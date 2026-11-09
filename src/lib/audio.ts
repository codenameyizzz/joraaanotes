// Pure Web Audio API Sound Effects + Background Music Engine (Clair de Lune & Happy Birthday)
import { MusicMoodId } from './types';

export interface MusicTrackOption {
  id: MusicMoodId;
  name: string;
  artist?: string;
  description: string;
  durationLabel: string;
  src?: string;
  fallbackSrc?: string;
}

export const MUSIC_TRACKS: MusicTrackOption[] = [
  {
    id: 'clair-de-lune',
    name: 'Clair de Lune',
    artist: 'Claude Debussy',
    description: 'Melodi piano klasik lembut, puitis & menenangkan',
    durationLabel: '30s Loop',
    src: '/audio/clair-de-lune.mp3',
    fallbackSrc: '/audio/clair-de-lune.ogg',
  },
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    artist: 'Birthday Melody',
    description: 'Melodi hangat ceria untuk ucapan & momen ulang tahun',
    durationLabel: 'Full Loop',
    src: '/audio/happy-birthday.mp3',
  },
  {
    id: 'none',
    name: 'Tanpa Musik',
    description: 'Suasana hening dan tenang tanpa alunan melodi latar',
    durationLabel: 'Hening',
  },
];

export function normalizeMusicMood(id?: string): MusicMoodId {
  if (!id || id === 'none') return 'none';
  if (id === 'happy-birthday') return 'happy-birthday';
  return 'clair-de-lune';
}

export function getMusicTrack(id?: string): MusicTrackOption {
  const normalized = normalizeMusicMood(id);
  return MUSIC_TRACKS.find((m) => m.id === normalized) || MUSIC_TRACKS[0];
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;
  private musicAudios: Map<string, HTMLAudioElement> = new Map();
  private activeAudio: HTMLAudioElement | null = null;
  private currentTrackId: MusicMoodId = 'clair-de-lune';
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

  private getAudioForTrack(trackId: MusicMoodId): HTMLAudioElement | null {
    if (typeof window === 'undefined' || trackId === 'none') return null;

    if (this.musicAudios.has(trackId)) {
      return this.musicAudios.get(trackId)!;
    }

    const audio = new Audio();
    audio.preload = 'auto';

    if (trackId === 'happy-birthday') {
      audio.src = '/audio/happy-birthday.mp3';
      audio.loop = true;
    } else {
      // clair-de-lune (default for all classical/legacy IDs)
      audio.src = '/audio/clair-de-lune.mp3';

      audio.onerror = () => {
        // Fallback to .ogg if .mp3 not found
        if (audio.src.endsWith('.mp3')) {
          audio.src = '/audio/clair-de-lune.ogg';
          audio.load();
          if (this.isMusicPlaying && this.activeAudio === audio) {
            audio.play().catch(() => {});
          }
        }
      };

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
    }

    this.musicAudios.set(trackId, audio);
    return audio;
  }

  // Play background music (Clair de Lune or Happy Birthday)
  playMusic(trackId?: string): boolean {
    if (typeof window === 'undefined') return false;

    const targetId = normalizeMusicMood(trackId || this.currentTrackId);
    if (targetId === 'none') {
      this.stopMusic();
      return false;
    }

    // If another track was playing, pause and reset it
    if (this.activeAudio && this.currentTrackId !== targetId) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
    }

    this.currentTrackId = targetId;
    const audio = this.getAudioForTrack(targetId);
    if (!audio) return false;

    this.activeAudio = audio;
    const targetVol = this.isDucked ? this.duckedVolume : this.normalVolume;

    try {
      audio.currentTime = 0;
      audio.volume = targetVol;
      const playPromise = audio.play();
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

  stopMusic() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
    }
    this.isMusicPlaying = false;
    this.isDucked = false;
  }

  // Audio Ducking: Softly lower music volume when voice note plays so music becomes gentle background atmosphere
  duckMusic() {
    this.isDucked = true;
    if (this.activeAudio) {
      if (this.isMusicPlaying && !this.activeAudio.paused) {
        this.fadeVolume(this.duckedVolume, 400);
      } else if (this.isMusicPlaying) {
        this.activeAudio.volume = this.duckedVolume;
        this.activeAudio.play().catch(() => {});
      }
    }
  }

  // Restore music volume to normal ambient level when voice note stops/pauses
  unduckMusic() {
    this.isDucked = false;
    if (this.activeAudio && this.isMusicPlaying && !this.activeAudio.paused) {
      this.fadeVolume(this.normalVolume, 500);
    }
  }

  // Smooth volume interpolation helper
  private fadeVolume(targetVol: number, durationMs: number = 400) {
    if (!this.activeAudio || typeof window === 'undefined') return;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const audio = this.activeAudio;
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

  pauseMusic() {
    this.duckMusic();
  }

  resumeMusic() {
    this.unduckMusic();
  }

  toggleMusic(trackId?: string): boolean {
    const targetId = normalizeMusicMood(trackId || this.currentTrackId);
    if (this.isMusicPlaying && this.currentTrackId === targetId) {
      this.stopMusic();
      return false;
    } else {
      return this.playMusic(targetId);
    }
  }

  getMusicStatus(): boolean {
    return this.isMusicPlaying;
  }

  getCurrentTrack(): MusicMoodId {
    return this.currentTrackId;
  }

  // Backward-compatibility aliases
  playClairDeLune(): boolean {
    return this.playMusic('clair-de-lune');
  }

  stopClairDeLune() {
    this.stopMusic();
  }

  duckClairDeLune() {
    this.duckMusic();
  }

  unduckClairDeLune() {
    this.unduckMusic();
  }

  pauseClairDeLune() {
    this.duckMusic();
  }

  resumeClairDeLune() {
    this.unduckMusic();
  }

  toggleClairDeLune(): boolean {
    return this.toggleMusic('clair-de-lune');
  }

  toggleAmbientSound(mode: string): boolean {
    return this.toggleMusic(mode);
  }

  getAmbientStatus(): boolean {
    return this.isMusicPlaying || this.isAmbientPlaying;
  }
}

export const sounds = new SoundSystem();
