import { slotOf } from '../data/constants';
import { DailyForecast } from '../services/weather';
import { Language, Slot, WardrobeItem } from '../types';
import { scoreItem, warmthNeed } from './stylist';
import { StylistRequest, WeatherInfo } from '../types';

export interface PackingList {
  summary: string;
  toPack: { slot: Slot; label: string; items: WardrobeItem[] }[];
  missing: string[];
}

const SLOT_LABELS: Record<Language, Record<Slot, string>> = {
  pl: {
    top: 'Góry',
    bottom: 'Doły',
    dress: 'Sukienki / kombinezony',
    outerwear: 'Okrycia wierzchnie',
    shoes: 'Buty',
    accessory: 'Akcesoria',
  },
  en: {
    top: 'Tops',
    bottom: 'Bottoms',
    dress: 'Dresses / jumpsuits',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessories',
  },
};

const MISSING_TEXTS: Record<Language, Record<string, string>> = {
  pl: {
    tops: 'za mało gór na tę pogodę',
    bottoms: 'brak dołów lub sukienek na tę pogodę',
    shoes: 'brak butów na ten klimat',
    outer: 'brak okrycia wierzchniego na chłodniejsze dni',
    rain: 'coś na deszcz (parasol / kurtka przeciwdeszczowa)',
  },
  en: {
    tops: 'not enough tops for this weather',
    bottoms: 'no bottoms or dresses for this weather',
    shoes: 'no shoes for this climate',
    outer: 'no outerwear for colder days',
    rain: 'something for rain (umbrella / rain jacket)',
  },
};

// Ile sztuk z danego slotu zabrać na X dni
function countFor(slot: Slot, days: number): number {
  switch (slot) {
    case 'top':
      return Math.min(Math.ceil(days * 0.8) + 1, 10);
    case 'bottom':
      return Math.min(Math.ceil(days / 3) + 1, 4);
    case 'dress':
      return Math.min(Math.ceil(days / 4), 3);
    case 'outerwear':
      return 1;
    case 'shoes':
      return days > 4 ? 2 : 1;
    case 'accessory':
      return 3;
  }
}

export function buildPackingList(
  items: WardrobeItem[],
  forecast: DailyForecast[],
  days: number,
  destination: string,
  lang: Language = 'pl'
): PackingList {
  const minTemp = Math.min(...forecast.map((f) => f.tempMin));
  const maxTemp = Math.max(...forecast.map((f) => f.tempMax));
  const rainyDays = forecast.filter((f) => f.isRain || f.precipitationProb >= 50).length;
  const snowy = forecast.some((f) => f.isSnow);

  const avgWeather: WeatherInfo = {
    tempC: Math.round((minTemp + maxTemp) / 2),
    feelsLikeC: Math.round((minTemp + maxTemp) / 2),
    precipitationProb: rainyDays > 0 ? 70 : 10,
    windKmh: 10,
    isRain: rainyDays > 0,
    isSnow: snowy,
    description: '',
  };
  const req: StylistRequest = {
    occasion: 'codzienne',
    timeOfDay: 'dzień',
    bottomPreference: 'dowolnie',
    styles: [],
    weather: avgWeather,
  };
  const need = warmthNeed(avgWeather);
  const needCold = warmthNeed({ ...avgWeather, tempC: minTemp, feelsLikeC: minTemp });

  const bySlot = new Map<Slot, WardrobeItem[]>();
  for (const item of items) {
    // na wyjazd bierzemy rzeczy pasujące do zakresu temperatur
    if (Math.abs(item.warmth - need) > 1 && Math.abs(item.warmth - needCold) > 1) continue;
    const slot = slotOf(item.mainCategory, item.subcategory);
    const list = bySlot.get(slot) ?? [];
    list.push(item);
    bySlot.set(slot, list);
  }

  const toPack: PackingList['toPack'] = [];
  const missing: string[] = [];
  const slots: Slot[] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];
  for (const slot of slots) {
    const pool = (bySlot.get(slot) ?? []).sort(
      (a, b) => scoreItem(b, req, need) - scoreItem(a, req, need)
    );
    const wanted = countFor(slot, days);
    const chosen = pool.slice(0, wanted);
    if (chosen.length) toPack.push({ slot, label: SLOT_LABELS[lang][slot], items: chosen });
    if (slot === 'top' && chosen.length < Math.min(wanted, 2)) missing.push(MISSING_TEXTS[lang].tops);
    if (slot === 'bottom' && chosen.length === 0 && (bySlot.get('dress') ?? []).length === 0)
      missing.push(MISSING_TEXTS[lang].bottoms);
    if (slot === 'shoes' && chosen.length === 0) missing.push(MISSING_TEXTS[lang].shoes);
    if (slot === 'outerwear' && needCold >= 3 && chosen.length === 0)
      missing.push(MISSING_TEXTS[lang].outer);
  }
  if (rainyDays > 0 && !items.some((i) => i.subcategory === 'parasol' || i.waterproof)) {
    missing.push(MISSING_TEXTS[lang].rain);
  }

  const summary =
    lang === 'en'
      ? `${destination}: ${minTemp}°C to ${maxTemp}°C, ` +
        (rainyDays > 0 ? `rain for about ${rainyDays} day(s). ` : 'mostly dry. ') +
        (snowy ? 'Snow possible. ' : '') +
        `Plan for ${days} days.`
      : `${destination}: ${minTemp}°C do ${maxTemp}°C, ` +
        (rainyDays > 0 ? `deszcz przez ok. ${rainyDays} dni. ` : 'raczej bez opadów. ') +
        (snowy ? 'Możliwy śnieg. ' : '') +
        `Plan na ${days} dni.`;

  return { summary, toPack, missing };
}
