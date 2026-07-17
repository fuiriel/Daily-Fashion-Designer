import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Expense, Outfit, StorePref, UserPrefs, WardrobeItem } from '../types';

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AppState {
  items: WardrobeItem[];
  outfits: Outfit[];
  expenses: Expense[];
  stores: StorePref[];
  prefs: UserPrefs;

  addItem: (item: Omit<WardrobeItem, 'id' | 'createdAt'>) => WardrobeItem;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void;
  removeItem: (id: string) => void;
  toggleItemFavorite: (id: string) => void;

  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => Outfit;
  updateOutfit: (id: string, patch: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;
  toggleOutfitFavorite: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;

  addStore: (name: string, url?: string) => void;
  removeStore: (id: string) => void;
  toggleStoreFavorite: (id: string) => void;

  setPrefs: (patch: Partial<UserPrefs>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      outfits: [],
      expenses: [],
      stores: [],
      prefs: { favoriteStyles: [] },

      addItem: (data) => {
        const item: WardrobeItem = { ...data, id: uid(), createdAt: new Date().toISOString() };
        set((s) => ({ items: [item, ...s.items] }));
        // zakup z ceną trafia też do rejestru wydatków
        if (item.price && item.price > 0) {
          const expense: Expense = {
            id: uid(),
            title: `Zakup: ${item.name}`,
            amount: item.price,
            store: item.store,
            date: item.purchaseDate ?? new Date().toISOString().slice(0, 10),
            itemId: item.id,
          };
          set((s) => ({ expenses: [expense, ...s.expenses] }));
        }
        return item;
      },
      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          outfits: s.outfits.map((o) => ({ ...o, itemIds: o.itemIds.filter((x) => x !== id) })),
        })),
      toggleItemFavorite: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)),
        })),

      addOutfit: (data) => {
        const outfit: Outfit = { ...data, id: uid(), createdAt: new Date().toISOString() };
        set((s) => ({ outfits: [outfit, ...s.outfits] }));
        return outfit;
      },
      updateOutfit: (id, patch) =>
        set((s) => ({ outfits: s.outfits.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      removeOutfit: (id) => set((s) => ({ outfits: s.outfits.filter((o) => o.id !== id) })),
      toggleOutfitFavorite: (id) =>
        set((s) => ({
          outfits: s.outfits.map((o) => (o.id === id ? { ...o, favorite: !o.favorite } : o)),
        })),

      addExpense: (data) => set((s) => ({ expenses: [{ ...data, id: uid() }, ...s.expenses] })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addStore: (name, url) =>
        set((s) => ({ stores: [...s.stores, { id: uid(), name, url, favorite: false }] })),
      removeStore: (id) => set((s) => ({ stores: s.stores.filter((x) => x.id !== id) })),
      toggleStoreFavorite: (id) =>
        set((s) => ({
          stores: s.stores.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x)),
        })),

      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),
    }),
    {
      name: 'daily-fashion-designer',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
