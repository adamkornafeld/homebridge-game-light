/**
 * NBA API Type Definitions
 *
 * Types for NBA.com API responses (stats.nba.com and cdn.nba.com)
 * Based on the nba_api Python library structure
 *
 * @see https://github.com/swar/nba_api
 */

// ═══════════════════════════════════════════════════════════════
// GAME STATUS
// ═══════════════════════════════════════════════════════════════

/**
 * NBA API game status codes
 */
export enum GameStatusCode {
  Scheduled = 1,
  InProgress = 2,
  Final = 3,
}

/**
 * Internal game state for the scheduler
 */
export type GameState =
  | 'idle' // No game scheduled today
  | 'scheduled' // Game scheduled, waiting to start
  | 'live' // Game in progress (Q1-Q3 or Q4 with >2 min)
  | 'halftime' // Halftime break
  | 'final-minutes' // Q4/OT with ≤2 minutes remaining
  | 'finished'; // Game just ended

// ═══════════════════════════════════════════════════════════════
// TEAM INFO
// ═══════════════════════════════════════════════════════════════

/**
 * Team information within a game response
 */
export interface GameTeamInfo {
  teamId: number;
  teamTricode: string; // 3-letter abbreviation (e.g., "BOS")
  teamName: string;
  teamCity: string;
  score: number;
  wins: number;
  losses: number;
}

// ═══════════════════════════════════════════════════════════════
// GAME
// ═══════════════════════════════════════════════════════════════

/**
 * Individual game from the scoreboard
 */
export interface Game {
  gameId: string;
  gameCode: string; // e.g., "20251226/BOSMIA"
  gameStatus: GameStatusCode;
  gameStatusText: string; // e.g., "7:30 pm ET", "Q2 5:32", "Final"
  gameTimeUTC: string; // ISO 8601 timestamp
  gameEt: string; // Eastern time string
  period: number; // Current quarter (0=not started, 1-4, 5+=OT)
  gameClock: string; // Time remaining, e.g., "PT05M32.00S" or ""
  regulationPeriods: number; // Usually 4
  homeTeam: GameTeamInfo;
  awayTeam: GameTeamInfo;
  seriesGameNumber?: string; // Playoff game number
  seriesText?: string; // Playoff series status
}

/**
 * Parsed game clock for easier calculations
 */
export interface GameClock {
  period: number; // 1-4 for regulation, 5+ for overtime
  minutes: number; // Minutes remaining in current period
  seconds: number; // Seconds remaining in current period
  isOvertime: boolean; // true if period > 4
  totalSecondsRemaining: number; // Estimated total time left in regulation/OT
  displayString: string; // Formatted for logging, e.g., "Q4 1:32"
}

// ═══════════════════════════════════════════════════════════════
// SCOREBOARD
// ═══════════════════════════════════════════════════════════════

/**
 * Today's scoreboard response from NBA CDN
 * Endpoint: cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json
 */
export interface ScoreboardResponse {
  scoreboard: {
    gameDate: string; // e.g., "2025-12-26"
    leagueId: string;
    leagueName: string;
    games: Game[];
  };
}

// ═══════════════════════════════════════════════════════════════
// TEAM SCHEDULE
// ═══════════════════════════════════════════════════════════════

/**
 * Scheduled game from team schedule endpoint
 */
export interface ScheduledGame {
  gameId: string;
  gameDate: string; // "YYYY-MM-DD"
  gameTimeUTC: string;
  homeTeam: {
    teamId: number;
    teamTricode: string;
  };
  awayTeam: {
    teamId: number;
    teamTricode: string;
  };
  isHomeGame: boolean;
}

// ═══════════════════════════════════════════════════════════════
// API CLIENT TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Configuration for the NBA API client
 */
export interface NBAApiClientConfig {
  /** Request timeout in milliseconds (default: 10000) */
  timeoutMs: number;
  /** User agent string for requests */
  userAgent: string;
}

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /** Maximum retry attempts (default: 3) */
  maxRetries: number;
  /** Initial delay before retry in ms (default: 2000) */
  baseDelayMs: number;
  /** Maximum delay cap in ms (default: 120000) */
  maxDelayMs: number;
  /** Exponential backoff factor (default: 2) */
  backoffMultiplier: number;
  /** Minimum time between requests in ms (default: 1000) */
  minRequestIntervalMs: number;
}

/**
 * Rate limit information from API response
 */
export interface RateLimitInfo {
  /** Whether this request was rate limited */
  wasThrottled: boolean;
  /** Retry-After header value in seconds (if provided) */
  retryAfterSeconds?: number;
  /** Number of consecutive failures */
  consecutiveFailures: number;
}

/**
 * Wrapper for API responses with metadata
 */
export interface ApiResponse<T> {
  data: T;
  rateLimitInfo: RateLimitInfo;
  /** Response timestamp */
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Custom error for NBA API failures
 */
export class NBAApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRateLimited: boolean = false,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'NBAApiError';
  }
}

