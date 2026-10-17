'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { MailOpen, Sparkles } from 'lucide-react';
import { CapsuleData, THEMES } from '@/lib/types';
import WaxSeal from './WaxSeal';
import { sounds } from '@/lib/audio';
import { getBotanicalFlower } from '@/lib/botanical';

interface EnvelopeViewProps {
  capsule: CapsuleData;
  onOpen: () => void;
}

const ambientPetals = [
  { img: '/botanical/pink-lily.png', x: '8%', y: '14%', size: 52, rotate: 18, delay: 0 },
  { img: '/botanical/sunflower.png', x: '86%', y: '16%', size: 46, rotate: -25, delay: 1.2 },
  { img: '/botanical/flower-blue-hydrangea.png', x: '12%', y: '78%', size: 42, rotate: 40, delay: 2.4 },
  { img: '/botanical/flower-gerbera.png', x: '88%', y: '75%', size: 48, rotate: -18, delay: 0.8 },
  { img: '/botanical/pink-rose.png', x: '4%', y: '48%', size: 40, rotate: 28, delay: 3.1 },
  { img: '/botanical/flower-anemone.png', x: '92%', y: '46%', size: 38, rotate: -35, delay: 1.6 },
];

const burstBlossoms = [
  { img: '/botanical/pink-lily.png', x: -140, y: -220, rotate: -45, scale: 0.9 },
  { img: '/botanical/sunflower.png', x: 150, y: -210, rotate: 55, scale: 0.85 },
  { img: '/botanical/pink-rose.png', x: -190, y: -90, rotate: -70, scale: 0.8 },
  { img: '/botanical/flower-gerbera.png', x: 200, y: -80, rotate: 60, scale: 0.8 },
  { img: '/botanical/flower-blue-hydrangea.png', x: -80, y: -270, rotate: 25, scale: 0.75 },
  { img: '/botanical/flower-anemone.png', x: 80, y: -260, rotate: -30, scale: 0.75 },
  { img: '/botanical/flower-ranunculus.png', x: -210, y: 30, rotate: 80, scale: 0.7 },
  { img: '/botanical/flower-pansy.png', x: 220, y: 40, rotate: -65, scale: 0.7 },
];

