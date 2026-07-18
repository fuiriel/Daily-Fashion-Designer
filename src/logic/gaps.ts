import { slotOf } from '../data/constants';
import { itemFormality } from './stylist';
import { GapStoreLink, GapSuggestion, StorePref, WardrobeItem, isItemActive } from '../types';

interface CapsuleRule {
  id: string; // klucz tekstów w i18n (GAP_TEXTS)
  icon: string; // MaterialCommunityIcons
  check: (items: WardrobeItem[]) => boolean;
}

const has = (items: WardrobeItem[], pred: (i: WardrobeItem) => boolean) => items.some(pred);

// minimalna "kapsułka" — czego dobrze mieć przynajmniej po jednej sztuce
const RULES: CapsuleRule[] = [
  {
    id: 'warmOuter',
    icon: 'snowflake',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth >= 4),
  },
  {
    id: 'midOuter',
    icon: 'weather-windy',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth === 3),
  },
  {
    id: 'rainOuter',
    icon: 'weather-pouring',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && !!i.waterproof),
  },
  {
    id: 'rainShoes',
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
    icon: 'snowflake-alert',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && i.warmth >= 4),
  },
  {
    id: 'sneakers',
    icon: 'shoe-sneaker',
    check: (items) => has(items, (i) => ['sneakersy', 'buty sportowe'].includes(i.subcategory)),
  },
  {
    id: 'elegantShoes',
    icon: 'shoe-heel',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && itemFormality(i) >= 4),
  },
  {
    id: 'elegantBase',
    icon: 'hanger',
    check: (items) =>
      has(
        items,
        (i) => itemFormality(i) >= 4 && ['dress', 'top'].includes(slotOf(i.mainCategory, i.subcategory))
      ),
  },
  {
    id: 'darkSet',
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
    icon: 'tshirt-crew-outline',
    check: (items) =>
      has(items, (i) => ['koszula', 'bluzka'].includes(i.subcategory) && i.colors.includes('biały')),
  },
  {
    id: 'bottoms',
    icon: 'seat-legroom-normal',
    check: (items) => has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'bottom'),
  },
  {
    id: 'warmSweater',
    icon: 'sausage', // brak dedykowanej ikony swetra; przybliżenie zastępujemy niżej
    check: (items) => has(items, (i) => i.subcategory === 'sweter' && i.warmth >= 4),
  },
  {
    id: 'sportSet',
    icon: 'dumbbell',
    check: (items) => has(items, (i) => i.styles.includes('sportowy')),
  },
  {
    id: 'umbrella',
    icon: 'umbrella',
    check: (items) => has(items, (i) => i.subcategory === 'parasol'),
  },
  {
    id: 'winterAcc',
    icon: 'gloves',
    check: (items) =>
      ['szalik', 'czapka', 'rękawiczki'].every((sub) => has(items, (i) => i.subcategory === sub)),
  },
  {
    id: 'bag',
    icon: 'bag-personal',
    check: (items) => has(items, (i) => ['torebka', 'plecak'].includes(i.subcategory)),
  },
];

// poprawka ikony dla swetra (dostępna w MaterialCommunityIcons)
RULES.find((r) => r.id === 'warmSweater')!.icon = 'tshirt-v';

// Adresy popularnych sklepów — używane, gdy użytkowniczka nie doda własnych.
export const DEFAULT_STORE_LINKS: GapStoreLink[] = [
  { name: 'Zalando', url: 'https://www.zalando.pl' },
  { name: 'Zara', url: 'https://www.zara.com/pl' },
  { name: 'H&M', url: 'https://www2.hm.com/pl_pl' },
  { name: 'Reserved', url: 'https://www.reserved.com/pl/pl' },
  { name: 'Mohito', url: 'https://www.mohito.com/pl/pl' },
  { name: 'CCC', url: 'https://ccc.eu/pl' },
  { name: 'eobuwie', url: 'https://www.eobuwie.com.pl' },
  { name: 'Allegro', url: 'https://allegro.pl' },
];

export function analyzeGaps(allItems: WardrobeItem[], stores: StorePref[]): GapSuggestion[] {
  const items = allItems.filter(isItemActive);
  const favStores: GapStoreLink[] = stores
    .filter((s) => s.favorite)
    .map((s) => ({ name: s.name, url: s.url }));
  const otherStores: GapStoreLink[] = stores
    .filter((s) => !s.favorite)
    .map((s) => ({ name: s.name, url: s.url }));
  const userStores = [...favStores, ...otherStores];
  const where = (userStores.length ? userStores : DEFAULT_STORE_LINKS).slice(0, 3);

  return RULES.filter((r) => !r.check(items)).map((r) => ({
    id: r.id,
    icon: r.icon,
    whereToBuy: where,
  }));
}
