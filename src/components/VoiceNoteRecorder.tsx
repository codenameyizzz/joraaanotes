'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, UploadCloud, Radio, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceNoteData } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface VoiceNoteRecorderProps {
  value: VoiceNoteData | null;
  onChange: (data: VoiceNoteData | null) => void;
  maxDurationSeconds?: number;
}

export default function VoiceNoteRecorder({
  value,
  onChange,
  maxDurationSeconds = 60,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Clean up timer and streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Update preview audio playback time
  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [value]);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMsg(null);
    sounds.playSoftClick();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Browser Anda tidak mendukung perekaman mikrofon langsung.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Find best supported format for compact speech
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 32000, // 32kbps for ultra-lightweight, crisp voice
      };
      if (mimeType) options.mimeType = mimeType;

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all microphone tracks to release mic light
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });

        // Convert blob to base64 Data URL
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          // Calculate final recorded duration
          const finalDuration = Math.max(1, recordingSeconds);
          onChange({
            url: base64Audio,
            duration: finalDuration,
            fileName: 'voice-note.webm',
          });
        };
      };

      recorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start duration counter
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingSeconds(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 250);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      const isDenied = err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setErrorMsg(
        isDenied
          ? 'Izin mikrofon ditolak. Anda juga bisa mengunggah file rekaman suara melalui tombol di bawah.'
          : 'Gagal mengakses mikrofon. Pastikan mikrofon terhubung atau unggah file suara secara langsung.'
      );
    }
  };

  // Stop Recording
  const stopRecording = () => {
    sounds.playWaxSealPop();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Cancel Recording
  const cancelRecording = () => {
    sounds.playSoftClick();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Delete Current Voice Note
  const deleteVoiceNote = () => {
    sounds.playSoftClick();
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onChange(null);
  };

  // Toggle Play / Pause in Preview
  const togglePlayPreview = () => {
    if (!value || !audioPreviewRef.current) return;
    sounds.playSoftClick();

    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Handle Audio File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 5MB agar amplop tetap ringan.');
      return;
    }

    sounds.playSoftClick();
    setErrorMsg(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Get audio duration
      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        const dur = Math.round(tempAudio.duration) || 15;
        onChange({
          url: dataUrl,
          duration: dur,
          fileName: file.name,
        });
      };
      tempAudio.onerror = () => {
        onChange({
          url: dataUrl,
          duration: 15,
          fileName: file.name,
        });
      };
    };

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-[#FAF6EE] border border-[#E8DEC8] rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#EFE4D2] flex items-center justify-center text-[#964332]">
            <Radio size={16} />
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#7A6C5D] font-semibold">
              Pesan Suara (Voice Note)
            </h4>
            <p className="text-[11px] text-[#9E9080] font-sans">
              Kirimkan bisikan suara hangatmu yang tersimpan di dalam amplop.
            </p>
          </div>
        </div>

        {value && !isRecording && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0E4] text-[#4F7744] text-[10px] font-mono font-medium">
            ✓ Suara Terlampir ({formatTime(value.duration)})
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 bg-[#FDF0ED] border border-[#F5C7BE] rounded-xl p-2.5 mb-3 text-xs text-[#964332] font-sans">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STATE 1: RECORDING IN PROGRESS */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border border-[#E8DEC8] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          {/* Animated Wave & Time Indicator */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D64545] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D64545]" />
            </span>

            <div className="flex items-center gap-1.5 h-6">
              {[40, 75, 55, 90, 60, 100, 45, 80, 50, 95, 70, 40].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                  transition={{
                    duration: 0.6 + (i % 3) * 0.2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-[#D64545] rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <span className="font-mono text-xs font-semibold text-[#D64545]">
              {formatTime(recordingSeconds)} / {formatTime(maxDurationSeconds)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-3 py-1.5 rounded-lg border border-[#E0D5C3] text-xs font-mono text-[#7D7062] hover:bg-[#FAF6EE] transition-all"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D64545] text-white text-xs font-mono font-medium hover:bg-[#B83838] shadow-sm transition-all active:scale-95"
            >
              <Square size={12} fill="white" />
              <span>Selesai Rekam</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STATE 2: ALREADY RECORDED / PREVIEW */}
      {!isRecording && value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#DFCDBA] p-3.5 shadow-xs"
        >
          {/* Audio hidden element for preview */}
          <audio ref={audioPreviewRef} src={value.url} preload="auto" />

          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayPreview}
              className="w-10 h-10 rounded-full bg-[#2B231D] text-white flex items-center justify-center shrink-0 hover:bg-[#3E332A] transition-all active:scale-95 shadow-sm"
            >
              {isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="white" className="ml-0.5" />}
            </button>

            {/* Scrubber & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7F72] mb-1">
                <span>{isPlaying ? 'Memutar Pesan Suara...' : 'Pratinjau Pesan Suara'}</span>
                <span>
                  {formatTime(currentTime)} / {formatTime(value.duration)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="w-full bg-[#EFE8DD] h-2 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  if (audioPreviewRef.current && value.duration) {
                    audioPreviewRef.current.currentTime = ratio * value.duration;
                    setCurrentTime(audioPreviewRef.current.currentTime);
                  }
                }}
              >
                <div
                  className="bg-[#BA6E52] h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${value.duration > 0 ? (currentTime / value.duration) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Actions: Re-record or Delete */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={startRecording}
                title="Rekam Ulang"
                className="p-2 rounded-lg text-[#7C6F61] hover:text-[#2B231D] hover:bg-[#FAF4EA] transition-colors"
              >
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                onClick={deleteVoiceNote}
                title="Hapus Rekaman"
                className="p-2 rounded-lg text-[#964332] hover:bg-[#FDF0ED] transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STATE 3: IDLE / NO RECORDING YET */}
      {!isRecording && !value && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          {/* Record with Mic */}
          <button
            type="button"
            onClick={startRecording}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B231D] text-white text-xs font-mono font-medium hover:bg-[#3D332A] transition-all active:scale-95 shadow-xs"
          >
            <Mic size={14} className="text-[#EADFA8]" />
            <span>Mulai Rekam Suara (Maks. 60d)</span>
          </button>

          {/* Or Upload Audio File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DACDBA] text-xs font-mono text-[#6A5E50] hover:bg-[#FAF6EE] transition-all"
          >
            <UploadCloud size={14} />
            <span>Unggah Audio (.mp3, .m4a)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.webm,.wav,.ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
