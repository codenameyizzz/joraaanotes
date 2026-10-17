'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, Disc } from 'lucide-react';
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
  const [duration, setDuration] = useState(voiceNote.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(Math.round(audio.duration));
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Resume background music softly when voice note ends
      sounds.resumeClairDeLune();
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      sounds.resumeClairDeLune();
    };
  }, [voiceNote.url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    sounds.playSoftClick();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      // Resume Clair de Lune softly
      sounds.resumeClairDeLune();
    } else {
      // Pause Clair de Lune so voice note is heard crystal-clear
      sounds.pauseClairDeLune();

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
          sounds.resumeClairDeLune();
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  // Waveform bars with aesthetic heights
  const barHeights = [
    30, 60, 45, 80, 50, 95, 65, 100, 75, 45, 85, 55, 90, 70, 40, 85, 60, 95, 50, 75, 40,
  ];

  return (
    <div className="my-8 relative overflow-hidden rounded-2xl bg-[#F6F1E6] border border-[#E3D6C1] p-4 sm:p-5 shadow-xs">
      {/* Background cassette decorative watermark */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-[#2B231D]">
        <Disc size={130} />
      </div>

      <audio ref={audioRef} src={voiceNote.url} preload="metadata" />

      {/* Mini Top Banner */}
      <div className="flex items-center justify-between mb-3.5 border-b border-[#E8DEC9] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} style={{ color: themeColor }} />
          <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-[#7D7060]">
            SEPUCUK PESAN SUARA
          </span>
        </div>

        <span className="text-[10px] font-mono text-[#8C7E6E]">
          {authorName ? `Dari: ${authorName}` : 'Dengarkan Rekaman'}
        </span>
      </div>

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
              const barProgress = (i / barHeights.length) * duration;
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
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7F72] mt-1.5">
            <span className="flex items-center gap-1">
              <Volume2 size={11} className={isPlaying ? 'animate-pulse text-[#BA6E52]' : ''} />
              <span>{isPlaying ? 'Sedang bersuara...' : 'Ketuk untuk mendengarkan'}</span>
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
