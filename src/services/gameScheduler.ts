import { EventEmitter } from 'events';
import type { Logging } from 'homebridge';
import type { Game, GameState } from '../api/types.js';
import { GameStatusCode } from '../api/types.js';
import { NBAApiClient } from '../api/nbaClient.js';
import { parseGameClock, isInFinalMinutes } from '../api/gameClockParser.js';

/**
 * Game Scheduler
 *
 * Manages the game lifecycle state machine:
 * - idle: No game scheduled today
 * - scheduled: Game scheduled, waiting to start
 * - live: Game in progress
 * - halftime: Halftime break
 * - final-minutes: Q4/OT with ≤2 minutes remaining
 * - finished: Game just ended
 *
 * Emits events for switch control:
 * - 'gameStarting': Game is about to start
 * - 'gameStarted': Game has started, turn switch ON
 * - 'gameEnded': Game has ended, turn switch OFF
 * - 'stateChanged': State transition occurred
 */

// Timing constants
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export interface SchedulerConfig {
  /** Team tricode to track (e.g., "BOS") */
  teamTricode: string;
  /** Default polling interval in ms (default: 5 minutes) */
  defaultPollIntervalMs: number;
  /** Schedule check interval when idle in ms (default: 6 hours) */
  idlePollIntervalMs: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  teamTricode: 'BOS',
  defaultPollIntervalMs: 5 * MINUTE,
  idlePollIntervalMs: 6 * HOUR,
};

export interface SchedulerEvents {
  gameStarting: [game: Game];
  gameStarted: [game: Game];
  gameEnded: [game: Game];
  stateChanged: [newState: GameState, oldState: GameState, game: Game | null];
  error: [error: Error];
}

export class GameScheduler extends EventEmitter<SchedulerEvents> {
  private readonly config: SchedulerConfig;
  private readonly client: NBAApiClient;

  // State
  private currentState: GameState = 'idle';
  private currentGame: Game | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private isPolling = false;

