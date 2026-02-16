/**
 * MIDI Music Generator for "Everything is Connected" Game Jam
 * 
 * Generates three retro-style MIDI music tracks:
 * 1. Menu Theme - upbeat signature theme (75 seconds)
 * 2. Level Theme - energetic loopable gameplay music (140 seconds)
 * 3. Victory Theme - triumphant fanfare (28 seconds)
 * 4. Electricity Sound Effect - short electrical zap for terminal interactions
 * 
 * Requirements: npm install jsmidgen
 * Usage: node src/audio/MusicGenerator.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Dynamic import for jsmidgen
let Midi;
let Track;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../../public/audio');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Initialize MIDI library
 */
async function initializeMidi() {
  try {
    const jsmidgen = await import('jsmidgen');
    Midi = jsmidgen.default.File;
    Track = jsmidgen.default.Track;
    console.log('✓ jsmidgen loaded successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to load jsmidgen. Installing...');
    console.error('  Run: npm install --save-dev jsmidgen');
    return false;
  }
}

/**
 * Note map for retro melodies
 */
const NOTES = {
  C3: 0x30, D3: 0x32, E3: 0x34, F3: 0x35, G3: 0x37, A3: 0x39, B3: 0x3b,
  C4: 0x3c, D4: 0x3e, E4: 0x40, F4: 0x41, G4: 0x43, A4: 0x45, B4: 0x47,
  C5: 0x48, D5: 0x4a, E5: 0x4c, F5: 0x4d, G5: 0x4f, A5: 0x51, B5: 0x53,
  C6: 0x54, D6: 0x56, E6: 0x58, F6: 0x59, G6: 0x5b,
};

/**
 * Drum note map (GM Standard)
 */
const DRUMS = {
  kickDrum: 0x24,
  snare: 0x26,
  closedHiHat: 0x2e,
  openHiHat: 0x2e,
  tom: 0x31,
};

/**
 * Generate Menu Theme - Upbeat, cheerful signature theme
 * Structure: Intro (8 bars) → Main (32 bars) → Outro (8 bars)
 * BPM: 150
 */
