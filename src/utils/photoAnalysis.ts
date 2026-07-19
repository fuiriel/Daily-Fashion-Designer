import { Platform } from 'react-native';
import { COLOR_PALETTE } from '../data/constants';
import { subcatLabel, colorLabel } from '../i18n/labels';
import { Language } from '../types';

// Rozpoznawanie dominujących kolorów ubrania ze zdjęcia.
// Web: canvas + getImageData. Telefon: base64 z ImagePickera + dekoder jpeg-js.
// Piksele bliżej środka kadru ważą więcej (mniejszy wpływ tła).

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const PALETTE = COLOR_PALETTE.filter((c) => c.name !== 'wielokolorowy').map((c) => ({
  name: c.name,
  rgb: hexToRgb(c.hex),
}));

function nearestColor(r: number, g: number, b: number): string {
  let best = PALETTE[0].name;
  let bestDist = Infinity;
  for (const p of PALETTE) {
    const dr = r - p.rgb.r;
    const dg = g - p.rgb.g;
    const db = b - p.rgb.b;
    // ważona odległość (oko jest czulsze na zieleń)
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = p.name;
    }
  }
  return best;
}

type GetPixel = (x: number, y: number) => [number, number, number, number] | null;

// Średni kolor tła wyznaczony z pierścienia krawędzi kadru (zewnętrzne ~10%).
// Zdjęcia ubrań zwykle mają przedmiot w centrum, a tło przy brzegach.
function edgeBackground(getPixel: GetPixel, width: number, height: number) {
  const step = Math.max(1, Math.floor(Math.min(width, height) / 48));
  const bx = width * 0.1;
  const by = height * 0.1;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const isEdge = x < bx || x > width - bx || y < by || y > height - by;
      if (!isEdge) continue;
      const px = getPixel(x, y);
      if (!px || px[3] < 128) continue;
      r += px[0];
      g += px[1];
      b += px[2];
      n++;
    }
  }
  return n ? { r: r / n, g: g / n, b: b / n } : null;
}

function tallyPixels(getPixel: GetPixel, width: number, height: number): string[] {
  const step = Math.max(1, Math.floor(Math.min(width, height) / 48));
  const bg = edgeBackground(getPixel, width, height);
  // analizujemy tylko środek kadru (tam jest przedmiot)...
  const cx0 = width * 0.18;
  const cx1 = width * 0.82;
  const cy0 = height * 0.18;
  const cy1 = height * 0.82;

  const run = (excludeBg: boolean): { counts: Map<string, number>; total: number } => {
    const counts = new Map<string, number>();
    let total = 0;
    for (let y = cy0; y <= cy1; y += step) {
      for (let x = cx0; x <= cx1; x += step) {
        const px = getPixel(Math.floor(x), Math.floor(y));
        if (!px) continue;
        const [r, g, b, a] = px;
        if (a < 128) continue; // przezroczyste tło (PNG)
        if (excludeBg && bg) {
          // ...i pomijamy piksele podobne do koloru tła z krawędzi
          const dr = r - bg.r;
          const dg = g - bg.g;
          const db = b - bg.b;
          if (dr * dr + dg * dg + db * db < 55 * 55) continue;
        }
        const name = nearestColor(r, g, b);
        counts.set(name, (counts.get(name) ?? 0) + 1);
        total++;
      }
    }
    return { counts, total };
  };

  let { counts, total } = run(true);
  // gdy przedmiot ma kolor tła (prawie wszystko odfiltrowane) — licz bez wykluczania
  const centerSamples = Math.ceil(((cx1 - cx0) / step) * ((cy1 - cy0) / step));
  if (total < centerSamples * 0.12) {
    ({ counts, total } = run(false));
  }
  if (!total) return [];
  return [...counts.entries()]
    .map(([name, count]) => ({ name, share: count / total }))
    .sort((a, b) => b.share - a.share)
    .filter((c, idx) => idx === 0 || c.share >= 0.22)
    .slice(0, 2)
    .map((c) => c.name);
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(base64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  // awaryjny dekoder base64 (starsze środowiska bez atob)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (chars.indexOf(clean[i]) << 18) |
      (chars.indexOf(clean[i + 1]) << 12) |
      ((chars.indexOf(clean[i + 2]) & 63) << 6) |
      (chars.indexOf(clean[i + 3]) & 63);
    out.push((n >> 16) & 255);
    if (clean[i + 2] !== undefined) out.push((n >> 8) & 255);
    if (clean[i + 3] !== undefined) out.push(n & 255);
  }
  return new Uint8Array(out);
}

async function analyzeWeb(uri: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 96;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        resolve(
          tallyPixels(
            (x, y) => {
              const i = (y * size + x) * 4;
              return [data[i], data[i + 1], data[i + 2], data[i + 3]];
            },
            size,
            size
          )
        );
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = uri;
  });
}

async function analyzeNative(base64: string): Promise<string[]> {
  try {
    const { decode } = require('jpeg-js') as typeof import('jpeg-js');
    const bytes = base64ToBytes(base64);
    const img = decode(bytes, { useTArray: true, maxMemoryUsageInMB: 64 });
    const { width, height, data } = img;
    return tallyPixels(
      (x, y) => {
        const i = (y * width + x) * 4;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
      },
      width,
      height
    );
  } catch {
    return [];
  }
}

// Zwraca 1–2 nazwy kolorów z palety aplikacji (lub [] gdy analiza się nie uda).
export async function analyzePhotoColors(uri: string, base64?: string): Promise<string[]> {
  if (Platform.OS === 'web') return analyzeWeb(uri);
  if (base64) return analyzeNative(base64);
  return [];
}

// Odmiana polskich przymiotników kolorów przez rodzaj podkategorii.
const PL_FEMININE = new Set([
  'koszula', 'bluzka', 'spódnica', 'sukienka', 'kurtka', 'marynarka', 'kamizelka',
  'czapka', 'torebka', 'biżuteria', 'bluza',
]);
const PL_PLURAL = new Set([
  'spodnie', 'jeansy', 'legginsy', 'szorty', 'sneakersy', 'botki', 'kozaki', 'szpilki',
  'sandały', 'baleriny', 'mokasyny', 'kalosze', 'buty sportowe', 'rękawiczki', 'rajstopy',
  'okulary przeciwsłoneczne', 'skarpety',
]);

function plColorAdjective(color: string, subcategory: string): string {
  const feminine = PL_FEMININE.has(subcategory);
  const plural = PL_PLURAL.has(subcategory);
  if (!feminine && !plural) return color; // rodzaj męski = forma podstawowa
  if (color.endsWith('ki')) return feminine ? color.slice(0, -1) + 'a' : color.slice(0, -1) + 'ie';
  if (color.endsWith('y')) return feminine ? color.slice(0, -1) + 'a' : color.slice(0, -1) + 'e';
  return color;
}

// Sugestia nazwy: „Czarna sukienka" / "Black dress".
export function suggestItemName(lang: Language, colors: string[], subcategory: string): string {
  if (!subcategory) return '';
  if (lang === 'en') {
    const color = colors[0] ? colorLabel('en', colors[0]) + ' ' : '';
    const name = `${color}${subcatLabel('en', subcategory)}`;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  const color = colors[0] ? plColorAdjective(colors[0], subcategory) + ' ' : '';
  const name = `${color}${subcategory}`;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Sugestia opisu: lista wykrytych kolorów.
export function suggestItemDescription(lang: Language, colors: string[]): string {
  if (!colors.length) return '';
  const list = colors.map((c) => colorLabel(lang, c)).join(', ');
  return lang === 'en' ? `Colours: ${list}` : `Kolory: ${list}`;
}
