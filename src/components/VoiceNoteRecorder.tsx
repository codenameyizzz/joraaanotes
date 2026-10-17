'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, UploadCloud, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoiceNoteData } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface VoiceNoteRecorderProps {
  value: VoiceNoteData | null;
  onChange: (data: VoiceNoteData | null) => void;
  maxDurationSeconds?: number;
}

// Convert PCM Float32 audio samples to 16-bit Mono WAV Blob
function encodeWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true); // ChunkSize
  writeString(8, 'WAVE');

  /* "fmt " sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM linear)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  /* "data" sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true); // Subchunk2Size

  // Write 16-bit PCM samples with soft limiter clipping
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
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
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  // Web Audio Recording Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const totalSamplesCountRef = useRef(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Clean up timer and streams on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch {}
      processorNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  // Update preview audio playback time
  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.muted = false;

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

  // Start Voice Recording with Web Audio API (Universal WAV Format)
  const startRecording = async () => {
    setErrorMsg(null);
    sounds.playSoftClick();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Browser Anda tidak mendukung perekaman mikrofon langsung. Silakan gunakan tombol Unggah Audio.');
      return;
    }

    try {
      cleanupRecording();
      audioBuffersRef.current = [];
      totalSamplesCountRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Use 16,000 Hz or standard sampleRate for speech
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      // ScriptProcessorNode with buffer size 2048, 1 input channel, 1 output channel
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Clone input data
        const copy = new Float32Array(inputData.length);
        copy.set(inputData);
        audioBuffersRef.current.push(copy);
        totalSamplesCountRef.current += copy.length;

        // Calculate peak amplitude for live visual soundwave
        let sum = 0;
        for (let i = 0; i < inputData.length; i += 16) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / (inputData.length / 16);
        setMicVolumeLevel(Math.min(1, avg * 4));
      };

      sourceNode.connect(processor);
      // Connect to destination through a zero-gain node to avoid feedback echo while keeping processor active
      const silenceGain = audioCtx.createGain();
      silenceGain.gain.setValueAtTime(0, audioCtx.currentTime);
      processor.connect(silenceGain);
      silenceGain.connect(audioCtx.destination);

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
      cleanupRecording();
      const isDenied =
        err instanceof Error &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setErrorMsg(
        isDenied
          ? 'Izin mikrofon tidak diizinkan. Anda dapat mengunggah file rekaman suara melalui tombol di samping.'
          : 'Gagal mengakses mikrofon. Pastikan mikrofon terpasang atau gunakan opsi Unggah Audio.'
      );
    }
  };

  // Stop Recording and build lossless universal WAV
  const stopRecording = () => {
    sounds.playWaxSealPop();
    const finalSeconds = Math.max(1, recordingSeconds);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const audioCtx = audioContextRef.current;
    const sampleRate = audioCtx ? audioCtx.sampleRate : 16000;

    // Disconnect processor
    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Merge all recorded Float32 chunks
    const totalSamples = totalSamplesCountRef.current;
    if (totalSamples > 0 && audioBuffersRef.current.length > 0) {
      const mergedSamples = new Float32Array(totalSamples);
      let offset = 0;
      for (const chunk of audioBuffersRef.current) {
        mergedSamples.set(chunk, offset);
        offset += chunk.length;
      }

      // Encode to 16-bit Mono WAV Blob (Universal support on iOS, Android, PC, WhatsApp)
      const wavBlob = encodeWavBlob(mergedSamples, sampleRate);

      const reader = new FileReader();
      reader.readAsDataURL(wavBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        onChange({
          url: base64Audio,
          duration: finalSeconds,
          fileName: 'voice-note.wav',
        });
      };
    }

    cleanupRecording();
    setIsRecording(false);
    setMicVolumeLevel(0);
  };

  // Cancel Recording
  const cancelRecording = () => {
    sounds.playSoftClick();
    cleanupRecording();
    audioBuffersRef.current = [];
    totalSamplesCountRef.current = 0;
    setIsRecording(false);
    setRecordingSeconds(0);
    setMicVolumeLevel(0);
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

    const audio = audioPreviewRef.current;
    audio.volume = 1.0;
    audio.muted = false;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Handle Audio File Upload Fallback (.mp3, .m4a, .wav)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 8MB agar surat tetap ringan dan cepat dimuat.');
      return;
    }

    sounds.playSoftClick();
    setErrorMsg(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
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
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#7A6C5D] font-semibold flex items-center gap-1.5">
              <span>Pesan Suara (Voice Note)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E4ECDE] text-[#416834] font-normal lowercase">
                universal wav
              </span>
            </h4>
            <p className="text-[11px] text-[#9E9080] font-sans">
              Bisikan suara hangatmu yang terdengar jernih di iPhone & Android.
            </p>
          </div>
        </div>

        {value && !isRecording && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0E4] text-[#4F7744] text-[10px] font-mono font-medium">
            <CheckCircle2 size={11} />
            <span>Suara Tersimpan ({formatTime(value.duration)})</span>
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

            {/* Live Visualizer modulated by real mic volume */}
            <div className="flex items-center gap-1.5 h-6">
              {[35, 75, 50, 90, 60, 100, 45, 80, 50, 95, 70, 40].map((h, i) => {
                const dynamicHeight = Math.max(25, Math.min(100, h * (0.4 + micVolumeLevel * 0.9)));
                return (
                  <motion.div
                    key={i}
                    animate={{ height: `${dynamicHeight}%` }}
                    transition={{ duration: 0.1 }}
                    className="w-1 bg-[#D64545] rounded-full"
                    style={{ height: `${dynamicHeight}%` }}
                  />
                );
              })}
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
          <audio
            ref={audioPreviewRef}
            src={value.url}
            preload="auto"
            playsInline
            webkit-playsinline="true"
          />

          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayPreview}
              className="w-10 h-10 rounded-full bg-[#2B231D] text-white flex items-center justify-center shrink-0 hover:bg-[#3E332A] transition-all active:scale-95 shadow-sm"
              aria-label={isPlaying ? 'Jeda Pratinjau' : 'Putar Pratinjau'}
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
            <span>Unggah Audio (.mp3, .m4a, .wav)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
