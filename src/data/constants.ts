import { MainCategory, Occasion, Pattern, Season, Slot, StyleTag, TimeOfDay } from '../types';

export const MAIN_CATEGORIES: { key: MainCategory; label: string; icon: string }[] = [
  { key: 'ubrania', label: 'Ubrania', icon: 'tshirt-crew' },
  { key: 'buty', label: 'Buty', icon: 'shoe-heel' },
  { key: 'akcesoria', label: 'Akcesoria', icon: 'bag-personal' },
];

// podkategoria -> slot w kompozycji
export const SUBCATEGORIES: Record<MainCategory, { name: string; slot: Slot }[]> = {
  ubrania: [
    { name: 't-shirt', slot: 'top' },
    { name: 'koszula', slot: 'top' },
    { name: 'bluzka', slot: 'top' },
    { name: 'top', slot: 'top' },
    { name: 'sweter', slot: 'top' },
    { name: 'bluza', slot: 'top' },
    { name: 'spodnie', slot: 'bottom' },
    { name: 'jeansy', slot: 'bottom' },
    { name: 'legginsy', slot: 'bottom' },
    { name: 'szorty', slot: 'bottom' },
    { name: 'spódnica', slot: 'bottom' },
    { name: 'sukienka', slot: 'dress' },
    { name: 'kombinezon', slot: 'dress' },
    { name: 'kurtka', slot: 'outerwear' },
    { name: 'płaszcz', slot: 'outerwear' },
    { name: 'marynarka', slot: 'outerwear' },
    { name: 'żakiet', slot: 'outerwear' },
    { name: 'kamizelka', slot: 'outerwear' },
  ],
  buty: [
    { name: 'sneakersy', slot: 'shoes' },
    { name: 'botki', slot: 'shoes' },
    { name: 'kozaki', slot: 'shoes' },
    { name: 'szpilki', slot: 'shoes' },
    { name: 'sandały', slot: 'shoes' },
    { name: 'baleriny', slot: 'shoes' },
    { name: 'mokasyny', slot: 'shoes' },
    { name: 'kalosze', slot: 'shoes' },
    { name: 'buty sportowe', slot: 'shoes' },
  ],
  akcesoria: [
    { name: 'torebka', slot: 'accessory' },
    { name: 'plecak', slot: 'accessory' },
    { name: 'czapka', slot: 'accessory' },
    { name: 'kapelusz', slot: 'accessory' },
    { name: 'szalik', slot: 'accessory' },
    { name: 'rękawiczki', slot: 'accessory' },
    { name: 'pasek', slot: 'accessory' },
    { name: 'biżuteria', slot: 'accessory' },
    { name: 'okulary przeciwsłoneczne', slot: 'accessory' },
    { name: 'parasol', slot: 'accessory' },
    { name: 'rajstopy', slot: 'accessory' },
  ],
};

export function slotOf(mainCategory: MainCategory, subcategory: string): Slot {
  const found = SUBCATEGORIES[mainCategory]?.find((s) => s.name === subcategory);
  if (found) return found.slot;
  if (mainCategory === 'buty') return 'shoes';
  if (mainCategory === 'akcesoria') return 'accessory';
  return 'top';
}

export const COLOR_PALETTE: { name: string; hex: string; neutral?: boolean }[] = [
  { name: 'czarny', hex: '#1F1F1F', neutral: true },
  { name: 'biały', hex: '#FAFAFA', neutral: true },
  { name: 'szary', hex: '#9E9E9E', neutral: true },
  { name: 'beżowy', hex: '#D9C3A5', neutral: true },
  { name: 'brązowy', hex: '#7B4B2A', neutral: true },
  { name: 'granatowy', hex: '#1F3A5F', neutral: true },
  { name: 'jeansowy', hex: '#5A7CA6', neutral: true },
  { name: 'czerwony', hex: '#C0392B' },
  { name: 'bordowy', hex: '#7B1E2B' },
  { name: 'różowy', hex: '#E8A0B5' },
  { name: 'pomarańczowy', hex: '#E67E22' },
  { name: 'żółty', hex: '#F1C40F' },
  { name: 'zielony', hex: '#2E7D4F' },
  { name: 'oliwkowy', hex: '#708238' },
  { name: 'niebieski', hex: '#2D7DD2' },
  { name: 'turkusowy', hex: '#1ABC9C' },
  { name: 'fioletowy', hex: '#7D3C98' },
  { name: 'złoty', hex: '#C9A227' },
  { name: 'srebrny', hex: '#B8BCC2' },
  { name: 'wielokolorowy', hex: '#E8A0B5' },
];

