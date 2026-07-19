import { slotOf } from '../data/constants';
import { itemFormality } from './stylist';
import { GapPrefill, GapStoreLink, GapSuggestion, StorePref, WardrobeItem, isItemActive } from '../types';

// kategoria zakupowa reguły — dobiera sklepy pasujące do danej części garderoby
type StoreCategory = 'clothes' | 'elegant' | 'sport' | 'shoes' | 'bags' | 'accessories';

interface CapsuleRule {
  id: string; // klucz tekstów w i18n (GAP_TEXTS)
  icon: string; // MaterialCommunityIcons
  storeCategory: StoreCategory;
  check: (items: WardrobeItem[]) => boolean;
}

// dane startowe formularza dodawania dla każdej reguły
const PREFILLS: Record<string, GapPrefill> = {
  warmOuter: { mainCategory: 'ubrania', subcategory: 'kurtka', warmth: 5 },
  midOuter: { mainCategory: 'ubrania', subcategory: 'kurtka', warmth: 3 },
  rainOuter: { mainCategory: 'ubrania', subcategory: 'kurtka', warmth: 3, waterproof: true },
  rainShoes: { mainCategory: 'buty', subcategory: 'kalosze', warmth: 2, waterproof: true },
  winterShoes: { mainCategory: 'buty', subcategory: 'kozaki', warmth: 4 },
  sneakers: { mainCategory: 'buty', subcategory: 'sneakersy', warmth: 2, styles: ['casual'] },
  elegantShoes: { mainCategory: 'buty', subcategory: 'szpilki', warmth: 1, styles: ['elegancki'] },
  elegantBase: { mainCategory: 'ubrania', subcategory: 'sukienka', warmth: 2, styles: ['elegancki'] },
  darkSet: { mainCategory: 'ubrania', subcategory: 'sukienka', warmth: 2, colors: ['czarny'] },
  whiteShirt: { mainCategory: 'ubrania', subcategory: 'koszula', warmth: 2, colors: ['biały'] },
  bottoms: { mainCategory: 'ubrania', subcategory: 'jeansy', warmth: 3 },
  warmSweater: { mainCategory: 'ubrania', subcategory: 'sweter', warmth: 4 },
  sportSet: { mainCategory: 'ubrania', subcategory: 'bluza', warmth: 2, styles: ['sportowy'] },
  umbrella: { mainCategory: 'akcesoria', subcategory: 'parasol', warmth: 2, waterproof: true },
  winterAcc: { mainCategory: 'akcesoria', subcategory: 'szalik', warmth: 4 },
  bag: { mainCategory: 'akcesoria', subcategory: 'torebka', warmth: 2 },
};

const has = (items: WardrobeItem[], pred: (i: WardrobeItem) => boolean) => items.some(pred);

// minimalna "kapsułka" — czego dobrze mieć przynajmniej po jednej sztuce
const RULES: CapsuleRule[] = [
  {
    id: 'warmOuter',
    storeCategory: 'clothes',
    icon: 'snowflake',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth >= 4),
  },
  {
    id: 'midOuter',
    storeCategory: 'clothes',
    icon: 'weather-windy',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth === 3),
  },
  {
    id: 'rainOuter',
    storeCategory: 'clothes',
    icon: 'weather-pouring',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && !!i.waterproof),
  },
  {
    id: 'rainShoes',
    storeCategory: 'shoes',
    icon: 'shoe-cleat',
    check: (items) =>
      has(
        items,
        (i) =>
          slotOf(i.mainCategory, i.subcategory) === 'shoes' &&
          (!!i.waterproof || i.subcategory === 'kalosze')
      ),
  },
  {
    id: 'winterShoes',
    storeCategory: 'shoes',
    icon: 'snowflake-alert',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && i.warmth >= 4),
  },
  {
    id: 'sneakers',
    storeCategory: 'shoes',
    icon: 'shoe-sneaker',
    check: (items) => has(items, (i) => ['sneakersy', 'buty sportowe'].includes(i.subcategory)),
  },
  {
    id: 'elegantShoes',
    storeCategory: 'shoes',
    icon: 'shoe-heel',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && itemFormality(i) >= 4),
  },
  {
    id: 'elegantBase',
    storeCategory: 'elegant',
    icon: 'hanger',
    check: (items) =>
      has(
        items,
        (i) => itemFormality(i) >= 4 && ['dress', 'top'].includes(slotOf(i.mainCategory, i.subcategory))
      ),
  },
  {
    id: 'darkSet',
    storeCategory: 'elegant',
    icon: 'tshirt-crew',
    check: (items) =>
      has(
        items,
        (i) =>
          ['dress', 'top', 'bottom'].includes(slotOf(i.mainCategory, i.subcategory)) &&
          i.colors.length > 0 &&
          i.colors.every((c) => ['czarny', 'szary', 'granatowy'].includes(c))
      ),
  },
  {
    id: 'whiteShirt',
    storeCategory: 'elegant',
    icon: 'tshirt-crew-outline',
    check: (items) =>
      has(items, (i) => ['koszula', 'bluzka'].includes(i.subcategory) && i.colors.includes('biały')),
  },
  {
    id: 'bottoms',
    storeCategory: 'clothes',
    icon: 'seat-legroom-normal',
    check: (items) => has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'bottom'),
  },
  {
    id: 'warmSweater',
    storeCategory: 'clothes',
    icon: 'sausage', // brak dedykowanej ikony swetra; przybliżenie zastępujemy niżej
    check: (items) => has(items, (i) => i.subcategory === 'sweter' && i.warmth >= 4),
  },
  {
    id: 'sportSet',
    storeCategory: 'sport',
    icon: 'dumbbell',
    check: (items) => has(items, (i) => i.styles.includes('sportowy')),
  },
  {
    id: 'umbrella',
    storeCategory: 'accessories',
    icon: 'umbrella',
    check: (items) => has(items, (i) => i.subcategory === 'parasol'),
  },
  {
    id: 'winterAcc',
    storeCategory: 'accessories',
    icon: 'snowman',
    check: (items) =>
      ['szalik', 'czapka', 'rękawiczki'].every((sub) => has(items, (i) => i.subcategory === sub)),
  },
  {
    id: 'bag',
    storeCategory: 'bags',
    icon: 'bag-personal',
    check: (items) => has(items, (i) => ['torebka', 'plecak'].includes(i.subcategory)),
  },
];

