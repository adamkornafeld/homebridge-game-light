<p align="center">
  <img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

<h1 align="center">Game Light</h1>

<p align="center">
  A Homebridge plugin that creates a switch to trigger HomeKit automations when your favorite sports team plays.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/homebridge-game-light"><img src="https://img.shields.io/npm/v/homebridge-game-light?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/homebridge-game-light"><img src="https://img.shields.io/npm/dt/homebridge-game-light?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/adamkornafeld/homebridge-game-light/blob/latest/LICENSE"><img src="https://img.shields.io/github/license/adamkornafeld/homebridge-game-light?style=flat-square" alt="license"></a>
</p>

---

## 🏀 What It Does

Game Light monitors sports schedules and creates a **switch** in HomeKit that automatically turns **ON** when your team's game starts and **OFF** when it ends.

You then create HomeKit automations to control your actual lights:

- **Game starts** → Living room turns to team color
- **Game ends** → Living room returns to normal

This approach lets you use **any lights** already in your HomeKit setup (Hue, LIFX, Nanoleaf, etc.).

> **Currently Supported:** NBA Basketball  
> More sports coming soon! See [Future Extensibility](#-future-extensibility).

## ✨ Features

- 🏀 Track your favorite team
- ⏱️ Smart polling with increased frequency in final minutes
- 🔄 Automatic game detection from official schedules
- 🎮 Manual switch toggle for testing
- 📊 Robust API rate limiting and retry logic

## 📦 Installation

### Via Homebridge UI (Recommended)

1. Open the Homebridge UI
2. Go to **Plugins** tab
3. Search for `homebridge-game-light`
4. Click **Install**

### Via Command Line

```bash
npm install -g homebridge-game-light
```

## ⚙️ Configuration

### Via Homebridge UI

1. Go to **Plugins** → **Game Light** → **Settings**
2. Select your sport and team
3. Save and restart Homebridge

### Manual Configuration

Add to your `config.json`:

```json
{
  "platforms": [
    {
      "platform": "GameLight",
      "name": "Game Light",
      "sport": "NBA",
      "team": "BOS",
      "pollingInterval": 5,
      "scheduleCheckInterval": 6
    }
  ]
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `sport` | Sport league (`NBA`) | `NBA` |
| `team` | Team abbreviation (e.g., `BOS`, `LAL`, `GSW`) | `BOS` |
| `pollingInterval` | Minutes between game status checks during a game | `5` |
| `scheduleCheckInterval` | Hours between schedule checks when idle | `6` |

### NBA Teams & Colors

Use these **Hue** (H) and **Saturation** (S) values when setting up your HomeKit light automations. In the Home app color picker, set the hue angle and saturation percentage to match.

#### Eastern Conference

| Code | Team | Primary | H° / S% | Secondary | H° / S% |
|------|------|---------|---------|-----------|---------|
| ATL | Atlanta Hawks | ![](https://img.shields.io/badge/-%20-E03A3E?style=flat-square) Hawks Red | 358 / 74 | ![](https://img.shields.io/badge/-%20-C1D32F?style=flat-square) Volt Green | 68 / 65 |
| BOS | Boston Celtics | ![](https://img.shields.io/badge/-%20-007A33?style=flat-square) Celtics Green | 145 / 100 | ![](https://img.shields.io/badge/-%20-BA9653?style=flat-square) Gold | 38 / 36 |
| BKN | Brooklyn Nets | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 | ![](https://img.shields.io/badge/-%20-FFFFFF?style=flat-square) White | 0 / 0 |
| CHA | Charlotte Hornets | ![](https://img.shields.io/badge/-%20-1D1160?style=flat-square) Hornets Purple | 256 / 79 | ![](https://img.shields.io/badge/-%20-00788C?style=flat-square) Teal | 187 / 100 |
| CHI | Chicago Bulls | ![](https://img.shields.io/badge/-%20-CE1141?style=flat-square) Bulls Red | 350 / 87 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| CLE | Cleveland Cavaliers | ![](https://img.shields.io/badge/-%20-860038?style=flat-square) Wine | 341 / 100 | ![](https://img.shields.io/badge/-%20-FDBB30?style=flat-square) Gold | 43 / 97 |
| DET | Detroit Pistons | ![](https://img.shields.io/badge/-%20-C8102E?style=flat-square) Red | 350 / 82 | ![](https://img.shields.io/badge/-%20-1D42BA?style=flat-square) Royal Blue | 224 / 78 |
| IND | Indiana Pacers | ![](https://img.shields.io/badge/-%20-002D62?style=flat-square) Pacers Blue | 214 / 100 | ![](https://img.shields.io/badge/-%20-FDBB30?style=flat-square) Gold | 43 / 97 |
| MIA | Miami Heat | ![](https://img.shields.io/badge/-%20-98002E?style=flat-square) Heat Red | 345 / 100 | ![](https://img.shields.io/badge/-%20-F9A01B?style=flat-square) Orange | 37 / 93 |
| MIL | Milwaukee Bucks | ![](https://img.shields.io/badge/-%20-00471B?style=flat-square) Good Land Green | 145 / 100 | ![](https://img.shields.io/badge/-%20-EEE1C6?style=flat-square) Cream City Cream | 42 / 67 |
| NYK | New York Knicks | ![](https://img.shields.io/badge/-%20-006BB6?style=flat-square) Knicks Blue | 207 / 100 | ![](https://img.shields.io/badge/-%20-F58426?style=flat-square) Orange | 24 / 92 |
| ORL | Orlando Magic | ![](https://img.shields.io/badge/-%20-0077C0?style=flat-square) Magic Blue | 202 / 100 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| PHI | Philadelphia 76ers | ![](https://img.shields.io/badge/-%20-006BB6?style=flat-square) Royal Blue | 207 / 100 | ![](https://img.shields.io/badge/-%20-ED174C?style=flat-square) Red | 348 / 84 |
| TOR | Toronto Raptors | ![](https://img.shields.io/badge/-%20-CE1141?style=flat-square) Raptors Red | 348 / 89 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| WAS | Washington Wizards | ![](https://img.shields.io/badge/-%20-002B5C?style=flat-square) Navy Blue | 214 / 100 | ![](https://img.shields.io/badge/-%20-E31837?style=flat-square) Red | 351 / 82 |

#### Western Conference

| Code | Team | Primary | H° / S% | Secondary | H° / S% |
|------|------|---------|---------|-----------|---------|
| DAL | Dallas Mavericks | ![](https://img.shields.io/badge/-%20-00538C?style=flat-square) Royal Blue | 207 / 100 | ![](https://img.shields.io/badge/-%20-002B5E?style=flat-square) Navy Blue | 210 / 100 |
| DEN | Denver Nuggets | ![](https://img.shields.io/badge/-%20-0E2240?style=flat-square) Midnight Blue | 214 / 65 | ![](https://img.shields.io/badge/-%20-FEC524?style=flat-square) Sunshine Yellow | 47 / 98 |
| GSW | Golden State Warriors | ![](https://img.shields.io/badge/-%20-1D428A?style=flat-square) Warriors Blue | 220 / 66 | ![](https://img.shields.io/badge/-%20-FFC72C?style=flat-square) Golden Yellow | 45 / 100 |
| HOU | Houston Rockets | ![](https://img.shields.io/badge/-%20-CE1141?style=flat-square) Rockets Red | 348 / 89 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| LAC | LA Clippers | ![](https://img.shields.io/badge/-%20-C8102E?style=flat-square) Clippers Red | 350 / 82 | ![](https://img.shields.io/badge/-%20-1D428A?style=flat-square) Blue | 220 / 66 |
| LAL | Los Angeles Lakers | ![](https://img.shields.io/badge/-%20-552583?style=flat-square) Lakers Purple | 270 / 56 | ![](https://img.shields.io/badge/-%20-FDB927?style=flat-square) Gold | 44 / 97 |
| MEM | Memphis Grizzlies | ![](https://img.shields.io/badge/-%20-5D76A9?style=flat-square) Beale Street Blue | 221 / 34 | ![](https://img.shields.io/badge/-%20-12173F?style=flat-square) Navy Blue | 229 / 56 |
| MIN | Minnesota Timberwolves | ![](https://img.shields.io/badge/-%20-0C2340?style=flat-square) Midnight Blue | 214 / 66 | ![](https://img.shields.io/badge/-%20-236192?style=flat-square) Lake Blue | 205 / 57 |
| NOP | New Orleans Pelicans | ![](https://img.shields.io/badge/-%20-0C2340?style=flat-square) Pelicans Navy | 214 / 66 | ![](https://img.shields.io/badge/-%20-C8102E?style=flat-square) Red | 350 / 82 |
| OKC | Oklahoma City Thunder | ![](https://img.shields.io/badge/-%20-007AC1?style=flat-square) Thunder Blue | 200 / 100 | ![](https://img.shields.io/badge/-%20-EF3B24?style=flat-square) Sunset Orange | 11 / 86 |
| PHX | Phoenix Suns | ![](https://img.shields.io/badge/-%20-1D1160?style=flat-square) Suns Purple | 256 / 79 | ![](https://img.shields.io/badge/-%20-E56020?style=flat-square) Orange | 22 / 78 |
| POR | Portland Trail Blazers | ![](https://img.shields.io/badge/-%20-E03A3E?style=flat-square) Blazers Red | 358 / 74 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| SAC | Sacramento Kings | ![](https://img.shields.io/badge/-%20-5A2D81?style=flat-square) Kings Purple | 275 / 52 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| SAS | San Antonio Spurs | ![](https://img.shields.io/badge/-%20-C4CED4?style=flat-square) Silver | 0 / 6 | ![](https://img.shields.io/badge/-%20-000000?style=flat-square) Black | 0 / 0 |
| UTA | Utah Jazz | ![](https://img.shields.io/badge/-%20-002B5C?style=flat-square) Navy Blue | 214 / 100 | ![](https://img.shields.io/badge/-%20-00471B?style=flat-square) Green | 145 / 100 |

> **Tip:** In the Home app, tap a light → tap the color wheel → use Hue (angle around the wheel) and Saturation (distance from center).

## 🏠 Setting Up HomeKit Automations

After installing and configuring the plugin, you'll see a switch named after your team (e.g., **"Boston Celtics Game"**) in the Home app.

### Create "Game Start" Automation

1. Open the **Home** app
2. Tap **Automation** → **+** → **Add Automation**
3. Choose **An Accessory is Controlled**
4. Select your team's switch → **Turns On**
5. Add actions:
   - Set your lights to your team's color
   - Set **Brightness** to **100%**
6. Tap **Done**

### Create "Game End" Automation

1. Tap **+** → **Add Automation**
2. Choose **An Accessory is Controlled**
3. Select your team's switch → **Turns Off**
4. Add actions to set your lights back to normal
5. Tap **Done**

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/adamkornafeld/homebridge-game-light.git
cd game-light

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link

# Run Homebridge with debug logging
homebridge -D
```

### Testing the API

```bash
# Test API connection
npx tsx scripts/testApi.ts
```

## 📋 How It Works

1. **Schedule Check**: Plugin checks schedule for your team's games
2. **Game Detection**: When a game is found, switches to active polling
3. **Game Start**: When game status changes to "live", turns switch ON
4. **Smart Polling**: In final minutes, polls more frequently for accuracy
5. **Game End**: When game ends, turns switch OFF
6. **Idle**: Returns to infrequent schedule checks

```
Schedule Check (every 6h)
        │
        ▼
   Game Found? ──No──→ Wait & Retry
        │
       Yes
        ▼
   Poll Game (every 5m)
        │
        ▼
   Game Started? ──No──→ Wait & Retry
        │
       Yes
        ▼
   🏀 Switch ON ──→ HomeKit Automation
        │
        ▼
   Final minutes? ──Yes──→ Poll every 30s
        │
        ▼
   Game Ended?
        │
       Yes
        ▼
   🏁 Switch OFF ──→ HomeKit Automation
```

## ⚠️ API Rate Limiting

This plugin uses public sports APIs which may have rate limiting. The plugin includes:

- Exponential backoff with jitter
- `Retry-After` header support
- Minimum request intervals
- Graceful degradation on errors

If you see 429 errors in the logs, the plugin will automatically back off and retry.

## 🚀 Future Extensibility

| Feature | Description |
|---------|-------------|
| **NHL Support** | Add NHL API client, team data |
| **NFL Support** | Add ESPN/NFL API |
| **MLB Support** | Add MLB Stats API |
| **Multi-team** | Support multiple teams (flash alternating colors) |
| **Score alerts** | Flash lights on scoring plays |
| **Win celebration** | Special color effect when your team wins |
| **Away game colors** | Option to show opponent's color for away games |
| **Pre-game countdown** | Gradual color transition before tip-off |

Want to contribute? PRs welcome!

## 🙏 Acknowledgments

- [Homebridge](https://homebridge.io/) for the amazing platform
- [nba_api](https://github.com/swar/nba_api) for API documentation

## ⚖️ Disclaimer

This project is not affiliated with, endorsed by, or connected to the National Basketball Association (NBA) or any of its member teams.

NBA, the NBA logo, and all NBA team names, logos, and related marks are registered trademarks of NBA Properties, Inc. and the respective NBA member teams. All other trademarks are the property of their respective owners.

Team colors provided in this plugin are approximations for personal, non-commercial home automation use only. This is an independent, open-source project created for fans to enhance their game-watching experience.

Use of the NBA API is subject to the NBA's terms of service. This plugin accesses only publicly available game schedule data.
