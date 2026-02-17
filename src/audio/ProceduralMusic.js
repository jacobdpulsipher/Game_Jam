/**
 * ProceduralMusic — retro chiptune music via Web Audio API.
 *
 * Three tracks: menu (chill loop), level (upbeat loop), victory (one-shot).
 * Uses proper ADSR envelopes so notes sound like tones, not clicks.
 */

const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00,
  C6: 1046.50,
  REST: 0,
};

export class ProceduralMusic {
  constructor() {
    this.ctx = null;
    this._master = null;
    this._nodes = [];
    this._playing = false;
    this._track = null;
    this._timer = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._master = this.ctx.createGain();
    this._master.gain.value = 0.3;
    this._master.connect(this.ctx.destination);
  }

  setVolume(v) {
    if (this._master) this._master.gain.value = Math.max(0, Math.min(1, v));
  }

  stop() {
    this._playing = false;
    this._track = null;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    for (const n of this._nodes) {
      try { n.stop(); } catch (_) { /* */ }
    }
    this._nodes = [];
  }

  playMenu()  { this._play('menu'); }
  playLevel(levelNum = 1) { this._play(`level${levelNum}`); }

  playVictory() {
    this.stop();
    this.init();
    this._schedule(this._victory(), false);
  }

  /**
   * Play electricity zap sound effect for plug/unplug actions.
   * Creates a buzzing electrical sound with noise and frequency modulation.
   */
  playElectricZap() {
    this.init();
    const now = this.ctx.currentTime;
    this._electricZap(now);
  }

  /**
   * Play a metallic wrench clang sound effect.
   * Simulates metal-on-metal impact for the repair animation.
   */
  playMetalClang() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Impact transient — short bright ping
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    g1.gain.setValueAtTime(0.18, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(g1); g1.connect(this._master);
    osc1.start(now); osc1.stop(now + 0.15);
    this._nodes.push(osc1);

    // 2. Metallic ring — resonant sine decay
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 620;
    g2.gain.setValueAtTime(0.1, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(g2); g2.connect(this._master);
    osc2.start(now); osc2.stop(now + 0.3);
    this._nodes.push(osc2);

    // 3. Noise burst — impact crunch
    const noiseLen = Math.floor(this.ctx.sampleRate * 0.04);
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 2;
    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0.15, now);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    src.connect(bp); bp.connect(g3); g3.connect(this._master);
    src.start(now); src.stop(now + 0.08);
    this._nodes.push(src);
  }

