// Pure Web Audio API Sound Synthesizer - 100% reliable, zero external MP3 dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // muted by default as requested
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  constructor() {
    // Check saved mute preference
    const saved = localStorage.getItem('star_matric_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('star_matric_muted', String(muted));
    if (muted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // School Bell Chime - rich harmonic metallic resonance
  public playSchoolBell() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Frequencies for a rich resonant brass school bell
      const bellFreqs = [523.25, 784, 1046.5, 1568, 2093]; // C5, G5, C6, G6, C7
      const gains = [0.4, 0.3, 0.2, 0.15, 0.08];

      bellFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        // Exponential decay simulating brass vibration
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch {
      // Audio not permitted yet
    }
  }

  // Heart pop sound
  public playPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  // Success celebration fanfare
  public playCelebration() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C (major arpeggio)
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.6);
      });
    } catch {
      // ignore
    }
  }

  // Gentle Ambient Melodic Chime Loop (nostalgic, soft)
  public startAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.isAmbientPlaying = true;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // gentle background volume
      masterGain.connect(this.ctx.destination);
      this.ambientGain = masterGain;

      // Soft ambient chord tones: C maj7 (C4, E4, G4, B4)
      const chord = [261.63, 329.63, 392.00, 493.88];
      this.ambientOscillators = chord.map((freq) => {
        const osc = this.ctx!.createOscillator();
        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // Slow tremolo/chorus for nostalgic warmth
        lfo.frequency.setValueAtTime(0.2, this.ctx!.currentTime);
        lfoGain.gain.setValueAtTime(1.5, this.ctx!.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(masterGain);
        osc.start();
        lfo.start();
        return osc;
      });
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public stopAmbient() {
    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.ambientOscillators = [];
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.isAmbientPlaying = false;
  }
}

export const sound = new SoundManager();
