"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Bouquet } from "@/data/catalog";
import { rub } from "@/lib/money";
import { useShop } from "@/lib/store";

export function ProductCard({ bouquet }: { bouquet: Bouquet }) {
  const favorites = useShop((s) => s.favorites);
  const toggleFav = useShop((s) => s.toggleFav);
  const add = useShop((s) => s.add);
  const loved = favorites.includes(bouquet.slug);

  return (
    <article className="lift group">
      <div className="relative overflow-hidden rounded-[28px] bg-white">
        <Link href={`/bouquets/${bouquet.slug}`}>
          <img src={bouquet.image} alt={bouquet.name} className="aspect-[4/5] w-full object-cover" />
          <img
            src={bouquet.hover}
            alt=""
            className="absolute inset-0 aspect-[4/5] h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        </Link>
        <button
          type="button"
          aria-label={loved ? "Убрать из избранного" : "В избранное"}
          onClick={() => toggleFav(bouquet.slug)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/80"
        >
          <Heart size={16} fill={loved ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={() =>
            add({
              key: `bouquet:${bouquet.slug}:M`,
              name: bouquet.name,
              price: bouquet.price,
              image: bouquet.image,
              detail: "Размер M",
              kind: "bouquet",
            })
          }
          className="absolute bottom-3 left-3 right-3 translate-y-3 rounded-full bg-cta py-3 text-[11px] uppercase tracking-[0.16em] text-ivory opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
        >
          В корзину
        </button>
      </div>
      <div className="flex items-end justify-between gap-3 px-1 pt-4">
        <div>
          <Link href={`/bouquets/${bouquet.slug}`} className="font-serif text-3xl leading-none">
            {bouquet.name}
          </Link>
          <p className="mt-2 text-sm text-black/50">{bouquet.epithet}</p>
        </div>
        <p className="text-sm">{rub(bouquet.price)}</p>
      </div>
    </article>
  );
}
