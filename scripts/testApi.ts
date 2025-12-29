/**
 * Test script for NBA API Client
 *
 * Run with: npx ts-node --esm --experimental-specifier-resolution=node scripts/testApi.ts
 * Or after build: node dist/scripts/testApi.js
 */

import { createTestClient } from '../src/api/nbaClient.ts';
import { parseGameClock, isInFinalMinutes } from '../src/api/gameClockParser.ts';
import { getTeam } from '../src/data/teams.ts';
import { GameStatusCode } from '../src/api/types.ts';

async function main() {
  console.log('🏀 NBA API Client Test\n');
  console.log('='.repeat(60));

  const client = createTestClient();

  // Get Celtics team info
  const celtics = getTeam('BOS');
  if (!celtics) {
    console.error('Could not find Celtics team data!');
    process.exit(1);
  }

  console.log(`\n📋 Team: ${celtics.fullName}`);
  console.log(`   ID: ${celtics.id}`);
  console.log(`   Primary Color: ${celtics.colors.primary.name} (H:${celtics.colors.primary.hue}, S:${celtics.colors.primary.saturation})`);
  console.log('');

  try {
    // Fetch today's scoreboard
    console.log('📡 Fetching today\'s scoreboard...\n');
    const response = await client.getTodaysScoreboard();

    const scoreboard = response.data.scoreboard;
    console.log(`📅 Game Date: ${scoreboard.gameDate}`);
    console.log(`🎮 Total Games Today: ${scoreboard.games.length}\n`);

    // Find Celtics games
    const celticsGames = await client.getTeamGamesToday('BOS');

    if (celticsGames.length === 0) {
      console.log('❌ No Celtics games today!\n');

      // Show all games for reference
      console.log('All games today:');
      for (const game of scoreboard.games) {
        console.log(`  ${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode} - ${game.gameStatusText}`);
      }
    } else {
      console.log(`✅ Found ${celticsGames.length} Celtics game(s)!\n`);

      for (const game of celticsGames) {
        console.log('='.repeat(60));
        console.log('🎯 CELTICS GAME FOUND');
        console.log('='.repeat(60));

        const isHome = game.homeTeam.teamTricode === 'BOS';
        const opponent = isHome ? game.awayTeam : game.homeTeam;

        console.log(`\n📍 Matchup: ${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode}`);
        console.log(`   Celtics are: ${isHome ? 'HOME 🏠' : 'AWAY ✈️'}`);
        console.log(`   Opponent: ${opponent.teamCity} ${opponent.teamName}`);

        // Game status
        console.log(`\n⏱️  Status: ${game.gameStatusText}`);
        console.log(`   Game ID: ${game.gameId}`);
        console.log(`   Game Code: ${game.gameCode}`);

        // Parse status code
        let statusEmoji: string;
        switch (game.gameStatus) {
        case GameStatusCode.Scheduled:
          statusEmoji = '📅 Scheduled';
          break;
        case GameStatusCode.InProgress:
          statusEmoji = '🔴 LIVE';
          break;
        case GameStatusCode.Final:
          statusEmoji = '🏁 Final';
          break;
        default:
          statusEmoji = `❓ Unknown (${game.gameStatus})`;
        }
        console.log(`   Status Code: ${statusEmoji}`);

        // Score (if game started)
        if (game.gameStatus !== GameStatusCode.Scheduled) {
          console.log('\n🏀 Score:');
          console.log(`   ${game.awayTeam.teamTricode}: ${game.awayTeam.score}`);
          console.log(`   ${game.homeTeam.teamTricode}: ${game.homeTeam.score}`);
        }

        // Game clock (if in progress)
        if (game.gameStatus === GameStatusCode.InProgress) {
          console.log('\n⏰ Game Clock:');
          console.log(`   Period: ${game.period}`);
          console.log(`   Clock: ${game.gameClock}`);

          // Parse the clock
          const clock = parseGameClock(game.gameClock, game.period);
          console.log(`   Parsed: ${clock.displayString}`);
          console.log(`   Total seconds remaining: ${clock.totalSecondsRemaining}`);
          console.log(`   Is overtime: ${clock.isOvertime}`);
          console.log(`   In final minutes: ${isInFinalMinutes(clock)}`);
        }

        // Game time
        console.log('\n🕐 Game Time:');
        console.log(`   UTC: ${game.gameTimeUTC}`);
        console.log(`   ET: ${game.gameEt}`);

        // What the plugin would do
        console.log('\n🎮 Plugin Action:');
        if (game.gameStatus === GameStatusCode.InProgress) {
          console.log(`   ✅ LIGHTS SHOULD BE: ${celtics.colors.primary.name.toUpperCase()}`);
          console.log(`   Hue: ${celtics.colors.primary.hue}, Saturation: ${celtics.colors.primary.saturation}`);
        } else if (game.gameStatus === GameStatusCode.Scheduled) {
          console.log('   ⏳ Waiting for game to start...');
          console.log(`   Lights will change to ${celtics.colors.primary.name} at tip-off`);
        } else {
          console.log('   🏠 Game over - lights should be restored to original state');
        }

        console.log('');
      }
    }

    console.log('='.repeat(60));
    console.log('✅ API test completed successfully!');
    console.log(`   Timestamp: ${response.timestamp.toISOString()}`);

  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

main();
