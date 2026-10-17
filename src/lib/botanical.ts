import {
  BotanicalFlowerId,
  GarlandBorderId,
  FlowerStickerPosition,
  FlowerSize,
  GarlandPosition,
  EnvelopeStyle,
  OpenAnimationType,
} from './types';

export interface BotanicalFlowerOption {
  id: BotanicalFlowerId;
  name: string;
  image: string;
  tag: string;
}

export const BOTANICAL_FLOWERS: BotanicalFlowerOption[] = [
  {
    id: 'pink-lily',
    name: 'Lily Merah Muda',
    image: '/botanical/pink-lily.png',
    tag: 'Stiker Vintage',
  },
  {
    id: 'sunflower',
    name: 'Bunga Matahari',
    image: '/botanical/sunflower.png',
    tag: 'Kehangatan',
  },
  {
    id: 'pink-rose',
    name: 'Mawar Liar',
    image: '/botanical/pink-rose.png',
    tag: 'Klasik Romantis',
  },
  {
    id: 'flower-blue-hydrangea',
    name: 'Hydrangea Biru',
    image: '/botanical/flower-blue-hydrangea.png',
    tag: 'Herbarium',
  },
  {
    id: 'flower-gerbera',
    name: 'Gerbera Pink',
    image: '/botanical/flower-gerbera.png',
    tag: 'Manis Lembut',
  },
  {
    id: 'bouquet-peony',
    name: 'Buket Peony Mewah',
    image: '/botanical/bouquet-peony.png',
    tag: 'Buket Lukisan',
  },
  {
    id: 'bouquet-lily',
    name: 'Buket Lily & Hibiscus',
    image: '/botanical/bouquet-lily.png',
    tag: 'Rangkaian Botani',
  },
  {
    id: 'wildflowers',
    name: 'Bunga Liar Estetik',
    image: '/botanical/wildflowers.png',
    tag: 'Wild Botanica',
  },
  {
    id: 'flower-anemone',
    name: 'Anemon Putih',
    image: '/botanical/flower-anemone.png',
    tag: 'Minimalis',
  },
  {
    id: 'flower-ranunculus',
    name: 'Ranunculus Kuning',
    image: '/botanical/flower-ranunculus.png',
    tag: 'Cerah Hangat',
  },
  {
    id: 'flower-pansy',
    name: 'Pansy Beludru Ungu',
    image: '/botanical/flower-pansy.png',
    tag: 'Puitis',
  },
];

export interface GarlandBorderOption {
  id: GarlandBorderId;
  name: string;
  image?: string;
  description: string;
  type: 'vertical-garland' | 'corners';
}

export const GARLAND_BORDERS: GarlandBorderOption[] = [
  {
    id: 'none',
    name: 'Tanpa Bingkai',
    description: 'Tampilan kertas surat polos minimalis',
    type: 'vertical-garland',
  },
  {
    id: 'tiger-lily',
    name: 'Untaian Tiger Lily',
    image: '/botanical/garland-lily.png',
    description: 'Garland vertikal bunga lily tutul merah muda elegan',
    type: 'vertical-garland',
  },
  {
    id: 'sakura-pearl',
    name: 'Untaian Sakura & Mutiara',
    image: '/botanical/garland-sakura.png',
    description: 'Untaian kelopak sakura merah muda berpadu butiran mutiara',
    type: 'vertical-garland',
  },
  {
    id: 'tropical-lily',
    name: 'Lily & Hibiscus Tropis',
    image: '/botanical/garland-tropical.png',
    description: 'Kombinasi bunga lily dan kembang sepatu putih dengan embun',
    type: 'vertical-garland',
  },
  {
    id: 'hydrangea-corners',
    name: 'Sudut Herbarium Hydrangea',
    image: '/botanical/hydrangea-top-left.png',
    description: 'Bingkai sudut botani hydrangea biru di pojok surat',
    type: 'corners',
  },
  {
    id: 'wildflower-cluster',
    name: 'Rangkaian Bunga Liar',
    image: '/botanical/wildflowers.png',
    description: 'Aksen untaian flora liar alami di tepi kertas',
    type: 'vertical-garland',
  },
];