export default function EnvelopeView({ capsule, onOpen }: EnvelopeViewProps) {
  const [isOpening, setIsOpening] = useState(false);
  const theme = THEMES[capsule.theme] || THEMES['warm-paper'];

  const chosenFlower = getBotanicalFlower(capsule.flowerDecoration);
  const flowerTuckImage = chosenFlower ? chosenFlower.image : '/botanical/pink-rose.png';

  const handleSealClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // 1. Fire wax seal pop audio
    sounds.playWaxSealPop();

    // 2. Confetti Shower
    confetti({
      particleCount: 55,
      spread: 80,
      origin: { y: 0.62 },
      colors: [theme.accentColor, '#F5DEB3', '#E6C280', '#BA6E52', '#EADFA8'],
      shapes: ['circle', 'square'],
      scalar: 0.95,
    });

    // 3. Play paper sliding sound as paper emerges
    setTimeout(() => {
      sounds.playPaperRustle();
    }, 450);

    // 4. Trigger seamless transition to letter reader
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.45, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none -top-16 -left-16"
        style={{ backgroundColor: theme.accentColor }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none -bottom-16 -right-16"
        style={{ backgroundColor: '#EADFA8' }}
      />

      {/* Ambient Floating Botanical Petals in Background */}
      {ambientPetals.map((petal, idx) => (
        <motion.div
          key={idx}
          animate={{
            y: [-10, 10, -10],
            rotate: [petal.rotate - 8, petal.rotate + 8, petal.rotate - 8],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 6 + idx * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: petal.delay,
          }}
          className="absolute pointer-events-none opacity-40 hover:opacity-80 transition-opacity filter drop-shadow-sm select-none z-5 hidden sm:block"
          style={{
            left: petal.x,
            top: petal.y,
            width: petal.size,
            height: petal.size,
          }}
        >
          <img
            src={petal.img}
            alt="Petal"
            className="w-full h-full object-contain"
          />
        </motion.div>
      ))}

      {/* Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isOpening ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8 max-w-md z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/60 border border-[#E5DACB] text-[12px] font-mono tracking-wider text-[#7A6F63] mb-3 backdrop-blur-xs shadow-xs">
          <Sparkles size={12} className="text-[#BA6E52]" />
          <span>A letter for you</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2520] tracking-tight">
          Ada sebuah pesan rahasia untukmu
        </h1>
        <p className="font-sans text-sm text-[#7D7266] mt-2">
          Ditulis dengan tulus oleh{' '}
          <span className="font-semibold text-[#2B2520]">{capsule.author || 'Seseorang'}</span>
        </p>

        {(capsule.voiceNote || (capsule.photos && capsule.photos.length > 0) || chosenFlower) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {capsule.voiceNote && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#BA6E52]/10 border border-[#BA6E52]/20 text-[11px] font-mono text-[#964332]">
                🎙️ Pesan Suara
              </span>
            )}
            {chosenFlower && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF2E4] border border-[#D0E2C8] text-[11px] font-mono text-[#446A3A]">
                {chosenFlower.symbol} {chosenFlower.name}
              </span>
            )}
            {capsule.photos && capsule.photos.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/70 border border-[#E5DACB] text-[11px] font-mono text-[#7A6F63]">
                📷 {capsule.photos.length} Potret
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* The 3D Tactile Envelope Container */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 25 }}
        animate={
          isOpening
            ? { scale: [1, 1.02, 0.96], opacity: [1, 1, 0.4] }
            : { scale: 1, opacity: 1, y: 0 }
        }
        transition={
          isOpening
            ? { duration: 1.5, times: [0, 0.6, 1], ease: 'easeInOut' }
            : { duration: 0.7, type: 'spring', stiffness: 220, damping: 24 }
        }
        className="relative perspective-1000 w-[310px] sm:w-[380px] h-[210px] sm:h-[245px] z-10"
      >
        {/* Envelope Outer Shadow */}
        <div className="absolute inset-0 rounded-md shadow-[0_25px_50px_-12px_rgba(45,35,25,0.22),0_4px_16px_rgba(0,0,0,0.06)]" />

        {/* Envelope Body Base */}
        <div
          className="absolute inset-0 rounded-md overflow-hidden border border-[#D8CCBA]"
          style={{ backgroundColor: theme.envelopeColor }}
        >
          {/* Inner Lining Pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(${theme.liningPatternColor} 1.5px, transparent 1.5px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* Letter Emerging Smoothly from inside envelope */}
          <motion.div
            animate={
              isOpening
                ? {
                    y: [-10, -80, -210],
                    scale: [0.98, 1.04, 1.15],
                    rotate: [0, -0.5, -1],
                    opacity: [0.9, 1, 1],
                  }
                : { y: 0, opacity: 0.92, scale: 0.98, rotate: 0 }
            }
            transition={{
              duration: 1.25,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.4, 1],
            }}
            style={{ transformOrigin: 'bottom center' }}
            className="absolute left-4 right-4 top-3 bottom-3 bg-[#FAF8F5] rounded-xs p-4 shadow-xl border border-[#E8E0D2] flex flex-col items-center justify-center text-center z-15"
          >
            {chosenFlower && (
              <img
                src={chosenFlower.image}
                alt="Flower Accent"
                className="w-8 h-8 object-contain mb-1 drop-shadow-xs"
              />
            )}
            <div className="w-12 h-1 bg-[#E8E0D2] rounded-full mb-2" />
            <p className="font-serif text-lg text-[#2B2520] italic leading-snug line-clamp-2">
              &ldquo;{capsule.title}&rdquo;
            </p>
            <span className="text-[10px] font-mono text-[#8C8276] mt-2 tracking-wide">
              {capsule.dateStr}
            </span>
            {isOpening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#964332]"
              >
                <span>Membuka surat & semerbak bunga...</span>
              </motion.div>
            )}
          </motion.div>

          {/* Envelope Left & Right Fold Triangles */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              filter: 'drop-shadow(1px 0 2px rgba(0,0,0,0.06))',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              filter: 'drop-shadow(-1px 0 2px rgba(0,0,0,0.06))',
            }}
          />

          {/* Envelope Bottom Fold Triangle */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              clipPath: 'polygon(0% 100%, 50% 48%, 100% 100%)',
              backgroundColor: theme.envelopeColor,
              filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.08))',
            }}
          />
        </div>

        {/* Envelope Top Flap (3D Unfold Upwards) */}
        <motion.div
          animate={
            isOpening
              ? { rotateX: 180, zIndex: 5 }
              : { rotateX: 0, zIndex: 25 }
          }
          transition={{
            duration: 0.85,
            delay: 0.12,
            ease: [0.33, 1, 0.68, 1],
          }}
          style={{
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        >
          {/* Top Flap Triangle Front */}
          <div
            className="w-full h-full"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              backgroundColor: theme.envelopeFlapColor,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
        </motion.div>

        {/* Real Botanical Flower Blossom Tucked Underneath the Wax Seal */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.95 }}
              exit={{
                scale: 1.5,
                opacity: 0,
                y: -30,
                filter: 'blur(3px)',
                transition: { duration: 0.4 },
              }}
              className="absolute left-1/2 top-[47%] -translate-x-[62%] -translate-y-[62%] z-28 pointer-events-none select-none"
            >
              <img
                src={flowerTuckImage}
                alt="Tucked Botanical Flower"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain -rotate-15 drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Burst of Blooming Botanical Petals when seal pops open */}
        {isOpening && (
          <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none">
            {burstBlossoms.map((b, i) => (
              <motion.img
                key={i}
                src={b.img}
                alt="Blooming Blossom"
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                animate={{
                  x: b.x,
                  y: b.y,
                  scale: b.scale,
                  opacity: [1, 1, 0],
                  rotate: b.rotate,
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-md"
              />
            ))}
          </div>
        )}

        {/* The Wax Seal in the center of the envelope */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.35,
                opacity: 0,
                filter: 'blur(4px)',
                transition: { duration: 0.28, ease: 'easeOut' },
              }}
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
        animate={isOpening ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 text-center z-10"
      >
        <button
          type="button"
          onClick={handleSealClick}
          disabled={isOpening}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2B2520] text-[#FAF8F5] text-xs font-mono uppercase tracking-wider shadow-lg hover:bg-[#3D352E] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          <MailOpen size={14} />
          <span>{isOpening ? 'Membuka Segel...' : 'Klik untuk buka'}</span>
        </button>
        <p className="text-[11px] font-sans text-[#8C8276] mt-2 italic">
          Open it, let the word find you...
        </p>
      </motion.div>
    </div>
  );
}
