# Music Composition Guide for ProceduralMusic.js

This guide explains how to compose new procedural music tracks for game levels using the Web Audio API-based music system.

## Overview

The game uses a **three-section structure** for level music:
1. **Section A** (8 bars): Energetic melody with rich harmonies
2. **Section A repeat** (8 bars): Exact duplicate for emphasis
3. **Section B** (16 bars): Milder variation with simpler lead
4. **Loop**: Seamlessly returns to start

**Total duration**: 32 bars (~28 seconds at 135 BPM) per complete cycle.

## Core Structure

### Track Method (`_level()` or similar)

```javascript
_level() {
  const bpm = 135;
  const q = 60 / bpm;       // quarter note
  const h = q * 2;          // half note
  
  // Build Section A (8 bars)
  const sectionA = this._levelSectionA();
  
  // Calculate Section A duration (8 half-note bars)
  const sectionADuration = 8 * h;
  
  // Duplicate Section A for repeat
  const sectionARepeat = sectionA.map(note => ({
    ...note,
    t: note.t + sectionADuration
  }));
  
  // Build Section B starting after both A sections (16 bars)
  const sectionB = this._levelSectionB(sectionADuration * 2);
  
  return [...sectionA, ...sectionARepeat, ...sectionB];
}
```

**Key points**:
- Never hardcode durations (like `30.0`). Always calculate from BPM and bar count.
- Time offsets for sections are `sectionADuration * repetitions`.
- Concatenate all sections into a single array.

## Section A: Energetic Version (8 bars)

### Structure
- **Lead melody**: Square wave, eighth notes (32 notes total)
- **Harmony 1**: Triangle wave, quarter notes (16 notes total)
- **Harmony 2**: Sine wave pad, half notes (8 notes total)
- **Bass**: Triangle wave, half notes (8 notes total)
- **Drums**: Kick/snare/hat pattern, 8 bars

### Timing Constants

```javascript
const bpm = 135;           // Beats per minute
const q = 60 / bpm;        // quarter note (~0.444s)
const e = q / 2;           // eighth note (~0.222s)
const h = q * 2;           // half note (~0.889s)
```

### Lead Melody (Square Wave)

```javascript
// 32 eighth notes = 8 bars
const melody = [
  NOTE.C5, NOTE.E5, NOTE.G4, NOTE.C5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.G4,  // Bar 1-2
  NOTE.A4, NOTE.B4, NOTE.C5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.G4, NOTE.C5,  // Bar 3-4
  NOTE.E5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G4,  // Bar 5-6
  NOTE.A4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5,  // Bar 7-8
];
for (let i = 0; i < melody.length; i++) {
  seq.push({ 
    t: i * e, 
    freq: melody[i], 
    d: e * 0.95,          // 95% of beat length (no gaps)
    wave: 'square', 
    vol: 0.06 
  });
}
```

**Guidelines**:
- Use eighth notes for rhythmic drive
- Create memorable melodic phrases (2-4 bars each)
- Stay within C4-C6 range
- Duration: `e * 0.95` fills most of the beat without overlap

### Harmony Layer 1 (Triangle Wave)

```javascript
// 16 quarter notes = 8 bars (follows chord progression)
const harmony1 = [
  NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4,   // Bars 1-2 (C and Em chords)
  NOTE.F4, NOTE.A4, NOTE.G4, NOTE.G4,   // Bars 3-4 (F and G chords)
  NOTE.E4, NOTE.G4, NOTE.E4, NOTE.D4,   // Bars 5-6 (Em and D chords)
  NOTE.F4, NOTE.C4, NOTE.D4, NOTE.B3,   // Bars 7-8 (F and G chords)
];
for (let i = 0; i < harmony1.length; i++) {
  seq.push({ 
    t: i * q, 
    freq: harmony1[i], 
    d: q * 0.95, 
    wave: 'triangle', 
    vol: 0.04 
  });
}
```

**Guidelines**:
- Use chord tones from the progression
- Quarter note rhythm provides steady harmonic support
- Volume: 0.03-0.05 (supporting role)

### Harmony Layer 2 (Sine Pad)

```javascript
// 8 half notes = 8 bars (sustained harmonic pad)
const harmony2 = [
  NOTE.E4, NOTE.G4, NOTE.A4, NOTE.B4,   // Bars 1-4
  NOTE.G4, NOTE.B4, NOTE.C5, NOTE.D5    // Bars 5-8
];
for (let i = 0; i < harmony2.length; i++) {
  seq.push({ 
    t: i * h, 
    freq: harmony2[i], 
    d: h * 0.98,          // Very sustained for pad effect
    wave: 'sine', 
    vol: 0.035 
  });
}
```

