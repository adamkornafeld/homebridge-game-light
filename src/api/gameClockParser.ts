import type { GameClock } from './types.js';

/**
 * Game Clock Parser
 *
 * Parses NBA API game clock formats:
 * - ISO 8601 duration: "PT05M32.00S" (5 minutes 32 seconds)
 * - Simple format: "5:32"
 * - Empty string: "" (game not started or ended)
 */

const REGULATION_PERIOD_SECONDS = 12 * 60; // 12 minutes
const OVERTIME_PERIOD_SECONDS = 5 * 60; // 5 minutes
const REGULATION_PERIODS = 4;

/**
 * Parse game clock string from NBA API
 *
 * @param gameClock - Clock string from API (e.g., "PT05M32.00S" or "5:32" or "")
 * @param period - Current period (1-4 for regulation, 5+ for overtime)
 * @returns Parsed GameClock object
 */
export function parseGameClock(gameClock: string, period: number): GameClock {
  let minutes = 0;
  let seconds = 0;

  if (gameClock && gameClock.trim() !== '') {
    // Try ISO 8601 duration format: "PT05M32.00S"
    const isoMatch = gameClock.match(/PT(\d+)M([\d.]+)S/);
    if (isoMatch) {
      minutes = parseInt(isoMatch[1], 10);
      seconds = Math.floor(parseFloat(isoMatch[2]));
    } else {
      // Try simple "MM:SS" or "M:SS" format
      const simpleMatch = gameClock.match(/^(\d+):(\d{2})$/);
      if (simpleMatch) {
        minutes = parseInt(simpleMatch[1], 10);
        seconds = parseInt(simpleMatch[2], 10);
      }
    }
  }

  const isOvertime = period > REGULATION_PERIODS;
  const timeInCurrentPeriod = minutes * 60 + seconds;

  // Calculate total seconds remaining in the game
  let totalSecondsRemaining: number;

  if (period === 0) {
    // Game hasn't started - full game time
    totalSecondsRemaining = REGULATION_PERIODS * REGULATION_PERIOD_SECONDS;
  } else if (isOvertime) {
    // In overtime - just the current OT period remaining
    totalSecondsRemaining = timeInCurrentPeriod;
  } else {
    // In regulation - remaining periods + current period time
    const remainingFullPeriods = REGULATION_PERIODS - period;
    totalSecondsRemaining =
      remainingFullPeriods * REGULATION_PERIOD_SECONDS + timeInCurrentPeriod;
  }

  // Format display string
  const periodStr = isOvertime ? `OT${period - REGULATION_PERIODS}` : `Q${period}`;
  const displayString =
    period === 0
      ? 'Not Started'
      : `${periodStr} ${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    period,
    minutes,
    seconds,
    isOvertime,
    totalSecondsRemaining,
    displayString,
  };
}

/**
 * Check if the game is in the final 2 minutes
 * (4th quarter or overtime with ≤2 minutes remaining)
 *
 * @param clock - Parsed game clock
 * @returns true if in final minutes
 */
export function isInFinalMinutes(clock: GameClock): boolean {
  // Must be in 4th quarter or overtime
  if (clock.period < REGULATION_PERIODS) {
    return false;
  }

  // Check if 2 minutes or less remaining in current period
  const timeRemaining = clock.minutes * 60 + clock.seconds;
  return timeRemaining <= 120; // 2 minutes = 120 seconds
}

/**
 * Format seconds as "M:SS" display string
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get the period display name
 */
export function getPeriodName(period: number): string {
  if (period === 0) {
    return 'Pre-Game';
  }
  if (period <= REGULATION_PERIODS) {
    return `Q${period}`;
  }
  return `OT${period - REGULATION_PERIODS}`;
}

/**
 * Check if game is in halftime (between Q2 and Q3)
 * Note: This is typically determined by gameStatusText, but this
 * helper can be used for estimation
 */
export function isLikelyHalftime(
  period: number,
  gameClock: string,
  gameStatusText: string,
): boolean {
  // Check explicit halftime text
  if (gameStatusText.toLowerCase().includes('half')) {
    return true;
  }

  // Heuristic: end of Q2 with no clock
  if (period === 2 && (!gameClock || gameClock.trim() === '')) {
    return true;
  }

  return false;
}

