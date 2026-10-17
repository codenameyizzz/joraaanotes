'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Camera,
  PenTool,
  Send,
  Eye,
  BookOpen,
  Calendar,
  MapPin,
  X,
  Volume2,
  Loader2,
  Heart,
  Star,
  Layers,
  Sparkle,
  ChevronRight,
  FileText,
  Mail,
  HeartHandshake,
  Feather,
  Wind,
  Flame,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  CapsuleData,
  PhotoItem,
  SealIconType,
  ThemeId,
  VoiceNoteData,
  BotanicalFlowerId,
  FlowerStickerPosition,
  FlowerSize,
  GarlandBorderId,
  GarlandPosition,
  EnvelopeStyle,
  OpenAnimationType,
  THEMES,
} from '@/lib/types';
import { compressImage, encodeCapsule, getLocalVault, saveToLocalVault } from '@/lib/storage';
import { sounds } from '@/lib/audio';
import {
  BOTANICAL_FLOWERS,
  GARLAND_BORDERS,
  FLOWER_POSITIONS,
  GARLAND_POSITIONS,
  FLOWER_SIZES,
  ENVELOPE_STYLES,
  OPEN_ANIMATIONS,
  getBotanicalFlower,
  getGarlandBorder,
  getFlowerPositionConfig,
  getFlowerSizeClass,
} from '@/lib/botanical';
import WaxSeal from '@/components/WaxSeal';
import PolaroidCard from '@/components/PolaroidCard';
import VoiceNoteRecorder from '@/components/VoiceNoteRecorder';
import ShareModal from '@/components/ShareModal';
import EnvelopeView from '@/components/EnvelopeView';
import LetterReader from '@/components/LetterReader';