**Guidelines**:
- Sine waves create smooth, atmospheric background
- Half notes provide harmonic texture without rhythmic clash
- Very high duration multiplier (0.98) for continuous pad
- Volume: 0.03-0.04 (subtle presence)

### Bass Line (Triangle Wave)

```javascript
// 8 half notes = 8 bars (defines chord progression)
const bass = [
  NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3,   // Bars 1-4
  NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3    // Bars 5-8
];
for (let i = 0; i < bass.length; i++) {
  seq.push({ 
    t: i * h, 
    freq: bass[i], 
    d: h * 0.98, 
    wave: 'triangle', 
    vol: 0.10 
  });
}
```

**Guidelines**:
- Bass is the FOUNDATION - keep consistent between sections
- Use root notes of chord progression
- Half notes provide strong rhythmic anchor
- Volume: 0.08-0.12 (prominent but not overpowering)
- **CRITICAL**: This exact pattern must continue in Section B

### Drums

```javascript
// 8 bars
for (let bar = 0; bar < 8; bar++) {
  const bt = bar * h;
  seq.push({ t: bt,         drum: 'kick', freq: 0 });
  seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
  seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
  seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
}
```

**Pattern**: Kick (downbeat) → Hat (offbeat) → Snare (backbeat) → Hat (offbeat)

This creates a standard four-on-the-floor dance beat.

## Section B: Milder Version (16 bars)

Section B plays **twice as long** as Section A to provide contrast and breathing room.

### Structure
- **Lead melody**: Square wave, half/quarter notes (simpler, slower)
- **Baritone harmony**: Triangle wave, quarter notes (lower register)
- **Bass**: Triangle wave, half notes (SAME as Section A)
- **Drums**: Same pattern, 16 bars

### Lead Melody (Simpler & Slower)

```javascript
const simpleLead = [
  // First 8 bars
  { note: NOTE.C5, dur: h },      // Bar 1
  { note: NOTE.E5, dur: h },      // Bar 2
  { note: NOTE.G4, dur: q },      // Bar 3 beat 1
  { note: NOTE.C5, dur: q },      // Bar 3 beat 2
  { note: NOTE.D5, dur: h },      // Bar 4
  { note: NOTE.E5, dur: q },      // Bar 5 beat 1
  { note: NOTE.D5, dur: q },      // Bar 5 beat 2
  { note: NOTE.C5, dur: h },      // Bar 6
  { note: NOTE.G4, dur: q },      // Bar 7 beat 1
  { note: NOTE.A4, dur: q },      // Bar 7 beat 2
  { note: NOTE.G4, dur: h },      // Bar 8

  // Repeat for bars 9-16 (exact duplicate or slight variation)
  { note: NOTE.C5, dur: h },      // Bar 9
  { note: NOTE.E5, dur: h },      // Bar 10
  // ... etc
];

let time = startTime;
for (const { note, dur } of simpleLead) {
  seq.push({ 
    t: time, 
    freq: note, 
    d: dur * 0.98,        // Very sustained for contemplative feel
    wave: 'square', 
    vol: 0.045            // 25% quieter than Section A
  });
  time += dur;
}
```

**Guidelines**:
- Use half notes and quarter notes (no eighth notes = less busy)
- Lower volume (0.04-0.05 vs 0.06 in Section A)
- Longer note durations = contemplative, relaxed
- Repeat the 8-bar phrase to fill 16 bars

### Baritone Harmony (Triangle Wave)

```javascript
// 32 quarter notes = 16 bars (lower register counter-melody)
const baritone = [
  NOTE.E3, NOTE.G3, NOTE.C3, NOTE.E3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3,  // Bars 1-4
  NOTE.E3, NOTE.C3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.B3,  // Bars 5-8
  NOTE.E3, NOTE.G3, NOTE.C3, NOTE.E3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3,  // Bars 9-12
  NOTE.E3, NOTE.C3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.B3,  // Bars 13-16
];
for (let i = 0; i < baritone.length; i++) {
  seq.push({ 
    t: startTime + i * q, 
    freq: baritone[i], 
    d: q * 0.95, 
    wave: 'triangle', 
    vol: 0.055 
  });
}
```

**Guidelines**:
- Stay in C3-B3 range (lower than Section A harmony)
- Quarter notes provide rhythmic interest without overpowering
- Complement the simpler lead melody
- Volume: 0.05-0.06

### Bass (SAME AS SECTION A)

```javascript
// 16 half notes = 16 bars (MUST maintain chord progression)
const bass = [
  NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3,   // Bars 1-4
  NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3,   // Bars 5-8
  NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3,   // Bars 9-12 (repeat pattern)
  NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3,   // Bars 13-16
];
for (let i = 0; i < bass.length; i++) {
  seq.push({ 
    t: startTime + i * h, 
    freq: bass[i], 
    d: h * 0.98, 
    wave: 'triangle', 
    vol: 0.10             // SAME volume as Section A
  });
}
```

