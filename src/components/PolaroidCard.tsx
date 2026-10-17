'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Trash2 } from 'lucide-react';
import { PhotoItem } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface PolaroidCardProps {
  photo: PhotoItem;
  onDelete?: () => void;
  interactive?: boolean;
  dateStr?: string;
  className?: string;
}

export default function PolaroidCard({
  photo,
  onDelete,
  interactive = true,
  dateStr,
  className = '',
}: PolaroidCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-(y / rect.height) * 14);
    setRotateY((x / rect.width) * 14);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleFlip = () => {
    sounds.playPolaroidFlip();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`relative inline-block perspective-1000 select-none ${className}`}
      style={{
        transform: `rotate(${photo.rotation}deg)`,
      }}
    >
      {/* Washi Tape Strip at the top */}
      <div
        className="washi-tape-jagged absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 z-20 pointer-events-none opacity-90 shadow-sm"
        style={{
          backgroundColor: photo.washiTapeColor || 'rgba(235, 224, 180, 0.88)',
          transform: `translateX(-50%) rotate(${photo.rotation > 0 ? -2 : 2.5}deg)`,
        }}
      />

      {/* Delete button (only in edit/create mode) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 z-30 w-7 h-7 rounded-full bg-[#964332] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
          title="Hapus foto"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* 3D Flippable Card Container */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleFlip}
        animate={{
          rotateY: isFlipped ? 180 : rotateY,
          rotateX: isFlipped ? 0 : rotateX,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
        }}
        className="preserve-3d relative w-64 sm:w-72 cursor-pointer transition-shadow duration-300"
      >
        {/* FRONT: Polaroid Photo */}
        <div
          className="backface-hidden rounded-xs p-3.5 pb-5 bg-[#FAF8F5] border border-[#E8E2D8] shadow-[0_10px_25px_-5px_rgba(40,35,30,0.12),0_1px_3px_rgba(0,0,0,0.06)]"
        >
          {/* Photo Frame Container */}
          <div className="relative aspect-4/4 w-full bg-[#201D1A] overflow-hidden rounded-[2px] shadow-inner">
            {/* The Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || 'Polaroid moment'}
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 hover:scale-105"
            />
            {/* Film Glare Highlight */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
              }}
            />
          </div>

          {/* Bottom Area: Handwritten Caption */}
          <div className="mt-3.5 px-1 min-h-[38px] flex flex-col justify-between">
            <p className="font-handwriting text-xl text-[#2B2621] leading-tight line-clamp-2">
              {photo.caption || 'Sebuah potret kecil...'}
            </p>
            <div className="flex items-center justify-between text-xs font-serif italic text-[#8C847A] pt-1">
              <span>{dateStr || 'Memoir • 35mm'}</span>
              <span className="flex items-center gap-1 text-[11px] font-handwriting text-[#8A7D70] hover:text-[#2B2621]">
                <RotateCw size={10} /> balik
              </span>
            </div>
          </div>
        </div>

        {/* BACK: Vintage Postcard Note */}
        <div
          className="backface-hidden rotate-y-180 absolute inset-0 rounded-xs p-4 bg-[#F5EFE6] border border-[#DFCDBB] shadow-[0_10px_25px_-5px_rgba(40,35,30,0.14)] flex flex-col justify-between"
          style={{
            backgroundImage:
              'radial-gradient(#D6C6B2 0.75px, transparent 0.75px), radial-gradient(#D6C6B2 0.75px, #F5EFE6 0.75px)',
            backgroundSize: '15px 15px',
            backgroundPosition: '0 0, 7.5px 7.5px',
          }}
        >
          {/* Postcard Header */}
          <div className="flex items-start justify-between border-b border-[#DFCDBB] pb-2">
            <div>
              <span className="text-xs font-serif italic tracking-wider text-[#8A7969]">
                Post Card
              </span>
              <p className="text-[10px] font-serif text-[#A89887]">Series No. 04</p>
            </div>
            {/* Faux Vintage Postage Stamp */}
            <div className="w-9 h-11 border border-dashed border-[#8A7969] bg-[#EFE7DC] rounded-xs flex flex-col items-center justify-center p-1">
              <span className="text-[8px] font-serif text-[#8A7969]">STAMP</span>
              <div className="w-4 h-4 rounded-full bg-[#BA6E52]/20 flex items-center justify-center text-[7px] text-[#BA6E52]">
                ✿
              </div>
            </div>
          </div>

          {/* Postcard Handwritten Content */}
          <div className="my-auto py-2 text-center">
            <p className="font-handwriting text-2xl text-[#362920] leading-snug px-2">
              &ldquo;{photo.caption || 'Kenangan ini tersimpan di balik potret, tak pernah usang oleh waktu.'}&rdquo;
            </p>
          </div>

          {/* Postcard Footer */}
          <div className="flex items-center justify-between text-xs font-serif italic text-[#8A7969] border-t border-[#DFCDBB] pt-2">
            <span>Untukmu yang terkasih</span>
            <span className="flex items-center gap-1 text-[11px] font-handwriting text-[#8A7969]">
              <RotateCw size={9} /> tap balik
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
