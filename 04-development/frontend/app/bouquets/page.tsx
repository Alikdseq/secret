"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useStudioOn } from "@/components/studio-session";
import { categories, type Tag } from "@/data/catalog";
import { usePublicBouquets } from "@/lib/use-public-bouquets";

export default function BouquetsPage() {
  const { items } = usePublicBouquets();
  const studio = useStudioOn();
  const [tag, setTag] = useState<"all" | Tag>("all");
  const list = useMemo(() => (tag === "all" ? items : items.filter((item) => item.tags.includes(tag))), [items, tag]);

  return (
    <div className="stage py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{studio ? "Режим управления" : "Каталог"}</p>
          <h1 className="mt-2 font-serif text-6xl md:text-7xl">Букеты</h1>
          <p className="mt-3 max-w-xl text-black/60">Авторские композиции, которые говорят без слов.</p>
        </div>
        {studio && (
          <Link href="/studio" className="btn-primary">
            Добавить букет
          </Link>
        )}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button key={item.id} type="button" onClick={() => setTag(item.id)} className={`rounded-full px-4 py-2 text-sm ${tag === item.id ? "bg-cta text-ivory" : "bg-white"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((bouquet) => (
          <ProductCard key={bouquet.slug} bouquet={bouquet} />
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-black/50">В этой полке демо пока пусто.</p>}
    </div>
  );
}
