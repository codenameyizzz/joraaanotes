'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, Disc, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoiceNoteData } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface VoiceNotePlayerProps {
  voiceNote: VoiceNoteData;
  authorName?: string;
  themeColor?: string;
}

export default function VoiceNotePlayer({
  voiceNote,
  authorName,
  themeColor = '#964332',
}: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(voiceNote.duration || 10);
  const [volumeBoost, setVolumeBoost] = useState<1 | 1.5 | 2>(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Fallback playback node refs (for devices where HTML5 audio tag fails on certain codecs)
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isWebAudioModeRef = useRef<boolean>(false);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert base64 data URL to ArrayBuffer
  const base64ToArrayBuffer = (base64Url: string): ArrayBuffer => {
    const base64Data = base64Url.split(',')[1] || base64Url;
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Initialize HTML5 Audio and pre-decode Web Audio fallback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.muted = false;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity && audio.duration > 0) {
        setDuration(Math.round(audio.duration));
      } else if (voiceNote.duration) {
        setDuration(voiceNote.duration);
      }
    };

    const onTimeUpdate = () => {
      if (!isWebAudioModeRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      sounds.resumeClairDeLune();
    };

    const onError = () => {
      console.warn('HTML5 <audio> error, preparing Web Audio API fallback...');
      prepareWebAudioFallback();
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      stopWebAudio();
      sounds.resumeClairDeLune();
    };
  }, [voiceNote.url]);

  // Decode audio using Web Audio API as bulletproof secondary engine
  const prepareWebAudioFallback = async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = webAudioCtxRef.current || new AudioCtx();
      webAudioCtxRef.current = ctx;

      const arrayBuffer = base64ToArrayBuffer(voiceNote.url);
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decodedBuffer;
      if (decodedBuffer.duration && decodedBuffer.duration > 0) {
        setDuration(Math.round(decodedBuffer.duration));
      }
      isWebAudioModeRef.current = true;
      setLoadError(null);
    } catch (err) {
      console.warn('Web Audio decode fallback error:', err);
      setLoadError('Format audio tidak dapat diputar langsung di peramban ini.');
    }
  };

  // Playback using Web Audio API buffer
  const playWebAudio = () => {
    const ctx = webAudioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    sounds.pauseClairDeLune();

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volumeBoost, ctx.currentTime);
    gainNodeRef.current = gain;

    source.connect(gain);
    gain.connect(ctx.destination);

    const offset = pausedAtRef.current % buffer.duration;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;
    bufferSourceRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      if (ctx.currentTime - startTimeRef.current >= buffer.duration - 0.2) {
        setIsPlaying(false);
        setCurrentTime(0);
        pausedAtRef.current = 0;
        sounds.resumeClairDeLune();
      }
    };

    const updateTimer = () => {
      if (bufferSourceRef.current) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(buffer.duration, Math.max(0, elapsed)));
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const pauseWebAudio = () => {
    const ctx = webAudioCtxRef.current;
    if (ctx && bufferSourceRef.current) {
      pausedAtRef.current = ctx.currentTime - startTimeRef.current;
      try {
        bufferSourceRef.current.stop();
      } catch {}
      bufferSourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
    sounds.resumeClairDeLune();
  };

  const stopWebAudio = () => {
    pauseWebAudio();
    pausedAtRef.current = 0;
    setCurrentTime(0);
  };

  // Toggle Play / Pause Main Entry
  const togglePlay = async () => {
    sounds.playSoftClick();

    if (isWebAudioModeRef.current && audioBufferRef.current) {
      if (isPlaying) {
        pauseWebAudio();
      } else {
        playWebAudio();
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.muted = false;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      sounds.resumeClairDeLune();
    } else {
      // Pause background music for crystal-clear voice clarity
      sounds.pauseClairDeLune();

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Standard HTML5 audio.play() rejected, trying Web Audio fallback:', err);
        // Switch to Web Audio fallback
        await prepareWebAudioFallback();
        if (audioBufferRef.current) {
          playWebAudio();
        } else {
          setIsPlaying(false);
          sounds.resumeClairDeLune();
        }
      }
    }
  };

  // Handle seeking / scrubbing
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * (duration || voiceNote.duration || 10);

    if (isWebAudioModeRef.current && audioBufferRef.current) {
      pausedAtRef.current = targetTime;
      setCurrentTime(targetTime);
      if (isPlaying) {
        pauseWebAudio();
        playWebAudio();
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Toggle volume gain boost (1x, 1.5x, 2x)
  const toggleVolumeBoost = () => {
    sounds.playSoftClick();
    const nextBoost = volumeBoost === 1 ? 1.5 : volumeBoost === 1.5 ? 2 : 1;
    setVolumeBoost(nextBoost);
    if (gainNodeRef.current && webAudioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextBoost, webAudioCtxRef.current.currentTime);
    }
  };

  // Waveform bars with aesthetic heights
  const barHeights = [
    30, 60, 45, 80, 50, 95, 65, 100, 75, 45, 85, 55, 90, 70, 40, 85, 60, 95, 50, 75, 40,
  ];

  return (
    <div className="my-8 relative overflow-hidden rounded-2xl bg-[#F7F2E7] border border-[#E3D6C1] p-4 sm:p-5 shadow-xs">
      {/* Background cassette decorative watermark */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-[#2B231D]">
        <Disc size={130} />
      </div>

      <audio
        ref={audioRef}
        src={voiceNote.url}
        preload="auto"
        playsInline
        webkit-playsinline="true"
      />

      {/* Mini Top Banner */}
      <div className="flex items-center justify-between mb-3.5 border-b border-[#E8DEC9] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} style={{ color: themeColor }} />
          <span className="text-xs font-serif italic text-[#7D7060]">
            Sepucuk Pesan Suara
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Volume Boost Pill */}
          <button
            type="button"
            onClick={toggleVolumeBoost}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif italic transition-all border ${
              volumeBoost > 1
                ? 'bg-[#EADFA8] text-[#4A3D1E] border-[#DAC386] font-medium'
                : 'bg-white/80 text-[#7D7060] border-[#E8DEC9] hover:bg-white'
            }`}
            title="Tingkatkan kenyaringan suara bisikan"
          >
            <Volume2 size={11} />
            <span>Kenyaringan {volumeBoost}x</span>
          </button>

          <span className="text-xs font-handwriting text-[#8C7E6E]">
            {authorName ? `Dari: ${authorName}` : 'Dengarkan Rekaman'}
          </span>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 bg-[#FDF0ED] border border-[#F5C7BE] rounded-xl p-2.5 mb-3 text-xs text-[#964332] font-sans">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button
            type="button"
            onClick={() => prepareWebAudioFallback()}
            className="p-1 rounded text-[#964332] hover:bg-white/60"
            title="Coba Muat Ulang"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      )}

      {/* Player Main Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Play / Pause Tactile Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md active:scale-95 text-white"
          style={{ backgroundColor: themeColor }}
          aria-label={isPlaying ? 'Jeda pesan suara' : 'Putar pesan suara'}
        >
          {isPlaying ? (
            <Pause size={18} fill="white" />
          ) : (
            <Play size={18} fill="white" className="ml-0.5" />
          )}
        </button>

        {/* Waveform and Progress Bar */}
        <div className="flex-1 min-w-0">
          {/* Animated Waveform Visualization */}
          <div
            className="flex items-center justify-between gap-1 h-7 mb-2 cursor-pointer px-1"
            onClick={handleSeek}
          >
            {barHeights.map((h, i) => {
              const barProgress = (i / barHeights.length) * (duration || 1);
              const isPassed = currentTime >= barProgress;

              return (
                <motion.div
                  key={i}
                  animate={
                    isPlaying
                      ? {
                          height: [`${Math.max(20, h * 0.4)}%`, `${h}%`, `${Math.max(25, h * 0.6)}%`],
                        }
                      : { height: `${h * 0.7}%` }
                  }
                  transition={
                    isPlaying
                      ? {
                          duration: 0.5 + (i % 4) * 0.15,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                        }
                      : { duration: 0.3 }
                  }
                  className="flex-1 max-w-[4px] rounded-full transition-colors"
                  style={{
                    backgroundColor: isPassed ? themeColor : '#DBCFBE',
                  }}
                />
              );
            })}
          </div>

          {/* Time Scrubber */}
          <div
            className="w-full bg-[#E5DBCB] h-1.5 rounded-full overflow-hidden cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                backgroundColor: themeColor,
              }}
            />
          </div>

          {/* Time text indicator */}
          <div className="flex items-center justify-between text-xs font-serif italic text-[#8C7F72] mt-1.5">
            <span className="flex items-center gap-1">
              <Volume2 size={11} className={isPlaying ? 'animate-pulse text-[#BA6E52]' : ''} />
              <span>
                {isPlaying
                  ? `Sedang bersuara ${volumeBoost > 1 ? `(${volumeBoost}x)` : ''}...`
                  : 'Ketuk untuk mendengarkan'}
              </span>
            </span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
