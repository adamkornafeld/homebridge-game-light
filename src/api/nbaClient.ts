import type { Logging } from 'homebridge';
import type {
  ApiResponse,
  Game,
  NBAApiClientConfig,
  RetryConfig,
  ScoreboardResponse,
} from './types.js';
import { RateLimitedFetcher } from './rateLimiter.js';

/**
 * NBA API Client
 *
 * Fetches game data from NBA.com APIs:
 * - CDN endpoint for live scoreboard (less rate-limited)
 *
 * Based on https://github.com/swar/nba_api
 */

// NBA.com CDN endpoint (preferred - less aggressive rate limiting)
const NBA_CDN_BASE = 'https://cdn.nba.com/static/json/liveData';

// Required headers for NBA.com requests
const NBA_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Origin: 'https://www.nba.com',
  Referer: 'https://www.nba.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const DEFAULT_CONFIG: NBAApiClientConfig = {
  timeoutMs: 10000,
  userAgent: NBA_HEADERS['User-Agent'],
};

export class NBAApiClient {
  private readonly config: NBAApiClientConfig;
  private readonly fetcher: RateLimitedFetcher;

  constructor(
    private readonly log: Logging,
    config?: Partial<NBAApiClientConfig>,
    retryConfig?: Partial<RetryConfig>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fetcher = new RateLimitedFetcher(log, retryConfig);
  }

  /**
   * Get today's scoreboard with all games
   * Uses the CDN endpoint which is more reliable
   */
  async getTodaysScoreboard(): Promise<ApiResponse<ScoreboardResponse>> {
    const url = `${NBA_CDN_BASE}/scoreboard/todaysScoreboard_00.json`;

    const result = await this.fetcher.fetch<ScoreboardResponse>(url, {
      headers: {
        ...NBA_HEADERS,
        'User-Agent': this.config.userAgent,
      },
    });

    return {
      data: result.data,
      rateLimitInfo: result.rateLimitInfo,
      timestamp: new Date(),
    };
  }

  /**
   * Find games for a specific team from today's scoreboard
   *
   * @param teamTricode - Team abbreviation (e.g., "BOS")
   * @returns Games where the team is playing (usually 0 or 1)
   */
  async getTeamGamesToday(teamTricode: string): Promise<Game[]> {
    const response = await this.getTodaysScoreboard();
    const games = response.data.scoreboard.games;

    return games.filter(
      (game) =>
        game.homeTeam.teamTricode === teamTricode ||
        game.awayTeam.teamTricode === teamTricode,
    );
  }

  /**
   * Get a specific game by ID
   *
   * @param gameId - NBA game ID
   * @returns Game data or null if not found
   */
  async getGame(gameId: string): Promise<Game | null> {
    const response = await this.getTodaysScoreboard();
    const game = response.data.scoreboard.games.find(
      (g) => g.gameId === gameId,
    );
    return game || null;
  }

  /**
   * Check if the rate limiter is currently in backoff
   */
  isRateLimited(): boolean {
    return this.fetcher.isInBackoff();
  }

  /**
   * Get the rate limiter's consecutive failure count
   */
  getFailureCount(): number {
    return this.fetcher.getConsecutiveFailures();
  }

  /**
   * Check if the last request was throttled (429)
   */
  wasLastRequestThrottled(): boolean {
    return this.fetcher.wasRateLimited();
  }

  /**
   * Reset the rate limiter state
   */
  resetRateLimiter(): void {
    this.fetcher.reset();
  }
}

/**
 * Create a standalone client for testing
 * Uses console logging instead of Homebridge logger
 */
export function createTestClient(): NBAApiClient {
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

  return new NBAApiClient(consoleLogger);
}