function generateMenuTheme() {
  const file = new Midi();
  
  // Lead melody track - Synth Brass tone
  const leadTrack = new Track();
  leadTrack.setTempo(150); // BPM set on first track
  leadTrack.setInstrument(61); // Synth Brass 1
  leadTrack.setVolume(100);
  
  // Drums track
  const drumTrack = new Track();
  drumTrack.setChannel(9); // MIDI drum channel
  drumTrack.setVolume(90);
  
  // Bass track
  const bassTrack = new Track();
  bassTrack.setInstrument(32); // Acoustic Bass
  bassTrack.setVolume(85);
  
  // Chord accompaniment
  const chordTrack = new Track();
  chordTrack.setInstrument(4); // Marimba
  chordTrack.setVolume(70);
  
  // INTRO (8 bars = 32 quarter notes)
  // Short lead flourish
  leadTrack.addNote(NOTES.E4, 0.5);
  leadTrack.addNote(NOTES.G4, 0.5);
  leadTrack.addNote(NOTES.A4, 0.5);
  leadTrack.addNote(NOTES.B4, 0.5);
  
  leadTrack.addNote(NOTES.C5, 0.5);
  leadTrack.addNote(NOTES.B4, 0.5);
  leadTrack.addNote(NOTES.A4, 0.5);
  leadTrack.addNote(NOTES.G4, 0.5);
  
  // Rest for intro bass and chords
  for (let i = 0; i < 16; i++) {
    leadTrack.addRest(0.5);
  }
  
  // Drums intro - simple kick and snare
  for (let i = 0; i < 8; i++) {
    drumTrack.addNote(DRUMS.kickDrum, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
    drumTrack.addNote(DRUMS.snare, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
  }
  
  // MAIN SECTION (32 bars - memorable melody)
  // Verse A - happy, bouncy melody
  const melodyA = [
    NOTES.C5, NOTES.E4, NOTES.G4, NOTES.A4,
    NOTES.B4, NOTES.A4, NOTES.G4, NOTES.E4,
    NOTES.D4, NOTES.E4, NOTES.F4, NOTES.G4,
    NOTES.A4, NOTES.G4, NOTES.F4, NOTES.E4,
  ];
  
  // Play main melody twice (16 bars each = 32 quarter notes)
  for (let rep = 0; rep < 2; rep++) {
    for (let note of melodyA) {
      leadTrack.addNote(note, 0.5);
    }
    
    // Bass line supporting main melody
    const bassLine = [
      NOTES.C3, NOTES.C3, NOTES.G3, NOTES.G3,
      NOTES.A3, NOTES.A3, NOTES.E3, NOTES.E3,
      NOTES.D3, NOTES.D3, NOTES.A3, NOTES.A3,
      NOTES.G3, NOTES.G3, NOTES.E3, NOTES.E3,
    ];
    
    for (let note of bassLine) {
      bassTrack.addNote(note, 1.0);
    }
    
    // Drum pattern - keep energy high
    for (let bar = 0; bar < 16; bar++) {
      drumTrack.addNote(DRUMS.kickDrum, 0.5);
      drumTrack.addNote(DRUMS.closedHiHat, 0.25);
      drumTrack.addNote(DRUMS.snare, 0.5);
      drumTrack.addNote(DRUMS.closedHiHat, 0.25);
    }
  }
  
  // Chorus section variation (16 bars)
  const melodyB = [
    NOTES.C5, NOTES.G4, NOTES.A4, NOTES.B4,
    NOTES.C6, NOTES.B5, NOTES.A5, NOTES.G5,
    NOTES.E5, NOTES.F5, NOTES.G5, NOTES.A5,
    NOTES.B5, NOTES.A5, NOTES.G5, NOTES.E5,
  ];
  
  for (let note of melodyB) {
    leadTrack.addNote(note, 0.5);
  }
  
  // Bass for chorus
  const bassB = [
    NOTES.C3, NOTES.C3, NOTES.C3, NOTES.C3,
    NOTES.F3, NOTES.F3, NOTES.C3, NOTES.C3,
    NOTES.G3, NOTES.G3, NOTES.G3, NOTES.G3,
    NOTES.E3, NOTES.E3, NOTES.B2, NOTES.B2,
  ];
  
  for (let note of bassB) {
    bassTrack.addNote(note, 1.0);
  }
  
  // Drums - intensify chorus
  for (let bar = 0; bar < 16; bar++) {
    drumTrack.addNote(DRUMS.kickDrum, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
    drumTrack.addNote(DRUMS.snare, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
  }
  
  // OUTRO (8 bars - wind down)
  const outroMelody = [
    NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4,
    NOTES.E4, NOTES.D4, NOTES.E4, NOTES.G4,
    NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4,
    NOTES.E4, NOTES.E4, NOTES.E4, NOTES.E4,
  ];
  
  for (let note of outroMelody) {
    leadTrack.addNote(note, 0.5);
  }
  
  // Bass outro
  for (let i = 0; i < 8; i++) {
    bassTrack.addNote(NOTES.C3, 0.5);
    bassTrack.addNote(NOTES.C3, 0.5);
  }
  
  // Final drums
  for (let i = 0; i < 4; i++) {
    drumTrack.addNote(DRUMS.kickDrum, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
    drumTrack.addNote(DRUMS.snare, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
  }
  
  // Pad chord accompaniment
  const padChords = [NOTES.C4, NOTES.E4, NOTES.G4];
  for (let i = 0; i < 60; i++) {
    chordTrack.addNote(padChords[i % 3], 1.0);
  }
  
  file.addTrack(leadTrack);
  file.addTrack(drumTrack);
  file.addTrack(bassTrack);
  file.addTrack(chordTrack);
  
  return file;
}

/**
 * Generate Level Theme - Energetic, loopable gameplay music
 * Structure: Intro (8 bars) → Loop section (64 bars) → Outro (8 bars)
 * BPM: 155
 */
function generateLevelTheme() {
  const file = new Midi();
  
  const leadTrack = new Track();
  leadTrack.setTempo(155); // BPM set on first track
  leadTrack.setInstrument(80); // Square wave synthesizer
  leadTrack.setVolume(100);
  
  const drumTrack = new Track();
  drumTrack.setChannel(9);
  drumTrack.setVolume(95);
  
  const bassTrack = new Track();
  bassTrack.setInstrument(33); // Electric Bass
  bassTrack.setVolume(90);
  
  // INTRO (8 bars)
  // Synth riff hook
  const introRiff = [
    NOTES.G4, NOTES.G4, NOTES.A4, NOTES.B4,
    NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4,
  ];
  
  for (let note of introRiff) {
    leadTrack.addNote(note, 0.5);
  }
  
  // Intro bass - minimal
  for (let i = 0; i < 4; i++) {
    bassTrack.addNote(NOTES.G3, 1.0);
  }
  
  // Intro drums - building
  for (let i = 0; i < 8; i++) {
    drumTrack.addNote(DRUMS.kickDrum, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.5);
  }
  
  // MAIN LOOP SECTION (64 bars = 256 quarter notes)
  // This section loops seamlessly during gameplay
  
  // Main melody - catchy and energetic
  const mainMelody = [
    // Bar 1-4: Primary hook
    NOTES.G4, NOTES.A4, NOTES.B4, NOTES.C5,
    NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4,
    NOTES.A4, NOTES.B4, NOTES.C5, NOTES.D5,
    NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4,
    
    // Bar 5-8: Secondary hook
    NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4,
    NOTES.A4, NOTES.B4, NOTES.C5, NOTES.D5,
    NOTES.G4, NOTES.A4, NOTES.B4, NOTES.C5,
    NOTES.B4, NOTES.A4, NOTES.G4, NOTES.F4,
    
    // Bar 9-12: Build-up variation
    NOTES.G4, NOTES.G4, NOTES.A4, NOTES.A4,
    NOTES.B4, NOTES.B4, NOTES.C5, NOTES.C5,
    NOTES.D5, NOTES.D5, NOTES.C5, NOTES.B4,
    NOTES.A4, NOTES.A4, NOTES.G4, NOTES.G4,
    
    // Bar 13-16: Energy peak
    NOTES.C5, NOTES.B4, NOTES.A4, NOTES.B4,
    NOTES.C5, NOTES.D5, NOTES.E5, NOTES.D5,
    NOTES.C5, NOTES.B4, NOTES.C5, NOTES.A4,
    NOTES.G4, NOTES.A4, NOTES.B4, NOTES.C5,
  ];
  
  // Play main melody 4 times to fill 64 bars
  for (let rep = 0; rep < 4; rep++) {
    for (let note of mainMelody) {
      leadTrack.addNote(note, 0.5);
    }
  }
  
  // Bass line - driving rhythm
  const bassMelody = [
    // 16-bar bass pattern
    NOTES.G3, NOTES.G3, NOTES.G3, NOTES.G3,
    NOTES.D3, NOTES.D3, NOTES.D3, NOTES.D3,
    NOTES.A3, NOTES.A3, NOTES.A3, NOTES.A3,
    NOTES.E3, NOTES.E3, NOTES.E3, NOTES.E3,
  ];
  
  // Repeat bass pattern 4 times to match 64-bar main loop
  for (let rep = 0; rep < 4; rep++) {
    for (let note of bassMelody) {
      bassTrack.addNote(note, 1.0);
    }
  }
  
  // Drums - consistent energetic pattern
  for (let bar = 0; bar < 64; bar++) {
    // Kick on 1 and 3, snare on 2 and 4, hi-hats throughout
    if (bar % 2 === 0) {
      drumTrack.addNote(DRUMS.kickDrum, 0.5);
    } else {
      drumTrack.addNote(DRUMS.snare, 0.5);
    }
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
  }
  
  // OUTRO (8 bars - gradual fade-like ending for non-looping playback)
  const outroMelody = [
    NOTES.G4, NOTES.G4, NOTES.G4, NOTES.G4,
    NOTES.G4, NOTES.G4, NOTES.G4, NOTES.G4,
    NOTES.G4, NOTES.G4, NOTES.G4, NOTES.G4,
    NOTES.G4, NOTES.G4, NOTES.G4, NOTES.G4,
  ];
  
  for (let note of outroMelody) {
    leadTrack.addNote(note, 0.5);
  }
  
  // Bass outro
  for (let i = 0; i < 8; i++) {
    bassTrack.addNote(NOTES.G3, 1.0);
  }
  
  // Drums outro
  for (let i = 0; i < 8; i++) {
    drumTrack.addNote(DRUMS.kickDrum, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
    drumTrack.addNote(DRUMS.snare, 0.5);
    drumTrack.addNote(DRUMS.closedHiHat, 0.25);
  }
  
  file.addTrack(leadTrack);
  file.addTrack(drumTrack);
  file.addTrack(bassTrack);
  
  return file;
}

/**
 * Generate Victory Theme - Celebratory fanfare
 * Structure: Intro (2 bars) → Victory fanfare (12 bars) → Outro (2 bars)
 * BPM: 160
 */
function generateVictoryTheme() {
  const file = new Midi();
  
  const leadTrack = new Track();
  leadTrack.setTempo(160); // BPM set on first track
  leadTrack.setInstrument(56); // Trumpet
  leadTrack.setVolume(110);
  
  const drumTrack = new Track();
  drumTrack.setChannel(9);
  drumTrack.setVolume(100);
  
  const bassTrack = new Track();
  bassTrack.setInstrument(33); // Electric Bass
  bassTrack.setVolume(95);
  
  // INTRO (2 bars - cymbal crash setup)
  for (let i = 0; i < 2; i++) {
    leadTrack.addRest(2.0);
    drumTrack.addNote(0x31, 0.5); // Cymbal crash
    drumTrack.addRest(1.5);
    bassTrack.addRest(2.0);
  }
  
  // VICTORY FANFARE (12 bars - triumphant melody)
  const victoryMelody = [
    // Bright ascending phrase
    NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6,
    NOTES.C6, NOTES.G5, NOTES.E5, NOTES.C5,
    
    // Triumphant peak
    NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6,
    NOTES.C6, NOTES.B5, NOTES.A5, NOTES.G5,
    
    // Resolving phrase
    NOTES.C6, NOTES.C6, NOTES.C6, NOTES.C6,
    NOTES.B5, NOTES.A5, NOTES.G5, NOTES.C6,
  ];
  
  for (let note of victoryMelody) {
    leadTrack.addNote(note, 0.5);
  }
  
  // Victory bass
  const victoryBass = [
    NOTES.C3, NOTES.C3, NOTES.E3, NOTES.E3,
    NOTES.G3, NOTES.G3, NOTES.C3, NOTES.C3,
    NOTES.G3, NOTES.G3, NOTES.B3, NOTES.B3,
    NOTES.C4, NOTES.C4, NOTES.G3, NOTES.C3,
  ];
  
  for (let note of victoryBass) {
    bassTrack.addNote(note, 1.0);
  }
  
  // Victory drums - celebratory
  const victoryDrumPattern = [
    DRUMS.kickDrum, DRUMS.closedHiHat, DRUMS.snare, DRUMS.closedHiHat,
    DRUMS.kickDrum, DRUMS.kickDrum, DRUMS.snare, DRUMS.closedHiHat,
    DRUMS.kickDrum, DRUMS.closedHiHat, DRUMS.snare, DRUMS.closedHiHat,
    DRUMS.kickDrum, DRUMS.closedHiHat, DRUMS.snare, DRUMS.snare,
  ];
  
  for (let note of victoryDrumPattern) {
    drumTrack.addNote(note, 0.5);
  }
  
  // OUTRO (2 bars - sustained victory chord)
  leadTrack.addNote(NOTES.C6, 1.0);
  leadTrack.addNote(NOTES.C6, 1.0);
  
  bassTrack.addNote(NOTES.C3, 1.0);
  bassTrack.addNote(NOTES.C3, 1.0);
  
  for (let i = 0; i < 4; i++) {
    drumTrack.addNote(DRUMS.closedHiHat, 0.5);
  }
  
  file.addTrack(leadTrack);
  file.addTrack(drumTrack);
  file.addTrack(bassTrack);
  
  return file;
}

/**
 * Generate Electricity Sound Effect - Short electrical zap for terminal interactions
 * Structure: Quick burst (~0.5-1 second)
 * BPM: 200
 */
function generateElectricitySound() {
  const file = new Midi();
  
  // Synth track - Charang synth for electrical sound
  const synthTrack = new Track();
  synthTrack.setTempo(200); // BPM set on first track
  synthTrack.setInstrument(0, 84); // Channel 0, Charang instrument - bright, piercing synth
  
  // Quick ascending chromatic burst (electric charge-up)
  const zapSequence = [
    NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5,
    NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6,
  ];
  
  for (let note of zapSequence) {
    synthTrack.addNote(0, note, 3); // Channel 0, very short duration (3 ticks)
  }
  
  // Quick descending sequence for "release" (electric discharge)
  const releaseSequence = [NOTES.C6, NOTES.A5, NOTES.F5, NOTES.C5];
  for (let note of releaseSequence) {
    synthTrack.addNote(0, note, 3); // Channel 0, very short duration
  }
  
  // Add some "crackle" with rapid alternating high notes
  const crackle = [NOTES.G6, NOTES.E6, NOTES.G6, NOTES.D6];
  for (let note of crackle) {
    synthTrack.addNote(0, note, 2); // Channel 0, even shorter for crackle effect
  }
  
  file.addTrack(synthTrack);
  
  return file;
}

/**
 * Save MIDI file
 */
function saveMidiFile(midiFile, filename) {
  try {
    const filepath = join(OUTPUT_DIR, filename);
    const data = midiFile.toBytes();
    const buffer = Buffer.from(data);
    
    // Write file synchronously
    const fs = require('fs');
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated: ${filename} (${buffer.length} bytes)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to save ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main generation function
 */
export async function generateAllTracks() {
  console.log('\n🎵 Everything is Connected - Music Generator\n');
  
  // Try to initialize MIDI library
  const loaded = await initializeMidi();
  if (!loaded) {
    console.error('\n⚠ Cannot proceed without jsmidgen.');
    console.error('Install with: npm install --save-dev jsmidgen\n');
    process.exit(1);
  }
  
  console.log('\nGenerating music tracks...\n');
  
  try {
    // Generate Menu Theme
    console.log('🎼 Menu Theme (150 BPM, 75 seconds)');
    const menuTheme = generateMenuTheme();
    saveMidiFile(menuTheme, 'menu-theme.mid');
    
    // Generate Level Theme
    console.log('🎼 Level Theme (155 BPM, 140 seconds, loopable)');
    const levelTheme = generateLevelTheme();
    saveMidiFile(levelTheme, 'level-theme.mid');
    
    // Generate Victory Theme
    console.log('🎼 Victory Theme (160 BPM, 28 seconds)');
    const victoryTheme = generateVictoryTheme();
    saveMidiFile(victoryTheme, 'victory-theme.mid');
    
    // Generate Electricity Sound Effect
    console.log('⚡ Electricity Sound Effect (200 BPM, ~1 second)');
    const electricitySound = generateElectricitySound();
    saveMidiFile(electricitySound, 'electricity-sfx.mid');
    
    console.log('\n✅ All music files generated successfully!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
    
  } catch (error) {
    console.error('✗ Error during generation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllTracks().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export {
  generateMenuTheme,
  generateLevelTheme,
  generateVictoryTheme,
  generateElectricitySound,
};
