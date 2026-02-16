/**
 * Audio Generation Script
 * Runs the MusicGenerator to create all MIDI files
 */

import { generateAllTracks } from '../src/audio/MusicGenerator.js';

// Generate all music tracks and sound effects
generateAllTracks().catch(error => {
  console.error('Failed to generate audio:', error);
  process.exit(1);
});