export const NEUTRAL_COLORS = new Set(
  COLOR_PALETTE.filter((c) => c.neutral).map((c) => c.name)
);

// proste rodziny kolorów do oceny harmonii
export const COLOR_FAMILY: Record<string, string> = {
  czerwony: 'ciepłe',
  bordowy: 'ciepłe',
  pomarańczowy: 'ciepłe',
  żółty: 'ciepłe',
  złoty: 'ciepłe',
  różowy: 'ciepłe',
  zielony: 'zimne',
  oliwkowy: 'zimne',
  niebieski: 'zimne',
  turkusowy: 'zimne',
  fioletowy: 'zimne',
  srebrny: 'zimne',
};

export const PATTERNS: Pattern[] = [
  'gładki',
  'paski',
  'kratka',
  'kwiaty',
  'grochy',
  'zwierzęcy',
  'geometryczny',
  'nadruk',
  'inny',
];

export const STYLES: StyleTag[] = [
  'casual',
  'elegancki',
  'sportowy',
  'klasyczny',
  'boho',
  'streetwear',
  'romantyczny',
  'minimalistyczny',
  'rockowy',
];

export const OCCASIONS: { key: Occasion; label: string; icon: string }[] = [
  { key: 'codzienne', label: 'Codzienne', icon: 'coffee' },
  { key: 'praca', label: 'Praca', icon: 'briefcase' },
  { key: 'kino', label: 'Kino', icon: 'movie-open' },
  { key: 'park', label: 'Park / spacer', icon: 'tree' },
  { key: 'rower', label: 'Rower', icon: 'bike' },
  { key: 'sport', label: 'Sport', icon: 'dumbbell' },
  { key: 'randka', label: 'Randka', icon: 'heart' },
  { key: 'przyjęcie', label: 'Przyjęcie', icon: 'party-popper' },
  { key: 'wesele', label: 'Wesele', icon: 'ring' },
  { key: 'pogrzeb', label: 'Pogrzeb', icon: 'flower' },
  { key: 'plaża', label: 'Plaża', icon: 'beach' },
];

// formalność okazji: 1 luźno – 5 bardzo formalnie
export const OCCASION_FORMALITY: Record<Occasion, number> = {
  codzienne: 2,
  praca: 3,
  kino: 2,
  park: 1,
  rower: 1,
  sport: 1,
  randka: 3,
  przyjęcie: 4,
  wesele: 5,
  pogrzeb: 5,
  plaża: 1,
};

// formalność stylu rzeczy
export const STYLE_FORMALITY: Record<StyleTag, number> = {
  sportowy: 1,
  streetwear: 2,
  casual: 2,
  boho: 3,
  rockowy: 2,
  romantyczny: 3,
  minimalistyczny: 3,
  klasyczny: 4,
  elegancki: 5,
};

export const SEASONS: Season[] = ['wiosna', 'lato', 'jesień', 'zima'];

export const TIMES_OF_DAY: { key: TimeOfDay; label: string; icon: string }[] = [
  { key: 'rano', label: 'Rano', icon: 'weather-sunset-up' },
  { key: 'dzień', label: 'Dzień', icon: 'white-balance-sunny' },
  { key: 'wieczór', label: 'Wieczór', icon: 'weather-sunset-down' },
  { key: 'noc', label: 'Noc', icon: 'weather-night' },
];

export const DEFAULT_STORES = ['Zalando', 'Zara', 'H&M', 'Reserved', 'Mohito', 'CCC', 'eobuwie', 'Allegro'];

export const WARMTH_LABELS: Record<number, string> = {
  1: 'bardzo lekkie',
  2: 'lekkie',
  3: 'przejściowe',
  4: 'ciepłe',
  5: 'bardzo ciepłe',
};
