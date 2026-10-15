'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapsuleData } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: CapsuleData;
  shareUrl: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  capsule,
  shareUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playSoftClick();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#BA6E52', '#EADFA8', '#6E7E62'],
    });

    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Ada sepucuk surat & kenangan manis untukmu dari ${capsule.author || 'seseorang'}:\n"${capsule.title}"\n\nBuka segel amplopnya di sini:\n${shareUrl}`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Paper Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] p-6 shadow-2xl z-10"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8C8072] hover:text-[#28231E] p-1.5 rounded-full hover:bg-[#EFE8DC] transition-colors"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E8D8] text-[11px] font-mono text-[#7D7060] mb-2">
              <Sparkles size={12} className="text-[#BA6E52]" />
              <span>SURAT TELAH TERSEGEL</span>
            </div>
            <h2 className="font-serif text-2xl text-[#2B231D] tracking-tight">
              Bawa dan Berikan Pelan-Pelan
            </h2>
            <p className="text-xs text-[#7A6E62] font-sans mt-1">
              Siapapun yang menerima link ini bisa langsung membuka amplop & membaca kenanganmu.
            </p>
          </div>

          {/* Capsule Mini Summary */}
          <div className="bg-[#FFFDFB] rounded-xl border border-[#ECE2D2] p-4 mb-5 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9C8F80]">
              PREVIEW SURAT
            </span>
            <h3 className="font-serif text-lg text-[#2B2520] font-normal truncate mt-0.5">
              {capsule.title}
            </h3>
            <p className="text-xs font-mono text-[#827568] mt-1">
              Dari: <span className="font-medium text-[#2B2520]">{capsule.author || 'Anonim'}</span> • Untuk:{' '}
              <span className="font-medium text-[#2B2520]">{capsule.recipient || 'Untukmu'}</span>
            </p>
            {capsule.photos && capsule.photos.length > 0 && (
              <span className="inline-block mt-2 text-[10px] font-mono text-[#8C7F70] bg-[#F5EDE1] px-2 py-0.5 rounded-full">
                📷 {capsule.photos.length} Potret Polaroid Terlampir
              </span>
            )}
          </div>

          {/* Share Link Input Box */}
          <div className="flex items-center gap-2 bg-[#F3EDE2] border border-[#DFCDBA] rounded-xl p-1.5 pl-3 mb-5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs font-mono text-[#332A22] w-full outline-hidden select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
                copied
                  ? 'bg-[#6E7E62] text-white'
                  : 'bg-[#2B231D] text-[#FAF8F5] hover:bg-[#3D332B] active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Share Options */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-mono text-[#128C7E] transition-all active:scale-95"
            >
              <MessageCircle size={14} />
              <span>Kirim WhatsApp</span>
            </a>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E5DACB] text-xs font-mono text-[#4A3F33] transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              <span>Buka Amplop</span>
            </a>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] font-mono text-[#A19485]">
              Link ini abadi & bebas di-host gratis di Vercel selamanya.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
