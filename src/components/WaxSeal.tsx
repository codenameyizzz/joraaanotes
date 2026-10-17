'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { SealIconType } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface WaxSealProps {
  icon?: SealIconType;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
  isBroken?: boolean;
}

export default function WaxSeal({
  icon = 'lily',
  color = '#964332',
  size = 'md',
  onClick,
  interactive = true,
  className = '',
  isBroken = false,
}: WaxSealProps) {
  const sizeMap = {
    sm: { container: 'w-9 h-9', iconSize: 14, border: 'border' },
    md: { container: 'w-13 h-13', iconSize: 20, border: 'border-2' },
    lg: { container: 'w-18 h-18', iconSize: 28, border: 'border-2' },
    xl: { container: 'w-22 h-22', iconSize: 34, border: 'border-[3px]' },
  };

  const currentSize = sizeMap[size];
  const isFlowerSeal = ['lily', 'sunflower', 'rose', 'hydrangea', 'peony', 'gerbera'].includes(icon);

  const renderIcon = () => {
    const props = {
      size: currentSize.iconSize,
      strokeWidth: 1.75,
      className: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]',
    };

    switch (icon) {
      case 'lily':
        return (
          <img
            src="/botanical/pink-lily.png"
            alt="Lily"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'sunflower':
        return (
          <img
            src="/botanical/sunflower.png"
            alt="Sunflower"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'rose':
        return (
          <img
            src="/botanical/pink-rose.png"
            alt="Rose"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'hydrangea':
        return (
          <img
            src="/botanical/flower-blue-hydrangea.png"
            alt="Hydrangea"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'peony':
        return (
          <img
            src="/botanical/bouquet-peony.png"
            alt="Peony"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'gerbera':
        return (
          <img
            src="/botanical/flower-gerbera.png"
            alt="Gerbera"
            className="w-[125%] h-[125%] max-w-none object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] scale-110 pointer-events-none"
          />
        );
      case 'star':
        return <Star {...props} fill="currentColor" fillOpacity={0.3} />;
      case 'heart':
      default:
        return <Heart {...props} fill="currentColor" fillOpacity={0.3} />;
    }
  };

  const handleClick = () => {
    if (interactive && onClick) {
      sounds.playWaxSealPop();
      onClick();
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={!interactive || isBroken}
      whileHover={interactive && !isBroken ? { scale: 1.08, rotate: 2 } : {}}
      whileTap={interactive && !isBroken ? { scale: 0.94 } : {}}
      className={`relative rounded-full flex items-center justify-center select-none transition-shadow ${
        currentSize.container
      } ${interactive ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      style={{
        backgroundColor: color,
        boxShadow: isBroken
          ? 'none'
          : `0 4px 14px -2px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -3px 6px rgba(0, 0, 0, 0.45)`,
      }}
    >
      {/* Irregular organic molten wax rim */}
      <div
        className="absolute inset-0 rounded-full opacity-65 pointer-events-none"
        style={{
          boxShadow: `0 0 0 2.5px ${color}, 0 0 0 4.5px rgba(0, 0, 0, 0.08)`,
          filter: 'blur(0.4px)',
        }}
      />

      {/* Embossed inner seal circle */}
      <div
        className={`w-[82%] h-[82%] rounded-full flex items-center justify-center overflow-visible text-white/90 ${
          isFlowerSeal ? '' : `${currentSize.border} border-dashed`
        }`}
        style={{
          borderColor: 'rgba(255, 255, 255, 0.35)',
          boxShadow: isFlowerSeal
            ? 'none'
            : 'inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.2)',
          background: isFlowerSeal
            ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.18) 100%)'
            : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.25) 100%)',
        }}
      >
        {renderIcon()}
      </div>

      {/* Subtle light reflection on the top curve */}
      <div
        className="absolute top-0.5 left-1.5 right-1.5 h-1/3 rounded-full pointer-events-none opacity-25"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)',
        }}
      />
    </motion.button>
  );
}
