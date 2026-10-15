'use client';

import React, { useState } from 'react';
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
import { sounds } from '@/lib/audio';

interface LetterReaderProps {
  capsule: CapsuleData;
  onBackToEnvelope?: () => void;
  onShare?: () => void;
}

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

  const toggleAmbient = () => {
    const newState = sounds.toggleAmbientSound(capsule.musicMood || 'lofi-rain');
    setIsAmbientOn(newState);
  };

  const handleReaction = (
    type: 'hugs' | 'smiles' | 'flowers' | 'coffee',
    icon: string,
    index: number
  ) => {
    sounds.playReactionChime(index);
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    // Add floating particle
    const newId = Date.now() + Math.random();
    const randomX = Math.random() * 80 - 40;
    setFloatingParticles((prev) => [...prev, { id: newId, icon, x: randomX }]);

    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${theme.bgClass} py-8 px-4 sm:px-6 relative selection:bg-[#E2D4C0]`}>
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
              title="Suasana Hujan & Ambient Lofi"
            >
              {isAmbientOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{isAmbientOn ? 'Suasana Hidup' : 'Nyalakan Suasana'}</span>
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
        className="max-w-2xl mx-auto relative"
      >
        {/* The Paper Sheet */}
        <article
          className={`relative rounded-xs p-7 sm:p-12 ${theme.paperClass} border ${theme.cardBorder} shadow-[0_20px_60px_-15px_rgba(40,30,20,0.1),0_2px_6px_rgba(0,0,0,0.03)]`}
        >
          {/* Top Washi Tape accent */}
          <div
            className="washi-tape-jagged absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-7 pointer-events-none opacity-80"
            style={{ backgroundColor: theme.washiDefault }}
          />

          {/* Letter Meta / Date Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ECE3D5] pb-5 mb-8 gap-2">
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-[#96897B]">
                MEMOIR & LETTER
              </p>
              <p className="text-xs font-mono text-[#7D7266] mt-0.5">
                {capsule.dateStr || 'Suatu hari yang tenang'}
              </p>
            </div>
            {capsule.locationWeather && (
              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[10px] font-mono text-[#8C7F72]">
                  📍 {capsule.locationWeather}
                </span>
              </div>
            )}
          </div>

          {/* Recipient salutation */}
          <div className="mb-6">
            <span className="font-handwriting text-2xl text-[#8C7A6B]">
              Kepada yang terkasih,
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2520] font-normal tracking-tight mt-1">
              {capsule.recipient || 'Untukmu'}
            </h2>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-5xl text-[#26201B] font-normal tracking-tight leading-[1.15] mb-8">
            {capsule.title}
          </h1>

          {/* Letter Body Text */}
          <div className="space-y-5 text-[#332C26] text-base sm:text-lg leading-relaxed font-sans font-normal whitespace-pre-line border-l-2 border-[#E8DEC8] pl-5 my-8">
            {capsule.message}
          </div>

          {/* Photos Section (if any attached) */}
          {capsule.photos && capsule.photos.length > 0 && (
            <div className="my-12 pt-6 border-t border-[#ECE3D5]">
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

          {/* Letter Sign-off */}
          <div className="mt-12 pt-6 border-t border-[#ECE3D5] flex flex-col items-end">
            <span className="text-xs font-mono text-[#96897B] uppercase tracking-wider">
              Tertulis dengan hangat oleh,
            </span>
            <p className="font-handwriting text-3xl sm:text-4xl text-[#26201B] mt-1">
              {capsule.author || 'Seseorang'}
            </p>
          </div>
        </article>

        {/* Floating Reactions Bar */}
        <section className="mt-10 mb-6 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E8DFC9] p-4 shadow-sm relative">
          <div className="text-center mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#7D7061]">
              Kirimkan Sentuhan Rasa untuk Pengirim
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative">
            {/* Hugs Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('hugs', '🤍', 0)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95"
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
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95"
            >
              <Smile size={14} className="text-[#D4AF37]" />
              <span>Senyuman</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.smiles}
              </span>
            </button>

            {/* Flowers Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('flowers', '🌸', 2)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95"
            >
              <Flower2 size={14} className="text-[#B85D6B]" />
              <span>Kelopak</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.flowers}
              </span>
            </button>

            {/* Coffee Reaction */}
            <button
              type="button"
              onClick={() => handleReaction('coffee', '☕', 3)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EBDC] border border-[#E8DFC9] transition-all text-xs font-mono text-[#382F26] active:scale-95"
            >
              <Coffee size={14} className="text-[#7D5D3B]" />
              <span>Secangkir</span>
              <span className="font-semibold text-[11px] text-[#8A7969] ml-auto">
                {reactions.coffee}
              </span>
            </button>
          </div>

          {/* Floating animated particles */}
          <AnimatePresence>
            {floatingParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: 0, scale: 0.8, x: p.x }}
                animate={{ opacity: 0, y: -70, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-12 pointer-events-none text-2xl select-none"
              >
                {p.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Viral CTA: Make your own capsule */}
        <div className="text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#26201B] text-[#FAF8F5] text-xs font-mono uppercase tracking-wider shadow-md hover:bg-[#3D352E] hover:scale-105 active:scale-95 transition-all"
          >
            <PenLine size={13} />
            <span>Tulis Surat Balasan / Buat Kapsulmu</span>
          </Link>
          <p className="text-[11px] text-[#918578] font-mono mt-2">
            Gratis • Tanpa Perlu Daftar Akun • Tersimpan Abadi
          </p>
        </div>
      </motion.main>
    </div>
  );
}
