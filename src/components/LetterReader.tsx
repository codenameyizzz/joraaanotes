'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Volume2,
  VolumeX,
  ArrowLeft,
  PenLine,
  Download,
  Sparkles,
  Check,
  Loader2,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { CapsuleData, THEMES } from '@/lib/types';
import PolaroidCard from './PolaroidCard';
import VoiceNotePlayer from './VoiceNotePlayer';
import { sounds } from '@/lib/audio';
import {
  getBotanicalFlower,
  getGarlandBorder,
  getFlowerPositionConfig,
  getFlowerSizeClass,
  getGarlandImageClass,
} from '@/lib/botanical';

interface LetterReaderProps {
  capsule: CapsuleData;
  onBackToEnvelope?: () => void;
  onShare?: () => void;
}

const petalShowerIcons = [
  '/botanical/pink-lily.png',
  '/botanical/pink-rose.png',
  '/botanical/sunflower.png',
  '/botanical/flower-blue-hydrangea.png',
  '/botanical/flower-gerbera.png',
  '/botanical/flower-anemone.png',
];

export default function LetterReader({
  capsule,
  onBackToEnvelope,
  onShare,
}: LetterReaderProps) {
  const theme = THEMES[capsule.theme] || THEMES['warm-paper'];
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [fallingPetals, setFallingPetals] = useState<
    Array<{ id: number; img: string; left: number; size: number; rotate: number; delay: number }>
  >([]);

  const [isStickerWiggling, setIsStickerWiggling] = useState(false);

  const letterPaperRef = useRef<HTMLElement>(null);

  const chosenFlower = getBotanicalFlower(capsule.flowerDecoration);
  const chosenGarland = getGarlandBorder(capsule.garlandBorder);
  const flowerPos = getFlowerPositionConfig(capsule.flowerPosition);
  const garlandPos = capsule.garlandPosition || 'right';
  const garlandOffset = capsule.garlandOffset ?? 0;
  const garlandFlipH = capsule.garlandFlipH ?? false;
  const garlandFlipV = capsule.garlandFlipV ?? false;

  useEffect(() => {
    // Start Clair de Lune softly when letter opens
    if (capsule.musicMood !== 'none') {
      const playing = sounds.playClairDeLune();
      setIsAmbientOn(playing);
    }
    return () => {
      sounds.stopClairDeLune();
    };
  }, [capsule.musicMood]);

  const toggleAmbient = () => {
    const newState = sounds.toggleClairDeLune();
    setIsAmbientOn(newState);
  };

  const triggerFlowerShower = () => {
    sounds.playReactionChime(2);
    const newPetals = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      img: petalShowerIcons[i % petalShowerIcons.length],
      left: Math.random() * 90 + 5,
      size: Math.floor(Math.random() * 26) + 32,
      rotate: Math.random() * 360,
      delay: Math.random() * 0.4,
    }));

    setFallingPetals((prev) => [...prev, ...newPetals]);

    setTimeout(() => {
      setFallingPetals((prev) =>
        prev.filter((p) => !newPetals.some((np) => np.id === p.id))
      );
    }, 3200);
  };

  const handleStickerClick = () => {
    setIsStickerWiggling(true);
    triggerFlowerShower();
    setTimeout(() => setIsStickerWiggling(false), 800);
  };

  // Save Letter as Image Keepsake
  const handleSaveAsImage = async () => {
    if (!letterPaperRef.current || isSavingImage) return;

    sounds.playSoftClick();
    setIsSavingImage(true);
    setSaveSuccess(false);

    try {
      // Small pause to allow layout stability
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await toPng(letterPaperRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High resolution for crisp print/keepsake
        cacheBust: true,
        filter: (domNode) => {
          if (
            domNode instanceof HTMLElement &&
            (domNode.dataset?.excludeFromImage === 'true' ||
              domNode.classList?.contains('exclude-from-image'))
          ) {
            return false;
          }
          return true;
        },
      });

      // Trigger download
      const link = document.createElement('a');
      const safeTitle = (capsule.title || 'sepucuk-surat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
      link.download = `surat-${safeTitle}.png`;
      link.href = dataUrl;
      link.click();

      sounds.playReactionChime(1);
      setSaveSuccess(true);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: [theme.accentColor, '#F5DEB3', '#BA6E52', '#EADFA8'],
      });

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to capture letter image:', err);
      alert('Gagal mengabadikan gambar. Anda juga dapat mengambil screenshot secara langsung.');
    } finally {
      setIsSavingImage(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 relative selection:bg-[#E2D4C0] overflow-x-hidden`}>
      {/* Falling Botanical Petal Shower Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {fallingPetals.map((petal) => (
          <motion.img
            key={petal.id}
            src={petal.img}
            alt="Falling Petal"
            initial={{ y: -60, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: '105vh',
              x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120],
              opacity: [0, 1, 1, 0],
              rotate: [0, petal.rotate, petal.rotate * 2],
            }}
            transition={{
              duration: 2.8,
              delay: petal.delay,
              ease: 'easeInOut',
            }}
            className="absolute drop-shadow-md select-none"
            style={{
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size,
              objectFit: 'contain',
            }}
          />
        ))}
      </div>

      {/* Top Floating Action Bar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8 z-20 relative">
        {onBackToEnvelope ? (
          <button
            type="button"
            onClick={onBackToEnvelope}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/75 border border-[#E5DACB] text-xs font-serif italic text-[#594E42] hover:bg-white transition-all shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>Tutup Amplop</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {capsule.musicMood !== 'none' && (
            <button
              type="button"
              onClick={toggleAmbient}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-serif transition-all shadow-xs ${isAmbientOn
                ? 'bg-[#2B2520] text-white border-[#2B2520]'
                : 'bg-white/75 text-[#5C5044] border-[#E5DACB] hover:bg-white'
                }`}
              title="Clair de Lune — Claude Debussy (30 Detik)"
            >
              {isAmbientOn ? (
                <>
                  <Volume2 size={13} className="text-[#EADFA8] animate-pulse" />
                  <span>Clair de Lune</span>
                </>
              ) : (
                <>
                  <VolumeX size={13} />
                  <span>Nyalakan Musik</span>
                </>
              )}
            </button>
          )}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/75 border border-[#E5DACB] text-xs font-serif text-[#5C5044] hover:bg-white transition-all shadow-xs"
            >
              <Share2 size={13} />
              <span>Bagi Tautan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Letter Content Area */}
      <motion.main
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto relative z-10"
      >
        {/* The Paper Sheet (Target for Screenshot Image Capture) */}
        <article
          ref={letterPaperRef}
          className={`relative rounded-xs p-7 sm:p-12 ${theme.paperClass} border ${theme.cardBorder} shadow-[0_20px_60px_-15px_rgba(40,30,20,0.1),0_2px_6px_rgba(0,0,0,0.03)] overflow-hidden`}
        >
          {/* Decorative Floral Garland Margin / Border (Soft watercolor-like subtle accent) */}
          {chosenGarland && chosenGarland.image && (
            <>
              {chosenGarland.type === 'corners' ? (
                <>
                  <div
                    className="absolute top-0 w-20 sm:w-28 h-20 sm:h-28 pointer-events-none opacity-40 mix-blend-multiply z-5 select-none overflow-hidden transition-all duration-200"
                    style={{ left: `${garlandOffset}px` }}
                  >
                    <img
                      src={chosenGarland.image}
                      alt={chosenGarland.name}
                      className={`w-full h-full object-contain ${garlandFlipH ? 'scale-x-[-1]' : ''} ${garlandFlipV ? 'scale-y-[-1]' : ''}`}
                    />
                  </div>
                  <div
                    className="absolute bottom-0 w-20 sm:w-28 h-20 sm:h-28 pointer-events-none opacity-40 mix-blend-multiply z-5 select-none overflow-hidden rotate-180 transition-all duration-200"
                    style={{ right: `${garlandOffset}px` }}
                  >
                    <img
                      src={chosenGarland.image}
                      alt={chosenGarland.name}
                      className={`w-full h-full object-contain ${garlandFlipH ? 'scale-x-[-1]' : ''} ${garlandFlipV ? 'scale-y-[-1]' : ''}`}
                    />
                  </div>
                </>
              ) : (
                <>
                  {(garlandPos === 'right' || garlandPos === 'both') && (
                    <div
                      className="absolute top-0 bottom-0 w-20 sm:w-28 pointer-events-none opacity-40 mix-blend-multiply z-5 select-none overflow-hidden transition-all duration-200"
                      style={{ right: `${garlandOffset}px` }}
                    >
                      <img
                        src={chosenGarland.image}
                        alt={chosenGarland.name}
                        className={`w-full h-full object-cover ${getGarlandImageClass(
                          chosenGarland.id,
                          'right',
                          garlandFlipH,
                          garlandFlipV
                        )}`}
                      />
                    </div>
                  )}
                  {(garlandPos === 'left' || garlandPos === 'both') && (
                    <div
                      className="absolute top-0 bottom-0 w-20 sm:w-28 pointer-events-none opacity-40 mix-blend-multiply z-5 select-none overflow-hidden transition-all duration-200"
                      style={{ left: `${garlandOffset}px` }}
                    >
                      <img
                        src={chosenGarland.image}
                        alt={chosenGarland.name}
                        className={`w-full h-full object-cover ${getGarlandImageClass(
                          chosenGarland.id,
                          'left',
                          garlandFlipH,
                          garlandFlipV
                        )}`}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Top Washi Tape accent */}
          <div
            className="washi-tape-jagged absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-7 pointer-events-none opacity-85 z-15"
            style={{ backgroundColor: theme.washiDefault }}
          />

          {/* Botanical Flower Sticker pinned to selected position */}
          {chosenFlower && (
            <motion.div
              onClick={handleStickerClick}
              animate={
                isStickerWiggling
                  ? { rotate: [-10, 15, -12, 10, 0], scale: [1, 1.18, 1] }
                  : { rotate: flowerPos.rotation, scale: 1 }
              }
              whileHover={{ scale: 1.1, rotate: flowerPos.rotation + 4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className={`absolute ${flowerPos.className} z-20 cursor-pointer group select-none`}
              title={`Bunga ${chosenFlower.name}`}
            >
              {/* Washi tape pin over stem */}
              <div
                className="washi-tape-jagged absolute -top-2 left-1/2 -translate-x-1/2 w-9 h-3.5 opacity-80 z-25 shadow-xs"
                style={{ backgroundColor: theme.washiDefault }}
              />
              <img
                src={chosenFlower.image}
                alt={chosenFlower.name}
                className={`${getFlowerSizeClass(capsule.flowerSize)} object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]`}
              />
            </motion.div>
          )}

          {/* Letter Meta / Date Stamp (Memoir text removed) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ECE3D5] pb-4 mb-8 gap-2 relative z-10">
            <div>
              <p className="font-handwriting text-lg text-[#8C7D6D]">
                {capsule.dateStr || 'Suatu hari yang tenang'}
              </p>
            </div>
            {capsule.locationWeather && (
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F4EFE6] font-handwriting text-sm text-[#7D6E60]">
                  {capsule.locationWeather}
                </span>
              </div>
            )}
          </div>

          {/* Recipient salutation */}
          <div className="mb-6 relative z-10">
            <span className="font-handwriting text-2xl sm:text-3xl text-[#8C7A6B]">
              Kepada yang terkasih,
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2520] font-normal tracking-tight mt-1">
              {capsule.recipient || 'Untukmu'}
            </h2>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-5xl text-[#26201B] font-normal tracking-tight leading-[1.15] mb-8 relative z-10">
            {capsule.title}
          </h1>

          {/* Letter Body Text */}
          <div className="space-y-5 text-[#332C26] text-base sm:text-lg leading-relaxed font-sans font-normal whitespace-pre-line border-l-2 border-[#E8DEC8] pl-5 my-8 relative z-10">
            {capsule.message}
          </div>

          {/* Voice Note Section (if attached) - Excluded from downloaded image keepsake */}
          {capsule.voiceNote && (
            <div
              className="relative z-15 exclude-from-image"
              data-exclude-from-image="true"
            >
              <VoiceNotePlayer
                voiceNote={capsule.voiceNote}
                authorName={capsule.author}
                themeColor={theme.accentColor}
              />
            </div>
          )}

          {/* Photos Section (if any attached) */}
          {capsule.photos && capsule.photos.length > 0 && (
            <div className="my-12 pt-6 border-t border-[#ECE3D5] relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 font-handwriting text-xl text-[#7D6F61]">
                  {/* <Sparkles size={14} className="text-[#BA6E52]" /> */}
                  <span>Images ({capsule.photos.length})</span>
                </span>
                <p className="font-serif italic text-xs text-[#9E9285] mt-0.5">
                  Tap to see the notes behind it!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 py-2">
                {capsule.photos.map((photo, idx) => (
                  <PolaroidCard
                    key={photo.id || idx}
                    photo={photo}
                    dateStr={capsule.dateStr}
                    interactive={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Letter Sign-off with Botanical Flower Stamp (Meaning wording removed, customizable flower) */}
          <div className="mt-12 pt-6 border-t border-[#ECE3D5] flex items-center justify-between relative z-10">
            {chosenFlower ? (
              <div className="flex items-center">
                <img
                  src={chosenFlower.image}
                  alt={chosenFlower.name}
                  className={`${getFlowerSizeClass(capsule.flowerSize)} object-contain drop-shadow-xs opacity-90`}
                />
              </div>
            ) : (
              <div />
            )}

            <div className="flex flex-col items-end">
              <span className="font-handwriting text-xl text-[#8A7969]">
                {capsule.signOffPrefix || 'Ditulis dengan hangat oleh,'}
              </span>
              <p className="font-handwriting text-3xl sm:text-4xl text-[#26201B] mt-0.5">
                {capsule.author || 'Seseorang'}
              </p>
            </div>
          </div>
        </article>

        {/* Save as Keepsake Image Feature */}
        <section className="mt-8 mb-6 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E8DFC9] p-5 shadow-sm text-center relative z-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="font-serif text-lg text-[#2B231D] font-normal flex items-center gap-2">
                <Camera size={16} className="text-[#964332]" />
                <span>Simpan Surat Ini sebagai Gambar Kenangan</span>
              </h3>
              <p className="font-handwriting text-base text-[#7A6D5E] mt-0.5">
                Unduh lembar surat ini beserta hiasan bunga & potretnya untuk disimpan di galeri ponselmu.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveAsImage}
              disabled={isSavingImage}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif italic transition-all shadow-sm active:scale-95 shrink-0 ${saveSuccess
                ? 'bg-[#EAF2E4] text-[#3B6631] border border-[#C5DDBB]'
                : 'bg-[#2B231D] text-white hover:bg-[#3D332A]'
                }`}
            >
              {isSavingImage ? (
                <>
                  <Loader2 size={14} className="animate-spin text-[#EADFA8]" />
                  <span>Mengabadikan Gambar...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>Tersimpan di Perangkatmu!</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Image (PNG)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Footer: Create Your Own Letter Callout (Shortened wording) */}
        <div className="text-center py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2B231D] text-[#FAF6EE] text-sm font-serif italic hover:bg-[#3D322A] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <PenLine size={14} />
            <span>Tulis Balasan</span>
          </Link>
        </div>

        {/* Creator Attribution */}
        <div className="text-center pb-8 pt-2">
          <p className="font-serif italic text-xs text-[#7A6E62]">
            Created by <span className="font-medium text-[#2B231D]">yizzzrl</span>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
