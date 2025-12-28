import type {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';

import { GameLightAccessory } from './platformAccessory.js';
import {
  PLATFORM_NAME,
  PLUGIN_NAME,
  getSportConfig,
  type Sport,
} from './settings.js';
import { NBAApiClient } from './api/nbaClient.js';
import { GameScheduler } from './services/gameScheduler.js';
import { getTeam } from './data/teams.js';

/**
 * Plugin configuration
 */
interface GameLightConfig {
  platform: string;
  name: string;
  sport: Sport;
  team: string;
  pollingInterval: number;
  scheduleCheckInterval: number;
}

/**
 * GameLightPlatform
 *
 * Creates a HomeKit switch that turns ON when a game is active,
 * allowing users to create automations to control their lights.
 */
export class GameLightPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  // Cached accessories
  public readonly accessories: Map<string, PlatformAccessory> = new Map();

  // The single Game Active switch accessory
  private gameActiveAccessory?: GameLightAccessory;

  // Core services
  private readonly apiClient: NBAApiClient;
  private readonly scheduler: GameScheduler;

  // Plugin config
  private readonly pluginConfig: GameLightConfig;

  // Sport emoji for logging
  public readonly sportEmoji: string;

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    // Parse config
    this.pluginConfig = this.parseConfig(config);

    // Get sport-specific config
    const sportConfig = getSportConfig(this.pluginConfig.sport);
    this.sportEmoji = sportConfig.emoji;

    // Validate team
    const team = getTeam(this.pluginConfig.team);
    if (!team) {
      this.log.error(`Unknown team: ${this.pluginConfig.team}`);
      this.log.error('Please configure a valid team in plugin settings.');
    }

    // Initialize services
    this.apiClient = new NBAApiClient(log);

    this.scheduler = new GameScheduler(log, this.apiClient, {
      teamTricode: this.pluginConfig.team,
      defaultPollIntervalMs: this.pluginConfig.pollingInterval * 60 * 1000,
      idlePollIntervalMs:
        this.pluginConfig.scheduleCheckInterval * 60 * 60 * 1000,
    });

    // Set up game event handlers
    this.setupGameEventHandlers();

    const teamName = team?.fullName || this.pluginConfig.team;
    this.log.info(`Game Light initialized - ${teamName}`);

    // Homebridge lifecycle
    this.api.on('didFinishLaunching', async () => {
      this.log.debug('Homebridge finished launching');

      // Create the switch
      this.discoverDevices();

      // Start the scheduler
      this.scheduler.start();
    });

    this.api.on('shutdown', async () => {
      this.log.info('Shutting down Game Light');
      this.scheduler.stop();
    });
  }

  /**
   * Parse and validate plugin config
   */
  private parseConfig(config: PlatformConfig): GameLightConfig {
    return {
      platform: config.platform as string,
      name: (config.name as string) || 'Game Light',
      sport: (config.sport as Sport) || 'NBA',
      team: (config.team as string) || 'BOS',
      pollingInterval: (config.pollingInterval as number) || 5,
      scheduleCheckInterval: (config.scheduleCheckInterval as number) || 6,
    };
  }

  /**
   * Set up handlers for game events from the scheduler
   */
  private setupGameEventHandlers(): void {
    // Game is about to start
    this.scheduler.on('gameStarting', async (game) => {
      this.log.info(
        `${this.sportEmoji} Game starting: ${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode}`,
      );
    });

    // Game has started - turn switch ON
    this.scheduler.on('gameStarted', async (game) => {
      this.log.info(
        `${this.sportEmoji} Game started: ${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode}`,
      );
      this.gameActiveAccessory?.setGameActive(true);
    });

    // Game ended - celebrate win or just turn off
    this.scheduler.on('gameEnded', async (game) => {
      const homeScore = game.homeTeam.score;
      const awayScore = game.awayTeam.score;
      const winner =
        homeScore > awayScore
          ? game.homeTeam.teamTricode
          : game.awayTeam.teamTricode;
      const didWin = winner === this.pluginConfig.team;

      this.log.info(
        `🏁 Game ended: ${game.awayTeam.teamTricode} ${awayScore} - ` +
          `${game.homeTeam.teamTricode} ${homeScore}`,
      );

      if (didWin) {
        this.log.info('🎉 Your team won!');
        await this.celebrateVictory();
      } else {
        this.log.info('😢 Better luck next time.');
        this.gameActiveAccessory?.setGameActive(false);
      }
    });

    // State changes
    this.scheduler.on('stateChanged', (newState, oldState) => {
      this.log.debug(`Scheduler state: ${oldState} → ${newState}`);
    });

    // Errors
    this.scheduler.on('error', async (error) => {
      this.log.error('Scheduler error:', error.message);
    });
  }

  /**
   * Celebrate a victory by blinking the switch
   * This triggers the user's HomeKit automations to flash the lights
   */
  private async celebrateVictory(): Promise<void> {
    const blinkCount = 3;
    const blinkDurationMs = 800; // Time switch stays in each state

    for (let i = 0; i < blinkCount; i++) {
      // Turn OFF
      this.gameActiveAccessory?.setGameActive(false);
      await this.delay(blinkDurationMs);

      // Turn ON
      this.gameActiveAccessory?.setGameActive(true);
      await this.delay(blinkDurationMs);
    }

    // Final turn OFF
    this.gameActiveAccessory?.setGameActive(false);
  }

  /**
   * Helper to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Homebridge calls this when restoring cached accessories
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  /**
   * Create or restore the Game Active switch
   */
  discoverDevices(): void {
    const team = getTeam(this.pluginConfig.team);
    const displayName = team
      ? `${team.fullName} Game`
      : `${this.pluginConfig.team} Game`;

    // Generate a stable UUID based on team
    const uuid = this.api.hap.uuid.generate(
      `game-light-${this.pluginConfig.team}`,
    );

    const existingAccessory = this.accessories.get(uuid);

    if (existingAccessory) {
      // Restore from cache
      this.log.info('Restoring accessory:', displayName);
      existingAccessory.context.teamTricode = this.pluginConfig.team;
      existingAccessory.context.displayName = displayName;

      this.gameActiveAccessory = new GameLightAccessory(
        this,
        existingAccessory,
      );
    } else {
      // Create new accessory
      this.log.info('Creating accessory:', displayName);

      const accessory = new this.api.platformAccessory(displayName, uuid);
      accessory.context.teamTricode = this.pluginConfig.team;
      accessory.context.displayName = displayName;

      this.gameActiveAccessory = new GameLightAccessory(this, accessory);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
    }

    // Clean up accessories for other teams (if user changed team config)
    for (const [cachedUuid, accessory] of this.accessories) {
      if (cachedUuid !== uuid) {
        this.log.info('Removing old accessory:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
        this.accessories.delete(cachedUuid);
      }
    }

    // Log setup instructions
    this.log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.log.info(`✓ "${displayName}" switch ready`);
    this.log.info('');
    this.log.info('Create HomeKit automations to control your lights');
    this.log.info(`based on the "${displayName}" switch state.`);
    this.log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}
