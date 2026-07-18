import { MONTHS_BY_LANG } from '../i18n/labels';
import { Language } from '../types';

export function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

// dni miesiąca ułożone w tygodnie zaczynające się od poniedziałku
export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // pon=0 ... nd=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// „17 lipiec 2026" / "17 July 2026" z ISO yyyy-mm-dd
export function formatDate(iso: string, lang: Language): string {
  const d = new Date(`${iso}T12:00:00`);
  if (isNaN(d.getTime())) return iso;
  const month = MONTHS_BY_LANG[lang][d.getMonth()];
  return `${d.getDate()} ${lang === 'pl' ? month.toLowerCase() : month} ${d.getFullYear()}`;
}
