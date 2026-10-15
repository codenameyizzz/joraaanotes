'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, ExternalLink, Sparkles, ChevronDown, ChevronUp, Database } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapsuleData } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: CapsuleData;
  shareUrl: string;
  fallbackUrl?: string;
  hasPersistentStorage?: boolean;
}

export default function ShareModal({
  isOpen,
  onClose,
  capsule,
  shareUrl,
  fallbackUrl,
  hasPersistentStorage = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [showFullHash, setShowFullHash] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (textToCopy: string) => {
    sounds.playSoftClick();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#BA6E52', '#EADFA8', '#6E7E62'],
    });

    setTimeout(() => setCopied(false), 2500);
  };

  const activeUrl = showFullHash && fallbackUrl ? fallbackUrl : shareUrl;

  const whatsappMessage = encodeURIComponent(
    `💌 Ada sepucuk surat & kenangan manis untukmu dari ${capsule.author || 'seseorang'}:\n"${capsule.title}"\n\nBuka segel amplopnya di sini:\n${activeUrl}`
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
          className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
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
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E8D8] text-[11px] font-mono text-[#7D7060] mb-2">
              <Sparkles size={12} className="text-[#BA6E52]" />
              <span>SURAT TELAH TERSEGEL</span>
            </div>
            <h2 className="font-serif text-2xl text-[#2B231D] tracking-tight">
              Bawa dan Berikan Pelan-Pelan
            </h2>
            <p className="text-xs text-[#7A6E62] font-sans mt-1">
              Link pendek WhatsApp-ready sudah siap untuk dikirimkan!
            </p>
          </div>

          {/* Capsule Mini Summary */}
          <div className="bg-[#FFFDFB] rounded-xl border border-[#ECE2D2] p-3.5 mb-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9C8F80]">
                PREVIEW SURAT
              </span>
              {hasPersistentStorage ? (
                <span className="text-[10px] font-mono text-[#4F7744] bg-[#E8F0E4] px-2 py-0.5 rounded-full font-medium">
                  ✓ Database Vercel KV Terhubung
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#8C7A4A] bg-[#F7F2E2] px-2 py-0.5 rounded-full font-medium">
                  ⚡ Link Pendek Aktif
                </span>
              )}
            </div>

            <h3 className="font-serif text-base text-[#2B2520] font-normal truncate mt-1">
              {capsule.title}
            </h3>
            <p className="text-xs font-mono text-[#827568] mt-0.5">
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
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#7A6E60] font-medium">
                {showFullHash ? 'Link Lengkap (Data Hash)' : 'Link Pendek WhatsApp'}
              </label>
              {fallbackUrl && (
                <button
                  type="button"
                  onClick={() => setShowFullHash(!showFullHash)}
                  className="text-[10px] font-mono text-[#964332] hover:underline"
                >
                  {showFullHash ? 'Gunakan Link Pendek' : 'Lihat Link Lengkap'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-[#F3EDE2] border border-[#DFCDBA] rounded-xl p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={activeUrl}
                className="bg-transparent text-xs font-mono text-[#332A22] w-full outline-hidden select-all truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(activeUrl)}
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
            <p className="text-[10px] font-mono text-[#8C7E6E] mt-1 px-1">
              {activeUrl.length < 100
                ? `✨ Link rapi (${activeUrl.length} karakter) — aman dikirim via WhatsApp tanpa terpotong.`
                : `Ukuran link: ${activeUrl.length} karakter.`}
            </p>
          </div>

          {/* Direct Share Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-mono text-[#128C7E] transition-all active:scale-95 font-medium"
            >
              <MessageCircle size={15} />
              <span>Kirim WhatsApp</span>
            </a>

            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E5DACB] text-xs font-mono text-[#4A3F33] transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              <span>Buka Amplop</span>
            </a>
          </div>

          {/* Vercel KV Setup Guidance (Collapsible) */}
          <div className="border border-[#E5DACB] rounded-xl bg-[#F7F2E8]/60 p-3 text-left">
            <button
              type="button"
              onClick={() => setShowVercelGuide(!showVercelGuide)}
              className="w-full flex items-center justify-between text-[11px] font-mono text-[#6A5E50] hover:text-[#2B231D]"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Database size={12} className="text-[#964332]" />
                <span>Mau link custom domain Anda sendiri?</span>
              </span>
              {showVercelGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showVercelGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 pt-2.5 border-t border-[#E8DEC8] text-[11px] font-sans text-[#6B5F52] space-y-1.5"
              >
                <p className="font-mono text-[10px] text-[#964332] font-semibold">
                  100% GRATIS SELAMANYA DENGAN VERCEL KV:
                </p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[10px] leading-relaxed text-[#5A4E42]">
                  <li>Buka dashboard Vercel proyek Anda (<code className="bg-white/80 px-1 py-0.5 rounded">joraaanotes</code>).</li>
                  <li>Klik tab <strong>Storage</strong> di menu atas.</li>
                  <li>Pilih <strong>KV (Durable Redis)</strong> atau <strong>Upstash Redis</strong> (Free).</li>
                  <li>Klik <strong>Create & Connect to Project</strong>.</li>
                </ol>
                <p className="text-[10px] text-[#7A6F62] italic mt-1 font-sans">
                  Selesai! Vercel akan otomatis menyambungkan database gratis, dan tautan Anda akan selalu berbentuk pendek resmi seperti: <code className="text-[#964332] font-mono">joraaanotes.vercel.app/open?id=k8Xq2m</code>
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] font-mono text-[#A19485]">
              Surat ini aman & dapat dibuka oleh siapa saja yang memegang tautan.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
