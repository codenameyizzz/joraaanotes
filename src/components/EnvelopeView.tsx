'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, MailOpen } from 'lucide-react';
import { CapsuleData, THEMES } from '@/lib/types';
import WaxSeal from './WaxSeal';
import { sounds } from '@/lib/audio';

interface EnvelopeViewProps {
  capsule: CapsuleData;
  onOpen: () => void;
}

export default function EnvelopeView({ capsule, onOpen }: EnvelopeViewProps) {
  const [isOpening, setIsOpening] = useState(false);
  const theme = THEMES[capsule.theme] || THEMES['warm-paper'];

  const handleSealClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Fire sound effect
    sounds.playWaxSealPop();

    // Whimsical Confetti Shower (gold, blush, matcha petals)
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.62 },
      colors: [theme.accentColor, '#F5DEB3', '#E6C280', '#BA6E52', '#EADFA8'],
      shapes: ['circle', 'square'],
      scalar: 0.9,
    });

    // Play paper rustle after flap opens
    setTimeout(() => {
      sounds.playPaperRustle();
    }, 450);

    // Trigger parent open callback
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 -top-12 -left-12"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 -bottom-12 -right-12"
        style={{ backgroundColor: '#EADFA8' }}
      />

      {/* Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-8 max-w-md z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/60 border border-[#E5DACB] text-[12px] font-mono tracking-wider text-[#7A6F63] mb-3 backdrop-blur-xs shadow-xs">
          {/* <Sparkles size={12} className="text-[#BA6E52]" /> */}
          <span>A letter for you</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2520] tracking-tight">
          Ada sebuah pesan rahasia untukmu
        </h1>
        <p className="font-sans text-sm text-[#7D7266] mt-2">
          Ditulis dengan tulus oleh <span className="font-semibold text-[#2B2520]">{capsule.author || 'Seseorang'}</span>
        </p>
      </motion.div>

      {/* The 3D Tactile Envelope */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 200, damping: 22 }}
        className="relative perspective-1000 w-[310px] sm:w-[380px] h-[210px] sm:h-[245px] z-10"
      >
        {/* Envelope Outer Shadow */}
        <div className="absolute inset-0 rounded-md shadow-[0_25px_50px_-12px_rgba(45,35,25,0.25),0_4px_12px_rgba(0,0,0,0.06)]" />

        {/* Envelope Body Base */}
        <div
          className="absolute inset-0 rounded-md overflow-hidden border border-[#D8CCBA]"
          style={{ backgroundColor: theme.envelopeColor }}
        >
          {/* Inner Lining Pattern (visible when open) */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(${theme.liningPatternColor} 1.5px, transparent 1.5px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* Letter Peek inside envelope */}
          <motion.div
            animate={
              isOpening
                ? { y: -140, opacity: 1, scale: 1.05 }
                : { y: 0, opacity: 0.9, scale: 0.98 }
            }
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            className="absolute left-4 right-4 top-3 bottom-3 bg-[#FAF8F5] rounded-xs p-3 shadow-md border border-[#E8E0D2] flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-1 bg-[#E8E0D2] rounded-full mb-2" />
            <p className="font-serif text-lg text-[#2B2520] italic">&ldquo;{capsule.title}&rdquo;</p>
            <span className="text-[10px] font-mono text-[#8C8276] mt-1">{capsule.dateStr}</span>
          </motion.div>

          {/* Envelope Left & Right Fold Triangles */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              filter: 'drop-shadow(1px 0 2px rgba(0,0,0,0.06))',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              filter: 'drop-shadow(-1px 0 2px rgba(0,0,0,0.06))',
            }}
          />

          {/* Envelope Bottom Fold Triangle */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: 'polygon(0% 100%, 50% 48%, 100% 100%)',
              backgroundColor: theme.envelopeColor,
              filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.08))',
            }}
          />
        </div>

        {/* Envelope Top Flap (Opens upwards with 3D rotateX) */}
        <motion.div
          animate={
            isOpening
              ? { rotateX: 180, zIndex: 0 }
              : { rotateX: 0, zIndex: 25 }
          }
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        >
          {/* Top Flap Triangle */}
          <div
            className="w-full h-full"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
        </motion.div>

        {/* The Wax Seal in the center of the envelope */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
            >
              <WaxSeal
                icon={capsule.sealIcon || 'heart'}
                color={theme.sealColor}
                size="lg"
                onClick={handleSealClick}
                interactive={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 text-center z-10"
      >
        <button
          type="button"
          onClick={handleSealClick}
          disabled={isOpening}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2B2520] text-[#FAF8F5] text-xs font-mono uppercase tracking-wider shadow-lg hover:bg-[#3D352E] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <MailOpen size={14} />
          <span>{isOpening ? 'Membuka Segel...' : 'Klik untuk buka'}</span>
        </button>
        <p className="text-[11px] font-sans text-[#8C8276] mt-2 italic">
          Buka perlahan, biarkan setiap kata menyapamu
        </p>
      </motion.div>
    </div>
  );
}
