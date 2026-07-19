// Główne kategorie i sloty kompozycji
export type MainCategory = 'ubrania' | 'buty' | 'akcesoria';

export type Slot = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

export type Pattern =
  | 'gładki'
  | 'paski'
  | 'kratka'
  | 'kwiaty'
  | 'grochy'
  | 'zwierzęcy'
  | 'geometryczny'
  | 'nadruk'
  | 'inny';

export type StyleTag =
  | 'casual'
  | 'elegancki'
  | 'sportowy'
  | 'klasyczny'
  | 'boho'
  | 'streetwear'
  | 'romantyczny'
  | 'minimalistyczny'
  | 'rockowy';

export type Occasion =
  | 'codzienne'
  | 'praca'
  | 'kino'
  | 'park'
  | 'rower'
  | 'sport'
  | 'randka'
  | 'przyjęcie'
  | 'wesele'
  | 'pogrzeb'
  | 'plaża';

export type Season = 'wiosna' | 'lato' | 'jesień' | 'zima';

export type TimeOfDay = 'rano' | 'dzień' | 'wieczór' | 'noc';

export type BottomPreference = 'dowolnie' | 'sukienka' | 'spodnie' | 'spódnica';

// Status rzeczy w szafie. Tylko 'aktywna' bierze udział w stylizacjach,
// analizie braków i pakowaniu.
export type ItemStatus = 'aktywna' | 'zarchiwizowana' | 'zwrócona' | 'sprzedana' | 'wyrzucona';

export interface Catalog {
  id: string;
  name: string; // własna nazwa, np. „Do sprzedania"
}

export type Language = 'pl' | 'en';

export interface WardrobeItem {
  id: string;
  name: string;
  description?: string;
  mainCategory: MainCategory;
  subcategory: string; // np. 't-shirt', 'sukienka', 'sneakersy'
  photoUri?: string;
  colors: string[]; // nazwy kolorów z palety
  pattern: Pattern;
  size?: string;
  brand?: string;
  purchaseDate?: string; // ISO yyyy-mm-dd
  price?: number;
  store?: string;
  favorite: boolean;
  styles: StyleTag[];
  occasions: Occasion[]; // puste = uniwersalne
  seasons: Season[]; // puste = całoroczne
  warmth: 1 | 2 | 3 | 4 | 5; // 1 = bardzo lekkie, 5 = bardzo ciepłe
  waterproof?: boolean;
  status?: ItemStatus; // brak = 'aktywna'
  catalogIds?: string[]; // przypisanie do katalogów użytkownika
  createdAt: string;
}

export function isItemActive(item: WardrobeItem): boolean {
  return !item.status || item.status === 'aktywna';
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  occasion?: Occasion;
  favorite: boolean;
  note?: string;
  createdAt: string;
  source: 'stylista' | 'własna';
}

export interface PlannedOutfit {
  id: string;
  date: string; // ISO yyyy-mm-dd
  outfitId: string;
  timeOfDay?: TimeOfDay;
  note?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  store?: string;
  date: string; // ISO
  itemId?: string; // powiązanie z rzeczą z szafy
}

export interface StorePref {
  id: string;
  name: string;
  url?: string;
  favorite: boolean;
}

export interface UserPrefs {
  favoriteStyles: StyleTag[];
  monthlyBudget?: number;
  city?: string;
}

export interface WeatherInfo {
  tempC: number;
  feelsLikeC: number;
  precipitationProb: number; // 0-100
  windKmh: number;
  isRain: boolean;
  isSnow: boolean;
  description: string;
  city?: string;
}

export interface StylistRequest {
  occasion: Occasion;
  timeOfDay: TimeOfDay;
  bottomPreference: BottomPreference;
  styles: StyleTag[];
  weather: WeatherInfo;
  lang?: Language; // język wyjaśnień i komunikatów o brakach
}

export interface OutfitSuggestion {
  items: WardrobeItem[];
  score: number;
  explanation: string[];
  missing: string[]; // braki w szafie dla tej kompozycji
}

export interface GapStoreLink {
  name: string;
  url?: string; // adres sklepu (własny lub domyślny); brak = wyszukiwarka
}

// wstępne wypełnienie formularza „Nowy przedmiot" po kliknięciu
// „Dodaj do szafy" na kafelku braków
export interface GapPrefill {
  mainCategory: MainCategory;
  subcategory: string;
  warmth?: 1 | 2 | 3 | 4 | 5;
  waterproof?: boolean;
  colors?: string[];
  styles?: StyleTag[];
}

export interface GapSuggestion {
  id: string; // klucz tekstów w i18n/labels GAP_TEXTS
  icon: string; // ikona MaterialCommunityIcons wizualizująca część ubioru
  whereToBuy: GapStoreLink[];
  prefill: GapPrefill;
}
