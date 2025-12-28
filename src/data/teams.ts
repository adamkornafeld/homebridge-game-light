/**
 * NBA Teams Static Data
 *
 * Complete list of all 30 NBA teams with:
 * - Official NBA API team IDs (stats.nba.com)
 * - Team colors in HSL format for HomeKit light control reference
 *
 * @see https://github.com/swar/nba_api for team ID reference
 */

/**
 * Color values for HomeKit light control reference
 * Users can use these values when setting up automations
 */
export interface TeamColor {
  hue: number; // 0-360 degrees
  saturation: number; // 0-100 percent
  name: string; // Color name for reference
}

export interface NBATeam {
  id: number; // NBA API team ID
  abbreviation: string; // 3-letter code
  name: string; // Team nickname
  city: string; // City name
  fullName: string; // Full team name
  conference: 'East' | 'West';
  colors: {
    primary: TeamColor;
    secondary: TeamColor;
  };
}

/**
 * Complete list of all 30 NBA teams
 * Team IDs match the NBA API (stats.nba.com)
 */
export const NBA_TEAMS: Record<string, NBATeam> = {
  // ═══════════════════════════════════════════════════════════════
  // EASTERN CONFERENCE
  // ═══════════════════════════════════════════════════════════════

  // --- Atlantic Division ---
  BOS: {
    id: 1610612738,
    abbreviation: 'BOS',
    name: 'Celtics',
    city: 'Boston',
    fullName: 'Boston Celtics',
    conference: 'East',
    colors: {
      primary: { hue: 145, saturation: 100, name: 'Celtics Green' },
      secondary: { hue: 38, saturation: 36, name: 'Gold' },
    },
  },
  BKN: {
    id: 1610612751,
    abbreviation: 'BKN',
    name: 'Nets',
    city: 'Brooklyn',
    fullName: 'Brooklyn Nets',
    conference: 'East',
    colors: {
      primary: { hue: 0, saturation: 0, name: 'Black' },
      secondary: { hue: 0, saturation: 0, name: 'White' },
    },
  },
  NYK: {
    id: 1610612752,
    abbreviation: 'NYK',
    name: 'Knicks',
    city: 'New York',
    fullName: 'New York Knicks',
    conference: 'East',
    colors: {
      primary: { hue: 207, saturation: 100, name: 'Knicks Blue' },
      secondary: { hue: 24, saturation: 92, name: 'Orange' },
    },
  },
  PHI: {
    id: 1610612755,
    abbreviation: 'PHI',
    name: '76ers',
    city: 'Philadelphia',
    fullName: 'Philadelphia 76ers',
    conference: 'East',
    colors: {
      primary: { hue: 207, saturation: 100, name: 'Royal Blue' },
      secondary: { hue: 348, saturation: 84, name: 'Red' },
    },
  },
  TOR: {
    id: 1610612761,
    abbreviation: 'TOR',
    name: 'Raptors',
    city: 'Toronto',
    fullName: 'Toronto Raptors',
    conference: 'East',
    colors: {
      primary: { hue: 348, saturation: 89, name: 'Raptors Red' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },

  // --- Central Division ---
  CHI: {
    id: 1610612741,
    abbreviation: 'CHI',
    name: 'Bulls',
    city: 'Chicago',
    fullName: 'Chicago Bulls',
    conference: 'East',
    colors: {
      primary: { hue: 350, saturation: 87, name: 'Bulls Red' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },
  CLE: {
    id: 1610612739,
    abbreviation: 'CLE',
    name: 'Cavaliers',
    city: 'Cleveland',
    fullName: 'Cleveland Cavaliers',
    conference: 'East',
    colors: {
      primary: { hue: 341, saturation: 100, name: 'Wine' },
      secondary: { hue: 43, saturation: 97, name: 'Gold' },
    },
  },
  DET: {
    id: 1610612765,
    abbreviation: 'DET',
    name: 'Pistons',
    city: 'Detroit',
    fullName: 'Detroit Pistons',
    conference: 'East',
    colors: {
      primary: { hue: 350, saturation: 82, name: 'Red' },
      secondary: { hue: 224, saturation: 78, name: 'Royal Blue' },
    },
  },
  IND: {
    id: 1610612754,
    abbreviation: 'IND',
    name: 'Pacers',
    city: 'Indiana',
    fullName: 'Indiana Pacers',
    conference: 'East',
    colors: {
      primary: { hue: 214, saturation: 100, name: 'Pacers Blue' },
      secondary: { hue: 43, saturation: 97, name: 'Gold' },
    },
  },
  MIL: {
    id: 1610612749,
    abbreviation: 'MIL',
    name: 'Bucks',
    city: 'Milwaukee',
    fullName: 'Milwaukee Bucks',
    conference: 'East',
    colors: {
      primary: { hue: 145, saturation: 100, name: 'Good Land Green' },
      secondary: { hue: 42, saturation: 67, name: 'Cream City Cream' },
    },
  },

  // --- Southeast Division ---
  ATL: {
    id: 1610612737,
    abbreviation: 'ATL',
    name: 'Hawks',
    city: 'Atlanta',
    fullName: 'Atlanta Hawks',
    conference: 'East',
    colors: {
      primary: { hue: 358, saturation: 74, name: 'Hawks Red' },
      secondary: { hue: 68, saturation: 65, name: 'Volt Green' },
    },
  },
  CHA: {
    id: 1610612766,
    abbreviation: 'CHA',
    name: 'Hornets',
    city: 'Charlotte',
    fullName: 'Charlotte Hornets',
    conference: 'East',
    colors: {
      primary: { hue: 256, saturation: 79, name: 'Hornets Purple' },
      secondary: { hue: 187, saturation: 100, name: 'Teal' },
    },
  },
  MIA: {
    id: 1610612748,
    abbreviation: 'MIA',
    name: 'Heat',
    city: 'Miami',
    fullName: 'Miami Heat',
    conference: 'East',
    colors: {
      primary: { hue: 345, saturation: 100, name: 'Heat Red' },
      secondary: { hue: 37, saturation: 93, name: 'Orange' },
    },
  },
  ORL: {
    id: 1610612753,
    abbreviation: 'ORL',
    name: 'Magic',
    city: 'Orlando',
    fullName: 'Orlando Magic',
    conference: 'East',
    colors: {
      primary: { hue: 202, saturation: 100, name: 'Magic Blue' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },
  WAS: {
    id: 1610612764,
    abbreviation: 'WAS',
    name: 'Wizards',
    city: 'Washington',
    fullName: 'Washington Wizards',
    conference: 'East',
    colors: {
      primary: { hue: 214, saturation: 100, name: 'Navy Blue' },
      secondary: { hue: 351, saturation: 82, name: 'Red' },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // WESTERN CONFERENCE
  // ═══════════════════════════════════════════════════════════════

  // --- Northwest Division ---
  DEN: {
    id: 1610612743,
    abbreviation: 'DEN',
    name: 'Nuggets',
    city: 'Denver',
    fullName: 'Denver Nuggets',
    conference: 'West',
    colors: {
      primary: { hue: 214, saturation: 65, name: 'Midnight Blue' },
      secondary: { hue: 47, saturation: 98, name: 'Sunshine Yellow' },
    },
  },
  MIN: {
    id: 1610612750,
    abbreviation: 'MIN',
    name: 'Timberwolves',
    city: 'Minnesota',
    fullName: 'Minnesota Timberwolves',
    conference: 'West',
    colors: {
      primary: { hue: 214, saturation: 66, name: 'Midnight Blue' },
      secondary: { hue: 205, saturation: 57, name: 'Lake Blue' },
    },
  },
  OKC: {
    id: 1610612760,
    abbreviation: 'OKC',
    name: 'Thunder',
    city: 'Oklahoma City',
    fullName: 'Oklahoma City Thunder',
    conference: 'West',
    colors: {
      primary: { hue: 200, saturation: 100, name: 'Thunder Blue' },
      secondary: { hue: 11, saturation: 86, name: 'Sunset Orange' },
    },
  },
  POR: {
    id: 1610612757,
    abbreviation: 'POR',
    name: 'Trail Blazers',
    city: 'Portland',
    fullName: 'Portland Trail Blazers',
    conference: 'West',
    colors: {
      primary: { hue: 358, saturation: 74, name: 'Blazers Red' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },
  UTA: {
    id: 1610612762,
    abbreviation: 'UTA',
    name: 'Jazz',
    city: 'Utah',
    fullName: 'Utah Jazz',
    conference: 'West',
    colors: {
      primary: { hue: 214, saturation: 100, name: 'Navy Blue' },
      secondary: { hue: 145, saturation: 100, name: 'Green' },
    },
  },

  // --- Pacific Division ---
  GSW: {
    id: 1610612744,
    abbreviation: 'GSW',
    name: 'Warriors',
    city: 'Golden State',
    fullName: 'Golden State Warriors',
    conference: 'West',
    colors: {
      primary: { hue: 220, saturation: 66, name: 'Warriors Blue' },
      secondary: { hue: 45, saturation: 100, name: 'Golden Yellow' },
    },
  },
  LAC: {
    id: 1610612746,
    abbreviation: 'LAC',
    name: 'Clippers',
    city: 'Los Angeles',
    fullName: 'Los Angeles Clippers',
    conference: 'West',
    colors: {
      primary: { hue: 350, saturation: 82, name: 'Clippers Red' },
      secondary: { hue: 220, saturation: 66, name: 'Blue' },
    },
  },
  LAL: {
    id: 1610612747,
    abbreviation: 'LAL',
    name: 'Lakers',
    city: 'Los Angeles',
    fullName: 'Los Angeles Lakers',
    conference: 'West',
    colors: {
      primary: { hue: 270, saturation: 56, name: 'Lakers Purple' },
      secondary: { hue: 44, saturation: 97, name: 'Gold' },
    },
  },
  PHX: {
    id: 1610612756,
    abbreviation: 'PHX',
    name: 'Suns',
    city: 'Phoenix',
    fullName: 'Phoenix Suns',
    conference: 'West',
    colors: {
      primary: { hue: 256, saturation: 79, name: 'Suns Purple' },
      secondary: { hue: 22, saturation: 78, name: 'Orange' },
    },
  },
  SAC: {
    id: 1610612758,
    abbreviation: 'SAC',
    name: 'Kings',
    city: 'Sacramento',
    fullName: 'Sacramento Kings',
    conference: 'West',
    colors: {
      primary: { hue: 275, saturation: 52, name: 'Kings Purple' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },

  // --- Southwest Division ---
  DAL: {
    id: 1610612742,
    abbreviation: 'DAL',
    name: 'Mavericks',
    city: 'Dallas',
    fullName: 'Dallas Mavericks',
    conference: 'West',
    colors: {
      primary: { hue: 207, saturation: 100, name: 'Royal Blue' },
      secondary: { hue: 210, saturation: 100, name: 'Navy Blue' },
    },
  },
  HOU: {
    id: 1610612745,
    abbreviation: 'HOU',
    name: 'Rockets',
    city: 'Houston',
    fullName: 'Houston Rockets',
    conference: 'West',
    colors: {
      primary: { hue: 348, saturation: 89, name: 'Rockets Red' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },
  MEM: {
    id: 1610612763,
    abbreviation: 'MEM',
    name: 'Grizzlies',
    city: 'Memphis',
    fullName: 'Memphis Grizzlies',
    conference: 'West',
    colors: {
      primary: { hue: 221, saturation: 34, name: 'Beale Street Blue' },
      secondary: { hue: 229, saturation: 56, name: 'Navy Blue' },
    },
  },
  NOP: {
    id: 1610612740,
    abbreviation: 'NOP',
    name: 'Pelicans',
    city: 'New Orleans',
    fullName: 'New Orleans Pelicans',
    conference: 'West',
    colors: {
      primary: { hue: 214, saturation: 66, name: 'Pelicans Navy' },
      secondary: { hue: 350, saturation: 82, name: 'Red' },
    },
  },
  SAS: {
    id: 1610612759,
    abbreviation: 'SAS',
    name: 'Spurs',
    city: 'San Antonio',
    fullName: 'San Antonio Spurs',
    conference: 'West',
    colors: {
      primary: { hue: 0, saturation: 6, name: 'Silver' },
      secondary: { hue: 0, saturation: 0, name: 'Black' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get team by abbreviation (case-insensitive)
 */
export function getTeam(abbreviation: string): NBATeam | undefined {
  return NBA_TEAMS[abbreviation.toUpperCase()];
}

/**
 * Get team by NBA API ID
 */
export function getTeamById(id: number): NBATeam | undefined {
  return Object.values(NBA_TEAMS).find((team) => team.id === id);
}

/**
 * Get all teams as array (sorted alphabetically by full name)
 * Useful for populating config UI dropdowns
 */
export function getAllTeams(): NBATeam[] {
  return Object.values(NBA_TEAMS).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
}

/**
 * Get teams filtered by conference
 */
export function getTeamsByConference(conference: 'East' | 'West'): NBATeam[] {
  return Object.values(NBA_TEAMS)
    .filter((team) => team.conference === conference)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Get team abbreviations for config schema enum
 */
export function getTeamAbbreviations(): string[] {
  return Object.keys(NBA_TEAMS).sort();
}
