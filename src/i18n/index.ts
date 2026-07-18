import { useAppStore } from '../store/useAppStore';
import { Language } from '../types';
import { TranslationKey, translations } from './translations';

export type { TranslationKey };

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

// Tłumaczenie poza komponentem (np. w funkcjach pomocniczych)
export function translate(lang: Language, key: TranslationKey, vars?: Record<string, string | number>): string {
  return interpolate(translations[lang][key] ?? translations.pl[key] ?? key, vars);
}

// Hook do użycia w komponentach — re-renderuje przy zmianie języka.
export function useI18n() {
  const lang = useAppStore((s) => s.language);
  const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  return { t, lang };
}
