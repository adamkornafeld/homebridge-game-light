import type { Logging } from 'homebridge';
import pRetry, { AbortError, type Options as PRetryOptions } from 'p-retry';
import type { RetryConfig, RateLimitInfo } from './types.js';

/**
 * Rate Limited Fetcher
 *
 * A thin wrapper around p-retry that adds:
 * - Minimum interval between requests (throttling)
 * - State tracking (consecutiveFailures, isInBackoff)
 * - Retry-After header support
 *
 * Uses p-retry for the core retry/backoff logic.
 */

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 2000,
  maxDelayMs: 120000, // 2 minutes
  backoffMultiplier: 2,
  minRequestIntervalMs: 1000,
};

export interface FetchResult<T> {
  data: T;
  rateLimitInfo: RateLimitInfo;
}

export class RateLimitedFetcher {
  private readonly config: RetryConfig;

  // State tracking
  private consecutiveFailures = 0;
  private lastRequestTime = 0;
  private backoffUntil = 0;
  private wasThrottled = false;

  constructor(
    private readonly log: Logging,
    config?: Partial<RetryConfig>,
  ) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Check if we're currently in a backoff period
   */
  isInBackoff(): boolean {
    return Date.now() < this.backoffUntil;
  }

  /**
   * Get remaining time in backoff period (ms)
   */
  getBackoffRemaining(): number {
    return Math.max(0, this.backoffUntil - Date.now());
  }

  /**
   * Get current consecutive failure count
   */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  /**
   * Check if the last request was rate limited
   */
  wasRateLimited(): boolean {
    return this.wasThrottled;
  }

  /**
   * Reset state (e.g., after successful recovery)
   */
  reset(): void {
    this.consecutiveFailures = 0;
    this.backoffUntil = 0;
    this.wasThrottled = false;
  }

  /**
   * Fetch with retry and rate limiting
   *
   * @param url - URL to fetch
   * @param options - Fetch options (headers, etc.)
   * @returns Parsed JSON response with rate limit info
   */
  async fetch<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    // Reset throttle flag for this request
    this.wasThrottled = false;

    // Wait if in backoff period
    if (this.isInBackoff()) {
      const waitTime = this.getBackoffRemaining();
      this.log.warn(
        `In backoff period. Waiting ${Math.round(waitTime / 1000)}s...`,
      );
      await this.sleep(waitTime);
    }

    // Enforce minimum interval between requests (throttle)
    await this.enforceThrottle();

    // Configure p-retry options
    const retryOptions: PRetryOptions = {
      retries: this.config.maxRetries,
      minTimeout: this.config.baseDelayMs,
      maxTimeout: this.config.maxDelayMs,
      factor: this.config.backoffMultiplier,
      randomize: true, // Adds jitter

      onFailedAttempt: (error) => {
        this.consecutiveFailures++;
        const message = error instanceof Error ? error.message : String(error);
        this.log.warn(
          `Request failed (attempt ${error.attemptNumber}/${this.config.maxRetries + 1}): ${message}. ` +
            `${error.retriesLeft} retries left.`,
        );
      },
    };

    try {
      const data = await pRetry(async () => {
        this.log.debug(`Fetching: ${url}`);

        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
          this.wasThrottled = true;
          const retryAfter = response.headers.get('Retry-After');

          if (retryAfter) {
            const retryAfterMs = parseInt(retryAfter, 10) * 1000;
            this.backoffUntil = Date.now() + retryAfterMs;
            this.log.warn(
              `Rate limited (429). Retry-After: ${retryAfter}s`,
            );
          }

          // Throw to trigger retry
          throw new Error(`Rate limited (429)`);
        }

        // Handle other HTTP errors
        if (!response.ok) {
          // Don't retry client errors (4xx) except 429
          if (response.status >= 400 && response.status < 500) {
            throw new AbortError(
              `HTTP ${response.status}: ${response.statusText}`,
            );
          }
          // Retry server errors (5xx)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      }, retryOptions);

      // Success! Reset failure tracking
      if (this.consecutiveFailures > 0) {
        this.log.info(
          `Request succeeded after ${this.consecutiveFailures} previous failures`,
        );
      }
      this.consecutiveFailures = 0;
      this.backoffUntil = 0;

      this.log.debug('Request successful');

      return {
        data,
        rateLimitInfo: {
          wasThrottled: this.wasThrottled,
          consecutiveFailures: 0,
        },
      };
    } catch (error) {
      // All retries exhausted or non-retryable error
      const rateLimitInfo: RateLimitInfo = {
        wasThrottled: this.wasThrottled,
        consecutiveFailures: this.consecutiveFailures,
      };

      // Re-throw with context
      if (error instanceof Error) {
        error.message = `Failed after ${this.consecutiveFailures} attempts: ${error.message}`;
      }
      throw error;
    }
  }

  /**
   * Enforce minimum interval between requests
   */
  private async enforceThrottle(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.minRequestIntervalMs) {
      const waitTime = this.config.minRequestIntervalMs - timeSinceLastRequest;
      await this.sleep(waitTime);
    }
    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
