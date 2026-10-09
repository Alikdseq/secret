"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { addons } from "@/data/catalog";
import { DELIVERY_FEE, FREE_FROM, rub } from "@/lib/money";
import { lineTotal, useShop } from "@/lib/store";

export function CartView() {
  const items = useShop((s) => s.items);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const add = useShop((s) => s.add);
  const reward = useShop((s) => s.guessReward);
  const ready = useShop((s) => s.ready);
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item, reward), 0);

  if (!ready) {
    return <div className="stage py-24 font-serif text-5xl text-black/20">Корзина</div>;
  }
  const delivery = subtotal === 0 || subtotal >= FREE_FROM ? 0 : DELIVERY_FEE;
  const hasCard = items.some((item) => item.kind === "addon" && item.key.startsWith("addon:card"));
  const left = Math.max(0, FREE_FROM - subtotal);

  if (items.length === 0) {
    return (
      <div className="stage py-24">
        <p className="eyebrow">Корзина</p>
        <h1 className="mt-3 font-serif text-6xl">Здесь пока пусто.</h1>
        <p className="mt-4 text-black/60">Может, соберём что-нибудь красивое?</p>
        <Link href="/create" className="btn-primary mt-8">
          Создать букет
        </Link>
      </div>
    );
  }

  return (
    <div className="stage py-10">
      <h1 className="font-serif text-6xl">Ваша корзина</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          {items.map((item) => (
            <article key={item.key} className="flex gap-4 rounded-[24px] bg-white/75 p-3">
              <img src={item.image} alt="" className="h-28 w-24 rounded-2xl object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl leading-none">{item.name}</h2>
                    <p className="mt-1 text-sm text-black/50">{item.detail}</p>
                  </div>
                  <p>{rub(lineTotal(item, reward))}</p>
                </div>
                <div className="mt-auto flex items-center gap-3 pt-3">
                  {item.kind !== "addon" && (
                    <div className="flex items-center gap-3">
                      <button type="button" aria-label="Меньше" onClick={() => setQty(item.key, item.qty - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" aria-label="Больше" onClick={() => setQty(item.key, item.qty + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => remove(item.key)} className="ml-auto text-black/40" aria-label="Удалить">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {reward && (
            <p className="rounded-2xl bg-white px-4 py-3 text-sm">✓ Открытка в подарок {hasCard ? "уже в заказе" : "— добавим на оформлении, если захотите"}</p>
          )}
        </div>
        <aside className="panel h-fit p-6 lg:col-span-5">
          <p className="text-sm text-black/50">Промежуточный итог</p>
          <p className="mt-1 text-right font-serif text-3xl">{rub(subtotal)}</p>
          <div className="mt-4 flex justify-between text-sm">
            <span>Доставка, демо</span>
            <span>{delivery ? rub(delivery) : "0 ₽"}</span>
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4">
            <span>Итого</span>
            <span className="font-serif text-4xl">{rub(subtotal + delivery)}</span>
          </div>
          {left > 0 && <p className="mt-3 text-sm text-black/50">До бесплатной доставки осталось {rub(left)}. Порог демо — {rub(FREE_FROM)}.</p>}
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Оформить заказ
          </Link>
        </aside>
      </div>
      <section className="mt-8 rounded-[28px] bg-cta p-6 text-ivory md:p-8">
        <h2 className="font-serif text-4xl">Сделать подарок особенным?</h2>
        <p className="mt-2 max-w-xl text-sm text-ivory/70">Добавить что-нибудь к букету?</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {addons.map((addon) => (
            <button
              key={addon.id}
              type="button"
              onClick={() =>
                add({
                  key: `addon:${addon.id}:cart`,
                  name: addon.name,
                  price: reward && addon.id === "card" ? 0 : addon.price,
                  image: addon.image,
                  detail: addon.note,
                  kind: "addon",
                })
              }
              className="rounded-2xl bg-white/10 p-3 text-left transition hover:bg-white/15"
            >
              <img src={addon.image} alt="" className="mb-3 h-24 w-full rounded-xl object-cover" />
              <span className="block">{addon.name}</span>
              <span className="text-sm text-ivory/70">{reward && addon.id === "card" ? "в подарок" : rub(addon.price)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
