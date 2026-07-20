import { MainCategory } from '../types';

// Zastępcze ilustracje SVG dopasowane do rodzaju rzeczy.
//
// Pokazujemy je, gdy przedmiot nie ma zdjęcia albo zdjęcia nie udało się
// wczytać (np. martwy blob: po odświeżeniu na starszych danych). Każdy rodzaj
// ubioru ma własną sylwetkę, utrzymaną w stylu ikon aplikacji: pojedynczy,
// wygaszony kolor na miękkim tle. Rysunki są parametryzowane kolorem, więc
// dostrajają się do jasnego i ciemnego motywu.
//
// Na webie renderujemy je jako <img> z data URI (React Native Image = <img>),
// na telefonie — jako glif MaterialCommunityIcons (patrz garmentIcon), bo tam
// Image nie potrafi narysować SVG bez dodatkowej biblioteki.

export type GarmentKey =
  | 'tshirt'
  | 'shirt'
  | 'tank'
  | 'sweater'
  | 'hoodie'
  | 'pants'
  | 'shorts'
  | 'skirt'
  | 'dress'
  | 'jumpsuit'
  | 'coat'
  | 'vest'
  | 'sneaker'
  | 'boot'
  | 'heel'
  | 'sandal'
  | 'flat'
  | 'bag'
  | 'backpack'
  | 'beanie'
  | 'hat'
  | 'scarf'
  | 'gloves'
  | 'belt'
  | 'jewelry'
  | 'sunglasses'
  | 'umbrella'
  | 'tights'
  | 'socks';

// Podkategoria (z data/constants.ts) → sylwetka.
const SUBCATEGORY_KEY: Record<string, GarmentKey> = {
  // ubrania
  't-shirt': 'tshirt',
  koszula: 'shirt',
  bluzka: 'shirt',
  top: 'tank',
  sweter: 'sweater',
  bluza: 'hoodie',
  spodnie: 'pants',
  jeansy: 'pants',
  legginsy: 'tights',
  szorty: 'shorts',
  spódnica: 'skirt',
  sukienka: 'dress',
  kombinezon: 'jumpsuit',
  kurtka: 'coat',
  płaszcz: 'coat',
  marynarka: 'coat',
  żakiet: 'coat',
  kamizelka: 'vest',
  // buty
  sneakersy: 'sneaker',
  'buty sportowe': 'sneaker',
  botki: 'boot',
  kozaki: 'boot',
  kalosze: 'boot',
  szpilki: 'heel',
  sandały: 'sandal',
  baleriny: 'flat',
  mokasyny: 'flat',
  // akcesoria
  torebka: 'bag',
  plecak: 'backpack',
  czapka: 'beanie',
  kapelusz: 'hat',
  szalik: 'scarf',
  rękawiczki: 'gloves',
  pasek: 'belt',
  biżuteria: 'jewelry',
  'okulary przeciwsłoneczne': 'sunglasses',
  parasol: 'umbrella',
  rajstopy: 'tights',
  skarpety: 'socks',
};

const CATEGORY_FALLBACK: Record<MainCategory, GarmentKey> = {
  ubrania: 'tshirt',
  buty: 'sneaker',
  akcesoria: 'bag',
};

export function garmentKey(mainCategory: MainCategory, subcategory?: string): GarmentKey {
  if (subcategory && SUBCATEGORY_KEY[subcategory]) return SUBCATEGORY_KEY[subcategory];
  return CATEGORY_FALLBACK[mainCategory] ?? 'tshirt';
}

// Zapasowy glif MaterialCommunityIcons dla telefonu (Image nie rysuje SVG na natywie).
const ICON: Record<GarmentKey, string> = {
  tshirt: 'tshirt-crew',
  shirt: 'tshirt-crew-outline',
  tank: 'tshirt-v-outline',
  sweater: 'tshirt-crew',
  hoodie: 'tshirt-crew',
  pants: 'hanger',
  shorts: 'hanger',
  skirt: 'hanger',
  dress: 'hanger',
  jumpsuit: 'hanger',
  coat: 'hanger',
  vest: 'hanger',
  sneaker: 'shoe-sneaker',
  boot: 'shoe-heel',
  heel: 'shoe-heel',
  sandal: 'shoe-sneaker',
  flat: 'shoe-ballet',
  bag: 'bag-personal',
  backpack: 'bag-personal-outline',
  beanie: 'hat-fedora',
  hat: 'hat-fedora',
  scarf: 'scarf',
  gloves: 'hand-back-right-outline',
  belt: 'road-variant',
  jewelry: 'necklace',
  sunglasses: 'sunglasses',
  umbrella: 'umbrella',
  tights: 'hanger',
  socks: 'sock',
};

export function garmentIcon(mainCategory: MainCategory, subcategory?: string): string {
  return ICON[garmentKey(mainCategory, subcategory)];
}

