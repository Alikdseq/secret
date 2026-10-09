"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { Bouquet } from "@/data/catalog";
import { rub } from "@/lib/money";
import { useShop } from "@/lib/store";
import { notifyCatalog } from "@/lib/use-public-bouquets";
import { useStudioOn } from "@/components/studio-session";

export function ProductCard({ bouquet }: { bouquet: Bouquet }) {
  const favorites = useShop((s) => s.favorites);
  const toggleFav = useShop((s) => s.toggleFav);
  const add = useShop((s) => s.add);
  const studio = useStudioOn();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const loved = favorites.includes(bouquet.slug);
  const sold = bouquet.availability === "sold";

  async function markSold() {
    if (!bouquet.studioId) return;
    await fetch("/api/studio/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: bouquet.studioId,
        patch: sold ? { availability: "in_stock", qty: 1, listing: "published" } : { availability: "sold", qty: 0 },
      }),
    });
    notifyCatalog();
  }

  async function hide() {
    if (!bouquet.studioId) return;
    await fetch("/api/studio/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: bouquet.studioId, patch: { listing: "hidden" } }),
    });
    notifyCatalog();
  }

  async function duplicate() {
    const response = await fetch("/api/studio/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: `${bouquet.name} — копия`,
        price: bouquet.price,
        composition: bouquet.composition,
        packaging: bouquet.packaging || "",
        availability: "in_stock",
        description: bouquet.story,
        category: bouquet.tags[0] || "author",
        qty: 1,
        image: bouquet.image,
        listing: "draft",
      }),
    });
    const data = (await response.json()) as { product?: { studioId?: string } };
    notifyCatalog();
    if (data.product?.studioId) router.push(`/studio?edit=${data.product.studioId}`);
  }

  async function remove() {
    if (!bouquet.studioId) return;
    await fetch("/api/studio/products", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: bouquet.studioId }),
    });
    setConfirmDelete(false);
    notifyCatalog();
  }

  return (
    <article className="lift group">
      <div className="relative overflow-hidden rounded-[28px] bg-white">
        <Link href={`/bouquets/${bouquet.slug}`}>
          <img src={bouquet.image} alt={bouquet.name} className="aspect-[4/5] w-full object-cover" />
          {!sold && (
            <img
              src={bouquet.hover}
              alt=""
              className="absolute inset-0 aspect-[4/5] h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          )}
        </Link>
        <button
          type="button"
          aria-label={loved ? "Убрать из избранного" : "В избранное"}
          onClick={() => toggleFav(bouquet.slug)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/80"
        >
          <Heart size={16} fill={loved ? "currentColor" : "none"} />
        </button>
        {sold ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.16em]">Продан</span>
        ) : (
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
        )}
      </div>
      <div className="flex items-end justify-between gap-3 px-1 pt-4">
        <div>
          <Link href={`/bouquets/${bouquet.slug}`} className="font-serif text-3xl leading-none">
            {bouquet.name}
          </Link>
          <p className="mt-2 text-sm text-black/50">{bouquet.epithet}</p>
        </div>
        <p className="text-sm">{sold ? "Продан" : rub(bouquet.price)}</p>
      </div>
      {studio && bouquet.studioId && (
        <div className="mt-3 px-1">
          <div className="flex flex-wrap gap-2">
            <Link href={`/studio?edit=${bouquet.studioId}`} className="rounded-full bg-white px-3 py-2 text-xs">
              Изменить
            </Link>
            <button type="button" onClick={() => void markSold()} className="rounded-full bg-white px-3 py-2 text-xs">
              {sold ? "Вернуть в наличие" : "Продан"}
            </button>
            <button type="button" onClick={() => void hide()} className="rounded-full bg-white px-3 py-2 text-xs">
              Скрыть
            </button>
            <button type="button" onClick={() => void duplicate()} className="rounded-full bg-white px-3 py-2 text-xs">
              Дубль
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full bg-white px-3 py-2 text-xs">
              Удалить
            </button>
          </div>
          {confirmDelete && (
            <div className="mt-2 rounded-2xl bg-[#f6f1ea] p-3 text-sm">
              <p>{bouquet.locked ? "Карточка из демо-каталога уйдёт в архив. Её можно вернуть." : "Убрать карточку из каталога?"}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full bg-white px-3 py-2 text-xs">
                  Отмена
                </button>
                <button type="button" onClick={() => void remove()} className="rounded-full bg-cta px-3 py-2 text-xs text-ivory">
                  {bouquet.locked ? "В архив" : "Удалить"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
