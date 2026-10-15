'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles, Mail, Flower2, Moon } from 'lucide-react';
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
  icon = 'heart',
  color = '#964332',
  size = 'md',
  onClick,
  interactive = true,
  className = '',
  isBroken = false,
}: WaxSealProps) {
  const sizeMap = {
    sm: { container: 'w-10 h-10', iconSize: 16, border: 'border-2' },
    md: { container: 'w-14 h-14', iconSize: 22, border: 'border-2' },
    lg: { container: 'w-20 h-20', iconSize: 32, border: 'border-[3px]' },
    xl: { container: 'w-24 h-24', iconSize: 38, border: 'border-4' },
  };

  const currentSize = sizeMap[size];

  const renderIcon = () => {
    const props = { size: currentSize.iconSize, strokeWidth: 1.75, className: 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]' };
    switch (icon) {
      case 'star':
        return <Star {...props} fill="currentColor" fillOpacity={0.3} />;
      case 'sparkle':
        return <Sparkles {...props} />;
      case 'flower':
        return <Flower2 {...props} />;
      case 'crescent':
        return <Moon {...props} fill="currentColor" fillOpacity={0.3} />;
      case 'envelope':
        return <Mail {...props} />;
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
      whileHover={interactive && !isBroken ? { scale: 1.07, rotate: 2 } : {}}
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
      {/* Irregular organic wax rim */}
      <div
        className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
        style={{
          boxShadow: `0 0 0 3px ${color}, 0 0 0 5px rgba(0, 0, 0, 0.08)`,
          filter: 'blur(0.5px)',
        }}
      />

      {/* Embossed inner seal circle */}
      <div
        className={`w-[78%] h-[78%] rounded-full flex items-center justify-center border-dashed text-white/90 ${currentSize.border}`}
        style={{
          borderColor: 'rgba(255, 255, 255, 0.35)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.2)',
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.25) 100%)',
        }}
      >
        {renderIcon()}
      </div>

      {/* Subtle light reflection on the top curve */}
      <div
        className="absolute top-1 left-2 right-2 h-2/5 rounded-full pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
        }}
      />
    </motion.button>
  );
}
