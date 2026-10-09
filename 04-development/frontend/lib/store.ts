"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  detail?: string;
  kind: "bouquet" | "custom" | "addon";
};

type ShopState = {
  items: CartItem[];
  favorites: string[];
  guessReward: boolean;
  toast: string | null;
  searchOpen: boolean;
  favOpen: boolean;
  ready: boolean;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  toggleFav: (slug: string) => void;
  setReward: (value: boolean) => void;
  clear: () => void;
  setToast: (value: string | null) => void;
  setSearchOpen: (value: boolean) => void;
  setFavOpen: (value: boolean) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],
      guessReward: false,
      toast: null,
      searchOpen: false,
      favOpen: false,
      ready: false,
      add: (item) => {
        const qty = item.qty ?? 1;
        const items = get().items.slice();
        const index = items.findIndex((line) => line.key === item.key);
        if (index >= 0) items[index] = { ...items[index], qty: items[index].qty + qty };
        else items.push({ ...item, qty });
        set({ items, toast: "В корзине" });
        window.setTimeout(() => set({ toast: null }), 1800);
      },
      setQty: (key, qty) =>
        set({
          items: get()
            .items.map((line) => (line.key === key ? { ...line, qty } : line))
            .filter((line) => line.qty > 0),
        }),
      remove: (key) => set({ items: get().items.filter((line) => line.key !== key) }),
      toggleFav: (slug) => {
        const favorites = get().favorites.includes(slug)
          ? get().favorites.filter((item) => item !== slug)
          : [...get().favorites, slug];
        set({ favorites });
      },
      setReward: (guessReward) => set({ guessReward }),
      clear: () => set({ items: [] }),
      setToast: (toast) => set({ toast }),
      setSearchOpen: (searchOpen) => set({ searchOpen, favOpen: searchOpen ? false : get().favOpen }),
      setFavOpen: (favOpen) => set({ favOpen, searchOpen: favOpen ? false : get().searchOpen }),
    }),
    {
      name: "secret-demo",
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        favorites: state.favorites,
        guessReward: state.guessReward,
      }),
    },
  ),
);

export function lineTotal(item: CartItem, reward: boolean) {
  if (reward && item.kind === "addon" && item.key.startsWith("addon:card")) return 0;
  return item.price * item.qty;
}