  /**
   * Play a death sound — descending buzz + thud when the player dies.
   * Short (~0.5s), punchy, unmistakably "you died".
   */
  playDeath() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Descending pitch sweep — the classic "wah wah" fall
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.45);
    g1.gain.setValueAtTime(0.18, now);
    g1.gain.linearRampToValueAtTime(0.12, now + 0.15);
    g1.gain.linearRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(g1); g1.connect(this._master);
    osc1.start(now); osc1.stop(now + 0.55);
    this._nodes.push(osc1);

    // 2. Low thud — impact hit
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    g2.gain.setValueAtTime(0.35, now + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(g2); g2.connect(this._master);
    osc2.start(now + 0.05); osc2.stop(now + 0.4);
    this._nodes.push(osc2);

    // 3. Noise crackle — electric fizzle
    const noiseLen = Math.floor(this.ctx.sampleRate * 0.25);
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      nd[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 2;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.2, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    src.connect(bp); bp.connect(ng); ng.connect(this._master);
    src.start(now); src.stop(now + 0.3);
    this._nodes.push(src);
  }

  /**
   * Play an electric blast sound effect for killing enemies.
   * Short, punchy burst with a zap crack.
   */
  playElectricBlast() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Punchy low thump — impact bass
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    g1.gain.setValueAtTime(0.45, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(g1); g1.connect(this._master);
    osc1.start(now); osc1.stop(now + 0.35);
    this._nodes.push(osc1);

    // 2. High zap crack — sharp electrical snap
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(2500, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.12);
    g2.gain.setValueAtTime(0.3, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(g2); g2.connect(this._master);
    osc2.start(now); osc2.stop(now + 0.2);
    this._nodes.push(osc2);

    // 3. Buzzy mid crackle
    const osc3 = this.ctx.createOscillator();
    const g3 = this.ctx.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(800, now);
    osc3.frequency.exponentialRampToValueAtTime(150, now + 0.22);
    g3.gain.setValueAtTime(0.2, now);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc3.connect(g3); g3.connect(this._master);
    osc3.start(now); osc3.stop(now + 0.3);
    this._nodes.push(osc3);

    // 4. Noise burst — explosive crackle
    const noiseLen = Math.floor(this.ctx.sampleRate * 0.18);
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      nd[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = noiseBuf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.35, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.connect(ng); ng.connect(this._master);
    src.start(now); src.stop(now + 0.25);
    this._nodes.push(src);
  }

  /**
   * Play a powering-up sweep sound effect.
   * A low-to-high pitch ramp simulating systems coming online.
   * @param {number} duration - Duration in seconds (default 1.5)
   */
  playPowerUp(duration = 1.5) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Main rising tone — low hum sweeping up
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(60, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + duration * 0.85);
    osc1.frequency.exponentialRampToValueAtTime(600, now + duration); // slight settle
    g1.gain.setValueAtTime(0.02, now);
    g1.gain.linearRampToValueAtTime(0.1, now + duration * 0.6);
    g1.gain.linearRampToValueAtTime(0.06, now + duration);
    g1.gain.linearRampToValueAtTime(0.001, now + duration + 0.3);
    osc1.connect(g1); g1.connect(this._master);
    osc1.start(now); osc1.stop(now + duration + 0.35);
    this._nodes.push(osc1);

    // 2. Sub-harmonic rumble — gives depth to the power-up
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(30, now);
    osc2.frequency.exponentialRampToValueAtTime(120, now + duration);
    g2.gain.setValueAtTime(0.08, now);
    g2.gain.linearRampToValueAtTime(0.04, now + duration * 0.7);
    g2.gain.linearRampToValueAtTime(0.001, now + duration + 0.2);
    osc2.connect(g2); g2.connect(this._master);
    osc2.start(now); osc2.stop(now + duration + 0.25);
    this._nodes.push(osc2);

    // 3. High-frequency whine — electrical charge building
    const osc3 = this.ctx.createOscillator();
    const g3 = this.ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(200, now);
    osc3.frequency.exponentialRampToValueAtTime(2400, now + duration);
    g3.gain.setValueAtTime(0.001, now);
    g3.gain.linearRampToValueAtTime(0.04, now + duration * 0.5);
    g3.gain.linearRampToValueAtTime(0.02, now + duration);
    g3.gain.linearRampToValueAtTime(0.001, now + duration + 0.2);
    osc3.connect(g3); g3.connect(this._master);
    osc3.start(now); osc3.stop(now + duration + 0.25);
    this._nodes.push(osc3);

    // 4. Electrical crackle at the peak — brief noise burst
    const crackleStart = now + duration * 0.8;
    const crackleLen = Math.floor(this.ctx.sampleRate * 0.1);
    const crackleBuf = this.ctx.createBuffer(1, crackleLen, this.ctx.sampleRate);
    const cd = crackleBuf.getChannelData(0);
    for (let i = 0; i < crackleLen; i++) {
      cd[i] = (Math.random() * 2 - 1) * (1 - i / crackleLen) * 0.6;
    }
    const crackleSrc = this.ctx.createBufferSource();
    crackleSrc.buffer = crackleBuf;
    const cg = this.ctx.createGain();
    cg.gain.setValueAtTime(0.08, crackleStart);
    cg.gain.linearRampToValueAtTime(0.001, crackleStart + 0.1);
    crackleSrc.connect(cg); cg.connect(this._master);
    crackleSrc.start(crackleStart); crackleSrc.stop(crackleStart + 0.12);
    this._nodes.push(crackleSrc);
  }

  /**
   * Play a hand-radio beep — the classic two-tone "walkie-talkie" chirp
   * heard when a push-to-talk radio opens. Short squelch burst + dual-tone beep.
   */
  playRadioBeep() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Static squelch burst — filtered noise (radio opening)
    const squelchLen = Math.floor(this.ctx.sampleRate * 0.08);
    const squelchBuf = this.ctx.createBuffer(1, squelchLen, this.ctx.sampleRate);
    const squelchData = squelchBuf.getChannelData(0);
    for (let i = 0; i < squelchLen; i++) {
      squelchData[i] = (Math.random() * 2 - 1) * (1 - i / squelchLen);
    }
    const squelchSrc = this.ctx.createBufferSource();
    squelchSrc.buffer = squelchBuf;
    const squelchBp = this.ctx.createBiquadFilter();
    squelchBp.type = 'bandpass'; squelchBp.frequency.value = 2200; squelchBp.Q.value = 3;
    const squelchG = this.ctx.createGain();
    squelchG.gain.setValueAtTime(0.15, now);
    squelchG.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    squelchSrc.connect(squelchBp); squelchBp.connect(squelchG); squelchG.connect(this._master);
    squelchSrc.start(now); squelchSrc.stop(now + 0.1);
    this._nodes.push(squelchSrc);

    // 2. Dual-tone beep (like a two-way radio chirp: ~1000 Hz + ~1300 Hz)
    const beepStart = now + 0.06;
    const beepDur = 0.12;
    const freqs = [1000, 1300];
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.12, beepStart);
      g.gain.setValueAtTime(0.12, beepStart + beepDur * 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, beepStart + beepDur);
      osc.connect(g); g.connect(this._master);
      osc.start(beepStart); osc.stop(beepStart + beepDur + 0.02);
      this._nodes.push(osc);
    }

    // 3. Second beep (slightly higher, confirms transmission)
    const beep2Start = beepStart + 0.15;
    const beep2Dur = 0.1;
    const freqs2 = [1200, 1500];
    for (const freq of freqs2) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.10, beep2Start);
      g.gain.setValueAtTime(0.10, beep2Start + beep2Dur * 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, beep2Start + beep2Dur);
      osc.connect(g); g.connect(this._master);
      osc.start(beep2Start); osc.stop(beep2Start + beep2Dur + 0.02);
      this._nodes.push(osc);
    }
  }

  /**
   * Play a joyful rescue chime — bright ascending arpeggio when the player
   * reaches Voltage Jack. Short, triumphant, and warm.
   */
  playRescueChime() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Ascending major arpeggio (C-E-G-C octave) with warm triangle waves
    const notes = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5];
    const gap = 0.12;
    for (let i = 0; i < notes.length; i++) {
      const t = now + i * gap;
      const dur = i === notes.length - 1 ? 0.6 : 0.2;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.linearRampToValueAtTime(0.08, t + dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g); g.connect(this._master);
      osc.start(t); osc.stop(t + dur + 0.05);
      this._nodes.push(osc);
    }

    // Sparkle — high bell tone on top
    const bell = this.ctx.createOscillator();
    const bg = this.ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(NOTE.E5, now + notes.length * gap);
    bg.gain.setValueAtTime(0.001, now + notes.length * gap);
    bg.gain.linearRampToValueAtTime(0.06, now + notes.length * gap + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.001, now + notes.length * gap + 0.8);
    bell.connect(bg); bg.connect(this._master);
    bell.start(now + notes.length * gap);
    bell.stop(now + notes.length * gap + 0.85);
    this._nodes.push(bell);
  }

  /**
   * Play a triumphant ending theme for "To Be Continued" screen.
   * Bold, uplifting fanfare that builds to a soaring climax — the hero wins.
   */
  playEnding() {
    this.stop();
    this.init();
    if (!this.ctx) return;
    this._playing = true;
    this._track = 'ending';

    const bpm = 132;
    const q = 60 / bpm;       // quarter note
    const e = q / 2;           // eighth note
    const h = q * 2;           // half note
    const w = q * 4;           // whole note
    const seq = [];

    // ── Melody: triumphant fanfare (square wave — bold & heroic) ──
    const melody = [
      // Phrase 1: bold ascending fanfare (C major)
      { t: 0,           freq: NOTE.C5,  d: q },
      { t: q,           freq: NOTE.E5,  d: q },
      { t: q * 2,       freq: NOTE.G5,  d: h },
      { t: q * 4,       freq: NOTE.A5,  d: q },
      { t: q * 5,       freq: NOTE.G5,  d: e },
      { t: q * 5.5,     freq: NOTE.A5,  d: q * 1.5 },
      // Phrase 2: climbing higher (F major → G major)
      { t: q * 7,       freq: NOTE.C5,  d: e },
      { t: q * 7.5,     freq: NOTE.D5,  d: e },
      { t: q * 8,       freq: NOTE.E5,  d: q },
      { t: q * 9,       freq: NOTE.F5,  d: q },
      { t: q * 10,      freq: NOTE.G5,  d: h },
      { t: q * 12,      freq: NOTE.A5,  d: q },
      { t: q * 13,      freq: NOTE.G5,  d: q * 1.5 },
      // Phrase 3: triumphant peak — soaring resolution
      { t: q * 15,      freq: NOTE.E5,  d: q },
      { t: q * 16,      freq: NOTE.G5,  d: q },
      { t: q * 17,      freq: NOTE.A5,  d: q },
      { t: q * 18,      freq: NOTE.C6,  d: h },
      { t: q * 20,      freq: NOTE.A5,  d: q },
      { t: q * 21,      freq: NOTE.G5,  d: q },
      { t: q * 22,      freq: NOTE.C6,  d: w },
    ];

    for (const n of melody) {
      seq.push({ t: n.t, freq: n.freq, d: n.d, wave: 'square', vol: 0.08 });
    }

    // ── Counter-melody: bright arpeggiated fills (triangle wave) ──
    const counter = [
      { t: q * 2,   freq: NOTE.E4,  d: e },
      { t: q * 2.5, freq: NOTE.G4,  d: e },
      { t: q * 3,   freq: NOTE.C5,  d: e },
      { t: q * 3.5, freq: NOTE.E5,  d: e },
      { t: q * 10,  freq: NOTE.G4,  d: e },
      { t: q * 10.5,freq: NOTE.B4,  d: e },
      { t: q * 11,  freq: NOTE.D5,  d: e },
      { t: q * 11.5,freq: NOTE.G5,  d: e },
      { t: q * 18,  freq: NOTE.C4,  d: e },
      { t: q * 18.5,freq: NOTE.E4,  d: e },
      { t: q * 19,  freq: NOTE.G4,  d: e },
      { t: q * 19.5,freq: NOTE.C5,  d: e },
    ];

    for (const n of counter) {
      seq.push({ t: n.t, freq: n.freq, d: n.d, wave: 'triangle', vol: 0.06 });
    }

    // ── Harmony: power chords (sine — full & sustained) ──
    const chords = [
      { t: 0,       notes: [NOTE.C3, NOTE.E3, NOTE.G3],          d: q * 7 },
      { t: q * 7,   notes: [NOTE.F3, NOTE.A3, NOTE.C4],          d: q * 3 },
      { t: q * 10,  notes: [NOTE.G3, NOTE.B3, NOTE.D4],          d: q * 5 },
      { t: q * 15,  notes: [NOTE.C3, NOTE.E3, NOTE.G3],          d: q * 3 },
      { t: q * 18,  notes: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], d: q * 8 },
    ];

    for (const ch of chords) {
      for (const f of ch.notes) {
        seq.push({ t: ch.t, freq: f, d: ch.d, wave: 'sine', vol: 0.05 });
      }
    }

    // ── Bass: driving root notes (square wave — punchy) ──
    const bass = [
      { t: 0,       freq: NOTE.C3,  d: q },
      { t: q * 2,   freq: NOTE.C3,  d: q },
      { t: q * 4,   freq: NOTE.C3,  d: q },
      { t: q * 5,   freq: NOTE.G3,  d: q },
      { t: q * 7,   freq: NOTE.F3,  d: q },
      { t: q * 8,   freq: NOTE.F3,  d: q },
      { t: q * 10,  freq: NOTE.G3,  d: q },
      { t: q * 12,  freq: NOTE.G3,  d: q },
      { t: q * 14,  freq: NOTE.G3,  d: q },
      { t: q * 15,  freq: NOTE.C3,  d: q },
      { t: q * 16,  freq: NOTE.C3,  d: q },
      { t: q * 18,  freq: NOTE.C3,  d: h },
      { t: q * 20,  freq: NOTE.G3,  d: q },
      { t: q * 22,  freq: NOTE.C3,  d: w },
    ];

    for (const n of bass) {
      seq.push({ t: n.t, freq: n.freq, d: n.d, wave: 'square', vol: 0.05 });
    }

    // ── Drums: celebratory march beat ──
    const drums = [
      // Intro hits
      { t: 0,       drum: 'kick' },
      { t: e,       drum: 'hat' },
      { t: q,       drum: 'hat' },
      { t: q * 2,   drum: 'kick' },
      { t: q * 2 + e, drum: 'hat' },
      { t: q * 3,   drum: 'snare' },
      { t: q * 3 + e, drum: 'hat' },
      // Driving section
      { t: q * 4,   drum: 'kick' },
      { t: q * 4 + e, drum: 'hat' },
      { t: q * 5,   drum: 'hat' },
      { t: q * 6,   drum: 'kick' },
      { t: q * 6 + e, drum: 'hat' },
      { t: q * 7,   drum: 'snare' },
      // Build-up
      { t: q * 8,   drum: 'kick' },
      { t: q * 8 + e, drum: 'hat' },
      { t: q * 9,   drum: 'hat' },
      { t: q * 10,  drum: 'kick' },
      { t: q * 10 + e, drum: 'hat' },
      { t: q * 11,  drum: 'snare' },
      { t: q * 12,  drum: 'kick' },
      { t: q * 13,  drum: 'snare' },
      { t: q * 14,  drum: 'kick' },
      { t: q * 14 + e, drum: 'snare' },
      // Triumphant climax
      { t: q * 15,  drum: 'kick' },
      { t: q * 16,  drum: 'kick' },
      { t: q * 17,  drum: 'snare' },
      { t: q * 18,  drum: 'kick' },
      { t: q * 18 + e, drum: 'hat' },
      { t: q * 19,  drum: 'hat' },
      { t: q * 20,  drum: 'kick' },
      { t: q * 21,  drum: 'snare' },
      { t: q * 22,  drum: 'kick' },
    ];

    for (const d of drums) {
      seq.push({ t: d.t, drum: d.drum });
    }

    this._schedule(seq, false);
  }

  // ── internal ──────────────────────────────────────────────

  _play(name) {
    if (this._track === name && this._playing) return;
    this.stop();
    this.init();
    this._track = name;
    this._playing = true;
    let seq;
    if (name === 'menu') seq = this._menu();
    else if (name === 'level1') seq = this._level1();
    else if (name === 'level2') seq = this._level2();
    else if (name === 'level3') seq = this._level3();
    else if (name === 'level4') seq = this._level4();
    else if (name === 'level5') seq = this._level5();
    else if (name === 'level6') seq = this._level6();
    else seq = this._level1(); // default
    this._schedule(seq, true);
  }

  _schedule(seq, loop) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + 0.05;
    let end = 0;

    for (const n of seq) {
      const t = t0 + n.t;
      end = Math.max(end, n.t + (n.d || 0.2));
      if (n.drum) {
        this._drum(t, n.drum);
      } else if (n.freq && n.freq > 0) {
        this._tone(t, n.freq, n.d, n.wave || 'square', n.vol || 0.08);
      }
    }

    if (loop) {
      this._timer = setTimeout(() => {
        if (this._playing) {
          this._nodes = [];
          // Get the correct sequence based on current track
          let seq;
          if (this._track === 'menu') seq = this._menu();
          else if (this._track === 'level1') seq = this._level1();
          else if (this._track === 'level2') seq = this._level2();
          else if (this._track === 'level3') seq = this._level3();
          else if (this._track === 'level4') seq = this._level4();
          else if (this._track === 'level5') seq = this._level5();
          else if (this._track === 'level6') seq = this._level6();
          else seq = this._level1(); // default
          this._schedule(seq, true);
        }
      }, end * 1000);  // Removed +80ms buffer for seamless looping
    }
  }

  /** Play a tone with smooth attack/release envelope (no clicks). */
  _tone(start, freq, dur, wave, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = wave;
    osc.frequency.value = freq;

    // Smooth ADSR-ish envelope: quick attack, sustain, smooth release
    const attack = 0.015;
    const release = Math.min(0.08, dur * 0.3);
    const sustainEnd = start + dur - release;

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(vol, start + attack);
    gain.gain.setValueAtTime(vol, Math.max(sustainEnd, start + attack));
    gain.gain.linearRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(this._master);
    osc.start(start);
    osc.stop(start + dur + 0.01);
    this._nodes.push(osc);
  }

  _drum(start, type) {
    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, start);
      osc.frequency.exponentialRampToValueAtTime(40, start + 0.12);
      g.gain.setValueAtTime(0.25, start);
      g.gain.linearRampToValueAtTime(0.001, start + 0.2);
      osc.connect(g); g.connect(this._master);
      osc.start(start); osc.stop(start + 0.2);
      this._nodes.push(osc);
    } else if (type === 'snare') {
      const len = this.ctx.sampleRate * 0.08;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, start);
      g.gain.linearRampToValueAtTime(0.001, start + 0.08);
      src.connect(g); g.connect(this._master);
      src.start(start); src.stop(start + 0.1);
      this._nodes.push(src);
    } else if (type === 'hat') {
      const len = this.ctx.sampleRate * 0.03;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 8000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.06, start);
      g.gain.linearRampToValueAtTime(0.001, start + 0.03);
      src.connect(hp); hp.connect(g); g.connect(this._master);
      src.start(start); src.stop(start + 0.04);
      this._nodes.push(src);
    }
  }

  /**
   * Create a crackly static + zap sound for plug connect/disconnect.
   * Longer duration (~0.7s) so it's clearly audible.
   */
  _electricZap(start) {
    const duration = 0.7;

    // 1. Initial contact snap — sharp transient
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(1800, start);
    snapOsc.frequency.exponentialRampToValueAtTime(300, start + 0.06);
    snapGain.gain.setValueAtTime(0.25, start);
    snapGain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    snapOsc.connect(snapGain); snapGain.connect(this._master);
    snapOsc.start(start); snapOsc.stop(start + 0.1);
    this._nodes.push(snapOsc);

    // 2. Crackly static bed — long white noise with choppy gain modulation
    const staticLen = Math.floor(this.ctx.sampleRate * duration);
    const staticBuf = this.ctx.createBuffer(1, staticLen, this.ctx.sampleRate);
    const sd = staticBuf.getChannelData(0);
    for (let i = 0; i < staticLen; i++) {
      // Base noise
      let sample = Math.random() * 2 - 1;
      // Choppy gating — randomly silence chunks to create crackle pops
      const chunkIdx = Math.floor(i / 120); // ~120 samples per chunk at 44.1kHz
      const gate = ((chunkIdx * 7 + chunkIdx * chunkIdx) % 5) < 3 ? 1 : 0.05;
      // Envelope: ramp up then slow fade
      const t = i / staticLen;
      const env = t < 0.05 ? t / 0.05 : Math.pow(1 - (t - 0.05) / 0.95, 0.5);
      sd[i] = sample * gate * env;
    }
    const staticSrc = this.ctx.createBufferSource();
    staticSrc.buffer = staticBuf;
    // Bandpass to give it a radio-static character
    const staticBP = this.ctx.createBiquadFilter();
    staticBP.type = 'bandpass'; staticBP.frequency.value = 2500; staticBP.Q.value = 0.8;
    const staticGain = this.ctx.createGain();
    staticGain.gain.setValueAtTime(0.18, start);
    staticGain.gain.setValueAtTime(0.18, start + duration * 0.6);
    staticGain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    staticSrc.connect(staticBP); staticBP.connect(staticGain);
    staticGain.connect(this._master);
    staticSrc.start(start); staticSrc.stop(start + duration + 0.02);
    this._nodes.push(staticSrc);

    // 3. High-freq crackle pops — scattered short noise bursts
    const numPops = 18;
    for (let i = 0; i < numPops; i++) {
      const popTime = start + 0.03 + Math.random() * (duration - 0.1);
      const popDur = 0.01 + Math.random() * 0.03;
      const popLen = Math.floor(this.ctx.sampleRate * popDur);
      const popBuf = this.ctx.createBuffer(1, popLen, this.ctx.sampleRate);
      const pd = popBuf.getChannelData(0);
      for (let j = 0; j < popLen; j++) {
        pd[j] = (Math.random() * 2 - 1) * (1 - j / popLen);
      }
      const popSrc = this.ctx.createBufferSource();
      popSrc.buffer = popBuf;
      const popHP = this.ctx.createBiquadFilter();
      popHP.type = 'highpass';
      popHP.frequency.value = 3000 + Math.random() * 3000;
      const popG = this.ctx.createGain();
      const popVol = 0.1 + Math.random() * 0.15;
      popG.gain.setValueAtTime(popVol, popTime);
      popG.gain.exponentialRampToValueAtTime(0.001, popTime + popDur);
      popSrc.connect(popHP); popHP.connect(popG); popG.connect(this._master);
      popSrc.start(popTime); popSrc.stop(popTime + popDur + 0.01);
      this._nodes.push(popSrc);
    }

    // 4. Electrical zap buzz — modulated square wave for that "zapping" character
    const zapOsc = this.ctx.createOscillator();
    const zapGain = this.ctx.createGain();
    zapOsc.type = 'square';
    zapOsc.frequency.setValueAtTime(120, start + 0.02);
    zapOsc.frequency.linearRampToValueAtTime(200, start + 0.15);
    zapOsc.frequency.linearRampToValueAtTime(90, start + duration * 0.8);
    // Tremolo via gain modulation for buzzy character
    zapGain.gain.setValueAtTime(0.001, start);
    zapGain.gain.linearRampToValueAtTime(0.14, start + 0.04);
    zapGain.gain.setValueAtTime(0.14, start + 0.15);
    zapGain.gain.linearRampToValueAtTime(0.08, start + duration * 0.5);
    zapGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.9);
    zapOsc.connect(zapGain); zapGain.connect(this._master);
    zapOsc.start(start + 0.02); zapOsc.stop(start + duration);
    this._nodes.push(zapOsc);

    // 5. Secondary zap tone — higher pitch arc sound
    const arcOsc = this.ctx.createOscillator();
    const arcGain = this.ctx.createGain();
    arcOsc.type = 'sawtooth';
    arcOsc.frequency.setValueAtTime(600, start + 0.05);
    arcOsc.frequency.exponentialRampToValueAtTime(250, start + 0.35);
    arcOsc.frequency.exponentialRampToValueAtTime(180, start + duration * 0.85);
    arcGain.gain.setValueAtTime(0.001, start + 0.05);
    arcGain.gain.linearRampToValueAtTime(0.07, start + 0.1);
    arcGain.gain.setValueAtTime(0.07, start + 0.25);
    arcGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.85);
    arcOsc.connect(arcGain); arcGain.connect(this._master);
    arcOsc.start(start + 0.05); arcOsc.stop(start + duration);
    this._nodes.push(arcOsc);

    // 6. Low rumble — subtle bass undertone
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(55, start);
    rumbleOsc.frequency.linearRampToValueAtTime(40, start + duration);
    rumbleGain.gain.setValueAtTime(0.12, start);
    rumbleGain.gain.setValueAtTime(0.12, start + duration * 0.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    rumbleOsc.connect(rumbleGain); rumbleGain.connect(this._master);
    rumbleOsc.start(start); rumbleOsc.stop(start + duration + 0.05);
    this._nodes.push(rumbleOsc);
  }

  // ── Compositions ──────────────────────────────────────────

  /** Menu: relaxed 120 BPM, simple melody, loops ~4s */
  _menu() {
    const bpm = 120;
    const q = 60 / bpm;       // quarter note (0.5s)
    const e = q / 2;           // eighth note (0.25s)
    const seq = [];

    // Lead melody (square, 16 eighth notes = 2 bars)
    const mel = [
      NOTE.E4, NOTE.G4, NOTE.A4, NOTE.G4,
      NOTE.C5, NOTE.B4, NOTE.A4, NOTE.G4,
      NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4,
      NOTE.E4, NOTE.REST, NOTE.E4, NOTE.REST,
    ];
    for (let i = 0; i < mel.length; i++) {
      if (mel[i] === 0) continue;
      seq.push({ t: i * e, freq: mel[i], d: e * 0.85, wave: 'square', vol: 0.07 });
    }

    // Bass (triangle, half notes)
    const bass = [NOTE.C3, NOTE.A3, NOTE.F3, NOTE.G3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * q, freq: bass[i], d: q * 0.9, wave: 'triangle', vol: 0.09 });
    }

    // Drums
    for (let bar = 0; bar < 2; bar++) {
      const bt = bar * q * 2;
      seq.push({ t: bt,       drum: 'kick', freq: 0 });
      seq.push({ t: bt + q,   drum: 'snare', freq: 0 });
      seq.push({ t: bt + e,       drum: 'hat', freq: 0 });
      seq.push({ t: bt + q + e,   drum: 'hat', freq: 0 });
    }

    return seq;
  }

  /** Level 1: C major - Upbeat and energetic (8 bars A repeated + 16 bars B) */
  _level1() {
    const bpm = 135;
    const q = 60 / bpm;
    const h = q * 2;
    
    // Build Section A (8 bars)
    const sectionA = this._level1SectionA();
    
    // Calculate Section A duration (8 half-note bars)
    const sectionADuration = 8 * h;
    
    // Duplicate Section A for repeat
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    
    // Build Section B starting after both A sections (16 bars)
    const sectionB = this._level1SectionB(sectionADuration * 2);
    
    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 1 Section A (8 bars): Energetic version with rich harmonies */
  _level1SectionA() {
    const bpm = 135;
    const q = 60 / bpm;       // quarter note (~0.444s)
    const e = q / 2;          // eighth note (~0.222s)
    const h = q * 2;          // half note (~0.889s)
    const seq = [];

    // 8 bars of energetic music
    
    // === Lead Melody (square wave, eighth notes - 32 notes for 8 bars) ===
    const melody = [
      NOTE.C5, NOTE.E5, NOTE.G4, NOTE.C5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.G4,
      NOTE.A4, NOTE.B4, NOTE.C5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.G4, NOTE.C5,
      NOTE.E5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G4,
      NOTE.A4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({ 
        t: i * e, 
        freq: melody[i], 
        d: e * 0.95, 
        wave: 'square', 
        vol: 0.06 
      });
    }

    // === Harmony 1 (triangle wave, quarter notes - 16 notes for 8 bars) ===
    const harmony1 = [
      NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4, NOTE.F4, NOTE.A4, NOTE.G4, NOTE.G4,
      NOTE.E4, NOTE.G4, NOTE.E4, NOTE.D4, NOTE.F4, NOTE.C4, NOTE.D4, NOTE.B3,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.04 });
    }

    // === Harmony 2 (sine wave pad, half notes - 8 notes for 8 bars) ===
    const harmony2 = [NOTE.E4, NOTE.G4, NOTE.A4, NOTE.B4, NOTE.G4, NOTE.B4, NOTE.C5, NOTE.D5];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.035 });
    }

    // === Bass (triangle wave, half notes - 8 notes for 8 bars) ===
    const bass = [NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3, NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.10 });
    }

    // === Drums (8 bars = 4 measures) ===
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 1 Section B (16 bars): Milder version with simpler lead and baritone harmony */
  _level1SectionB(startTime) {
    const bpm = 135;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // === Simpler Lead Melody (square wave, half and quarter notes - 16 bars) ===
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

      // Repeat for bars 9-16
      { note: NOTE.C5, dur: h },      // Bar 9
      { note: NOTE.E5, dur: h },      // Bar 10
      { note: NOTE.G4, dur: q },      // Bar 11 beat 1
      { note: NOTE.C5, dur: q },      // Bar 11 beat 2
      { note: NOTE.D5, dur: h },      // Bar 12
      
      { note: NOTE.E5, dur: q },      // Bar 13 beat 1
      { note: NOTE.D5, dur: q },      // Bar 13 beat 2
      { note: NOTE.C5, dur: h },      // Bar 14
      { note: NOTE.G4, dur: q },      // Bar 15 beat 1
      { note: NOTE.A4, dur: q },      // Bar 15 beat 2
      { note: NOTE.G4, dur: h },      // Bar 16
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({ 
        t: time, 
        freq: note, 
        d: dur * 0.98, 
        wave: 'square', 
        vol: 0.045
      });
      time += dur;
    }

    // === Baritone Harmony (triangle wave, quarter notes - 32 notes for 16 bars) ===
    const baritone = [
      NOTE.E3, NOTE.G3, NOTE.C3, NOTE.E3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3,
      NOTE.E3, NOTE.C3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.B3,
      NOTE.E3, NOTE.G3, NOTE.C3, NOTE.E3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3,
      NOTE.E3, NOTE.C3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.B3,
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

    // === Bass (triangle wave, half notes - 16 notes for 16 bars) ===
    // Keep the same chord progression as Section A
    const bass = [
      NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3,
      NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3,
      NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3,
      NOTE.C3, NOTE.E3, NOTE.F3, NOTE.G3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ 
        t: startTime + i * h, 
        freq: bass[i], 
        d: h * 0.98, 
        wave: 'triangle', 
        vol: 0.10  // Match Section A volume
      });
    }

    // === Drums (16 bars) ===
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 2: G major - Bright and adventurous (8 bars A repeated + 16 bars B) */
  _level2() {
    const bpm = 140;
    const q = 60 / bpm;
    const h = q * 2;
    
    const sectionA = this._level2SectionA();
    const sectionADuration = 8 * h;
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    const sectionB = this._level2SectionB(sectionADuration * 2);
    
    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 2 Section A (8 bars): Bright G major melody */
  _level2SectionA() {
    const bpm = 140;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead Melody (G major - bright and adventurous)
    const melody = [
      NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5, NOTE.A4, NOTE.D5, NOTE.C5, NOTE.B4,
      NOTE.D5, NOTE.G5, NOTE.B4, NOTE.A4, NOTE.G4, NOTE.A4, NOTE.B4, NOTE.D5,
      NOTE.G5, NOTE.D5, NOTE.B4, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4,
      NOTE.A4, NOTE.G4, NOTE.A4, NOTE.D5, NOTE.B4, NOTE.A4, NOTE.G4, NOTE.D5,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({ 
        t: i * e, 
        freq: melody[i], 
        d: e * 0.95, 
        wave: 'square', 
        vol: 0.06 
      });
    }

    // Harmony 1 (triangle, G major chord tones)
    const harmony1 = [
      NOTE.G4, NOTE.B4, NOTE.D4, NOTE.B4, NOTE.C4, NOTE.E4, NOTE.D4, NOTE.A4,
      NOTE.B4, NOTE.D4, NOTE.G4, NOTE.B4, NOTE.C4, NOTE.A4, NOTE.D4, NOTE.G4,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.04 });
    }

    // Harmony 2 (sine pad)
    const harmony2 = [NOTE.B4, NOTE.D5, NOTE.E4, NOTE.A4, NOTE.D5, NOTE.B4, NOTE.E4, NOTE.G4];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.035 });
    }

    // Bass (G major progression: G → D → C → D)
    const bass = [NOTE.G3, NOTE.D3, NOTE.C3, NOTE.D3, NOTE.G3, NOTE.B3, NOTE.C3, NOTE.D3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.10 });
    }

    // Drums
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 2 Section B (16 bars): Milder G major variation */
  _level2SectionB(startTime) {
    const bpm = 140;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Simpler Lead Melody
    const simpleLead = [
      // First 8 bars
      { note: NOTE.G4, dur: h },
      { note: NOTE.B4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.G5, dur: q },
      { note: NOTE.A4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: q },
      { note: NOTE.B4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
      // Repeat
      { note: NOTE.G4, dur: h },
      { note: NOTE.B4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.G5, dur: q },
      { note: NOTE.A4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: q },
      { note: NOTE.B4, dur: h },
      { note: NOTE.D5, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({ 
        t: time, 
        freq: note, 
        d: dur * 0.98, 
        wave: 'square', 
        vol: 0.045
      });
      time += dur;
    }

    // Baritone Harmony
    const baritone = [
      NOTE.B3, NOTE.D3, NOTE.G3, NOTE.B3, NOTE.C3, NOTE.E3, NOTE.A3, NOTE.D3,
      NOTE.B3, NOTE.G3, NOTE.D3, NOTE.B3, NOTE.C3, NOTE.A3, NOTE.D3, NOTE.G3,
      NOTE.B3, NOTE.D3, NOTE.G3, NOTE.B3, NOTE.C3, NOTE.E3, NOTE.A3, NOTE.D3,
      NOTE.B3, NOTE.G3, NOTE.D3, NOTE.B3, NOTE.C3, NOTE.A3, NOTE.D3, NOTE.G3,
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

    // Bass (same progression as Section A)
    const bass = [
      NOTE.G3, NOTE.D3, NOTE.C3, NOTE.D3,
      NOTE.G3, NOTE.B3, NOTE.C3, NOTE.D3,
      NOTE.G3, NOTE.D3, NOTE.C3, NOTE.D3,
      NOTE.G3, NOTE.B3, NOTE.C3, NOTE.D3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ 
        t: startTime + i * h, 
        freq: bass[i], 
        d: h * 0.98, 
        wave: 'triangle', 
        vol: 0.10
      });
    }

    // Drums
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 3: A minor - Darker and mysterious (8 bars A repeated + 16 bars B) */
  _level3() {
    const bpm = 130;
    const q = 60 / bpm;
    const h = q * 2;
    
    const sectionA = this._level3SectionA();
    const sectionADuration = 8 * h;
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    const sectionB = this._level3SectionB(sectionADuration * 2);
    
    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 3 Section A (8 bars): Dark A minor melody */
  _level3SectionA() {
    const bpm = 130;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead Melody (A minor - darker, mysterious)
    const melody = [
      NOTE.A4, NOTE.C5, NOTE.E5, NOTE.A4, NOTE.G4, NOTE.C5, NOTE.E5, NOTE.D5,
      NOTE.C5, NOTE.A4, NOTE.E4, NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4, NOTE.E4,
      NOTE.A4, NOTE.E5, NOTE.C5, NOTE.A4, NOTE.D5, NOTE.C5, NOTE.A4, NOTE.G4,
      NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.A4,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({ 
        t: i * e, 
        freq: melody[i], 
        d: e * 0.95, 
        wave: 'square', 
        vol: 0.055    // Slightly quieter for darker mood
      });
    }

    // Harmony 1 (triangle, A minor chord tones)
    const harmony1 = [
      NOTE.A4, NOTE.C4, NOTE.E4, NOTE.C4, NOTE.F4, NOTE.D4, NOTE.E4, NOTE.G4,
      NOTE.A4, NOTE.E4, NOTE.C4, NOTE.A4, NOTE.F4, NOTE.D4, NOTE.E4, NOTE.C4,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.038 });
    }

    // Harmony 2 (sine pad - darker voicing)
    const harmony2 = [NOTE.C4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.D4, NOTE.E4];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.032 });
    }

    // Bass (A minor progression: Am → Em → F → G)
    const bass = [NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3, NOTE.A3, NOTE.C3, NOTE.D3, NOTE.E3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.10 });
    }

    // Drums (slightly different pattern for darker feel)
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 3 Section B (16 bars): Milder A minor variation */
  _level3SectionB(startTime) {
    const bpm = 130;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Simpler Lead Melody (mysterious, contemplative)
    const simpleLead = [
      // First 8 bars
      { note: NOTE.A4, dur: h },
      { note: NOTE.C5, dur: h },
      { note: NOTE.E4, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
      { note: NOTE.C5, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: h },
      { note: NOTE.E4, dur: q },
      { note: NOTE.G4, dur: q },
      { note: NOTE.A4, dur: h },
      // Repeat
      { note: NOTE.A4, dur: h },
      { note: NOTE.C5, dur: h },
      { note: NOTE.E4, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
      { note: NOTE.C5, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: h },
      { note: NOTE.E4, dur: q },
      { note: NOTE.G4, dur: q },
      { note: NOTE.A4, dur: h },
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({ 
        t: time, 
        freq: note, 
        d: dur * 0.98, 
        wave: 'square', 
        vol: 0.042     // Quieter for mysterious atmosphere
      });
      time += dur;
    }

    // Baritone Harmony (lower, darker)
    const baritone = [
      NOTE.C3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.E3,
      NOTE.A3, NOTE.C3, NOTE.E3, NOTE.A3, NOTE.F3, NOTE.D3, NOTE.E3, NOTE.G3,
      NOTE.C3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.F3, NOTE.D3, NOTE.G3, NOTE.E3,
      NOTE.A3, NOTE.C3, NOTE.E3, NOTE.A3, NOTE.F3, NOTE.D3, NOTE.E3, NOTE.G3,
    ];
    for (let i = 0; i < baritone.length; i++) {
      seq.push({ 
        t: startTime + i * q, 
        freq: baritone[i], 
        d: q * 0.95, 
        wave: 'triangle', 
        vol: 0.052
      });
    }

    // Bass (same progression as Section A)
    const bass = [
      NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3,
      NOTE.A3, NOTE.C3, NOTE.D3, NOTE.E3,
      NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3,
      NOTE.A3, NOTE.C3, NOTE.D3, NOTE.E3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ 
        t: startTime + i * h, 
        freq: bass[i], 
        d: h * 0.98, 
        wave: 'triangle', 
        vol: 0.10
      });
    }

    // Drums
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 4: D minor — Driving and intense (8 bars A repeated + 16 bars B) */
  _level4() {
    const bpm = 145;
    const q = 60 / bpm;
    const h = q * 2;

    const sectionA = this._level4SectionA();
    const sectionADuration = 8 * h;
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    const sectionB = this._level4SectionB(sectionADuration * 2);

    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 4 Section A (8 bars): Driving D minor melody */
  _level4SectionA() {
    const bpm = 145;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead Melody (D minor - driving, intense)
    const melody = [
      NOTE.D5, NOTE.F5, NOTE.A4, NOTE.D5, NOTE.C5, NOTE.A4, NOTE.G4, NOTE.F4,
      NOTE.E4, NOTE.G4, NOTE.A4, NOTE.D5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.A4,
      NOTE.D5, NOTE.A5, NOTE.F5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5,
      NOTE.G5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.A4, NOTE.D5, NOTE.F5,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({
        t: i * e,
        freq: melody[i],
        d: e * 0.95,
        wave: 'square',
        vol: 0.06
      });
    }

    // Harmony 1 (triangle, D minor chord tones)
    const harmony1 = [
      NOTE.D4, NOTE.F4, NOTE.A4, NOTE.F4, NOTE.G4, NOTE.E4, NOTE.A4, NOTE.G4,
      NOTE.F4, NOTE.A4, NOTE.D4, NOTE.F4, NOTE.G4, NOTE.E4, NOTE.F4, NOTE.D4,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.04 });
    }

    // Harmony 2 (sine pad)
    const harmony2 = [NOTE.F4, NOTE.A4, NOTE.G4, NOTE.E4, NOTE.F4, NOTE.D4, NOTE.G4, NOTE.A4];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.035 });
    }

    // Bass (D minor progression: Dm → Am → Bb → C)
    const bass = [NOTE.D3, NOTE.A3, NOTE.B3, NOTE.C3, NOTE.D3, NOTE.F3, NOTE.G3, NOTE.A3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.10 });
    }

    // Drums (driving pattern with extra kick)
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,             drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,         drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,         drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,     drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 4 Section B (16 bars): Milder D minor variation */
  _level4SectionB(startTime) {
    const bpm = 145;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Simpler Lead Melody
    const simpleLead = [
      { note: NOTE.D5, dur: h },
      { note: NOTE.F5, dur: h },
      { note: NOTE.A4, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: h },
      { note: NOTE.F5, dur: q },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: h },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: q },
      { note: NOTE.F4, dur: h },
      // Repeat
      { note: NOTE.D5, dur: h },
      { note: NOTE.F5, dur: h },
      { note: NOTE.A4, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: h },
      { note: NOTE.F5, dur: q },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: h },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: q },
      { note: NOTE.F4, dur: h },
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({
        t: time,
        freq: note,
        d: dur * 0.98,
        wave: 'square',
        vol: 0.045
      });
      time += dur;
    }

    // Baritone Harmony
    const baritone = [
      NOTE.F3, NOTE.A3, NOTE.D3, NOTE.F3, NOTE.G3, NOTE.E3, NOTE.A3, NOTE.C3,
      NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.A3,
      NOTE.F3, NOTE.A3, NOTE.D3, NOTE.F3, NOTE.G3, NOTE.E3, NOTE.A3, NOTE.C3,
      NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3, NOTE.E3, NOTE.F3, NOTE.A3,
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

    // Bass
    const bass = [
      NOTE.D3, NOTE.A3, NOTE.B3, NOTE.C3,
      NOTE.D3, NOTE.F3, NOTE.G3, NOTE.A3,
      NOTE.D3, NOTE.A3, NOTE.B3, NOTE.C3,
      NOTE.D3, NOTE.F3, NOTE.G3, NOTE.A3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({
        t: startTime + i * h,
        freq: bass[i],
        d: h * 0.98,
        wave: 'triangle',
        vol: 0.10
      });
    }

    // Drums
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,         drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,     drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,     drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e, drum: 'hat',  freq: 0 });
    }

    return seq;
  }

  /** Level 5: E minor — Tense and urgent (8 bars A repeated + 16 bars B) */
  _level5() {
    const bpm = 150;
    const q = 60 / bpm;
    const h = q * 2;

    const sectionA = this._level5SectionA();
    const sectionADuration = 8 * h;
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    const sectionB = this._level5SectionB(sectionADuration * 2);

    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 5 Section A (8 bars): Tense E minor melody */
  _level5SectionA() {
    const bpm = 150;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead Melody (E minor - tense, urgent)
    const melody = [
      NOTE.E5, NOTE.G5, NOTE.B4, NOTE.E5, NOTE.D5, NOTE.B4, NOTE.A4, NOTE.G4,
      NOTE.A4, NOTE.B4, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5,
      NOTE.B4, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.B4,
      NOTE.E5, NOTE.D5, NOTE.B4, NOTE.G4, NOTE.A4, NOTE.B4, NOTE.D5, NOTE.E5,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({
        t: i * e,
        freq: melody[i],
        d: e * 0.95,
        wave: 'square',
        vol: 0.058
      });
    }

    // Harmony 1 (triangle, E minor chord tones)
    const harmony1 = [
      NOTE.E4, NOTE.G4, NOTE.B4, NOTE.G4, NOTE.A4, NOTE.C4, NOTE.B4, NOTE.D4,
      NOTE.E4, NOTE.B4, NOTE.G4, NOTE.E4, NOTE.A4, NOTE.C4, NOTE.D4, NOTE.B4,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.038 });
    }

    // Harmony 2 (sine pad — tense voicing)
    const harmony2 = [NOTE.G4, NOTE.B4, NOTE.A4, NOTE.D4, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.B4];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.032 });
    }

    // Bass (E minor progression: Em → Bm → C → D)
    const bass = [NOTE.E3, NOTE.B3, NOTE.C3, NOTE.D3, NOTE.E3, NOTE.G3, NOTE.A3, NOTE.B3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.10 });
    }

    // Drums (urgent feel with faster hats)
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,             drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e,         drum: 'hat',   freq: 0 });
      seq.push({ t: bt + e * 2,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + q,         drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,     drum: 'hat',   freq: 0 });
    }

    return seq;
  }

  /** Level 5 Section B (16 bars): Milder E minor variation */
  _level5SectionB(startTime) {
    const bpm = 150;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Simpler Lead Melody (brooding)
    const simpleLead = [
      { note: NOTE.E5, dur: h },
      { note: NOTE.G5, dur: h },
      { note: NOTE.B4, dur: q },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: h },
      { note: NOTE.G5, dur: q },
      { note: NOTE.A5, dur: q },
      { note: NOTE.G5, dur: h },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.B4, dur: h },
      // Repeat
      { note: NOTE.E5, dur: h },
      { note: NOTE.G5, dur: h },
      { note: NOTE.B4, dur: q },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: h },
      { note: NOTE.G5, dur: q },
      { note: NOTE.A5, dur: q },
      { note: NOTE.G5, dur: h },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.B4, dur: h },
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({
        t: time,
        freq: note,
        d: dur * 0.98,
        wave: 'square',
        vol: 0.042
      });
      time += dur;
    }

    // Baritone Harmony
    const baritone = [
      NOTE.G3, NOTE.B3, NOTE.E3, NOTE.G3, NOTE.A3, NOTE.C3, NOTE.D3, NOTE.B3,
      NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.B3, NOTE.D3,
      NOTE.G3, NOTE.B3, NOTE.E3, NOTE.G3, NOTE.A3, NOTE.C3, NOTE.D3, NOTE.B3,
      NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.B3, NOTE.D3,
    ];
    for (let i = 0; i < baritone.length; i++) {
      seq.push({
        t: startTime + i * q,
        freq: baritone[i],
        d: q * 0.95,
        wave: 'triangle',
        vol: 0.052
      });
    }

    // Bass
    const bass = [
      NOTE.E3, NOTE.B3, NOTE.C3, NOTE.D3,
      NOTE.E3, NOTE.G3, NOTE.A3, NOTE.B3,
      NOTE.E3, NOTE.B3, NOTE.C3, NOTE.D3,
      NOTE.E3, NOTE.G3, NOTE.A3, NOTE.B3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({
        t: startTime + i * h,
        freq: bass[i],
        d: h * 0.98,
        wave: 'triangle',
        vol: 0.10
      });
    }

    // Drums
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,             drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e,         drum: 'hat',   freq: 0 });
      seq.push({ t: bt + e * 2,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + q,         drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,     drum: 'hat',   freq: 0 });
    }

    return seq;
  }

  /** Level 6: D minor — Ominous boss battle (8 bars A repeated + 16 bars B) */
  _level6() {
    const bpm = 160;
    const q = 60 / bpm;
    const h = q * 2;

    const sectionA = this._level6SectionA();
    const sectionADuration = 8 * h;
    const sectionARepeat = sectionA.map(note => ({
      ...note,
      t: note.t + sectionADuration
    }));
    const sectionB = this._level6SectionB(sectionADuration * 2);

    return [...sectionA, ...sectionARepeat, ...sectionB];
  }

  /** Level 6 Section A (8 bars): Dark D minor boss riff */
  _level6SectionA() {
    const bpm = 160;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead Melody (D minor — dark, ominous, relentless)
    const melody = [
      NOTE.D5, NOTE.F5, NOTE.A4, NOTE.D5, NOTE.C5, NOTE.A4, NOTE.F4, NOTE.D4,
      NOTE.A4, NOTE.Bb4, NOTE.A4, NOTE.G4, NOTE.F4, NOTE.E4, NOTE.D4, NOTE.F4,
      NOTE.D5, NOTE.F5, NOTE.A5, NOTE.G5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5,
      NOTE.A4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.A4, NOTE.F4, NOTE.E4, NOTE.D4,
    ];
    for (let i = 0; i < melody.length; i++) {
      seq.push({
        t: i * e,
        freq: melody[i],
        d: e * 0.95,
        wave: 'square',
        vol: 0.065
      });
    }

    // Harmony 1 (triangle, D minor chord tones — brooding)
    const harmony1 = [
      NOTE.D4, NOTE.F4, NOTE.A4, NOTE.D4, NOTE.C4, NOTE.A3, NOTE.F4, NOTE.D4,
      NOTE.A3, NOTE.C4, NOTE.D4, NOTE.F4, NOTE.E4, NOTE.C4, NOTE.A3, NOTE.D4,
    ];
    for (let i = 0; i < harmony1.length; i++) {
      seq.push({ t: i * q, freq: harmony1[i], d: q * 0.95, wave: 'triangle', vol: 0.042 });
    }

    // Harmony 2 (sine pad — dark, sustained)
    const harmony2 = [NOTE.D4, NOTE.F4, NOTE.A4, NOTE.C4, NOTE.D4, NOTE.Bb3, NOTE.A3, NOTE.D4];
    for (let i = 0; i < harmony2.length; i++) {
      seq.push({ t: i * h, freq: harmony2[i], d: h * 0.98, wave: 'sine', vol: 0.038 });
    }

    // Bass (D minor: Dm → Gm → Am → Dm → Dm → Bb → C → Dm)
    const bass = [NOTE.D3, NOTE.G3, NOTE.A3, NOTE.D3, NOTE.D3, NOTE.Bb3, NOTE.C3, NOTE.D3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * h, freq: bass[i], d: h * 0.98, wave: 'triangle', vol: 0.11 });
    }

    // Drums (aggressive double-kick boss pattern)
    for (let bar = 0; bar < 8; bar++) {
      const bt = bar * h;
      seq.push({ t: bt,             drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e,         drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e * 2,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + e * 3,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + q,         drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,     drum: 'kick',  freq: 0 });
    }

    return seq;
  }

  /** Level 6 Section B (16 bars): Intensified D minor boss climax */
  _level6SectionB(startTime) {
    const bpm = 160;
    const q = 60 / bpm;
    const e = q / 2;
    const h = q * 2;
    const seq = [];

    // Lead melody — longer, dramatic phrases descending through D minor
    const simpleLead = [
      { note: NOTE.D5, dur: h },
      { note: NOTE.A4, dur: h },
      { note: NOTE.Bb4, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
      { note: NOTE.F4, dur: q },
      { note: NOTE.E4, dur: q },
      { note: NOTE.D4, dur: h },
      { note: NOTE.F4, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.D5, dur: h },
      // Repeat with darker variation
      { note: NOTE.D5, dur: h },
      { note: NOTE.F5, dur: h },
      { note: NOTE.E5, dur: q },
      { note: NOTE.D5, dur: q },
      { note: NOTE.C5, dur: h },
      { note: NOTE.Bb4, dur: q },
      { note: NOTE.A4, dur: q },
      { note: NOTE.G4, dur: h },
      { note: NOTE.F4, dur: q },
      { note: NOTE.E4, dur: q },
      { note: NOTE.D4, dur: h },
    ];

    let time = startTime;
    for (const { note, dur } of simpleLead) {
      seq.push({
        t: time,
        freq: note,
        d: dur * 0.98,
        wave: 'square',
        vol: 0.050
      });
      time += dur;
    }

    // Baritone Harmony (menacing, churning)
    const baritone = [
      NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3, NOTE.Bb3, NOTE.A3, NOTE.D3,
      NOTE.C3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.D3, NOTE.F3, NOTE.E3, NOTE.D3,
      NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D3, NOTE.G3, NOTE.Bb3, NOTE.A3, NOTE.D3,
      NOTE.C3, NOTE.E3, NOTE.A3, NOTE.C3, NOTE.D3, NOTE.F3, NOTE.E3, NOTE.D3,
    ];
    for (let i = 0; i < baritone.length; i++) {
      seq.push({
        t: startTime + i * q,
        freq: baritone[i],
        d: q * 0.95,
        wave: 'triangle',
        vol: 0.058
      });
    }

    // Bass (heavier, relentless D minor pedal)
    const bass = [
      NOTE.D3, NOTE.G3, NOTE.A3, NOTE.D3,
      NOTE.Bb3, NOTE.A3, NOTE.G3, NOTE.D3,
      NOTE.D3, NOTE.G3, NOTE.A3, NOTE.D3,
      NOTE.Bb3, NOTE.A3, NOTE.G3, NOTE.D3,
    ];
    for (let i = 0; i < bass.length; i++) {
      seq.push({
        t: startTime + i * h,
        freq: bass[i],
        d: h * 0.98,
        wave: 'triangle',
        vol: 0.11
      });
    }

    // Drums (relentless double-kick boss pattern)
    for (let bar = 0; bar < 16; bar++) {
      const bt = startTime + bar * h;
      seq.push({ t: bt,             drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e,         drum: 'kick',  freq: 0 });
      seq.push({ t: bt + e * 2,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + e * 3,     drum: 'hat',   freq: 0 });
      seq.push({ t: bt + q,         drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,     drum: 'kick',  freq: 0 });
    }

    return seq;
  }

  /** Victory: ascending fanfare, ~2s, no loop */
  _victory() {
    const bpm = 150;
    const q = 60 / bpm;
    const seq = [];

    const fan = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
    for (let i = 0; i < fan.length; i++) {
      const dur = i === 3 ? q * 3 : q * 0.9;
      seq.push({ t: i * q * 0.6, freq: fan[i], d: dur, wave: 'square', vol: 0.10 });
    }
    seq.push({ t: 0, freq: NOTE.C3, d: q * 3, wave: 'triangle', vol: 0.10 });
    seq.push({ t: q * 1.8, drum: 'snare', freq: 0 });
    seq.push({ t: q * 1.8, drum: 'kick', freq: 0 });

    return seq;
  }
}

/** Singleton */
export const music = new ProceduralMusic();
