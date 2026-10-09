"use client";

import { useEffect, useState } from "react";
import { bouquets, type Bouquet } from "@/data/catalog";

export function notifyCatalog() {
  window.dispatchEvent(new Event("studio-catalog"));
}

export function usePublicBouquets() {
  const [items, setItems] = useState<Bouquet[]>(bouquets);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = () => {
      fetch("/api/studio/products")
        .then((response) => response.json())
        .then((data: { products?: Bouquet[] }) => {
          if (stop) return;
          if (Array.isArray(data.products)) setItems(data.products);
          setReady(true);
        })
        .catch(() => {
          if (!stop) setReady(true);
        });
    };
    load();
    window.addEventListener("studio-catalog", load);
    return () => {
      stop = true;
      window.removeEventListener("studio-catalog", load);
    };
  }, []);

  return { items, ready };
}
