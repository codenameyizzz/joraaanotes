'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Volume2,
  VolumeX,
  ArrowLeft,
  PenLine,
  Heart,
  Smile,
  Coffee,
  Sparkles,
  Flower2,
} from 'lucide-react';
import Link from 'next/link';
import { CapsuleData, THEMES } from '@/lib/types';
import PolaroidCard from './PolaroidCard';
import VoiceNotePlayer from './VoiceNotePlayer';
import { sounds } from '@/lib/audio';
import { getBotanicalFlower, getGarlandBorder } from '@/lib/botanical';

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
  const [reactions, setReactions] = useState({
    hugs: capsule.reactions?.hugs || 0,
    smiles: capsule.reactions?.smiles || 0,
    flowers: capsule.reactions?.flowers || 0,
    coffee: capsule.reactions?.coffee || 0,
  });

  const [floatingParticles, setFloatingParticles] = useState<
    Array<{ id: number; icon: string; x: number }>
  >([]);

  const [fallingPetals, setFallingPetals] = useState<
    Array<{ id: number; img: string; left: number; size: number; rotate: number; delay: number }>
  >([]);

  const [isStickerWiggling, setIsStickerWiggling] = useState(false);

  const chosenFlower = getBotanicalFlower(capsule.flowerDecoration);
  const chosenGarland = getGarlandBorder(capsule.garlandBorder);

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
    const newPetals = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      img: petalShowerIcons[i % petalShowerIcons.length],
      left: Math.random() * 90 + 5, // 5% to 95%
      size: Math.floor(Math.random() * 26) + 30, // 30px to 56px
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

  const handleReaction = (
    type: 'hugs' | 'smiles' | 'flowers' | 'coffee',
    icon: string,
    index: number
  ) => {
    sounds.playReactionChime(index);
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    // If flower reaction clicked, trigger full botanical petal shower!
    if (type === 'flowers') {
      triggerFlowerShower();
    }

    // Add floating particle above button
    const newId = Date.now() + Math.random();
    const randomX = Math.random() * 80 - 40;
    setFloatingParticles((prev) => [...prev, { id: newId, icon, x: randomX }]);

    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1500);
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-[#E5DACB] text-xs font-mono text-[#6E6356] hover:bg-white transition-all shadow-xs"
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all shadow-xs ${
                isAmbientOn
                  ? 'bg-[#2B2520] text-white border-[#2B2520]'
                  : 'bg-white/70 text-[#6E6356] border-[#E5DACB] hover:bg-white'
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-[#E5DACB] text-xs font-mono text-[#6E6356] hover:bg-white transition-all shadow-xs"
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
        {/* The Paper Sheet */}
        <article
          className={`relative rounded-xs p-7 sm:p-12 ${theme.paperClass} border ${theme.cardBorder} shadow-[0_20px_60px_-15px_rgba(40,30,20,0.1),0_2px_6px_rgba(0,0,0,0.03)] overflow-hidden`}
        >
          {/* Decorative Floral Garland Margin / Border (if chosen) */}
          {chosenGarland && chosenGarland.image && (
            <div className="absolute top-0 right-0 bottom-0 w-20 sm:w-28 pointer-events-none opacity-40 mix-blend-multiply z-5 select-none overflow-hidden">
              <img
                src={chosenGarland.image}
                alt={chosenGarland.name}
                className="w-full h-full object-cover object-left"
              />
            </div>
          )}

          {/* Top Washi Tape accent */}
          <div
            className="washi-tape-jagged absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-7 pointer-events-none opacity-80 z-15"
            style={{ backgroundColor: theme.washiDefault }}
          />

          {/* Botanical Flower Sticker / Stamp pinned to top right */}
          {chosenFlower && (
            <motion.div
              onClick={handleStickerClick}
              animate={
                isStickerWiggling
                  ? { rotate: [-10, 15, -12, 10, 0], scale: [1, 1.15, 1] }
                  : { rotate: 8, scale: 1 }
              }
              whileHover={{ scale: 1.1, rotate: 12 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 cursor-pointer group select-none"
              title={`Ketuk stiker ${chosenFlower.name} untuk menyebarkan kelopak bunga!`}
            >
              {/* Washi tape pin over stem */}
              <div
                className="washi-tape-jagged absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 opacity-80 z-25 shadow-xs"
                style={{ backgroundColor: theme.washiDefault }}
              />
              <img
                src={chosenFlower.image}
                alt={chosenFlower.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
              />
              <span className="sr-only">Hiasan {chosenFlower.name}</span>
            </motion.div>
          )}

          {/* Letter Meta / Date Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ECE3D5] pb-5 mb-8 gap-2 relative z-10">
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-[#96897B] flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#BA6E52]" />
                <span>MEMOIR & LETTER</span>
              </p>
              <p className="text-xs font-mono text-[#7D7266] mt-0.5">
                {capsule.dateStr || 'Suatu hari yang tenang'}
              </p>
            </div>
            {capsule.locationWeather && (
              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[10px] font-mono text-[#8C7F72]">
                  {capsule.locationWeather}
                </span>
              </div>
            )}
          </div>

          {/* Recipient salutation */}
          <div className="mb-6 relative z-10">
            <span className="font-handwriting text-2xl text-[#8C7A6B]">
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

          {/* Voice Note Section (if attached) */}
          {capsule.voiceNote && (
            <div className="relative z-15">
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
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#8A7D70] uppercase">
                  <Sparkles size={12} className="text-[#BA6E52]" />
                  <span>Potret Kenangan ({capsule.photos.length})</span>
                </span>
                <p className="text-xs text-[#9E9285] font-sans mt-0.5">
                  Ketuk foto untuk membalik & membaca coretan rahasia
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

          {/* Letter Sign-off with Botanical Blossom Accent */}
          <div className="mt-12 pt-6 border-t border-[#ECE3D5] flex items-center justify-between relative z-10">
            {chosenFlower ? (
              <div className="flex items-center gap-2">
                <img
                  src={chosenFlower.image}
                  alt={chosenFlower.name}
                  className="w-10 h-10 object-contain drop-shadow-xs opacity-85"
                />
                <span className="text-[11px] font-mono text-[#8C7E70] italic">
                  &ldquo;{chosenFlower.meaning}&rdquo;
                </span>
              </div>
            ) : (
              <div />
            )}

            <div className="flex flex-col items-end">
              <span className="text-xs font-mono text-[#96897B] uppercase tracking-wider">
                Tertulis dengan hangat oleh,
              </span>
              <p className="font-handwriting text-3xl sm:text-4xl text-[#26201B] mt-1">
                {capsule.author || 'Seseorang'}
              </p>
            </div>
          </div>
        </article>

        {/* Floating Reactions Bar with Botanical Petal Shower */}
        <section className="mt-10 mb-6 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E8DFC9] p-4 shadow-sm relative z-20">
          <div className="text-center mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#7D7061] flex items-center justify-center gap-1.5">
              <span>Send Reactions</span>
              <span className="text-[10px] text-[#A6998A] font-normal lowercase">
                (ketuk bunga untuk hujan kelopak)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative">
            {/* Hugs Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('hugs', '🤍', 0)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95 cursor-pointer"
            >
              <Heart size={14} className="text-[#C2765A]" />
              <span>Pelukan</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.hugs}
              </span>
            </button>

            {/* Smiles Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('smiles', '✨', 1)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95 cursor-pointer"
            >
              <Smile size={14} className="text-[#D4AF37]" />
              <span>Senyuman</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.smiles}
              </span>
            </button>

            {/* Flowers Reaction (Triggers Botanical Petal Rain) */}
            <button
              type="button"
              onClick={() => handleReaction('flowers', '🌸', 2)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FBF0EE] hover:bg-[#F5E4E1] border border-[#F0D0CA] transition-all text-xs font-mono text-[#964332] active:scale-95 cursor-pointer group"
            >
              <Flower2 size={14} className="text-[#B85D6B] group-hover:rotate-45 transition-transform" />
              <span className="font-medium">Hujan Bunga</span>
              <span className="font-semibold text-[11px] text-[#964332] ml-auto">
                {reactions.flowers}
              </span>
            </button>

            {/* Coffee Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('coffee', '☕', 3)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95 cursor-pointer"
            >
              <Coffee size={14} className="text-[#7A5A43]" />
              <span>Secangkir Kopi</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.coffee}
              </span>
            </button>
          </div>

          {/* Floating Reaction Emojis Animation */}
          <AnimatePresence>
            {floatingParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -70, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute pointer-events-none text-2xl select-none"
                style={{
                  left: `calc(50% + ${p.x}px)`,
                  top: '10px',
                }}
              >
                {p.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Footer: Create Your Own Letter Callout */}
        <div className="text-center py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2B231D] text-[#FAF6EE] text-xs font-mono uppercase tracking-wider hover:bg-[#3D322A] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <PenLine size={13} />
            <span>Tulis Surat Balasan untuknya</span>
          </Link>
          <p className="text-[11px] font-sans text-[#968A7D] mt-2 italic">
            Abadikan kata-kata hangat yang tak lekang oleh waktu.
          </p>
        </div>
      </motion.main>
    </div>
  );
}
