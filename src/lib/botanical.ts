import { BotanicalFlowerId, GarlandBorderId } from './types';

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

export function getBotanicalFlower(id?: BotanicalFlowerId): BotanicalFlowerOption | undefined {
  if (!id || id === 'none') return undefined;
  return BOTANICAL_FLOWERS.find((f) => f.id === id);
}

export function getGarlandBorder(id?: GarlandBorderId): GarlandBorderOption | undefined {
  if (!id || id === 'none') return undefined;
  return GARLAND_BORDERS.find((g) => g.id === id);
}
