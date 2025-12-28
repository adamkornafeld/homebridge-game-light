/**
 * Test script for Game Scheduler
 *
 * Run with: npx tsx scripts/testScheduler.ts
 */

import { createTestScheduler } from '../src/services/gameScheduler.ts';
import { getTeam } from '../src/data/teams.ts';
import type { Logging } from 'homebridge';

async function main() {
  console.log('🏀 Game Scheduler Test\n');
  console.log('='.repeat(60));

  // Create console logger
  const log = {
    info: (message: string, ...args: unknown[]) =>
      console.log(`[INFO] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, ...args: unknown[]) =>
      console.error(`[ERROR] ${message}`, ...args),
    debug: (message: string, ...args: unknown[]) =>
      console.log(`[DEBUG] ${message}`, ...args),
    log: () => {},
    success: () => {},
  } as unknown as Logging;

  // Get Celtics team info
  const celtics = getTeam('BOS');
  if (!celtics) {
    console.error('Could not find Celtics team data!');
    process.exit(1);
  }

  console.log(`\n📋 Team: ${celtics.fullName}`);
  console.log(`   Primary Color: ${celtics.colors.primary.name} (H:${celtics.colors.primary.hue}, S:${celtics.colors.primary.saturation})`);

  // Track switch state
  let switchState = false;

  // Create scheduler
  const scheduler = createTestScheduler('BOS');

  // Set up event handlers
  scheduler.on('gameStarting', async (game) => {
    console.log('\n🎬 EVENT: gameStarting');
    console.log(`   ${game.awayTeam.teamTricode} @ ${game.homeTeam.teamTricode}`);
  });

  scheduler.on('gameStarted', async (game) => {
    console.log('\n🏀 EVENT: gameStarted');
    console.log(`   Switch would turn ON`);
    switchState = true;
  });

  scheduler.on('gameEnded', async (game) => {
    console.log('\n🏁 EVENT: gameEnded');
    const winner = game.homeTeam.score > game.awayTeam.score 
      ? game.homeTeam.teamTricode 
      : game.awayTeam.teamTricode;
    console.log(`   Final: ${game.awayTeam.teamTricode} ${game.awayTeam.score} - ${game.homeTeam.teamTricode} ${game.homeTeam.score}`);
    console.log(`   Winner: ${winner}`);
    console.log('   Switch would turn OFF');
    switchState = false;
  });

  scheduler.on('stateChanged', (newState, oldState) => {
    console.log(`\n📊 STATE: ${oldState} → ${newState}`);
  });

  scheduler.on('error', (error) => {
    console.error('\n❌ ERROR:', error.message);
  });

  // Do a single poll to check current state
  console.log('\n' + '='.repeat(60));
  console.log('📡 Performing initial poll...\n');

  await scheduler.forcePoll();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Current Status:');
  console.log(`   Scheduler: ${scheduler.getStatusSummary()}`);
  console.log(`   Switch State: ${switchState ? 'ON' : 'OFF'}`);

  const game = scheduler.getCurrentGame();
  if (game) {
    console.log('\n📅 Game Details:');
    console.log(`   ${game.awayTeam.teamCity} ${game.awayTeam.teamName} @ ${game.homeTeam.teamCity} ${game.homeTeam.teamName}`);
    console.log(`   Status: ${game.gameStatusText}`);
    console.log(`   Game Time: ${new Date(game.gameTimeUTC).toLocaleString()}`);
    
    const now = new Date();
    const gameTime = new Date(game.gameTimeUTC);
    const msUntilGame = gameTime.getTime() - now.getTime();
    
    if (msUntilGame > 0) {
      const hours = Math.floor(msUntilGame / (1000 * 60 * 60));
      const minutes = Math.floor((msUntilGame % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`   Time until tip-off: ${hours}h ${minutes}m`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Scheduler test completed!');
  console.log('\nNote: In production, the scheduler would continue polling.');
  console.log('      This test only does a single poll.\n');

  // Stop the scheduler to clear any pending timers
  scheduler.stop();
}

main().catch(console.error);
