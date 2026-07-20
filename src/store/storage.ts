import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// Trwałe przechowywanie stanu aplikacji.
//
// Na telefonie zostajemy przy AsyncStorage — zdjęcia to ścieżki `file://`,
// które przeżywają restart, a metadane szafy mieszczą się bez problemu.
//
// W przeglądarce wcześniej używaliśmy localStorage. Problem: po odświeżeniu
// strony zdjęcia znikały. Dwie przyczyny naraz:
//   1) ImagePicker na webie zwraca adres `blob:…`, który traci ważność po
//      przeładowaniu karty (patrz utils/image.ts — teraz zapisujemy data URI),
//   2) localStorage ma ~5 MB limitu, więc kilka zdjęć w base64 zapełniało go
//      i zapis całego stanu cicho się wywalał.
// IndexedDB nie ma tak niskiego limitu i trzyma duże wartości tekstowe, więc
// na webie przechodzimy właśnie na niego.

const DB_NAME = 'daily-fashion-designer';
const STORE_NAME = 'keyval';
// Klucz, pod którym stary build zapisywał stan w localStorage — migrujemy go
// jednorazowo do IndexedDB, żeby nie utracić dotychczasowej szafy.
const LEGACY_LOCALSTORAGE_KEY = 'daily-fashion-designer';

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function idbRequest<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = run(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

// Jednorazowe przeniesienie danych ze starego localStorage do IndexedDB.
// Uruchamiane leniwie przy pierwszym odczycie, gdy w IndexedDB nic jeszcze nie ma.
async function migrateFromLocalStorage(key: string): Promise<string | null> {
  if (typeof localStorage === 'undefined') return null;
  let legacy: string | null = null;
  try {
    legacy = localStorage.getItem(key) ?? localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    return null;
  }
  if (legacy == null) return null;
  try {
    await idbRequest('readwrite', (s) => s.put(legacy, key));
    // po udanej migracji sprzątamy starą kopię, by nie zajmowała limitu
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    // migracja nieudana — zwracamy dane wprost, spróbujemy ponownie następnym razem
  }
  return legacy;
}

const indexedDbStorage: StateStorage = {
  async getItem(key) {
    try {
      const value = await idbRequest<string | undefined>('readonly', (s) => s.get(key));
      if (value != null) return value;
      return await migrateFromLocalStorage(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    await idbRequest('readwrite', (s) => s.put(value, key));
  },
  async removeItem(key) {
    await idbRequest('readwrite', (s) => s.delete(key));
  },
};

// Web z dostępnym IndexedDB → IndexedDB; wszystko inne (telefon, brak IDB) → AsyncStorage.
export const persistStorage: StateStorage =
  Platform.OS === 'web' && hasIndexedDb() ? indexedDbStorage : AsyncStorage;