// poprawka ikony dla swetra (dostępna w MaterialCommunityIcons)
RULES.find((r) => r.id === 'warmSweater')!.icon = 'tshirt-v';

// Sklepy dopasowane do rodzaju części garderoby. Zawsze można je nadpisać
// własnymi ulubionymi sklepami (serduszko w zakładce Budżet).
const STORE_LINKS: Record<string, GapStoreLink> = {
  Zalando: { name: 'Zalando', url: 'https://www.zalando.pl' },
  Zara: { name: 'Zara', url: 'https://www.zara.com/pl' },
  'H&M': { name: 'H&M', url: 'https://www2.hm.com/pl_pl' },
  Reserved: { name: 'Reserved', url: 'https://www.reserved.com/pl/pl' },
  Mohito: { name: 'Mohito', url: 'https://www.mohito.com/pl/pl' },
  Uniqlo: { name: 'Uniqlo', url: 'https://www.uniqlo.com/pl' },
  Mango: { name: 'Mango', url: 'https://shop.mango.com/pl' },
  Vistula: { name: 'Vistula', url: 'https://vistula.pl' },
  'Wólczanka': { name: 'Wólczanka', url: 'https://www.wolczanka.pl' },
  Oysho: { name: 'Oysho', url: 'https://www.oysho.com/pl' },
  '4F': { name: '4F', url: 'https://4f.com.pl' },
  Decathlon: { name: 'Decathlon', url: 'https://www.decathlon.pl' },
  eobuwie: { name: 'eobuwie', url: 'https://www.eobuwie.com.pl' },
  CCC: { name: 'CCC', url: 'https://ccc.eu/pl' },
  Deichmann: { name: 'Deichmann', url: 'https://www.deichmann.com/pl-pl' },
  Parfois: { name: 'Parfois', url: 'https://www.parfois.com/pl' },
  Allegro: { name: 'Allegro', url: 'https://allegro.pl' },
};

const STORES_BY_CATEGORY: Record<StoreCategory, string[]> = {
  clothes: ['Zalando', 'Uniqlo', 'H&M', 'Reserved', 'Zara'],
  elegant: ['Zara', 'Mohito', 'Vistula', 'Wólczanka'],
  sport: ['Oysho', '4F', 'Decathlon', 'Zalando'],
  shoes: ['eobuwie', 'CCC', 'Deichmann', 'Zalando'],
  bags: ['Wólczanka', 'Parfois', 'Zalando', 'CCC'],
  accessories: ['Parfois', 'H&M', 'Uniqlo', 'Allegro'],
};

export const DEFAULT_STORE_LINKS: GapStoreLink[] = Object.values(STORE_LINKS);

function storesFor(category: StoreCategory, userStores: StorePref[]): GapStoreLink[] {
  // ulubione sklepy użytkowniczki mają pierwszeństwo (maks. 2),
  // resztę dobieramy z listy dopasowanej do kategorii
  const favs: GapStoreLink[] = userStores
    .filter((s) => s.favorite)
    .slice(0, 2)
    .map((s) => ({ name: s.name, url: s.url }));
  const defaults = STORES_BY_CATEGORY[category]
    .map((name) => STORE_LINKS[name])
    .filter((s) => !favs.some((f) => f.name.toLowerCase() === s.name.toLowerCase()));
  return [...favs, ...defaults].slice(0, 4);
}

export function analyzeGaps(allItems: WardrobeItem[], stores: StorePref[]): GapSuggestion[] {
  const items = allItems.filter(isItemActive);
  return RULES.filter((r) => !r.check(items)).map((r) => ({
    id: r.id,
    icon: r.icon,
    whereToBuy: storesFor(r.storeCategory, stores),
    prefill: PREFILLS[r.id],
  }));
}
