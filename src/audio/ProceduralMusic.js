/**
 * ProceduralMusic — retro chiptune music via Web Audio API.
 *
 * Three tracks: menu (chill loop), level (upbeat loop), victory (one-shot).
 * Uses proper ADSR envelopes so notes sound like tones, not clicks.
 */

const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
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