export const FLOWER_SIZES: Array<{ id: FlowerSize; label: string; className: string }> = [
  { id: 'sm', label: 'Kecil', className: 'w-12 h-12 sm:w-14 sm:h-14' },
  { id: 'md', label: 'Sedang', className: 'w-16 h-16 sm:w-20 sm:h-20' },
  { id: 'lg', label: 'Besar', className: 'w-22 h-22 sm:w-28 sm:h-28' },
  { id: 'xl', label: 'Ekstra Besar', className: 'w-30 h-30 sm:w-36 sm:h-36' },
];

export function getFlowerSizeClass(size?: FlowerSize): string {
  const found = FLOWER_SIZES.find((s) => s.id === size);
  return found ? found.className : 'w-16 h-16 sm:w-20 sm:h-20';
}

export const FLOWER_POSITIONS: Array<{
  id: FlowerStickerPosition;
  label: string;
  className: string;
  rotation: number;
}> = [
  { id: 'top-right', label: 'Kanan Atas', className: 'top-4 right-4 sm:top-6 sm:right-6', rotation: 8 },
  { id: 'top-left', label: 'Kiri Atas', className: 'top-4 left-4 sm:top-6 sm:left-6', rotation: -8 },
  { id: 'top-center', label: 'Tengah Atas', className: 'top-3 left-1/2 -translate-x-1/2', rotation: 0 },
  { id: 'bottom-right', label: 'Kanan Bawah', className: 'bottom-4 right-4 sm:bottom-6 sm:right-6', rotation: 6 },
  { id: 'bottom-left', label: 'Kiri Bawah', className: 'bottom-4 left-4 sm:bottom-6 sm:left-6', rotation: -6 },
  { id: 'sign-off', label: 'Dekat Tanda Tangan', className: 'bottom-20 right-8', rotation: 12 },
];

export const GARLAND_POSITIONS: Array<{ id: GarlandPosition; label: string; desc: string }> = [
  { id: 'right', label: 'Tepi Kanan', desc: 'Di sepanjang margin kanan kertas' },
  { id: 'left', label: 'Tepi Kiri', desc: 'Di sepanjang margin kiri kertas' },
  { id: 'both', label: 'Kedua Sisi (Kiri & Kanan)', desc: 'Membingkai kedua tepi kertas secara seimbang' },
];

export const ENVELOPE_STYLES: Array<{ id: EnvelopeStyle; name: string; desc: string; iconType: string }> = [
  { id: 'classic-triangle', name: 'Lipatan Segitiga Klasik', desc: 'Bentuk amplop surat cinta tradisional', iconType: 'mail' },
  { id: 'square-baroque', name: 'Flap Persegi Eropa', desc: 'Tutup lurus modern dengan lekukan mewah', iconType: 'heart-handshake' },
  { id: 'botanical-lining', name: 'Motif Bunga Dalam', desc: 'Lining amplop bermotif taman bunga', iconType: 'feather' },
  { id: 'vintage-airmail', name: 'Vintage Airmail', desc: 'Gaya pos udara klasik nostalgia', iconType: 'send' },
];

export const OPEN_ANIMATIONS: Array<{ id: OpenAnimationType; name: string; desc: string; iconType: string }> = [
  { id: 'blossom-burst', name: 'Semerbak Kelopak Bunga', desc: 'Kelopak bunga beterbangan keluar berputar halus', iconType: 'sparkles' },
  { id: 'silky-glide', name: 'Geser Meluncur Halus', desc: 'Amplop meluncur turun dan kertas surat melayang naik', iconType: 'wind' },
  { id: 'wax-crack', name: 'Retakan Segel Lilin', desc: 'Segel terbelah lembut dengan taburan kilau hangat', iconType: 'flame' },
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
