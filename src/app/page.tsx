'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Camera,
  PenTool,
  Send,
  Eye,
  Music,
  Heart,
  Star,
  Flower2,
  Moon,
  Mail,
  ChevronRight,
  BookOpen,
  Calendar,
  MapPin,
  X,
  Volume2,
  Loader2,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { CapsuleData, PhotoItem, SealIconType, ThemeId, VoiceNoteData, THEMES } from '@/lib/types';
import { compressImage, encodeCapsule, getLocalVault, saveToLocalVault } from '@/lib/storage';
import { sounds } from '@/lib/audio';
import WaxSeal from '@/components/WaxSeal';
import PolaroidCard from '@/components/PolaroidCard';
import VoiceNoteRecorder from '@/components/VoiceNoteRecorder';
import ShareModal from '@/components/ShareModal';
import EnvelopeView from '@/components/EnvelopeView';
import LetterReader from '@/components/LetterReader';

export default function HomePage() {
  // Form State
  const [title, setTitle] = useState('Di Bawah Langit Senja yang Teduh');
  const [author, setAuthor] = useState('Seseorang yang Mengingatmu');
  const [recipient, setRecipient] = useState('Untukmu yang Manis');
  const [dateStr, setDateStr] = useState('15 Oktober 2026 • 23:15');
  const [locationWeather, setLocationWeather] = useState('Di antara rintik gerimis & secangkir kopi');
  const [message, setMessage] = useState(
    `Hai,\n\nKadang di tengah riuhnya hari, ada satu dua ingatan yang tiba-tiba singgah tanpa permisi. Dan seringkali, ingatan itu mengarah kepadamu.\n\nSurat ini kutulis tanpa alasan rumit. Hanya ingin memastikan bahwa kamu baik-baik saja hari ini, dan mengingatkanmu untuk bernapas lebih pelan di sela-sela lelahmu.\n\nSemoga hari esok menyambutmu dengan lebih hangat.`
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('warm-paper');
  const [selectedSeal, setSelectedSeal] = useState<SealIconType>('heart');
  const [musicMood, setMusicMood] = useState<'lofi-rain' | 'soft-piano' | 'gentle-chimes' | 'none'>('lofi-rain');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [voiceNote, setVoiceNote] = useState<VoiceNoteData | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Modals & Navigation state
  const [previewMode, setPreviewMode] = useState<'none' | 'envelope' | 'letter'>('none');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [fallbackHashUrl, setFallbackHashUrl] = useState('');
  const [hasServerStorage, setHasServerStorage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState<CapsuleData | null>(null);
  const [savedVault, setSavedVault] = useState<CapsuleData[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved capsules from local vault
  useEffect(() => {
    setSavedVault(getLocalVault());
  }, []);

  // Set formatted current time on mount if needed
  useEffect(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      const formatted = now.toLocaleDateString('id-ID', options);
      setDateStr(formatted);
    } catch {
      // fallback preserved
    }
  }, []);

  // Handle Image Upload with auto compression to WebP
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 4) {
      alert('Maksimal 4 potret polaroid untuk menjaga kecepatan amplop.');
      return;
    }

    setIsCompressing(true);
    sounds.playSoftClick();

    const washiColors = ['#EFE3B5', '#D7E5D2', '#F2D3D8', '#E7CCA9'];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const compressedDataUrl = await compressImage(file, 800, 0.72);
        const randomRot = Number((Math.random() * 6 - 3).toFixed(1)); // -3 to +3 deg
        const newPhoto: PhotoItem = {
          id: nanoid(6),
          url: compressedDataUrl,
          caption: 'Potret yang terabadikan',
          rotation: randomRot,
          washiTapeColor: washiColors[(photos.length + i) % washiColors.length],
        };
        setPhotos((prev) => [...prev, newPhoto]);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }

    setIsCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    sounds.playSoftClick();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  // Compile Capsule Data object
  const buildCurrentCapsule = (): CapsuleData => {
    return {
      id: nanoid(7),
      title: title.trim() || 'Sepucuk Catatan',
      message: message.trim() || '...',
      author: author.trim() || 'Anonim',
      recipient: recipient.trim() || 'Untukmu',
      dateStr: dateStr.trim(),
      locationWeather: locationWeather.trim(),
      theme: selectedTheme,
      sealIcon: selectedSeal,
      musicMood,
      photos,
      voiceNote: voiceNote || undefined,
      reactions: { hugs: 0, smiles: 0, flowers: 0, coffee: 0 },
      createdAt: Date.now(),
    };
  };

  // Handle Publish / Generate Link
  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Mohon isi judul dan surat terlebih dahulu.');
      return;
    }

    setIsPublishing(true);
    sounds.playWaxSealPop();

    const capsule = buildCurrentCapsule();
    setActiveCapsule(capsule);

    // Save into local personal memory vault
    saveToLocalVault(capsule);
    setSavedVault(getLocalVault());

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const encoded = encodeCapsule(capsule);
    const fullHashUrl = `${origin}/open#data=${encoded}`;
    setFallbackHashUrl(fullHashUrl);

    // Primary clean short link (only ~43 characters, perfect for WhatsApp)
    const cleanShortUrl = `${origin}/open?id=${capsule.id}`;
    let storageActive = false;

    try {
      // 1. Post to API route (Vercel Blob / Upstash Redis / Memory)
      const res = await fetch('/api/capsules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capsule),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          storageActive = true;
        }
      }
    } catch (err) {
      console.warn('API save error:', err);
    }

    setHasServerStorage(storageActive);
    setGeneratedShareUrl(cleanShortUrl);
    setIsPublishing(false);
    setIsShareModalOpen(true);
  };

  // Handle Preview
  const handleOpenPreview = () => {
    sounds.playSoftClick();
    setActiveCapsule(buildCurrentCapsule());
    setPreviewMode('envelope');
  };

  const currentThemeConfig = THEMES[selectedTheme] || THEMES['warm-paper'];

  // If in Preview Mode, render Envelope or Letter with smooth AnimatePresence transition
  if (previewMode !== 'none' && activeCapsule) {
    return (
      <div className="relative">
        <div className="fixed top-4 left-4 z-50">
          <button
            type="button"
            onClick={() => setPreviewMode('none')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#DACFBF] text-xs font-mono text-[#5C5042] hover:bg-white shadow-sm"
          >
            <X size={13} />
            <span>{previewMode === 'envelope' ? 'Keluar Preview' : 'Kembali ke Editor'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {previewMode === 'envelope' ? (
            <motion.div
              key="preview-envelope"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <EnvelopeView
                capsule={activeCapsule}
                onOpen={() => setPreviewMode('letter')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview-letter"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <LetterReader
                capsule={activeCapsule}
                onBackToEnvelope={() => setPreviewMode('envelope')}
                onShare={handlePublish}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          capsule={activeCapsule}
          shareUrl={generatedShareUrl}
          fallbackUrl={fallbackHashUrl}
          hasPersistentStorage={hasServerStorage}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentThemeConfig.bgClass} text-[#28221D] transition-colors duration-300 relative paper-grain`}>
      {/* Top Subtle Announcement / Navigation Bar */}
      <header className="border-b border-[#E8DFC9] bg-white/50 backdrop-blur-xs py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#964332] text-white flex items-center justify-center text-xs font-serif shadow-xs">
              ✦
            </div>
            <div>
              <span className="font-serif text-lg tracking-tight font-medium text-[#26201B]">
                Joraaa Notes
              </span>
              <span className="text-[10px] font-mono text-[#8C7D6D] ml-2 hidden sm:inline">
                Aesthetic Digital Keepsakes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedVault.length > 0 && (
              <a
                href="#vault"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6E6152] hover:text-[#26201B] px-3 py-1.5 rounded-full bg-white/60 border border-[#E0D5C3] shadow-2xs"
              >
                <BookOpen size={12} />
                <span>Koleksi ({savedVault.length})</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleOpenPreview}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full bg-white border border-[#DACFBF] text-[#4A3F33] hover:bg-[#F9F5EC] transition-all shadow-2xs"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio / Creator Area */}
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        {/* Poetic Intro */}
        <section className="text-center mb-10">
          {/* <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 border border-[#E5DACB] text-[11px] font-mono tracking-wider text-[#7A6D5E] mb-3 shadow-2xs">
            <Sparkles size={12} className="text-[#BA6E52]" />
            <span>KIRIM SEPUCUK KENANGAN DI DALAM AMPLOP DIGITAL</span>
          </div> */}
          <h1 className="font-serif text-3xl sm:text-5xl text-[#26201B] tracking-tight font-normal leading-tight">
            Tulis Surat, Sematkan Potret, & Segel dengan Kasih.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#73685B] max-w-lg mx-auto mt-3 leading-relaxed">
            Penerima akan membuka amplop 3D, memecahkan segel lilin bertabur bunga, dan membaca lembar suratmu seperti menerima surat fisik.
          </p>
        </section>

        {/* The Writing Desk / Sheet */}
        <div className={`relative rounded-2xl p-6 sm:p-10 ${currentThemeConfig.paperClass} border ${currentThemeConfig.cardBorder} shadow-[0_20px_50px_-15px_rgba(40,30,20,0.08),0_2px_4px_rgba(0,0,0,0.02)] transition-colors duration-300`}>
          {/* Top Washi Tape Decoration */}
          <div
            className="washi-tape-jagged absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6.5 pointer-events-none opacity-85 shadow-xs"
            style={{ backgroundColor: currentThemeConfig.washiDefault }}
          />

          {/* Metadata Row: Date & Atmosphere */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6 border-b border-[#ECE2D2] mb-6">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
                <Calendar size={11} /> Waktu & Tanggal
              </label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="15 Oktober 2026 • 23:15"
                className="w-full bg-[#F5EDE1]/60 border border-[#E3D6C3] rounded-lg px-3 py-1.5 text-xs font-mono text-[#383027] focus:outline-hidden focus:border-[#964332] transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
                <MapPin size={11} /> Suasana / Lokasi
              </label>
              <input
                type="text"
                value={locationWeather}
                onChange={(e) => setLocationWeather(e.target.value)}
                placeholder="Di antara rintik gerimis & aroma kopi"
                className="w-full bg-[#F5EDE1]/60 border border-[#E3D6C3] rounded-lg px-3 py-1.5 text-xs font-mono text-[#383027] focus:outline-hidden focus:border-[#964332] transition-colors"
              />
            </div>
          </div>

          {/* Letter Addressee & Author Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
                Kepada (Penerima Surat)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Untuk Nadya / Sahabat Terbaikku"
                className="w-full bg-[#F8F2E8] border border-[#E3D6C3] rounded-lg px-3.5 py-2 text-sm font-sans font-medium text-[#28221D] focus:outline-hidden focus:border-[#964332]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
                Dari (Pengirim / Penulis)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Dari seseorang yang selalu mendoakanmu"
                className="w-full bg-[#F8F2E8] border border-[#E3D6C3] rounded-lg px-3.5 py-2 text-sm font-sans font-medium text-[#28221D] focus:outline-hidden focus:border-[#964332]"
              />
            </div>
          </div>

          {/* Title Input (Instrument Serif) */}
          <div className="mb-6">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
              Judul Surat / Memoir
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis judul puitismu..."
              className="w-full bg-transparent border-b-2 border-[#E5DAC8] pb-2 text-2xl sm:text-3xl font-serif text-[#241F1A] placeholder:text-[#BBB0A3] focus:outline-hidden focus:border-[#964332] transition-colors"
            />
          </div>

          {/* Message Area */}
          <div className="mb-8">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-1">
              Isi Surat / Catatan Estetik
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan apa yang ingin kamu bisikkan secara tenang..."
              className="w-full bg-[#F9F5EC]/70 border border-[#E3D6C3] rounded-xl p-4 text-base font-sans text-[#2B231D] leading-relaxed placeholder:text-[#BAAE9F] focus:outline-hidden focus:border-[#964332] transition-colors resize-y"
            />
          </div>

          {/* Photo Gallery & Uploader */}
          <div className="mb-10 pt-6 border-t border-[#ECE2D2]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#7A6C5D] font-medium flex items-center gap-1.5">
                  <Camera size={13} className="text-[#BA6E52]" />
                  <span>Potret Polaroid ({photos.length}/4)</span>
                </h3>
                <p className="text-[11px] text-[#9E9080] font-sans">
                  Sematkan foto kenangan. Bisa dibalik untuk membaca catatan di belakangnya.
                </p>
              </div>

              {photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B231D] text-[#FAF8F5] text-xs font-mono hover:bg-[#3E332A] transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <Camera size={12} />
                  <span>{isCompressing ? 'Mengompres...' : '+ Tambah Foto'}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Photos Preview Grid */}
            {photos.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="flex flex-col items-center">
                    <PolaroidCard
                      photo={photo}
                      onDelete={() => removePhoto(photo.id)}
                      interactive={true}
                      dateStr={dateStr}
                    />
                    {/* Caption editor input */}
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                      placeholder="Tulis catatan belakang..."
                      className="mt-3 text-center text-xs font-handwriting text-[#524436] bg-[#FAF4EA] border border-[#E2D5C3] rounded-md px-3 py-1 w-56 focus:outline-hidden focus:border-[#964332]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E0D5C3] rounded-xl p-8 text-center cursor-pointer hover:border-[#BA6E52] transition-colors bg-[#FAF5EB]/50"
              >
                <div className="w-10 h-10 rounded-full bg-[#F0E6D5] text-[#8C7D6D] flex items-center justify-center mx-auto mb-2">
                  <Camera size={18} />
                </div>
                <p className="text-xs font-mono text-[#6E6152]">
                  Belum ada foto yang disematkan
                </p>
                <p className="text-[11px] text-[#A39686] mt-0.5">
                  Klik di sini untuk upload foto (JPG, PNG, WebP)
                </p>
              </div>
            )}
          </div>

          {/* Voice Note Recorder Section */}
          <div className="mb-10 pt-6 border-t border-[#ECE2D2]">
            <VoiceNoteRecorder
              value={voiceNote}
              onChange={setVoiceNote}
              maxDurationSeconds={60}
            />
          </div>

          {/* Aesthetics Customizer: Themes, Seals & Music */}
          <div className="pt-6 border-t border-[#ECE2D2] space-y-6">
            {/* Theme Picker */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-2">
                Pilih Nuansa & Warna Kertas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSelected = selectedTheme === tId;
                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => {
                        sounds.playSoftClick();
                        setSelectedTheme(tId);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${isSelected
                        ? 'border-[#26201B] bg-white ring-1 ring-[#26201B] shadow-xs'
                        : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <span className="text-xs font-sans text-[#332A22] truncate">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seal Icon Picker */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-2">
                Pilih Ikon Segel Lilin (Wax Seal)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {(
                  [
                    { id: 'heart', label: 'Hati', icon: <Heart size={14} /> },
                    { id: 'star', label: 'Bintang', icon: <Star size={14} /> },
                    { id: 'flower', label: 'Bunga', icon: <Flower2 size={14} /> },
                    { id: 'crescent', label: 'Bulan', icon: <Moon size={14} /> },
                    { id: 'envelope', label: 'Surat', icon: <Mail size={14} /> },
                    { id: 'sparkle', label: 'Kilau', icon: <Sparkles size={14} /> },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sounds.playSoftClick();
                      setSelectedSeal(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${selectedSeal === item.id
                      ? 'bg-[#26201B] text-white border-[#26201B] shadow-xs'
                      : 'bg-[#F7F2E8] text-[#594E42] border-[#E3D6C3] hover:bg-white'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Atmosphere Mood Sound */}
            {/* <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#918373] mb-2">
                Musik Latar Suasana (Ambient Sound Engine)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'lofi-rain', label: '🌧️ Gerimis Hujan Lembut' },
                  { id: 'gentle-chimes', label: '🎐 Lonceng Angin Halus' },
                  { id: 'none', label: '🔇 Hening / Sunyi' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sounds.playSoftClick();
                      setMusicMood(item.id as 'lofi-rain' | 'gentle-chimes' | 'none');
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${musicMood === item.id
                      ? 'bg-[#8C9A7E] text-white border-[#8C9A7E]'
                      : 'bg-[#F7F2E8] text-[#594E42] border-[#E3D6C3] hover:bg-white'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div> */}
          </div>

          {/* Action Footer: Segel & Terbangkan */}
          <div className="mt-10 pt-8 border-t border-[#ECE2D2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <WaxSeal
                icon={selectedSeal}
                color={currentThemeConfig.sealColor}
                size="md"
                interactive={false}
              />
              <div>
                <p className="text-xs font-mono text-[#383027] font-medium">
                  Segel Lilin Siap Dicetak
                </p>
                <p className="text-[11px] font-sans text-[#8C7D6D]">
                  Link dapat langsung dibuka siapa saja tanpa perlu login
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-[#D8CCBA] bg-white text-xs font-mono text-[#4A3F33] hover:bg-[#F9F5EC] transition-all shadow-2xs"
              >
                <Eye size={13} />
                <span>Uji Buka Amplop</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#964332] text-white text-xs font-mono uppercase tracking-wider shadow-lg hover:bg-[#803829] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-80 disabled:cursor-wait"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Menyegel...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Segel & Bagikan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* User's Local Vault (Catatan Tersimpan di Browser ini) */}
        {savedVault.length > 0 && (
          <section id="vault" className="mt-16 pt-10 border-t border-[#E8DFC9]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-[#2B231D] tracking-tight flex items-center gap-2">
                <BookOpen size={18} className="text-[#964332]" />
                <span>Koleksi Surat Pribadimu</span>
              </h2>
              <span className="text-xs font-mono text-[#8C7D6D]">
                Tersimpan di perangkat ini ({savedVault.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedVault.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/70 backdrop-blur-2xs rounded-xl border border-[#E5DACB] p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#9E9080]">
                      {item.dateStr}
                    </span>
                    <h3 className="font-serif text-lg text-[#2B2520] font-normal truncate mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs font-sans text-[#7D7061] mt-1 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EFE8DC] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8C7E70]">
                      Untuk: {item.recipient}
                    </span>
                    <a
                      href={`/open#data=${encodeCapsule(item)}`}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#964332] hover:underline"
                    >
                      <span>Buka</span>
                      <ChevronRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Share Modal */}
      {activeCapsule && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          capsule={activeCapsule}
          shareUrl={generatedShareUrl}
          fallbackUrl={fallbackHashUrl}
          hasPersistentStorage={hasServerStorage}
        />
      )}

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-[#E8DFC9] text-center text-xs font-mono text-[#8C7E70]">
        <p>2026 Joraaa Notes - Copyright Reserved. All rights reserved.</p>
      </footer>
    </div>
  );
}