const signOffPresets = [
  'Ditulis dengan hangat oleh,',
  'Dengan segenap rindu,',
  'Peluk hangat dari jauh,',
  'Tertanda selalu,',
  'Sahabatmu selamanya,',
];

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
  const [signOffPrefix, setSignOffPrefix] = useState('Ditulis dengan hangat oleh,');

  // Aesthetic Customization State
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('warm-paper');
  const [selectedSeal, setSelectedSeal] = useState<SealIconType>('lily');
  const [selectedFlower, setSelectedFlower] = useState<BotanicalFlowerId>('pink-lily');
  const [flowerPosition, setFlowerPosition] = useState<FlowerStickerPosition>('top-right');
  const [flowerSize, setFlowerSize] = useState<FlowerSize>('md');
  const [selectedGarland, setSelectedGarland] = useState<GarlandBorderId>('none');
  const [garlandPosition, setGarlandPosition] = useState<GarlandPosition>('right');
  const [envelopeStyle, setEnvelopeStyle] = useState<EnvelopeStyle>('classic-triangle');
  const [openAnimation, setOpenAnimation] = useState<OpenAnimationType>('blossom-burst');
  const [musicMood, setMusicMood] = useState<'lofi-rain' | 'soft-piano' | 'gentle-chimes' | 'none'>('lofi-rain');

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [voiceNote, setVoiceNote] = useState<VoiceNoteData | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Editor View Mode: Tab to switch between Writing Desk and Instant Live Letter Preview
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

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

    const washiColors = ['#EFE3B5', '#D7E5D2', '#F2D3D8', '#E7CCA9', '#E2D5EE'];

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
      signOffPrefix: signOffPrefix.trim() || 'Ditulis dengan hangat oleh,',
      theme: selectedTheme,
      sealIcon: selectedSeal,
      flowerDecoration: selectedFlower,
      flowerPosition,
      flowerSize,
      garlandBorder: selectedGarland,
      garlandPosition,
      envelopeStyle,
      openAnimation,
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

    // Primary clean short link
    const cleanShortUrl = `${origin}/open?id=${capsule.id}`;
    let storageActive = false;

    try {
      const res = await fetch('/api/capsules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capsule),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          storageActive = true;
          setHasServerStorage(Boolean(result.hasPersistentStorage));
        }
      }
    } catch (err) {
      console.warn('Could not post to /api/capsules:', err);
    }

    setGeneratedShareUrl(cleanShortUrl);
    setHasServerStorage(storageActive);
    setIsPublishing(false);
    setIsShareModalOpen(true);
  };

  // Handle Open Envelope Test Preview
  const handleOpenPreview = () => {
    sounds.playSoftClick();
    const capsule = buildCurrentCapsule();
    setActiveCapsule(capsule);
    setPreviewMode('envelope');
  };

  const currentThemeConfig = THEMES[selectedTheme] || THEMES['warm-paper'];
  const chosenFlowerConfig = getBotanicalFlower(selectedFlower);
  const chosenGarlandConfig = getGarlandBorder(selectedGarland);
  const flowerPosConfig = getFlowerPositionConfig(flowerPosition);

  // Full Screen Envelope Test Mode
  if (previewMode !== 'none' && activeCapsule) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed top-4 left-4 z-50">
          <button
            type="button"
            onClick={() => {
              sounds.playSoftClick();
              setPreviewMode('none');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#DFCDBA] text-xs font-serif italic text-[#382F26] shadow-md hover:bg-white transition-all cursor-pointer"
          >
            <X size={14} />
            <span>Tutup Mode Uji Coba</span>
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
    <div className={`min-h-screen ${currentThemeConfig.bgClass} text-[#28221D] transition-colors duration-300 relative paper-grain overflow-x-hidden`}>
      {/* Botanical Corner Vignettes (Artistic Scatter) */}
      <div className="fixed top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 pointer-events-none opacity-20 mix-blend-multiply z-0 select-none -translate-x-8 -translate-y-8">
        <motion.img
          animate={{ rotate: [-2, 2, -2], y: [-4, 4, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          src="/botanical/bouquet-peony.png"
          alt="Peony Bouquet"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="fixed top-0 right-0 w-48 sm:w-60 h-48 sm:h-60 pointer-events-none opacity-20 mix-blend-multiply z-0 select-none translate-x-8 -translate-y-6">
        <motion.img
          animate={{ rotate: [2, -2, 2], y: [4, -4, 4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          src="/botanical/wildflowers.png"
          alt="Wildflowers"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="fixed bottom-0 left-0 w-44 sm:w-56 h-44 sm:h-56 pointer-events-none opacity-20 mix-blend-multiply z-0 select-none -translate-x-6 translate-y-6">
        <motion.img
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          src="/botanical/bouquet-lily.png"
          alt="Lily Bouquet"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="fixed bottom-0 right-0 w-40 sm:w-52 h-40 sm:h-52 pointer-events-none opacity-20 mix-blend-multiply z-0 select-none translate-x-6 translate-y-6">
        <motion.img
          animate={{ rotate: [3, -3, 3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          src="/botanical/flower-blue-hydrangea.png"
          alt="Hydrangea"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="border-b border-[#E8DFC9] bg-white/60 backdrop-blur-md py-3 px-4 sm:px-8 relative z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF4EA] border border-[#E0D5C3] flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
              <img
                src="/botanical/pink-lily.png"
                alt="Joraaa Notes"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight font-medium text-[#26201B]">
                Joraaa Notes
              </span>
              <span className="font-handwriting text-sm text-[#8C7D6D] ml-2 hidden sm:inline">
                Aesthetic Digital Keepsakes & Botanical Letters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedVault.length > 0 && (
              <a
                href="#vault"
                className="inline-flex items-center gap-1.5 text-xs font-serif text-[#6E6152] hover:text-[#26201B] px-3.5 py-1.5 rounded-full bg-white/70 border border-[#E0D5C3] shadow-2xs"
              >
                <BookOpen size={13} />
                <span>Koleksi ({savedVault.length})</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleOpenPreview}
              className="inline-flex items-center gap-1.5 text-xs font-serif italic px-4 py-1.5 rounded-full bg-white border border-[#DACFBF] text-[#4A3F33] hover:bg-[#F9F5EC] transition-all shadow-2xs cursor-pointer"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio / Creator Area */}
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 relative z-10">
        {/* Poetic Intro */}
        <section className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl text-[#26201B] tracking-tight font-normal leading-tight">
            Tulis Surat, Sematkan Potret, & Segel dengan Kasih.
          </h1>
          <p className="font-handwriting text-xl sm:text-2xl text-[#786654] max-w-lg mx-auto mt-2 leading-relaxed">
            Penerima akan membuka amplop 3D, memecahkan segel bunga, dan membaca lembar suratmu seperti menerima surat fisik.
          </p>
        </section>

        {/* View Mode Toggle Switcher (Clean, no emoticons) */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex p-1 rounded-full bg-white/80 border border-[#DFCDBA] shadow-xs backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                sounds.playSoftClick();
                setEditorTab('write');
              }}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                editorTab === 'write'
                  ? 'bg-[#2B231D] text-white shadow-xs font-medium'
                  : 'text-[#6E6152] hover:text-[#2B231D]'
              }`}
            >
              <PenTool size={13} />
              <span>Meja Tulis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSoftClick();
                setEditorTab('preview');
              }}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                editorTab === 'preview'
                  ? 'bg-[#2B231D] text-white shadow-xs font-medium'
                  : 'text-[#6E6152] hover:text-[#2B231D]'
              }`}
            >
              <Eye size={13} />
              <span>Pratinjau Surat</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INSTANT LIVE PREVIEW */}
        {editorTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="bg-[#FAF6EE] border border-[#E3D6C1] rounded-2xl p-3 mb-4 text-center">
              <span className="font-handwriting text-lg text-[#857262]">
                Ini adalah tampilan persis yang akan dilihat penerima saat lembar surat terbuka.
              </span>
            </div>
            <LetterReader capsule={buildCurrentCapsule()} />
          </motion.div>
        )}

        {/* TAB 2: WRITING DESK EDITOR */}
        {editorTab === 'write' && (
          <div className={`relative rounded-2xl p-6 sm:p-10 ${currentThemeConfig.paperClass} border ${currentThemeConfig.cardBorder} shadow-[0_20px_50px_-15px_rgba(40,30,20,0.08),0_2px_4px_rgba(0,0,0,0.02)] transition-colors duration-300 overflow-hidden`}>
            {/* Live Floral Garland Margin Preview */}
            {selectedGarland !== 'none' && chosenGarlandConfig?.image && (
              <>
                {chosenGarlandConfig.type === 'corners' ? (
                  <>
                    <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 pointer-events-none opacity-85 z-5 select-none overflow-hidden rounded-tl-2xl">
                      <img
                        src={chosenGarlandConfig.image}
                        alt="Garland Corner"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 pointer-events-none opacity-85 z-5 select-none overflow-hidden rounded-br-2xl rotate-180">
                      <img
                        src={chosenGarlandConfig.image}
                        alt="Garland Corner"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {(garlandPosition === 'right' || garlandPosition === 'both') && (
                      <div className="absolute top-0 right-0 bottom-0 w-24 sm:w-36 pointer-events-none opacity-85 mix-blend-multiply z-5 select-none overflow-hidden rounded-r-2xl">
                        <img
                          src={chosenGarlandConfig.image}
                          alt="Garland"
                          className="w-full h-full object-cover object-right"
                        />
                      </div>
                    )}
                    {(garlandPosition === 'left' || garlandPosition === 'both') && (
                      <div className="absolute top-0 left-0 bottom-0 w-24 sm:w-36 pointer-events-none opacity-85 mix-blend-multiply z-5 select-none overflow-hidden rounded-l-2xl">
                        <img
                          src={chosenGarlandConfig.image}
                          alt="Garland"
                          className="w-full h-full object-cover object-left"
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Pinned Botanical Flower Sticker (Live Preview at Selected Position and Size) */}
            {selectedFlower !== 'none' && chosenFlowerConfig && (
              <div className={`absolute ${flowerPosConfig.className} z-20 pointer-events-none select-none`}>
                <div
                  className="washi-tape-jagged absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 opacity-80 z-25 shadow-xs"
                  style={{ backgroundColor: currentThemeConfig.washiDefault }}
                />
                <img
                  src={chosenFlowerConfig.image}
                  alt="Sticker"
                  className={`${getFlowerSizeClass(flowerSize)} object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]`}
                  style={{ transform: `rotate(${flowerPosConfig.rotation}deg)` }}
                />
              </div>
            )}

            {/* Top Washi Tape Decoration */}
            <div
              className="washi-tape-jagged absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6.5 pointer-events-none opacity-85 shadow-xs z-15"
              style={{ backgroundColor: currentThemeConfig.washiDefault }}
            />

            {/* Metadata Row: Date & Atmosphere */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6 border-b border-[#ECE2D2] mb-6 relative z-10">
              <div>
                <label className="flex items-center gap-1 font-serif text-xs text-[#7D7060] mb-1">
                  <Calendar size={12} /> <span>Waktu & Tanggal Surat</span>
                </label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="15 Oktober 2026 • 23:15"
                  className="w-full bg-[#F5EDE1]/60 border border-[#E3D6C3] rounded-lg px-3 py-1.5 text-xs font-handwriting text-[#383027] focus:outline-hidden focus:border-[#964332] transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 font-serif text-xs text-[#7D7060] mb-1">
                  <MapPin size={12} /> <span>Suasana / Lokasi Saat Menulis</span>
                </label>
                <input
                  type="text"
                  value={locationWeather}
                  onChange={(e) => setLocationWeather(e.target.value)}
                  placeholder="Di antara rintik gerimis & aroma kopi"
                  className="w-full bg-[#F5EDE1]/60 border border-[#E3D6C3] rounded-lg px-3 py-1.5 text-xs font-handwriting text-[#383027] focus:outline-hidden focus:border-[#964332] transition-colors"
                />
              </div>
            </div>

            {/* Letter Addressee & Author Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
              <div>
                <label className="block font-serif text-xs text-[#7D7060] mb-1">
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
                <label className="block font-serif text-xs text-[#7D7060] mb-1">
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

            {/* Title Input */}
            <div className="mb-6 relative z-10">
              <label className="block font-serif text-xs text-[#7D7060] mb-1">
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
            <div className="mb-6 relative z-10">
              <label className="block font-serif text-xs text-[#7D7060] mb-1">
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

            {/* Customizable Sign-off Prefix */}
            <div className="mb-8 p-3.5 rounded-xl bg-[#FAF6EE] border border-[#EADFCB] relative z-10">
              <label className="block font-serif text-xs text-[#7D7060] mb-1.5">
                Kalimat Penutup / Tanda Tangan
              </label>
              <input
                type="text"
                value={signOffPrefix}
                onChange={(e) => setSignOffPrefix(e.target.value)}
                placeholder="Ditulis dengan hangat oleh,"
                className="w-full bg-white border border-[#E2D5C2] rounded-lg px-3 py-1.5 text-xs font-handwriting text-[#382F26] focus:outline-hidden focus:border-[#964332]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {signOffPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      sounds.playSoftClick();
                      setSignOffPrefix(preset);
                    }}
                    className={`text-[11px] font-handwriting px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      signOffPrefix === preset
                        ? 'bg-[#964332] text-white border-[#964332]'
                        : 'bg-white text-[#6E6050] border-[#DFCDBA] hover:bg-[#FAF4EA]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Polaroid Photos Upload Section */}
            <div className="mb-8 pt-6 border-t border-[#ECE2D2] relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-[#964332]" />
                  <h3 className="font-serif text-sm font-medium text-[#2B231D]">
                    Potret Kenangan Polaroid
                  </h3>
                  <span className="font-handwriting text-xs text-[#8A7969]">
                    (Maksimal 4 Foto)
                  </span>
                </div>

                {photos.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EB] border border-[#DFCDBA] text-xs font-serif text-[#6B5E4E] hover:bg-white transition-all cursor-pointer"
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-[#964332]" />
                        <span>Mengompres Foto...</span>
                      </>
                    ) : (
                      <>
                        <span>+ Tambah Foto</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

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
                  className="border-2 border-dashed border-[#E0D5C3] rounded-xl p-7 text-center cursor-pointer hover:border-[#BA6E52] transition-colors bg-[#FAF5EB]/50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F0E6D5] text-[#8C7D6D] flex items-center justify-center mx-auto mb-2">
                    <Camera size={18} />
                  </div>
                  <p className="font-serif text-xs text-[#6E6152]">
                    Belum ada foto yang disematkan
                  </p>
                  <p className="font-handwriting text-xs text-[#A39686] mt-0.5">
                    Klik di sini untuk upload foto kenanganmu (JPG, PNG, WebP)
                  </p>
                </div>
              )}
            </div>

            {/* Voice Note Recorder Section */}
            <div className="mb-10 pt-6 border-t border-[#ECE2D2] relative z-10">
              <VoiceNoteRecorder
                value={voiceNote}
                onChange={setVoiceNote}
                maxDurationSeconds={60}
              />
            </div>

            {/* Aesthetic Customization Sections */}
            <div className="pt-6 border-t border-[#ECE2D2] space-y-6 relative z-10">
              {/* 1. Theme Picker (10 Diverse Nuances) */}
              <div>
                <label className="block font-serif text-xs text-[#7D7060] mb-2">
                  Pilih Nuansa & Warna Kertas (10 Pilihan Estetik)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#26201B] bg-white ring-1 ring-[#26201B] shadow-xs'
                            : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/10 shrink-0 mb-1"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <span className="font-serif text-[11px] text-[#332A22] truncate w-full">
                          {t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Wax Seal Picker (Real Botanical Assets & Classical, No Emojis) */}
              <div>
                <label className="block font-serif text-xs text-[#7D7060] mb-2">
                  Pilih Ikon Segel Lilin (Wax Seal)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      {
                        id: 'lily',
                        label: 'Lily Pink',
                        icon: <img src="/botanical/pink-lily.png" alt="Lily" className="w-5 h-5 object-contain" />,
                      },
                      {
                        id: 'sunflower',
                        label: 'Bunga Matahari',
                        icon: <img src="/botanical/sunflower.png" alt="Sunflower" className="w-5 h-5 object-contain" />,
                      },
                      {
                        id: 'rose',
                        label: 'Mawar Liar',
                        icon: <img src="/botanical/pink-rose.png" alt="Rose" className="w-5 h-5 object-contain" />,
                      },
                      {
                        id: 'hydrangea',
                        label: 'Hydrangea',
                        icon: <img src="/botanical/flower-blue-hydrangea.png" alt="Hydrangea" className="w-5 h-5 object-contain" />,
                      },
                      {
                        id: 'peony',
                        label: 'Buket Peony',
                        icon: <img src="/botanical/bouquet-peony.png" alt="Peony" className="w-5 h-5 object-contain" />,
                      },
                      {
                        id: 'gerbera',
                        label: 'Gerbera',
                        icon: <img src="/botanical/flower-gerbera.png" alt="Gerbera" className="w-5 h-5 object-contain" />,
                      },
                      { id: 'heart', label: 'Hati', icon: <Heart size={14} className="text-[#964332]" /> },
                      { id: 'star', label: 'Bintang', icon: <Star size={14} className="text-[#BA6E52]" /> },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sounds.playSoftClick();
                        setSelectedSeal(item.id);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-serif transition-all cursor-pointer ${
                        selectedSeal === item.id
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

              {/* 3. Botanical Flower Sticker & Custom Position + Size Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-serif text-xs text-[#7D7060]">
                    Hiasan Stiker Bunga & Posisinya
                  </label>
                  <span className="font-handwriting text-xs text-[#8C7A6B]">
                    Bebas pilih letak & ukuran di lembar surat
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSoftClick();
                      setSelectedFlower('none');
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedFlower === 'none'
                        ? 'border-[#26201B] bg-white ring-1 ring-[#26201B] shadow-xs'
                        : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EFE7DC] flex items-center justify-center shrink-0">
                      <X size={14} className="text-[#8C7D6D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-xs text-[#332A22] font-medium truncate">
                        Tanpa Bunga
                      </p>
                      <p className="font-handwriting text-[11px] text-[#9E9080] truncate">Kertas polos</p>
                    </div>
                  </button>

                  {BOTANICAL_FLOWERS.map((f) => {
                    const isSelected = selectedFlower === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          sounds.playSoftClick();
                          setSelectedFlower(f.id);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all group cursor-pointer ${
                          isSelected
                            ? 'border-[#964332] bg-white ring-1 ring-[#964332] shadow-xs'
                            : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                      >
                        <img
                          src={f.image}
                          alt={f.name}
                          className="w-8 h-8 object-contain shrink-0 group-hover:scale-110 transition-transform drop-shadow-xs"
                        />
                        <div className="min-w-0">
                          <p className="font-serif text-xs text-[#332A22] font-medium truncate">
                            {f.name}
                          </p>
                          <p className="font-handwriting text-[11px] text-[#9E9080] truncate">{f.tag}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Flower Size & Position Selectors */}
                {selectedFlower !== 'none' && (
                  <div className="space-y-2.5">
                    {/* Size Selector */}
                    <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]">
                      <span className="block font-serif text-[11px] text-[#7D7060] mb-1.5">
                        Pilih Ukuran Bunga:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {FLOWER_SIZES.map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => {
                              sounds.playSoftClick();
                              setFlowerSize(sz.id);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                              flowerSize === sz.id
                                ? 'bg-[#964332] text-white shadow-xs'
                                : 'bg-white text-[#6E6152] border border-[#DFCDBA] hover:bg-[#FAF5EC]'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Position Selector */}
                    <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]">
                      <span className="block font-serif text-[11px] text-[#7D7060] mb-1.5">
                        Pilih Posisi Penempelan Stiker Bunga:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {FLOWER_POSITIONS.map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => {
                              sounds.playSoftClick();
                              setFlowerPosition(pos.id);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                              flowerPosition === pos.id
                                ? 'bg-[#964332] text-white shadow-xs'
                                : 'bg-white text-[#6E6152] border border-[#DFCDBA] hover:bg-[#FAF5EC]'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Floral Garland Border & Position Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-serif text-xs text-[#7D7060]">
                    Bingkai Garlands Bunga Kertas & Sisi Tampilan
                  </label>
                  <span className="font-handwriting text-xs text-[#8C7A6B]">
                    Untaian bunga di tepi kertas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {GARLAND_BORDERS.map((g) => {
                    const isSelected = selectedGarland === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          sounds.playSoftClick();
                          setSelectedGarland(g.id);
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#964332] bg-white ring-1 ring-[#964332] shadow-xs'
                            : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                      >
                        {g.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#E5DACB] bg-[#FAF6EE]">
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-full h-full object-cover object-left mix-blend-multiply"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#EFE8DD] flex items-center justify-center text-xs shrink-0 text-[#8C7D6D]">
                            <Layers size={16} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-xs text-[#332A22] font-medium truncate">
                            {g.name}
                          </p>
                          <p className="font-handwriting text-[11px] text-[#9E9080] line-clamp-1">
                            {g.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Garland Position Selector */}
                {selectedGarland !== 'none' && (
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]">
                    <span className="block font-serif text-[11px] text-[#7D7060] mb-1.5">
                      Letakkan Bingkai Pada:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {GARLAND_POSITIONS.map((gp) => (
                        <button
                          key={gp.id}
                          type="button"
                          onClick={() => {
                            sounds.playSoftClick();
                            setGarlandPosition(gp.id);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                            garlandPosition === gp.id
                              ? 'bg-[#964332] text-white shadow-xs'
                              : 'bg-white text-[#6E6152] border border-[#DFCDBA] hover:bg-[#FAF5EC]'
                          }`}
                        >
                          {gp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Envelope Style Selector (No emojis) */}
              <div>
                <label className="block font-serif text-xs text-[#7D7060] mb-2">
                  Variasi Pilihan Desain Amplop
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ENVELOPE_STYLES.map((env) => {
                    const isSelected = envelopeStyle === env.id;
                    return (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => {
                          sounds.playSoftClick();
                          setEnvelopeStyle(env.id);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#26201B] bg-white ring-1 ring-[#26201B] shadow-xs'
                            : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {env.id === 'classic-triangle' && <Mail size={18} className="text-[#964332]" />}
                          {env.id === 'square-baroque' && <HeartHandshake size={18} className="text-[#BA6E52]" />}
                          {env.id === 'botanical-lining' && <Feather size={18} className="text-[#4E7643]" />}
                          {env.id === 'vintage-airmail' && <Send size={18} className="text-[#8C7A6B]" />}
                        </div>
                        <p className="font-serif text-xs text-[#2B231D] font-medium truncate">
                          {env.name}
                        </p>
                        <p className="font-handwriting text-[11px] text-[#8C7D6D] truncate mt-0.5">
                          {env.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Opening Animation Variants Selector (No emojis) */}
              <div>
                <label className="block font-serif text-xs text-[#7D7060] mb-2">
                  Variasi Pilihan Animasi Buka Amplop
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {OPEN_ANIMATIONS.map((anim) => {
                    const isSelected = openAnimation === anim.id;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => {
                          sounds.playSoftClick();
                          setOpenAnimation(anim.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#964332] bg-white ring-1 ring-[#964332] shadow-xs'
                            : 'border-[#E5DACB] bg-[#F7F2E8] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {anim.id === 'blossom-burst' && <Sparkles size={16} className="text-[#BA6E52]" />}
                          {anim.id === 'silky-glide' && <Wind size={16} className="text-[#7A6E62]" />}
                          {anim.id === 'wax-crack' && <Flame size={16} className="text-[#964332]" />}
                          <p className="font-serif text-xs text-[#2B231D] font-medium">
                            {anim.name}
                          </p>
                        </div>
                        <p className="font-handwriting text-[11px] text-[#8C7D6D] mt-1">
                          {anim.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: Preview & Kirim Surat */}
            <div className="mt-10 pt-6 border-t border-[#ECE2D2] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#D5C7B3] text-xs font-serif italic text-[#4A3F33] hover:bg-white transition-all shadow-xs cursor-pointer"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full bg-[#2B231D] text-[#FAF8F5] text-xs font-serif italic shadow-lg hover:bg-[#3E342B] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#EADFA8]" />
                    <span>Menyiapkan Surat...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Kirim Surat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Saved Local Vault Section */}
        {savedVault.length > 0 && (
          <section id="vault" className="mt-16 pt-10 border-t border-[#E8DFC9] relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-[#2B231D] tracking-tight flex items-center gap-2">
                <BookOpen size={18} className="text-[#964332]" />
                <span>Koleksi Surat Pribadimu</span>
              </h2>
              <span className="font-handwriting text-sm text-[#8C7D6D]">
                Tersimpan di perangkat ini ({savedVault.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedVault.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/75 backdrop-blur-xs rounded-xl border border-[#E5DACB] p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all"
                >
                  <div>
                    <span className="font-handwriting text-xs text-[#9E9080]">
                      {item.dateStr}
                    </span>
                    <h3 className="font-serif text-lg text-[#2B2520] font-normal truncate mt-0.5">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-[#7D7061] mt-1 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EFE8DC] flex items-center justify-between">
                    <span className="font-handwriting text-sm text-[#8C7E70]">
                      Untuk: {item.recipient}
                    </span>
                    <a
                      href={`/open#data=${encodeCapsule(item)}`}
                      className="inline-flex items-center gap-1 font-serif italic text-xs text-[#964332] hover:underline"
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

      {/* Footer & Creator Attribution */}
      <footer className="mt-20 py-8 border-t border-[#E8DFC9] text-center relative z-10">
        <p className="font-serif italic text-xs text-[#7A6E62]">
          Made by <span className="font-medium text-[#2B231D]">Yizreel Schwartz Sipahutar</span>
        </p>
        <p className="font-handwriting text-base text-[#968878] mt-1">
          Abadikan kata-kata hangat yang tak lekang oleh waktu.
        </p>
      </footer>
    </div>
  );
}
