import {
  COLOR_FAMILY,
  NEUTRAL_COLORS,
  OCCASION_FORMALITY,
  STYLE_FORMALITY,
  slotOf,
} from '../data/constants';
import {
  Occasion,
  OutfitSuggestion,
  Season,
  Slot,
  StylistRequest,
  WardrobeItem,
  WeatherInfo,
} from '../types';

// Jak ciepłe ubranie jest potrzebne przy danej temperaturze odczuwalnej (1-5)
export function warmthNeed(weather: WeatherInfo, night = false): number {
  const t = weather.feelsLikeC - (night ? 3 : 0);
  if (t <= 0) return 5;
  if (t <= 8) return 4;
  if (t <= 15) return 3;
  if (t <= 22) return 2;
  return 1;
}

export function seasonFromWeather(weather: WeatherInfo): Season {
  const t = weather.tempC;
  if (t <= 5) return 'zima';
  if (t <= 14) return 'jesień';
  if (t <= 21) return 'wiosna';
  return 'lato';
}

function itemFormality(item: WardrobeItem): number {
  if (!item.styles.length) return 3;
  return Math.max(...item.styles.map((s) => STYLE_FORMALITY[s]));
}

function fitsOccasion(item: WardrobeItem, occasion: Occasion): boolean {
  // jawnie przypisana okazja zawsze pasuje
  if (item.occasions.includes(occasion)) return true;
  // rzeczy bez przypisanych okazji oceniamy po formalności stylu
  if (item.occasions.length > 0 && ['wesele', 'pogrzeb', 'przyjęcie'].includes(occasion)) {
    return false; // na formalne okazje tylko rzeczy jawnie dopasowane lub bez przypisań
  }
  const needed = OCCASION_FORMALITY[occasion];
  const formality = itemFormality(item);
  if (needed >= 4) return formality >= 4;
  if (needed <= 1) return formality <= 3;
  return Math.abs(formality - needed) <= 2;
}

function fitsSeason(item: WardrobeItem, season: Season): boolean {
  return item.seasons.length === 0 || item.seasons.includes(season);
}

function scoreItem(item: WardrobeItem, req: StylistRequest, need: number): number {
  let score = 0;
  if (item.favorite) score += 3; // ulubione mają priorytet
  score += item.styles.filter((s) => req.styles.includes(s)).length * 2;
  if (item.occasions.includes(req.occasion)) score += 2.5;

  const slot = slotOf(item.mainCategory, item.subcategory);
  if (slot === 'outerwear' || slot === 'shoes' || slot === 'accessory') {
    score += 1.5 - Math.abs(item.warmth - need) * 0.75;
  } else {
    score += 2 - Math.abs(item.warmth - need);
  }

  // pogoda: deszcz/śnieg
  if (req.weather.isRain || req.weather.isSnow) {
    if (item.waterproof) score += 1.5;
    if (item.subcategory === 'kalosze') score += 1.5;
    if (item.subcategory === 'parasol') score += 3;
    if (['sandały', 'baleriny', 'szpilki'].includes(item.subcategory)) score -= 2;
  }

  // pora dnia
  if (req.timeOfDay === 'wieczór' && itemFormality(item) >= 4) score += 0.5;
  if (item.subcategory === 'okulary przeciwsłoneczne' && req.timeOfDay !== 'dzień') score -= 4;

  // okazje specjalne
  if (req.occasion === 'pogrzeb') {
    const dark = item.colors.every((c) => ['czarny', 'szary', 'granatowy'].includes(c));
    score += dark ? 3 : -5;
  }
  if (req.occasion === 'rower' || req.occasion === 'sport') {
    if (item.styles.includes('sportowy')) score += 2;
    if (['szpilki', 'sukienka', 'spódnica'].includes(item.subcategory)) score -= 4;
  }
  if (req.occasion === 'wesele' && item.colors.includes('biały') && slot === 'dress') {
    score -= 5; // biała sukienka jest zarezerwowana dla panny młodej
  }
  return score;
}

// premia za spójność kolorystyczną całej kompozycji
function colorHarmonyBonus(items: WardrobeItem[]): number {
  const nonNeutral = new Set<string>();
  const families = new Set<string>();
  for (const it of items) {
    for (const c of it.colors) {
      if (!NEUTRAL_COLORS.has(c) && c !== 'wielokolorowy') {
        nonNeutral.add(c);
        const fam = COLOR_FAMILY[c];
        if (fam) families.add(fam);
      }
    }
  }
  if (nonNeutral.size === 0) return 2; // total look w neutralnych kolorach
  if (nonNeutral.size === 1) return 2.5; // jeden akcent kolorystyczny
  if (nonNeutral.size === 2 && families.size <= 1) return 1.5;
  if (nonNeutral.size <= 2) return 0.5;
  return -1.5; // zbyt wiele mocnych kolorów naraz
}

function patternClashPenalty(items: WardrobeItem[]): number {
  const patterned = items.filter((i) => i.pattern !== 'gładki').length;
  return patterned > 1 ? -1.5 * (patterned - 1) : 0;
}

interface Pool {
  top: WardrobeItem[];
  bottom: WardrobeItem[];
  dress: WardrobeItem[];
  outerwear: WardrobeItem[];
  shoes: WardrobeItem[];
  accessory: WardrobeItem[];
}

