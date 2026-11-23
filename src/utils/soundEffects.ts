// Subtle Nostalgic Instrumental Background Music & Audio Manager
// 100% reliable Web Audio API synthesis - zero external audio dependencies
// Low, comfortable level (~10-12%), smooth gradual fade-in, no bell sounds.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  constructor() {
    // Keep volume subtle and unforced
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Gentle pop for subtle tactile feedback
  public playPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio autoplay policy
    }
  }

  // Soft celebration chords
  public playCelebration() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // ignore
    }
  }

  // Start Subtle Nostalgic Instrumental Background Music
  // Plays warm piano/harp arpeggios with gradual fade-in to ~10-12% volume
  public startBackgroundMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.isMusicPlaying = true;
      const masterGain = this.ctx.createGain();
      // Start at 0 volume and fade in gradually to 0.10 (10%) over 3 seconds
      masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.10, this.ctx.currentTime + 3.0);

      // Low-pass filter to give warmth, mimicking a distant piano/harp
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(this.ctx.destination);
      this.musicGain = masterGain;

      // Nostalgic Reunion Chord Progression:
      // Chord 1: Cmaj7 (C3, G3, B3, E4)
      // Chord 2: Am9   (A2, E3, G3, C4, B4)
      // Chord 3: Fmaj7 (F2, C3, E3, A3, C4)
      // Chord 4: Gsus4 (G2, D3, G3, C4, D4)
      const chordNotes = [
        [130.81, 196.00, 246.94, 329.63, 392.00], // C chord
        [110.00, 164.81, 196.00, 261.63, 493.88], // Am chord
        [87.31, 130.81, 164.81, 220.00, 261.63],  // F chord
        [98.00, 146.83, 196.00, 261.63, 293.66],  // G chord
      ];

      let chordIndex = 0;
      let noteIndex = 0;

      const playNextArpeggioNote = () => {
        if (!this.ctx || !this.isMusicPlaying || !this.musicGain) return;

        const currentChord = chordNotes[chordIndex];
        const freq = currentChord[noteIndex % currentChord.length];

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Soft acoustic envelope
        const now = this.ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 1.6);

        noteIndex++;
        if (noteIndex >= currentChord.length) {
          noteIndex = 0;
          chordIndex = (chordIndex + 1) % chordNotes.length;
        }
      };

      // Play note every 480ms (~62 BPM gentle pace)
      playNextArpeggioNote();
      this.musicInterval = setInterval(playNextArpeggioNote, 480);

    } catch {
      this.isMusicPlaying = false;
    }
  }

  public stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          this.musicGain?.disconnect();
          this.musicGain = null;
        }, 1000);
      } catch {}
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundManager();
