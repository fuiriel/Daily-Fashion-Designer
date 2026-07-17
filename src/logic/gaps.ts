import { DEFAULT_STORES, slotOf } from '../data/constants';
import { itemFormality } from './stylist';
import { GapSuggestion, StorePref, WardrobeItem } from '../types';

interface CapsuleRule {
  what: string;
  why: string;
  check: (items: WardrobeItem[]) => boolean;
}

const has = (items: WardrobeItem[], pred: (i: WardrobeItem) => boolean) => items.some(pred);

// minimalna "kapsułka" — czego dobrze mieć przynajmniej po jednej sztuce
const RULES: CapsuleRule[] = [
  {
    what: 'Ciepła kurtka lub płaszcz (zima)',
    why: 'Brak wierzchniego okrycia na temperatury poniżej 5°C.',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth >= 4),
  },
  {
    what: 'Kurtka przejściowa',
    why: 'Przyda się wiosną i jesienią (8–15°C).',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && i.warmth === 3),
  },
  {
    what: 'Kurtka lub płaszcz przeciwdeszczowy',
    why: 'Nic w szafie nie jest oznaczone jako nieprzemakalne okrycie.',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'outerwear' && !!i.waterproof),
  },
  {
    what: 'Buty na deszcz (kalosze lub nieprzemakalne)',
    why: 'W deszczowe dni nie masz w czym wyjść z domu.',
    check: (items) =>
      has(
        items,
        (i) =>
          slotOf(i.mainCategory, i.subcategory) === 'shoes' &&
          (!!i.waterproof || i.subcategory === 'kalosze')
      ),
  },
  {
    what: 'Ciepłe buty na zimę',
    why: 'Brak krytych, ciepłych butów (kozaki, botki) na mrozy.',
    check: (items) =>
      has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && i.warmth >= 4),
  },
  {
    what: 'Wygodne buty na co dzień (sneakersy)',
    why: 'Podstawa codziennych i sportowych kompozycji.',
    check: (items) =>
      has(items, (i) => ['sneakersy', 'buty sportowe'].includes(i.subcategory)),
  },
  {
    what: 'Eleganckie buty',
    why: 'Potrzebne na wesele, przyjęcie lub inną formalną okazję.',
    check: (items) =>
      has(
        items,
        (i) => slotOf(i.mainCategory, i.subcategory) === 'shoes' && itemFormality(i) >= 4
      ),
  },
  {
    what: 'Elegancka sukienka lub komplet',
    why: 'Na wesele czy przyjęcie przyda się formalna baza kompozycji.',
    check: (items) =>
      has(
        items,
        (i) =>
          itemFormality(i) >= 4 &&
          ['dress', 'top'].includes(slotOf(i.mainCategory, i.subcategory))
      ),
  },
  {
    what: 'Ciemny, stonowany strój',
    why: 'Na pogrzeb potrzebna jest rzecz w czerni, szarości lub granacie.',
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
    what: 'Biała koszula lub bluzka',
    why: 'Uniwersalna baza — pasuje niemal do wszystkiego.',
    check: (items) =>
      has(
        items,
        (i) =>
          ['koszula', 'bluzka'].includes(i.subcategory) && i.colors.includes('biały')
      ),
  },
  {
    what: 'Jeansy lub uniwersalne spodnie',
    why: 'Podstawa większości codziennych kompozycji.',
    check: (items) => has(items, (i) => slotOf(i.mainCategory, i.subcategory) === 'bottom'),
  },
  {
    what: 'Ciepły sweter',
    why: 'Niezbędny jesienią i zimą jako warstwa pod kurtkę.',
    check: (items) => has(items, (i) => i.subcategory === 'sweter' && i.warmth >= 4),
  },
  {
    what: 'Strój sportowy',
    why: 'Na rower, siłownię czy jogging.',
    check: (items) => has(items, (i) => i.styles.includes('sportowy')),
  },
  {
    what: 'Parasol',
    why: 'Ratuje każdą kompozycję w deszczowy dzień.',
    check: (items) => has(items, (i) => i.subcategory === 'parasol'),
  },
  {
    what: 'Szalik, czapka i rękawiczki',
    why: 'Zimowe akcesoria — brakuje przynajmniej jednego z nich.',
    check: (items) =>
      ['szalik', 'czapka', 'rękawiczki'].every((sub) =>
        has(items, (i) => i.subcategory === sub)
      ),
  },
  {
    what: 'Torebka lub plecak',
    why: 'Praktyczne dopełnienie każdego wyjścia.',
    check: (items) => has(items, (i) => ['torebka', 'plecak'].includes(i.subcategory)),
  },
];

export function analyzeGaps(items: WardrobeItem[], stores: StorePref[]): GapSuggestion[] {
  const favStores = stores.filter((s) => s.favorite).map((s) => s.name);
  const otherStores = stores.filter((s) => !s.favorite).map((s) => s.name);
  const whereToBuy = [...favStores, ...otherStores];
  const fallback = DEFAULT_STORES;
  const where = whereToBuy.length ? whereToBuy.slice(0, 3) : fallback.slice(0, 3);

  return RULES.filter((r) => !r.check(items)).map((r) => ({
    what: r.what,
    why: r.why,
    whereToBuy: where,
  }));
}
