import {
  BotanicalFlowerId,
  GarlandBorderId,
  FlowerStickerPosition,
  GarlandPosition,
  EnvelopeStyle,
  OpenAnimationType,
} from './types';

export interface BotanicalFlowerOption {
  id: BotanicalFlowerId;
  name: string;
  image: string;
  tag: string;
  symbol: string;
  meaning: string;
}

export const BOTANICAL_FLOWERS: BotanicalFlowerOption[] = [
  {
    id: 'pink-lily',
    name: 'Pink Lily Sticker',
    image: '/botanical/pink-lily.png',
    tag: 'Stiker Estetik',
    symbol: '🌸',
    meaning: 'Ketulusan & Kasih Sayang Hangat',
  },
  {
    id: 'sunflower',
    name: 'Bunga Matahari Emas',
    image: '/botanical/sunflower.png',
    tag: 'Kehangatan',
    symbol: '🌻',
    meaning: 'Keceriaan & Harapan Indah',
  },
  {
    id: 'pink-rose',
    name: 'Mawar Liar Merah Muda',
    image: '/botanical/pink-rose.png',
    tag: 'Klasik',
    symbol: '🌹',
    meaning: 'Cinta Tulus & Kelembutan',
  },
  {
    id: 'flower-blue-hydrangea',
    name: 'Pressed Hydrangea Biru',
    image: '/botanical/flower-blue-hydrangea.png',
    tag: 'Herbarium',
    symbol: '🪻',
    meaning: 'Rasa Syukur & Ketenangan Jiwa',
  },
  {
    id: 'flower-gerbera',
    name: 'Gerbera Daisy Pink',
    image: '/botanical/flower-gerbera.png',
    tag: 'Manis',
    symbol: '🌼',
    meaning: 'Senyuman Manis & Kegembiraan',
  },
  {
    id: 'bouquet-peony',
    name: 'Lukisan Buket Peony',
    image: '/botanical/bouquet-peony.png',
    tag: 'Buket Mewah',
    symbol: '💐',
    meaning: 'Kemakmuran & Kenangan Abadi',
  },
  {
    id: 'bouquet-lily',
    name: 'Buket Lily & Hibiscus',
    image: '/botanical/bouquet-lily.png',
    tag: 'Buket Segar',
    symbol: '🌺',
    meaning: 'Kecantikan Murni & Keanggunan',
  },
  {
    id: 'wildflowers',
    name: 'Rangkaian Bunga Liar',
    image: '/botanical/wildflowers.png',
    tag: 'Wild Botanica',
    symbol: '🌿',
    meaning: 'Kebebasan & Nostalgia Alam',
  },
  {
    id: 'flower-anemone',
    name: 'Anemon Putih Anggun',
    image: '/botanical/flower-anemone.png',
    tag: 'Minimalis',
    symbol: '🤍',
    meaning: 'Kesetiaan & Doa Restu',
  },
  {
    id: 'flower-ranunculus',
    name: 'Ranunculus Kuning Cerah',
    image: '/botanical/flower-ranunculus.png',
    tag: 'Cerah',
    symbol: '✨',
    meaning: 'Daya Tarik & Pesona Memikat',
  },
  {
    id: 'flower-pansy',
    name: 'Pansy Beludru Ungu',
    image: '/botanical/flower-pansy.png',
    tag: 'Puitis',
    symbol: '💜',
    meaning: 'Pikiran Penuh Rindu',
  },
];

export interface GarlandBorderOption {
  id: GarlandBorderId;
  name: string;
  image?: string;
  description: string;
}

export const GARLAND_BORDERS: GarlandBorderOption[] = [
  {
    id: 'none',
    name: 'Tanpa Bingkai Bunga',
    description: 'Tampilan kertas surat polos minimalis',
  },
  {
    id: 'sakura-pearl',
    name: 'Sakura, Anggrek & Mutiara',
    image: '/botanical/garland-sakura.png',
    description: 'Untaian kelopak sakura merah muda lembut berpadu butiran mutiara',
  },
  {
    id: 'tiger-lily',
    name: 'Untaian Tiger Lily',
    image: '/botanical/garland-lily.png',
    description: 'Garland vertikal bunga lily tutul merah muda elegan',
  },
  {
    id: 'tropical-lily',
    name: 'Lily & Hibiscus Tropis',
    image: '/botanical/garland-tropical.png',
    description: 'Kombinasi bunga lily dan kembang sepatu putih dengan embun pagi',
  },
];

