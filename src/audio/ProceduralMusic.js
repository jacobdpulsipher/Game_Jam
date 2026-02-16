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
  playLevel() { this._play('level'); }

  playVictory() {
    this.stop();
    this.init();
    this._schedule(this._victory(), false);
  }

  /** Play electricity zap sound effect - short, non-looping */
  playElectricity() {
    this.init();
    const t0 = this.ctx.currentTime + 0.01;
    this._scheduleEffect(this._electricity(), t0);
  }

  // ── internal ──────────────────────────────────────────────

  _play(name) {
    if (this._track === name && this._playing) return;
    this.stop();
    this.init();
    this._track = name;
    this._playing = true;
    this._schedule(name === 'menu' ? this._menu() : this._level(), true);
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
          this._schedule(this._track === 'menu' ? this._menu() : this._level(), true);
        }
      }, end * 1000 + 80);
    }
  }

  /** Schedule a one-shot sound effect without disrupting current music */
  _scheduleEffect(seq, t0) {
    if (!this.ctx) return;
    
    for (const n of seq) {
      const t = t0 + n.t;
      if (n.drum) {
        this._drum(t, n.drum);
      } else if (n.freq && n.freq > 0) {
        this._tone(t, n.freq, n.d, n.wave || 'square', n.vol || 0.08);
      }
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

  /** Level: energetic 135 BPM, driving melody, loops ~3.6s */
  _level() {
    const bpm = 135;
    const q = 60 / bpm;
    const e = q / 2;
    const seq = [];

    // Lead (square, 16 eighth notes)
    const mel = [
      NOTE.C5, NOTE.E5, NOTE.G4, NOTE.C5,
      NOTE.D5, NOTE.C5, NOTE.B4, NOTE.G4,
      NOTE.A4, NOTE.B4, NOTE.C5, NOTE.E5,
      NOTE.D5, NOTE.C5, NOTE.G4, NOTE.C5,
    ];
    for (let i = 0; i < mel.length; i++) {
      seq.push({ t: i * e, freq: mel[i], d: e * 0.8, wave: 'square', vol: 0.06 });
    }

    // Harmony (triangle, quarter notes)
    const harm = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4, NOTE.F4, NOTE.A4, NOTE.G4, NOTE.G4];
    for (let i = 0; i < harm.length; i++) {
      seq.push({ t: i * q, freq: harm[i], d: q * 0.7, wave: 'triangle', vol: 0.04 });
    }

    // Bass (triangle, half notes)
    const bass = [NOTE.C3, NOTE.G3, NOTE.F3, NOTE.G3];
    for (let i = 0; i < bass.length; i++) {
      seq.push({ t: i * q * 2, freq: bass[i], d: q * 1.8, wave: 'triangle', vol: 0.10 });
    }

    // Drums
    for (let bar = 0; bar < 4; bar++) {
      const bt = bar * q * 2;
      seq.push({ t: bt,           drum: 'kick', freq: 0 });
      seq.push({ t: bt + e,       drum: 'hat',  freq: 0 });
      seq.push({ t: bt + q,       drum: 'snare', freq: 0 });
      seq.push({ t: bt + q + e,   drum: 'hat',  freq: 0 });
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

  /** Electricity: quick zap sound effect, ~0.3s, high-pitched crackle */
  _electricity() {
    const seq = [];
    const dur = 0.015; // Very short notes for crackle
    
    // Quick ascending chromatic burst (charge-up)
    const zapNotes = [
      NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5,
      NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6,
    ];
    
    let time = 0;
    for (let i = 0; i < zapNotes.length; i++) {
      seq.push({ t: time, freq: zapNotes[i], d: dur, wave: 'sawtooth', vol: 0.15 });
      time += 0.02; // 20ms between notes
    }
    
    // Quick descending release
    const releaseNotes = [NOTE.C6, NOTE.A5, NOTE.F5, NOTE.C5];
    for (let i = 0; i < releaseNotes.length; i++) {
      seq.push({ t: time, freq: releaseNotes[i], d: dur, wave: 'sawtooth', vol: 0.12 });
      time += 0.02;
    }
    
    // High-frequency crackle
    const crackleNotes = [NOTE.G6, NOTE.E6, NOTE.G6, NOTE.C6];
    for (let i = 0; i < crackleNotes.length; i++) {
      seq.push({ t: time, freq: crackleNotes[i], d: dur * 0.7, wave: 'square', vol: 0.08 });
      time += 0.015;
    }
    
    return seq;
  }
}

/** Singleton */
export const music = new ProceduralMusic();
