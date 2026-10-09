"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { addons, sizeFactor, sizes, type Bouquet, type SizeId } from "@/data/catalog";
import { roundPrice, rub } from "@/lib/money";
import { useShop } from "@/lib/store";

export function ProductView({ bouquet }: { bouquet: Bouquet }) {
  const add = useShop((s) => s.add);
  const favorites = useShop((s) => s.favorites);
  const toggleFav = useShop((s) => s.toggleFav);
  const reward = useShop((s) => s.guessReward);
  const [size, setSize] = useState<SizeId>("M");
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [shot, setShot] = useState(bouquet.image);
  const price = roundPrice(bouquet.price * sizeFactor(size));
  const shots = [bouquet.image, bouquet.hover, "/images/quiz-bloom.jpg"];

  function toggleAddon(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toCart() {
    add({
      key: `bouquet:${bouquet.slug}:${size}`,
      name: bouquet.name,
      price,
      qty,
      image: bouquet.image,
      detail: `Размер ${size}`,
      kind: "bouquet",
    });
    picked.forEach((id) => {
      const addon = addons.find((item) => item.id === id);
      if (!addon) return;
      add({
        key: `addon:${addon.id}:${bouquet.slug}`,
        name: addon.name,
        price: reward && addon.id === "card" ? 0 : addon.price,
        image: addon.image,
        detail: addon.note,
        kind: "addon",
      });
    });
  }

  return (
    <div className="stage grid gap-10 py-8 lg:grid-cols-12 lg:py-12">
      <div className="lg:col-span-7">
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div className="space-y-3">
            {shots.map((src) => (
              <button key={src} type="button" onClick={() => setShot(src)} className={`overflow-hidden rounded-2xl ${shot === src ? "ring-1 ring-black" : ""}`}>
                <img src={src} alt="" className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
          <img src={shot} alt={bouquet.name} className="aspect-[4/5] w-full rounded-[32px] object-cover" />
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-6xl leading-none">{bouquet.name}</h1>
          <button type="button" aria-label="В избранное" onClick={() => toggleFav(bouquet.slug)} className="mt-2 rounded-full bg-white p-3">
            <Heart size={18} fill={favorites.includes(bouquet.slug) ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="mt-3 text-black/55">{bouquet.composition}</p>
        <p className="mt-6 font-serif text-4xl">{rub(price)}</p>
        <p className="mt-6 text-sm text-black/50">Размер</p>
        <div className="mt-2 flex gap-2">
          {sizes.map((item) => (
            <button key={item.id} type="button" onClick={() => setSize(item.id)} className={`h-12 w-12 rounded-full ${size === item.id ? "bg-cta text-ivory" : "bg-white"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-black/50">Добавить к букету</p>
        <div className="mt-3 space-y-2">
          {addons.map((addon) => {
            const on = picked.includes(addon.id);
            const free = reward && addon.id === "card";
            return (
              <button key={addon.id} type="button" onClick={() => toggleAddon(addon.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${on ? "bg-cta text-ivory" : "bg-white"}`}>
                <img src={addon.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <span className="flex-1">{addon.name}</span>
                <span className="text-sm">{free ? "в подарок" : `+ ${rub(addon.price)}`}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
            <button type="button" aria-label="Меньше" onClick={() => setQty((value) => Math.max(1, value - 1))}>
              <Minus size={16} />
            </button>
            <span>{qty}</span>
            <button type="button" aria-label="Больше" onClick={() => setQty((value) => value + 1)}>
              <Plus size={16} />
            </button>
          </div>
          <button type="button" onClick={toCart} className="btn-primary flex-1">
            Добавить в корзину
          </button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] bg-white/70 p-5">
            <h2 className="font-serif text-2xl">Почему этот букет особенный?</h2>
            <p className="mt-3 text-sm leading-6 text-black/70">{bouquet.story}</p>
          </article>
          <article className="rounded-[24px] bg-white/70 p-5">
            <h2 className="font-serif text-2xl">Важно знать</h2>
            <p className="mt-3 text-sm leading-6 text-black/70">
              Цветы — живой продукт. Оттенки и отдельные элементы композиции могут немного отличаться в зависимости от сезона и поставки, сохраняя общий стиль и настроение букета. В этом демо состав иллюстративный.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
