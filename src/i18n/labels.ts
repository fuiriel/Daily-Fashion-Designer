import { Language } from '../types';

// Etykiety danych domenowych. Wartości zapisane w danych pozostają po polsku
// (to klucze), a tu tłumaczymy je na potrzeby wyświetlania.

const EN_SUBCATEGORIES: Record<string, string> = {
  't-shirt': 't-shirt',
  koszula: 'shirt',
  bluzka: 'blouse',
  top: 'top',
  sweter: 'sweater',
  bluza: 'hoodie',
  spodnie: 'trousers',
  jeansy: 'jeans',
  legginsy: 'leggings',
  szorty: 'shorts',
  spódnica: 'skirt',
  sukienka: 'dress',
  kombinezon: 'jumpsuit',
  kurtka: 'jacket',
  płaszcz: 'coat',
  marynarka: 'blazer',
  żakiet: 'suit jacket',
  kamizelka: 'vest',
  sneakersy: 'sneakers',
  botki: 'ankle boots',
  kozaki: 'boots',
  szpilki: 'heels',
  sandały: 'sandals',
  baleriny: 'flats',
  mokasyny: 'loafers',
  kalosze: 'rain boots',
  'buty sportowe': 'sport shoes',
  torebka: 'handbag',
  plecak: 'backpack',
  czapka: 'cap/beanie',
  kapelusz: 'hat',
  szalik: 'scarf',
  rękawiczki: 'gloves',
  pasek: 'belt',
  biżuteria: 'jewellery',
  'okulary przeciwsłoneczne': 'sunglasses',
  parasol: 'umbrella',
  rajstopy: 'tights',
  skarpety: 'socks',
};

const EN_COLORS: Record<string, string> = {
  czarny: 'black',
  biały: 'white',
  szary: 'grey',
  beżowy: 'beige',
  brązowy: 'brown',
  granatowy: 'navy',
  jeansowy: 'denim',
  czerwony: 'red',
  bordowy: 'burgundy',
  różowy: 'pink',
  pomarańczowy: 'orange',
  żółty: 'yellow',
  zielony: 'green',
  oliwkowy: 'olive',
  niebieski: 'blue',
  turkusowy: 'turquoise',
  fioletowy: 'purple',
  złoty: 'gold',
  srebrny: 'silver',
  wielokolorowy: 'multicolour',
};

const EN_PATTERNS: Record<string, string> = {
  gładki: 'plain',
  paski: 'stripes',
  kratka: 'check',
  kwiaty: 'floral',
  grochy: 'polka dots',
  zwierzęcy: 'animal',
  geometryczny: 'geometric',
  nadruk: 'print',
  inny: 'other',
};

const EN_STYLES: Record<string, string> = {
  casual: 'casual',
  elegancki: 'elegant',
  sportowy: 'sporty',
  klasyczny: 'classic',
  boho: 'boho',
  streetwear: 'streetwear',
  romantyczny: 'romantic',
  minimalistyczny: 'minimalist',
  rockowy: 'rock',
};

const EN_OCCASIONS: Record<string, string> = {
  codzienne: 'Everyday',
  praca: 'Work',
  kino: 'Cinema',
  park: 'Park / walk',
  rower: 'Bike',
  sport: 'Sport',
  randka: 'Date',
  przyjęcie: 'Party',
  wesele: 'Wedding',
  pogrzeb: 'Funeral',
  plaża: 'Beach',
};

const EN_SEASONS: Record<string, string> = {
  wiosna: 'spring',
  lato: 'summer',
  jesień: 'autumn',
  zima: 'winter',
};

const EN_TIMES: Record<string, string> = {
  rano: 'Morning',
  dzień: 'Day',
  wieczór: 'Evening',
  noc: 'Night',
};

const EN_CATEGORIES: Record<string, string> = {
  ubrania: 'Clothes',
  buty: 'Shoes',
  akcesoria: 'Accessories',
};

const EN_BOTTOM_PREF: Record<string, string> = {
  dowolnie: 'any',
  sukienka: 'dress',
  spodnie: 'trousers',
  spódnica: 'skirt',
};

const EN_WARMTH: Record<number, string> = {
  1: 'very light',
  2: 'light',
  3: 'mid-season',
  4: 'warm',
  5: 'very warm',
};

const PL_WARMTH: Record<number, string> = {
  1: 'bardzo lekkie',
  2: 'lekkie',
  3: 'przejściowe',
  4: 'ciepłe',
  5: 'bardzo ciepłe',
};

function fromMap(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}

export function subcatLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_SUBCATEGORIES, key) : key;
}
export function colorLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_COLORS, key) : key;
}
export function patternLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_PATTERNS, key) : key;
}
export function styleLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_STYLES, key) : key;
}
export function occasionLabel(lang: Language, key: string, plLabel: string): string {
  return lang === 'en' ? fromMap(EN_OCCASIONS, key) : plLabel;
}
export function seasonLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_SEASONS, key) : key;
}
export function timeLabel(lang: Language, key: string, plLabel: string): string {
  return lang === 'en' ? fromMap(EN_TIMES, key) : plLabel;
}
export function categoryLabel(lang: Language, key: string, plLabel: string): string {
  return lang === 'en' ? fromMap(EN_CATEGORIES, key) : plLabel;
}
export function bottomPrefLabel(lang: Language, key: string): string {
  return lang === 'en' ? fromMap(EN_BOTTOM_PREF, key) : key;
}
export function warmthLabel(lang: Language, level: number): string {
  return lang === 'en' ? EN_WARMTH[level] ?? String(level) : PL_WARMTH[level] ?? String(level);
}