**CRITICAL**: The bass line MUST use the same chord progression and volume as Section A. This is what keeps the song cohesive.

### Drums (16 bars)

```javascript
for (let bar = 0; bar < 16; bar++) {
  const bt = startTime + bar * h;
  seq.push({ t: bt,         drum: 'kick', freq: 0 });
  seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
  seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
  seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
}
```

Same pattern, just twice as many bars.

## Avoiding Gaps

### 1. Note Duration Multipliers

Use high duration multipliers to make notes sustain almost until the next note:

- **Lead melodies**: `d: noteValue * 0.95`
- **Harmonies**: `d: noteValue * 0.95`
- **Bass/pads**: `d: noteValue * 0.98` (very sustained)

The small gap (5% or 2%) is necessary for the ADSR envelope's release phase to prevent clicking.

### 2. Section Timing

Calculate section start times from bar counts, not hardcoded seconds:

```javascript
// WRONG
const sectionBStart = 30.0;  // Hardcoded

// CORRECT
const sectionADuration = 8 * h;  // Calculate from tempo
const sectionBStart = sectionADuration * 2;  // Two A sections
```

### 3. Loop Seamlessness

The `_schedule()` method uses `setTimeout(callback, end * 1000)` with NO added buffer:

```javascript
// In _schedule():
setTimeout(() => {
  if (this._playing) {
    this._nodes = [];
    this._schedule(this._track === 'menu' ? this._menu() : this._level(), true);
  }
}, end * 1000);  // NO +80 buffer!
```

This ensures the loop restarts immediately as the last notes end.

## Note Frequencies (C Major Scale)

```javascript
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00,
  C6: 1046.50,
  REST: 0,
};
```

## Volume Guidelines

- **Lead melody (Section A)**: 0.06
- **Lead melody (Section B)**: 0.045 (25% quieter)
- **Harmony 1 (triangle)**: 0.04
- **Harmony 2 (sine pad)**: 0.035
- **Baritone harmony**: 0.055
- **Bass**: 0.10 (consistent in both sections)
- **Master volume**: 0.3 (set in constructor)

## Waveform Choices

- **Square**: Bright, chiptune lead melodies
- **Triangle**: Warm, mellow harmonies and bass
- **Sine**: Smooth, atmospheric pads

## Chord Progression

The level music uses a **C major progression**:
- C (I) → G (V) → F (IV) → G (V)
- Pattern repeats every 4 bars

For variety, you can:
- Add Em (iii) or Am (vi) for minor color
- Use inversions (e.g., E3 instead of C3 for C chord)
- Modulate briefly to relative minor (Am)

## Creating a New Level Track

1. **Copy the `_level()` structure** and rename (e.g., `_level2()`)
2. **Choose a BPM** (120-150 works well for platformers)
3. **Compose Section A melody** (8 bars, energetic, eighth notes)
4. **Create harmonies** that follow your chord progression
5. **Define bass line** (root notes of chords, half notes)
6. **Compose Section B melody** (16 bars, simpler, half/quarter notes)
7. **Extend bass and baritone** to 16 bars for Section B
8. **Test timing**: Verify no gaps between sections or at loop point
9. **Add in GameScene** or update `playLevel()` to call your new track

## Checklist for New Tracks

- [ ] Section A is 8 bars with rich harmonies
- [ ] Section A repeats exactly once
- [ ] Section B is 16 bars with simpler, quieter lead
- [ ] Bass line is IDENTICAL in both sections (same notes, same volume)
- [ ] All note durations use 0.95-0.98 multipliers
- [ ] Section timings calculated from BPM, not hardcoded
- [ ] No `+80` or other buffer in loop timing
- [ ] Total duration: 32 bars
- [ ] Tested: No clicking, no gaps, seamless loop

## Example: Creating a Minor-Key Variation

For a darker level, use A minor:

**Section A bass** (8 bars):
```javascript
const bass = [
  NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3,   // Am → Em → F → G
  NOTE.A3, NOTE.C3, NOTE.D3, NOTE.E3    // Am → C → Dm → Em
];
```

**Lead melody** notes: `A4, C5, E5, G5, F5, D5`

Keep the same structure, just shift to the minor scale.

---

## Summary

**32-bar structure**: 8 bars energetic (Section A) × 2 repetitions + 16 bars milder (Section B)

**Key principle**: Bass line is the glue. Keep it consistent across ALL sections.

**No gaps**: High duration multipliers (0.95-0.98) + calculated timing + no loop buffer

**Variety**: Section A = busy eighth notes, rich harmonies. Section B = simple half/quarter notes, single baritone harmony.

Follow this guide and your level music will loop seamlessly with professional-sounding structure!
