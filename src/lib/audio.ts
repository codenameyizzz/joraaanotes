// Pure Web Audio API Sound Effects + Clair de Lune Classical Music Engine

class SoundSystem {
  private ctx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;
  private clairDeLuneAudio: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = false;
  private isDucked: boolean = false;
  private normalVolume: number = 0.30;
  private duckedVolume: number = 0.08;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft wooden click / tactile button feedback
  playSoftClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  // Wax seal break sound: low thud + warm bell resonance
  playWaxSealPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Pop oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      // Chime harmonic
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(659.25, now + 0.04); // E5 note
      chimeGain.gain.setValueAtTime(0.15, now + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
      chime.start(now + 0.04);
      chime.stop(now + 0.35);
    } catch {}
  }

  // Paper sliding / rustling out of envelope
  playPaperRustle() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {}
  }

  // Polaroid Card Flip
  playPolaroidFlip() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Reaction Chimes (Sweet musical pentatonic notes)
  playReactionChime(index: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
      const freq = notes[index % notes.length];
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  // Clair de Lune by Claude Debussy (30-second seamless loop)
  playClairDeLune(): boolean {
    if (typeof window === 'undefined') return false;

    const targetVol = this.isDucked ? this.duckedVolume : this.normalVolume;

    if (!this.clairDeLuneAudio) {
      const audio = new Audio();
      audio.preload = 'auto';

      // Prefer .mp3 if user provided it, fallback to .ogg
      audio.src = '/audio/clair-de-lune.mp3';

      audio.onerror = () => {
        // Fallback to .ogg if .mp3 not found
        if (audio.src.endsWith('.mp3')) {
          audio.src = '/audio/clair-de-lune.ogg';
          audio.load();
          audio.play().catch(() => {});
        }
      };

      audio.volume = targetVol;

      // Seamless 30-second loop with smooth volume cross-fade
      audio.addEventListener('timeupdate', () => {
        const currentTarget = this.isDucked ? this.duckedVolume : this.normalVolume;

        // Soft fade out in the last 2.5 seconds (27.5s - 30s)
        if (audio.currentTime >= 27.5 && audio.currentTime < 30.0) {
          const progress = (30.0 - audio.currentTime) / 2.5;
          audio.volume = Math.max(0.02, currentTarget * progress);
        }

        // Loop back to 0.0 at 30 seconds
        if (audio.currentTime >= 30.0) {
          audio.currentTime = 0;
          audio.volume = currentTarget;
          audio.play().catch(() => {});
        }
      });

      this.clairDeLuneAudio = audio;
    }

    try {
      this.clairDeLuneAudio.currentTime = 0;
      this.clairDeLuneAudio.volume = targetVol;
      const playPromise = this.clairDeLuneAudio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.isMusicPlaying = true;
          })
          .catch(() => {
            this.isMusicPlaying = false;
          });
      }
      this.isMusicPlaying = true;
      return true;
    } catch {
      this.isMusicPlaying = false;
      return false;
    }
  }

  stopClairDeLune() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.clairDeLuneAudio) {
      try {
        this.clairDeLuneAudio.pause();
        this.clairDeLuneAudio.currentTime = 0;
      } catch {}
      this.isMusicPlaying = false;
      this.isDucked = false;
    }
  }

  // Audio Ducking: Softly lower music volume when voice note plays so music becomes gentle background atmosphere
  duckClairDeLune() {
    this.isDucked = true;
    if (this.clairDeLuneAudio) {
      if (this.isMusicPlaying && !this.clairDeLuneAudio.paused) {
        this.fadeVolume(this.duckedVolume, 400);
      } else if (this.isMusicPlaying) {
        this.clairDeLuneAudio.volume = this.duckedVolume;
        this.clairDeLuneAudio.play().catch(() => {});
      }
    }
  }

  // Restore music volume to normal ambient level when voice note stops/pauses
  unduckClairDeLune() {
    this.isDucked = false;
    if (this.clairDeLuneAudio && this.isMusicPlaying && !this.clairDeLuneAudio.paused) {
      this.fadeVolume(this.normalVolume, 500);
    }
  }

  // Smooth volume interpolation helper
  private fadeVolume(targetVol: number, durationMs: number = 400) {
    if (!this.clairDeLuneAudio || typeof window === 'undefined') return;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const audio = this.clairDeLuneAudio;
    const startVol = audio.volume;
    const diff = targetVol - startVol;
    const steps = 12;
    const stepTime = durationMs / steps;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        audio.volume = targetVol;
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      } else {
        audio.volume = Math.max(0, Math.min(1, startVol + diff * (currentStep / steps)));
      }
    }, stepTime);
  }

  pauseClairDeLune() {
    this.duckClairDeLune();
  }

  resumeClairDeLune() {
    this.unduckClairDeLune();
  }

  toggleClairDeLune(): boolean {
    if (this.isMusicPlaying) {
      this.stopClairDeLune();
      return false;
    } else {
      return this.playClairDeLune();
    }
  }

  getMusicStatus(): boolean {
    return this.isMusicPlaying;
  }

  // Ambient Rain / Noise Generator (Fallback)
  toggleAmbientSound(mode: 'lofi-rain' | 'soft-piano' | 'gentle-chimes' | 'none'): boolean {
    // If Clair de Lune is requested or default, prioritize Clair de Lune
    return this.toggleClairDeLune();
  }

  getAmbientStatus(): boolean {
    return this.isMusicPlaying || this.isAmbientPlaying;
  }
}

export const sounds = new SoundSystem();
