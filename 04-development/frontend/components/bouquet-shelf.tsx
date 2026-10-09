"use client";

import { ProductCard } from "@/components/product-card";
import { usePublicBouquets } from "@/lib/use-public-bouquets";

export function BouquetShelf({ limit }: { limit?: number }) {
  const { items } = usePublicBouquets();
  const list = typeof limit === "number" ? items.slice(0, limit) : items;
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((bouquet) => (
        <ProductCard key={bouquet.slug} bouquet={bouquet} />
      ))}
    </div>
  );
}