// Wnętrze SVG (bez znacznika <svg>) dla każdej sylwetki, viewBox 0 0 96 96.
// `{c}` jest podmieniane na docelowy kolor. Rysunki są celowo proste — mają
// czytać się jako rodzaj ubioru już w małym kafelku.
const BODIES: Record<GarmentKey, string> = {
  tshirt:
    '<path fill="{c}" d="M39 18l-14 7-11 15 9 9 6-6v34h38V43l6 6 9-9-11-15-14-7c-3 6-15 6-18 0z"/>',
  shirt:
    '<path fill="{c}" d="M39 18l-14 8-10 14 8 8 6-6v34h38V42l6 6 8-8-10-14-14-8z"/>' +
    '<rect x="46.5" y="27" width="3" height="53" fill="{bg}"/>' +
    '<path fill="{bg}" d="M39 18l9 12 9-12-9 5-9-5z"/>' +
    '<circle cx="48" cy="40" r="1.7" fill="{c}"/><circle cx="48" cy="50" r="1.7" fill="{c}"/><circle cx="48" cy="60" r="1.7" fill="{c}"/><circle cx="48" cy="70" r="1.7" fill="{c}"/>',
  tank:
    '<path fill="{c}" d="M37 18c-1 6-8 9-13 12v58h48V30c-5-3-12-6-13-12-2 7-20 7-22 0z"/>',
  sweater:
    '<path fill="{c}" d="M38 18l-18 8-9 18 9 6 5-9v45h46V47l5 9 9-6-9-18-18-8c-3 7-17 7-20 0z"/>',
  hoodie:
    '<path fill="{c}" d="M40 22l-18 8-9 18 9 6 5-9v45h46V47l5 9 9-6-9-18-18-8z"/>' +
    '<path fill="{c}" d="M30 22c2 13 34 13 36 0 3 7-2 14-9 16-4-6-14-6-18 0-7-2-12-9-9-16z"/>' +
    '<rect x="35" y="58" width="26" height="16" rx="5" fill="{bg}"/>' +
    '<rect x="44.5" y="34" width="2.5" height="13" rx="1.2" fill="{bg}"/>' +
    '<rect x="49" y="34" width="2.5" height="13" rx="1.2" fill="{bg}"/>',
  pants:
    '<path fill="{c}" d="M31 16h34l-2 20-3 44H49l-4-40-4 40H26l-3-44-2-20z"/>',
  shorts:
    '<path fill="{c}" d="M30 18h36l-1 14-3 26H48l-3-24-3 24H33l-3-26-1-14z"/>',
  skirt:
    '<path fill="{c}" d="M32 20h32l3 8-11 4 11 4-16 4-16-4 11-4-11-4 3-8z"/>' +
    '<path fill="{c}" d="M28 40h40l6 38H22l6-38z"/>',
  dress:
    '<path fill="{c}" d="M38 16l-9 6 4 14-6 6 8 6-9 34h44l-9-34 8-6-6-6 4-14-9-6c-3 6-17 6-20 0z"/>',
  jumpsuit:
    '<path fill="{c}" d="M37 16c-2 7-9 8-13 12l4 10-4 6 5 6-3 38h13l3-34 3 34h13l-3-38 5-6-4-6 4-10c-4-4-11-5-13-12-2 6-15 6-17 0z"/>',
  coat:
    '<path fill="{c}" d="M40 16l-16 8-9 20 9 6 5-11v43h11V40l4 40h6V40l4 40h11V39l5 11 9-6-9-20-16-8-9 12-9-12zM45 20l3 12 3-12-3 3z"/>',
  vest:
    '<path fill="{c}" d="M40 18l-14 7v57h13l3-40 3 40h13V25l-14-7-4 12-4-12z"/>',
  sneaker:
    '<path fill="{c}" d="M12 52c0-8 5-13 5-13l6 3 3-6 5 4 3-5 24 12c7 3 13 4 19 5 4 1 6 3 6 7v6H14c-2 0-2-2-2-4v-9z"/>' +
    '<path fill="{c}" d="M12 64h72v5H12z"/>',
  boot:
    '<path fill="{c}" d="M34 14h14l2 30c0 4 3 6 7 8l14 8c3 2 5 4 5 8v6H30c-3 0-4-2-4-5V44l8-2-8-2V14z"/>',
  heel:
    '<path fill="{c}" d="M20 40c14 0 26 6 40 18 6 5 12 8 20 9v9H24l-4-14V40z"/>' +
    '<path fill="{c}" d="M22 60h6l3 22h-6l-3-22z"/>',
  sandal:
    '<path fill="{c}" d="M18 58h56c4 0 6 2 6 6s-2 6-6 6H18c-4 0-6-2-6-6s2-6 6-6z"/>' +
    '<path fill="{c}" d="M24 30l14 26h-8L18 32l6-2zM48 26l12 30h-8L40 30l8-4z"/>',
  flat:
    '<path fill="{c}" d="M14 52c14-4 40-4 62 2 6 2 8 6 8 10 0 4-4 6-9 6H22c-6 0-10-3-11-8-1-4 0-8 3-10z"/>' +
    '<path fill="{c}" d="M44 46c3 0 6 3 6 7h-12c0-4 3-7 6-7z"/>',
  bag:
    '<path fill="none" stroke="{c}" stroke-width="5" d="M34 34v-4c0-8 6-14 14-14s14 6 14 14v4"/>' +
    '<path fill="{c}" d="M24 34h48l6 46H18l6-46z"/>',
  backpack:
    '<path fill="none" stroke="{c}" stroke-width="5" d="M40 24c0-6 3-10 8-10s8 4 8 10"/>' +
    '<path fill="{c}" d="M30 26h36c5 0 9 4 9 9v37c0 5-4 9-9 9H30c-5 0-9-4-9-9V35c0-5 4-9 9-9z"/>' +
    '<rect x="38" y="48" width="20" height="22" rx="4" fill="{bg}"/>' +
    '<rect x="44" y="52" width="8" height="6" rx="3" fill="{c}"/>',
  beanie:
    '<path fill="{c}" d="M22 56c0-16 12-28 26-28s26 12 26 28H22z"/>' +
    '<path fill="{c}" d="M18 56h60v10H18z"/>',
  hat:
    '<path fill="{c}" d="M34 30c0-6 6-12 14-12s14 6 14 12v18H34V30z"/>' +
    '<path fill="{c}" d="M12 52c0-4 4-6 10-7h52c6 1 10 3 10 7 0 5-16 8-36 8s-36-3-36-8z"/>',
  scarf:
    '<path fill="{c}" d="M28 18c10 8 30 8 40 0 4 8 0 16-8 20l6 40h-9l-4-32-4 32h-9l6-40c-8-4-12-12-8-20z"/>',
  gloves:
    '<path fill="{c}" d="M34 40V22c0-3 4-3 4 0v14l3-16c1-3 5-2 4 1l-2 15 4-13c1-3 5-2 4 1l-3 14 4-9c1-3 5-1 4 2l-6 20c-2 8-6 12-6 20v10H36V56c-4-2-8-6-8-12 0-4 6-4 6 0v-4z"/>',
  belt:
    '<path fill="{c}" d="M12 42h58v12H12z"/>' +
    '<path fill="{c}" d="M66 38h18v20H66z"/>' +
    '<rect x="72" y="44" width="6" height="8" rx="2" fill="{bg}"/>',
  jewelry:
    '<path fill="none" stroke="{c}" stroke-width="5" d="M24 22c0 22 10 34 24 34s24-12 24-34"/>' +
    '<path fill="{c}" d="M48 54l7 12-7 12-7-12 7-12z"/>',
  sunglasses:
    '<path fill="none" stroke="{c}" stroke-width="5" d="M40 40h16"/>' +
    '<path fill="none" stroke="{c}" stroke-width="5" d="M20 40l-6-6M76 40l6-6"/>' +
    '<path fill="{c}" d="M14 40h26c2 0 3 1 3 3 0 10-6 15-14 15S14 55 14 46v-6z"/>' +
    '<path fill="{c}" d="M56 40h26v6c0 9-5 12-13 12s-16-5-16-15c0-2 1-3 3-3z"/>',
  umbrella:
    '<path fill="{c}" d="M48 16c20 0 36 14 38 30-6-5-11-5-16 0-5-5-11-5-16 0-3-4-3-4-6 0-5-5-11-5-16 0-5-5-10-5-16 0 2-16 18-30 38-30z"/>' +
    '<path fill="none" stroke="{c}" stroke-width="5" d="M48 46v26c0 6-4 10-10 10s-10-4-10-9"/>',
  tights:
    '<path fill="{c}" d="M34 14h28l-2 16-4 52h-9l-3-40-3 40h-9l-4-52-2-16z"/>',
  socks:
    '<path fill="{c}" d="M34 16h20v34c0 6 2 8 8 12l10 6c4 3 6 6 6 11 0 4-3 7-7 7-3 0-5-1-8-3L44 74c-6-4-10-9-10-18V16z"/>',
};

function buildSvg(body: string, color: string, bg: string): string {
  const inner = body.replace(/\{c\}/g, color).replace(/\{bg\}/g, bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${inner}</svg>`;
}

// Zwraca gotowy do <img src=…> data URI ilustracji rodzaju rzeczy.
// `bg` (kolor tła kafelka) służy do „wycinania" detali, np. sprzączki paska.
export function garmentDataUri(
  mainCategory: MainCategory,
  subcategory: string | undefined,
  color: string,
  bg: string
): string {
  const svg = buildSvg(BODIES[garmentKey(mainCategory, subcategory)], color, bg);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
