/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'GameLight';

/**
 * This must match the name of your plugin as defined the package.json `name` property
 */
export const PLUGIN_NAME = 'homebridge-game-light';

/**
 * Supported sports configuration
 */
export type Sport = 'NBA';

export interface SportConfig {
  emoji: string;
  name: string;
}

export const SPORTS: Record<Sport, SportConfig> = {
  NBA: {
    emoji: '🏀',
    name: 'NBA Basketball',
  },
  // Future sports can be added here:
  // NFL: { emoji: '🏈', name: 'NFL Football' },
  // MLB: { emoji: '⚾', name: 'MLB Baseball' },
  // NHL: { emoji: '🏒', name: 'NHL Hockey' },
  // MLS: { emoji: '⚽', name: 'MLS Soccer' },
};

/**
 * Get sport configuration by type
 */
export function getSportConfig(sport: Sport): SportConfig {
  return SPORTS[sport];
}
