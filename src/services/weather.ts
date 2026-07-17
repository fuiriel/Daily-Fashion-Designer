import { WeatherInfo } from '../types';

// Open-Meteo: darmowe API pogodowe bez klucza
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export async function geocodeCity(city: string): Promise<GeoResult | null> {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=pl`);
  if (!res.ok) throw new Error('Nie udało się znaleźć miasta');
  const json = await res.json();
  const first = json?.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    country: first.country ?? '',
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

function describeWeather(code: number): { description: string; isRain: boolean; isSnow: boolean } {
  if (code === 0) return { description: 'bezchmurnie', isRain: false, isSnow: false };
  if (code <= 3) return { description: 'częściowe zachmurzenie', isRain: false, isSnow: false };
  if (code === 45 || code === 48) return { description: 'mgła', isRain: false, isSnow: false };
  if (code >= 51 && code <= 57) return { description: 'mżawka', isRain: true, isSnow: false };
  if (code >= 61 && code <= 67) return { description: 'deszcz', isRain: true, isSnow: false };
  if (code >= 71 && code <= 77) return { description: 'śnieg', isRain: false, isSnow: true };
  if (code >= 80 && code <= 82) return { description: 'przelotne opady', isRain: true, isSnow: false };
  if (code >= 85 && code <= 86) return { description: 'przelotny śnieg', isRain: false, isSnow: true };
  if (code >= 95) return { description: 'burza', isRain: true, isSnow: false };
  return { description: 'zachmurzenie', isRain: false, isSnow: false };
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  city?: string
): Promise<WeatherInfo> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    hourly: 'precipitation_probability',
    forecast_days: '1',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Nie udało się pobrać pogody');
  const json = await res.json();
  const cur = json.current;
  const probs: number[] = json?.hourly?.precipitation_probability ?? [];
  const maxProb = probs.length ? Math.max(...probs.slice(0, 12)) : 0;
  const desc = describeWeather(cur.weather_code ?? 0);
  return {
    tempC: Math.round(cur.temperature_2m),
    feelsLikeC: Math.round(cur.apparent_temperature ?? cur.temperature_2m),
    precipitationProb: maxProb,
    windKmh: Math.round(cur.wind_speed_10m ?? 0),
    isRain: desc.isRain || (cur.precipitation ?? 0) > 0.2,
    isSnow: desc.isSnow,
    description: desc.description,
    city,
  };
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitationProb: number;
  isRain: boolean;
  isSnow: boolean;
  description: string;
}

export async function fetchDailyForecast(
  latitude: number,
  longitude: number,
  days: number
): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code',
    forecast_days: String(Math.min(Math.max(days, 1), 16)),
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Nie udało się pobrać prognozy');
  const json = await res.json();
  const d = json.daily;
  const out: DailyForecast[] = [];
  for (let i = 0; i < (d?.time?.length ?? 0); i++) {
    const desc = describeWeather(d.weather_code[i] ?? 0);
    out.push({
      date: d.time[i],
      tempMin: Math.round(d.temperature_2m_min[i]),
      tempMax: Math.round(d.temperature_2m_max[i]),
      precipitationProb: d.precipitation_probability_max?.[i] ?? 0,
      isRain: desc.isRain,
      isSnow: desc.isSnow,
      description: desc.description,
    });
  }
  return out;
}

export function manualWeather(tempC: number, rainy: boolean): WeatherInfo {
  return {
    tempC,
    feelsLikeC: tempC,
    precipitationProb: rainy ? 80 : 10,
    windKmh: 10,
    isRain: rainy,
    isSnow: rainy && tempC <= 0,
    description: rainy ? 'opady' : 'bez opadów',
  };
}