// Sloty stylizacji (etykiety na kafelkach propozycji)
const SLOT_LABELS: Record<Language, Record<string, string>> = {
  pl: { top: 'Góra', bottom: 'Dół', dress: 'Sukienka', outerwear: 'Okrycie', shoes: 'Buty', accessory: 'Dodatek' },
  en: { top: 'Top', bottom: 'Bottom', dress: 'Dress', outerwear: 'Outerwear', shoes: 'Shoes', accessory: 'Accessory' },
};
export function slotLabel(lang: Language, slot: string): string {
  return SLOT_LABELS[lang][slot] ?? slot;
}

// Kalendarz
export const WEEKDAYS_BY_LANG: Record<Language, string[]> = {
  pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};
export const MONTHS_BY_LANG: Record<Language, string[]> = {
  pl: [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

// Teksty reguł „czego brakuje" (id reguły -> tytuł i powód)
export const GAP_TEXTS: Record<Language, Record<string, { what: string; why: string }>> = {
  pl: {
    warmOuter: { what: 'Ciepła kurtka lub płaszcz (zima)', why: 'Brak wierzchniego okrycia na temperatury poniżej 5°C.' },
    midOuter: { what: 'Kurtka przejściowa', why: 'Przyda się wiosną i jesienią (8–15°C).' },
    rainOuter: { what: 'Kurtka lub płaszcz przeciwdeszczowy', why: 'Nic w szafie nie jest oznaczone jako nieprzemakalne okrycie.' },
    rainShoes: { what: 'Buty na deszcz (kalosze lub nieprzemakalne)', why: 'W deszczowe dni nie masz w czym wyjść z domu.' },
    winterShoes: { what: 'Ciepłe buty na zimę', why: 'Brak krytych, ciepłych butów (kozaki, botki) na mrozy.' },
    sneakers: { what: 'Wygodne buty na co dzień (sneakersy)', why: 'Podstawa codziennych i sportowych stylizacji.' },
    elegantShoes: { what: 'Eleganckie buty', why: 'Potrzebne na wesele, przyjęcie lub inną formalną okazję.' },
    elegantBase: { what: 'Elegancka sukienka lub komplet', why: 'Na wesele czy przyjęcie przyda się formalna baza stylizacji.' },
    darkSet: { what: 'Ciemny, stonowany strój', why: 'Na pogrzeb potrzebna jest rzecz w czerni, szarości lub granacie.' },
    whiteShirt: { what: 'Biała koszula lub bluzka', why: 'Uniwersalna baza — pasuje niemal do wszystkiego.' },
    bottoms: { what: 'Jeansy lub uniwersalne spodnie', why: 'Podstawa większości codziennych stylizacji.' },
    warmSweater: { what: 'Ciepły sweter', why: 'Niezbędny jesienią i zimą jako warstwa pod kurtkę.' },
    sportSet: { what: 'Strój sportowy', why: 'Na rower, siłownię czy jogging.' },
    umbrella: { what: 'Parasol', why: 'Ratuje każdą stylizację w deszczowy dzień.' },
    winterAcc: { what: 'Szalik, czapka i rękawiczki', why: 'Zimowe akcesoria — brakuje przynajmniej jednego z nich.' },
    bag: { what: 'Torebka lub plecak', why: 'Praktyczne dopełnienie każdego wyjścia.' },
    ctxTop: { what: 'Góra na tę okazję', why: 'W szafie nie ma góry pasującej do wybranej okazji i pogody.' },
    ctxBottom: { what: 'Dół na tę okazję', why: 'Brak spodni lub spódnicy pasujących do wybranych kryteriów.' },
    ctxDress: { what: 'Sukienka na tę okazję', why: 'Brak sukienki pasującej do wybranych kryteriów.' },
  },
  en: {
    warmOuter: { what: 'Warm jacket or coat (winter)', why: 'No outerwear for temperatures below 5°C.' },
    midOuter: { what: 'Mid-season jacket', why: 'Useful in spring and autumn (8–15°C).' },
    rainOuter: { what: 'Rain jacket or coat', why: 'Nothing in the wardrobe is marked as waterproof outerwear.' },
    rainShoes: { what: 'Rain shoes (waterproof or rain boots)', why: 'Nothing to wear outside on rainy days.' },
    winterShoes: { what: 'Warm winter shoes', why: 'No closed, warm shoes (boots) for freezing days.' },
    sneakers: { what: 'Comfortable everyday shoes (sneakers)', why: 'The base of everyday and sporty outfits.' },
    elegantShoes: { what: 'Elegant shoes', why: 'Needed for a wedding, party or other formal occasion.' },
    elegantBase: { what: 'Elegant dress or set', why: 'A formal outfit base for weddings and parties.' },
    darkSet: { what: 'Dark, subdued outfit', why: 'A funeral requires something in black, grey or navy.' },
    whiteShirt: { what: 'White shirt or blouse', why: 'A universal base — goes with almost everything.' },
    bottoms: { what: 'Jeans or universal trousers', why: 'The base of most everyday outfits.' },
    warmSweater: { what: 'Warm sweater', why: 'Essential in autumn and winter as a layer.' },
    sportSet: { what: 'Sports outfit', why: 'For cycling, the gym or jogging.' },
    umbrella: { what: 'Umbrella', why: 'Saves any outfit on a rainy day.' },
    winterAcc: { what: 'Scarf, beanie and gloves', why: 'Winter accessories — at least one is missing.' },
    bag: { what: 'Handbag or backpack', why: 'A practical finish to every outing.' },
    ctxTop: { what: 'A top for this occasion', why: 'No top in the wardrobe matches the selected occasion and weather.' },
    ctxBottom: { what: 'A bottom for this occasion', why: 'No trousers or skirt match the selected criteria.' },
    ctxDress: { what: 'A dress for this occasion', why: 'No dress matches the selected criteria.' },
  },
};
