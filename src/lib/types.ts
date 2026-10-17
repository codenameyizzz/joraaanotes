export type ThemeId = 'warm-paper' | 'midnight-film' | 'rose-petal' | 'matcha-breeze' | 'vintage-sepia';

export type SealIconType = 'heart' | 'star' | 'flower' | 'crescent' | 'envelope' | 'sparkle';

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  rotation: number; // e.g. -3 to +3
  washiTapeColor?: string;
}

export interface VoiceNoteData {
  url: string; // base64 audio data URL or hosted blob URL
  duration: number; // in seconds
  fileName?: string;
}

export interface CapsuleData {
  id: string;
  title: string;
  message: string;
  author: string;
  recipient: string;
  dateStr: string;
  locationWeather?: string;
  theme: ThemeId;
  sealIcon: SealIconType;
  musicMood: 'lofi-rain' | 'soft-piano' | 'gentle-chimes' | 'none';
  photos: PhotoItem[];
  voiceNote?: VoiceNoteData;
  reactions?: {
    hugs: number;
    smiles: number;
    flowers: number;
    coffee: number;
  };
  createdAt: number;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  paperClass: string;
  cardBorder: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  sealColor: string;
  washiDefault: string;
  envelopeColor: string;
  envelopeFlapColor: string;
  liningPatternColor: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'warm-paper': {
    id: 'warm-paper',
    name: 'Warm Linen & Cotton',
    bgClass: 'bg-[#FBF8F3]',
    paperClass: 'bg-[#FFFDFB]',
    cardBorder: 'border-[#EBE3D5]',
    textColor: 'text-[#28231D]',
    mutedColor: 'text-[#7D7468]',
    accentColor: '#964332',
    sealColor: '#964332',
    washiDefault: '#EFE3B5',
    envelopeColor: '#ECE3D4',
    envelopeFlapColor: '#E2D7C4',
    liningPatternColor: '#D8CCA8',
  },
  'midnight-film': {
    id: 'midnight-film',
    name: 'Midnight Film Slate',
    bgClass: 'bg-[#151518]',
    paperClass: 'bg-[#1E1E24]',
    cardBorder: 'border-[#2F2F38]',
    textColor: 'text-[#EDE9E3]',
    mutedColor: 'text-[#9A958D]',
    accentColor: '#D4AF37',
    sealColor: '#B8860B',
    washiDefault: '#3A3945',
    envelopeColor: '#24242C',
    envelopeFlapColor: '#2C2C36',
    liningPatternColor: '#3D3D4B',
  },
  'rose-petal': {
    id: 'rose-petal',
    name: 'Petal & Pressed Blush',
    bgClass: 'bg-[#FAF2F2]',
    paperClass: 'bg-[#FFF9F9]',
    cardBorder: 'border-[#EED9D9]',
    textColor: 'text-[#332224]',
    mutedColor: 'text-[#876E71]',
    accentColor: '#B85D6B',
    sealColor: '#B85D6B',
    washiDefault: '#F2D3D8',
    envelopeColor: '#F3DDDF',
    envelopeFlapColor: '#EBCFD2',
    liningPatternColor: '#E5C4C8',
  },
  'matcha-breeze': {
    id: 'matcha-breeze',
    name: 'Matcha Moss & Driftwood',
    bgClass: 'bg-[#F4F7F2]',
    paperClass: 'bg-[#FAFDF9]',
    cardBorder: 'border-[#D9E3D6]',
    textColor: 'text-[#222B20]',
    mutedColor: 'text-[#697867]',
    accentColor: '#5C7A54',
    sealColor: '#5C7A54',
    washiDefault: '#D7E5D2',
    envelopeColor: '#DEE8DA',
    envelopeFlapColor: '#D3E0CE',
    liningPatternColor: '#C4D5BE',
  },
  'vintage-sepia': {
    id: 'vintage-sepia',
    name: 'Vintage 1970s Sepia',
    bgClass: 'bg-[#F8F1E7]',
    paperClass: 'bg-[#FDF7EE]',
    cardBorder: 'border-[#E3D4C1]',
    textColor: 'text-[#38281B]',
    mutedColor: 'text-[#806B57]',
    accentColor: '#A86232',
    sealColor: '#A86232',
    washiDefault: '#E7CCA9',
    envelopeColor: '#E8DBC9',
    envelopeFlapColor: '#DECDB8',
    liningPatternColor: '#CFBA9F',
  },
};