export const FLOWER_POSITIONS: Array<{
  id: FlowerStickerPosition;
  label: string;
  className: string;
  rotation: number;
}> = [
  { id: 'top-right', label: 'Pojok Kanan Atas', className: 'top-4 right-4 sm:top-6 sm:right-6', rotation: 8 },
  { id: 'top-left', label: 'Pojok Kiri Atas', className: 'top-4 left-4 sm:top-6 sm:left-6', rotation: -8 },
  { id: 'top-center', label: 'Tengah Atas', className: 'top-3 left-1/2 -translate-x-1/2', rotation: 0 },
  { id: 'bottom-right', label: 'Pojok Kanan Bawah', className: 'bottom-4 right-4 sm:bottom-6 sm:right-6', rotation: 6 },
  { id: 'bottom-left', label: 'Pojok Kiri Bawah', className: 'bottom-4 left-4 sm:bottom-6 sm:left-6', rotation: -6 },
  { id: 'sign-off', label: 'Dekat Tanda Tangan', className: 'bottom-20 right-8', rotation: 12 },
];

export const GARLAND_POSITIONS: Array<{ id: GarlandPosition; label: string; desc: string }> = [
  { id: 'right', label: 'Tepi Kanan', desc: 'Di sepanjang margin kanan kertas' },
  { id: 'left', label: 'Tepi Kiri', desc: 'Di sepanjang margin kiri kertas' },
  { id: 'both', label: 'Kedua Sisi (Kiri & Kanan)', desc: 'Membingkai kedua tepi kertas secara anggun' },
];

export const ENVELOPE_STYLES: Array<{ id: EnvelopeStyle; name: string; desc: string; icon: string }> = [
  { id: 'classic-triangle', name: 'Lipatan Segitiga Klasik', desc: 'Bentuk amplop surat cinta tradisional', icon: '✉️' },
  { id: 'square-baroque', name: 'Flap Persegi Eropa', desc: 'Tutup lurus modern dengan lekukan mewah', icon: '💌' },
  { id: 'botanical-lining', name: 'Motif Bunga di Bagian Dalam', desc: 'Lining amplop bermotif taman bunga tersembunyi', icon: '🌿' },
  { id: 'vintage-airmail', name: 'Vintage Airmail Berpita', desc: 'Gaya pos udara klasik penuh nostalgia', icon: '✈️' },
];

export const OPEN_ANIMATIONS: Array<{ id: OpenAnimationType; name: string; desc: string; icon: string }> = [
  { id: 'blossom-burst', name: 'Mekar & Semerbak Bunga', desc: 'Kelopak dan kuntum bunga beterbangan keluar berputar 3D', icon: '🌸' },
  { id: 'silky-glide', name: 'Geser Lembut & Melayang', desc: 'Amplop meluncur turun dan kertas surat melayang naik ke layar', icon: '✨' },
  { id: 'wax-crack', name: 'Pecah Segel & Kilau Emas', desc: 'Segel pecah dengan percikan butiran kilau hangat', icon: '🕯️' },
];

export function getBotanicalFlower(id?: BotanicalFlowerId): BotanicalFlowerOption | undefined {
  if (!id || id === 'none') return undefined;
  return BOTANICAL_FLOWERS.find((f) => f.id === id);
}

export function getGarlandBorder(id?: GarlandBorderId): GarlandBorderOption | undefined {
  if (!id || id === 'none') return undefined;
  return GARLAND_BORDERS.find((g) => g.id === id);
}

export function getFlowerPositionConfig(pos?: FlowerStickerPosition) {
  const defaultPos = FLOWER_POSITIONS[0];
  if (!pos) return defaultPos;
  return FLOWER_POSITIONS.find((p) => p.id === pos) || defaultPos;
}