  constructor(
    private readonly log: Logging,
    client: NBAApiClient,
    config?: Partial<SchedulerConfig>,
  ) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = client;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    this.log.info(
      `Game Scheduler started for ${this.config.teamTricode}`,
    );
    this.poll(); // Initial poll
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.log.info('Game Scheduler stopped');
  }

  /**
   * Get current state
   */
  getState(): GameState {
    return this.currentState;
  }

  /**
   * Get current game being tracked
   */
  getCurrentGame(): Game | null {
    return this.currentGame;
  }

  /**
   * Force a poll (useful for testing)
   */
  async forcePoll(): Promise<void> {
    await this.poll();
  }

  /**
   * Main polling loop
   */
  private async poll(): Promise<void> {
    if (this.isPolling) {
      this.log.debug('Poll already in progress, skipping');
      return;
    }

    this.isPolling = true;

    try {
      await this.checkGameStatus();
    } catch (error) {
      this.log.error('Error during poll:', error);
      this.emit('error', error as Error);
    } finally {
      this.isPolling = false;
      this.scheduleNextPoll();
    }
  }

  /**
   * Check game status and update state machine
   */
  private async checkGameStatus(): Promise<void> {
    this.log.debug(`Checking game status (current state: ${this.currentState})`);

    // Fetch team's games today
    const games = await this.client.getTeamGamesToday(this.config.teamTricode);

    if (games.length === 0) {
      // No game today
      if (this.currentState !== 'idle') {
        this.transitionTo('idle', null);
      }
      return;
    }

    // Use the first game (teams typically play one game per day)
    const game = games[0];
    this.currentGame = game;

    // Determine new state based on game status
    const newState = this.determineState(game);

    // Handle state transitions
    if (newState !== this.currentState) {
      this.handleTransition(this.currentState, newState, game);
    }
  }

  /**
   * Determine what state we should be in based on game data
   */
  private determineState(game: Game): GameState {
    switch (game.gameStatus) {
      case GameStatusCode.Scheduled:
        return 'scheduled';

      case GameStatusCode.InProgress: {
        // Check for halftime
        if (this.isHalftime(game)) {
          return 'halftime';
        }

        // Check for final minutes (Q4/OT with ≤2 min)
        if (game.gameClock && game.period >= 4) {
          const clock = parseGameClock(game.gameClock, game.period);
          if (isInFinalMinutes(clock)) {
            return 'final-minutes';
          }
        }

        return 'live';
      }

      case GameStatusCode.Final:
        return 'finished';

      default:
        return 'idle';
    }
  }

  /**
   * Check if game is at halftime
   */
  private isHalftime(game: Game): boolean {
    const statusText = game.gameStatusText.toLowerCase();
    return (
      statusText.includes('half') ||
      (game.period === 2 && (!game.gameClock || game.gameClock === ''))
    );
  }

  /**
   * Handle state transitions and emit appropriate events
   */
  private handleTransition(
    oldState: GameState,
    newState: GameState,
    game: Game,
  ): void {
    this.log.info(`State transition: ${oldState} → ${newState}`);

    // Emit events based on transitions
    if (oldState === 'scheduled' && newState === 'live') {
      // Game just started!
      this.emit('gameStarting', game);
      this.emit('gameStarted', game);
    }

    if (
      (oldState === 'live' || oldState === 'final-minutes' || oldState === 'halftime') &&
      newState === 'finished'
    ) {
      // Game just ended!
      this.emit('gameEnded', game);
    }

    // Always emit state change
    this.transitionTo(newState, game);
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: GameState, game: Game | null): void {
    const oldState = this.currentState;
    this.currentState = newState;
    this.currentGame = game;
    this.emit('stateChanged', newState, oldState, game);
  }

  /**
   * Schedule the next poll based on current state
   */
  private scheduleNextPoll(): void {
    const interval = this.getNextPollInterval();

    this.log.debug(
      `Next poll in ${Math.round(interval / 1000)}s (state: ${this.currentState})`,
    );

    this.pollTimer = setTimeout(() => this.poll(), interval);
  }

  /**
   * Calculate next poll interval based on current state
   */
  private getNextPollInterval(): number {
    switch (this.currentState) {
      case 'idle':
        return this.config.idlePollIntervalMs;

      case 'scheduled': {
        // Poll more frequently as game approaches
        if (this.currentGame) {
          const gameTime = new Date(this.currentGame.gameTimeUTC).getTime();
          const timeToGame = gameTime - Date.now();

          if (timeToGame > 2 * HOUR) return 1 * HOUR;
          if (timeToGame > 30 * MINUTE) return 15 * MINUTE;
          if (timeToGame > 5 * MINUTE) return 5 * MINUTE;
          return 1 * MINUTE; // Game imminent
        }
        return 15 * MINUTE;
      }

      case 'halftime':
        return 10 * MINUTE;

      case 'final-minutes':
        return 30 * SECOND; // High-frequency polling!

      case 'live': {
        // Check if we're in Q4 (poll more frequently)
        if (this.currentGame && this.currentGame.period === 4) {
          return 2 * MINUTE;
        }
        return this.config.defaultPollIntervalMs;
      }

      case 'finished':
        // Transition to idle on next poll
        return 1 * MINUTE;

      default:
        return this.config.defaultPollIntervalMs;
    }
  }

  /**
   * Get human-readable status
   */
  getStatusSummary(): string {
    const game = this.currentGame;
    if (!game) {
      return `State: ${this.currentState}, No game`;
    }

    const matchup = `${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode}`;
    const score =
      game.gameStatus !== GameStatusCode.Scheduled
        ? ` (${game.awayTeam.score}-${game.homeTeam.score})`
        : '';

    return `State: ${this.currentState}, ${matchup}${score}, Status: ${game.gameStatusText}`;
  }
}

/**
 * Create a test scheduler with console logging
 */
export function createTestScheduler(
  teamTricode: string = 'BOS',
): GameScheduler {
  const consoleLogger = {
    info: (message: string, ...args: unknown[]) =>
      console.log(`[INFO] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, ...args: unknown[]) =>
      console.error(`[ERROR] ${message}`, ...args),
    debug: (message: string, ...args: unknown[]) =>
      console.log(`[DEBUG] ${message}`, ...args),
    log: (level: string, message: string, ...args: unknown[]) =>
      console.log(`[${level}] ${message}`, ...args),
    success: (message: string, ...args: unknown[]) =>
      console.log(`[SUCCESS] ${message}`, ...args),
  } as unknown as Logging;

  const client = new NBAApiClient(consoleLogger);
  return new GameScheduler(consoleLogger, client, { teamTricode });
}