function buildPool(items: WardrobeItem[], req: StylistRequest): Pool {
  const season = seasonFromWeather(req.weather);
  const pool: Pool = { top: [], bottom: [], dress: [], outerwear: [], shoes: [], accessory: [] };
  for (const item of items) {
    if (!fitsSeason(item, season)) continue;
    if (!fitsOccasion(item, req.occasion)) continue;
    const slot = slotOf(item.mainCategory, item.subcategory);
    // preferencja: sukienka vs spodnie vs spódnica
    if (req.bottomPreference === 'sukienka' && slot === 'bottom') continue;
    if (req.bottomPreference === 'spodnie' && slot === 'dress') continue;
    if (req.bottomPreference === 'spodnie' && item.subcategory === 'spódnica') continue;
    if (req.bottomPreference === 'spódnica' && slot === 'dress') continue;
    if (req.bottomPreference === 'spódnica' && slot === 'bottom' && item.subcategory !== 'spódnica')
      continue;
    pool[slot].push(item);
  }
  return pool;
}

function sortByScore(items: WardrobeItem[], req: StylistRequest, need: number): WardrobeItem[] {
  return [...items].sort((a, b) => scoreItem(b, req, need) - scoreItem(a, req, need));
}

export function suggestOutfits(
  allItems: WardrobeItem[],
  req: StylistRequest,
  count = 3
): OutfitSuggestion[] {
  const need = warmthNeed(req.weather, req.timeOfDay === 'noc');
  const pool = buildPool(allItems, req);
  const needOuterwear = need >= 3 || req.weather.isRain || req.weather.isSnow;

  const tops = sortByScore(pool.top, req, need).slice(0, 4);
  const bottoms = sortByScore(pool.bottom, req, need).slice(0, 4);
  const dresses = sortByScore(pool.dress, req, need).slice(0, 4);
  const outers = sortByScore(pool.outerwear, req, need).slice(0, 3);
  const shoes = sortByScore(pool.shoes, req, need).slice(0, 3);
  const accessories = sortByScore(pool.accessory, req, need).slice(0, 5);

  // wszystkie sensowne kombinacje bazy (sukienka albo góra+dół)
  const bases: WardrobeItem[][] = [];
  if (req.bottomPreference !== 'spodnie' && req.bottomPreference !== 'spódnica') {
    for (const d of dresses) bases.push([d]);
  }
  if (req.bottomPreference !== 'sukienka') {
    for (const t of tops) for (const b of bottoms) bases.push([t, b]);
  }

  const candidates: OutfitSuggestion[] = [];
  for (const base of bases) {
    const combo = [...base];
    const missing: string[] = [];

    if (needOuterwear) {
      if (outers.length) combo.push(outers[0]);
      else missing.push(req.weather.isRain ? 'kurtka przeciwdeszczowa' : 'ciepła kurtka lub płaszcz');
    }
    if (shoes.length) combo.push(shoes[0]);
    else missing.push('buty pasujące do tej okazji');

    // 1-2 akcesoria; parasol przy deszczu ma pierwszeństwo
    const acc = accessories.filter((a) => {
      if (a.subcategory === 'parasol') return req.weather.isRain;
      if (a.subcategory === 'szalik' || a.subcategory === 'rękawiczki') return need >= 4;
      if (a.subcategory === 'czapka') return need >= 4 || req.weather.tempC >= 25;
      return true;
    });
    combo.push(...acc.slice(0, 2));
    if (req.weather.isRain && !acc.some((a) => a.subcategory === 'parasol')) {
      missing.push('parasol');
    }

    let score = combo.reduce((sum, item) => sum + scoreItem(item, req, need), 0) / combo.length;
    score += colorHarmonyBonus(combo) + patternClashPenalty(combo);
    score -= missing.length * 0.5;

    candidates.push({ items: combo, score, missing, explanation: [] });
  }

  candidates.sort((a, b) => b.score - a.score);

  // różnorodność: kolejne propozycje muszą różnić się bazą
  const picked: OutfitSuggestion[] = [];
  const usedBaseKeys = new Set<string>();
  for (const c of candidates) {
    const baseKey = c.items
      .filter((i) => ['top', 'bottom', 'dress'].includes(slotOf(i.mainCategory, i.subcategory)))
      .map((i) => i.id)
      .sort()
      .join('|');
    if (usedBaseKeys.has(baseKey)) continue;
    usedBaseKeys.add(baseKey);
    c.explanation = explain(c, req, need);
    picked.push(c);
    if (picked.length >= count) break;
  }
  return picked;
}

function explain(suggestion: OutfitSuggestion, req: StylistRequest, need: number): string[] {
  const notes: string[] = [];
  const w = req.weather;
  notes.push(
    `Pogoda: ${w.tempC}°C (odczuwalna ${w.feelsLikeC}°C), ${w.description} — dobrano rzeczy o cieple ~${need}/5.`
  );
  if (w.isRain) notes.push('Zapowiada się deszcz — postaw na nieprzemakalne buty i parasol.');
  if (w.isSnow) notes.push('Śnieg — ciepłe, kryte buty będą najlepsze.');
  const favs = suggestion.items.filter((i) => i.favorite);
  if (favs.length) notes.push(`Uwzględniono Twoje ulubione: ${favs.map((f) => f.name).join(', ')}.`);
  const styleMatch = suggestion.items.filter((i) => i.styles.some((s) => req.styles.includes(s)));
  if (req.styles.length && styleMatch.length)
    notes.push(`Kompozycja trzyma się stylu: ${req.styles.join(', ')}.`);
  if (req.occasion === 'pogrzeb') notes.push('Stonowane, ciemne kolory odpowiednie na tę okazję.');
  if (req.occasion === 'wesele') notes.push('Elegancko, ale bez bieli — ta jest zarezerwowana dla panny młodej.');
  return notes;
}

export { fitsOccasion, fitsSeason, itemFormality, scoreItem };
