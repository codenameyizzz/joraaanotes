export type ThemeId =
  | 'warm-paper'
  | 'midnight-film'
  | 'rose-petal'
  | 'matcha-breeze'
  | 'vintage-sepia'
  | 'lavender-dusk'
  | 'terracotta-sun'
  | 'ocean-breeze'
  | 'golden-honey'
  | 'sakura-spring';

export type SealIconType =
  | 'lily'
  | 'sunflower'
  | 'rose'
  | 'hydrangea'
  | 'heart'
  | 'star';

export type BotanicalFlowerId =
  | 'none'
  | 'pink-lily'
  | 'sunflower'
  | 'pink-rose'
  | 'bouquet-peony'
  | 'bouquet-lily'
  | 'wildflowers'
  | 'flower-gerbera'
  | 'flower-blue-hydrangea'
  | 'flower-anemone'
  | 'flower-ranunculus'
  | 'flower-pansy';

export type FlowerStickerPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'sign-off';

export type GarlandBorderId = 'none' | 'sakura-pearl' | 'tiger-lily' | 'tropical-lily';

export type GarlandPosition = 'right' | 'left' | 'both';

export type EnvelopeStyle =
  | 'classic-triangle'
  | 'square-baroque'
  | 'botanical-lining'
  | 'vintage-airmail';

export type OpenAnimationType = 'blossom-burst' | 'silky-glide' | 'wax-crack';

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
  flowerDecoration?: BotanicalFlowerId;
  flowerPosition?: FlowerStickerPosition;
  garlandBorder?: GarlandBorderId;
  garlandPosition?: GarlandPosition;
  envelopeStyle?: EnvelopeStyle;
  openAnimation?: OpenAnimationType;
  signOffPrefix?: string;
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
  'lavender-dusk': {
    id: 'lavender-dusk',
    name: 'Lavender Dusk & Lilac',
    bgClass: 'bg-[#F7F4FA]',
    paperClass: 'bg-[#FCFAFD]',
    cardBorder: 'border-[#E6DCF0]',
    textColor: 'text-[#2C2138]',
    mutedColor: 'text-[#7C6E8A]',
    accentColor: '#7E6390',
    sealColor: '#7E6390',
    washiDefault: '#E4D6F2',
    envelopeColor: '#ECE3F5',
    envelopeFlapColor: '#DFD2EB',
    liningPatternColor: '#CBBCE0',
  },
  'terracotta-sun': {
    id: 'terracotta-sun',
    name: 'Tuscan Terracotta & Clay',
    bgClass: 'bg-[#FAF3EE]',
    paperClass: 'bg-[#FDF9F6]',
    cardBorder: 'border-[#EEDDCE]',
    textColor: 'text-[#3A2218]',
    mutedColor: 'text-[#8C6454]',
    accentColor: '#C26749',
    sealColor: '#B85C3E',
    washiDefault: '#F2D7C7',
    envelopeColor: '#F3DFD2',
    envelopeFlapColor: '#E9CFC0',
    liningPatternColor: '#DDBFAe',
  },
  'ocean-breeze': {
    id: 'ocean-breeze',
    name: 'Coastal Sage & Sea Foam',
    bgClass: 'bg-[#F1F6F7]',
    paperClass: 'bg-[#F8FBFC]',
    cardBorder: 'border-[#D2E4E8]',
    textColor: 'text-[#1D2B30]',
    mutedColor: 'text-[#5B7882]',
    accentColor: '#3B7688',
    sealColor: '#3B7688',
    washiDefault: '#CDE2E6',
    envelopeColor: '#D7E9ED',
    envelopeFlapColor: '#C8DEE3',
    liningPatternColor: '#AFD0D8',
  },
  'golden-honey': {
    id: 'golden-honey',
    name: 'Amber Honey & Sunlight',
    bgClass: 'bg-[#FAF6EB]',
    paperClass: 'bg-[#FDFBF4]',
    cardBorder: 'border-[#EBE0C2]',
    textColor: 'text-[#332711]',
    mutedColor: 'text-[#877148]',
    accentColor: '#B88B22',
    sealColor: '#B88B22',
    washiDefault: '#F2E4BA',
    envelopeColor: '#EFE2C4',
    envelopeFlapColor: '#E4D3AE',
    liningPatternColor: '#D3BE93',
  },
  'sakura-spring': {
    id: 'sakura-spring',
    name: 'Sakura & Pearl Blossom',
    bgClass: 'bg-[#FCF2F5]',
    paperClass: 'bg-[#FEF9FA]',
    cardBorder: 'border-[#F5D8E0]',
    textColor: 'text-[#361E26]',
    mutedColor: 'text-[#8F6370]',
    accentColor: '#C95B75',
    sealColor: '#C95B75',
    washiDefault: '#F7CFDA',
    envelopeColor: '#F9DEE5',
    envelopeFlapColor: '#EFCDD6',
    liningPatternColor: '#E2B3C0',
  },
};
