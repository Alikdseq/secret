"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DELIVERY_FEE, FREE_FROM, rub } from "@/lib/money";
import { lineTotal, useShop } from "@/lib/store";

type Form = {
  buyer: string;
  buyerPhone: string;
  recipient: string;
  recipientPhone: string;
  address: string;
  date: string;
  time: string;
  comment: string;
  card: string;
  pay: "online" | "cash";
};

const empty: Form = {
  buyer: "",
  buyerPhone: "",
  recipient: "",
  recipientPhone: "",
  address: "",
  date: "",
  time: "18:00",
  comment: "",
  card: "",
  pay: "cash",
};

export function CheckoutView() {
  const router = useRouter();
  const items = useShop((s) => s.items);
  const reward = useShop((s) => s.guessReward);
  const ready = useShop((s) => s.ready);
  const clear = useShop((s) => s.clear);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().slice(0, 10);
    setForm((current) => ({ ...current, date, time: current.time || "18:00" }));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + lineTotal(item, reward), 0);
  const delivery = subtotal === 0 || subtotal >= FREE_FROM ? 0 : DELIVERY_FEE;

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: string[] = [];
    if (!form.buyer.trim()) next.push("Имя покупателя");
    if (form.buyerPhone.trim().length < 6) next.push("Телефон покупателя");
    if (!form.address.trim()) next.push("Адрес");
    if (!form.date) next.push("Дата");
    if (!form.time) next.push("Время");
    setErrors(next);
    if (next.length || items.length === 0) return;
    const order = {
      id: `SECRET-${Math.floor(1000 + Math.random() * 9000)}`,
      form,
      items,
      reward,
      subtotal,
      delivery,
      total: subtotal + delivery,
    };
    window.sessionStorage.setItem("secret-order", JSON.stringify(order));
    clear();
    router.push("/success");
  }

  if (!ready) {
    return <div className="stage py-24 font-serif text-5xl text-black/20">Оформление</div>;
  }

  if (items.length === 0) {
    return (
      <div className="stage py-24">
        <h1 className="font-serif text-5xl">Корзина пуста.</h1>
        <Link href="/bouquets" className="btn-primary mt-6">
          К букетам
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="stage grid gap-10 py-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        <div>
          <p className="eyebrow">Оформление</p>
          <h1 className="mt-2 font-serif text-6xl">Куда отправим SECRET?</h1>
          <p className="mt-3 text-black/60">Оплата в этом демо не списывает деньги. Мы продаём момент получения, не банковский шлюз.</p>
        </div>
        <Field title="Покупатель">
          <Input label="Имя" value={form.buyer} onChange={(value) => set("buyer", value)} />
          <Input label="Телефон" value={form.buyerPhone} onChange={(value) => set("buyerPhone", value)} />
        </Field>
        <Field title="Получатель">
          <Input label="Имя" value={form.recipient} onChange={(value) => set("recipient", value)} />
          <Input label="Телефон" value={form.recipientPhone} onChange={(value) => set("recipientPhone", value)} />
        </Field>
        <Field title="Когда получатель получит букет?">
          <Input label="Адрес" value={form.address} onChange={(value) => set("address", value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Дата" type="date" value={form.date} onChange={(value) => set("date", value)} />
            <Input label="Время" type="time" value={form.time} onChange={(value) => set("time", value)} />
          </div>
          <label className="block text-sm">
            Комментарий
            <textarea value={form.comment} onChange={(event) => set("comment", event.target.value)} className="mt-2 h-24 w-full rounded-2xl bg-white px-4 py-3 outline-none" />
          </label>
        </Field>
        <Field title="Открытка">
          <textarea value={form.card} maxLength={150} onChange={(event) => set("card", event.target.value)} placeholder="Напишите сообщение..." className="h-28 w-full rounded-2xl bg-white px-4 py-3 outline-none" />
        </Field>
        <Field title="Оплата, демо">
          <div className="flex gap-3">
            {(["cash", "online"] as const).map((id) => (
              <button key={id} type="button" onClick={() => set("pay", id)} className={`rounded-full px-5 py-3 text-sm ${form.pay === id ? "bg-cta text-ivory" : "bg-white"}`}>
                {id === "cash" ? "При получении" : "Онлайн"}
              </button>
            ))}
          </div>
          <p className="text-xs text-black/45">Онлайн здесь только выбор на экране. Платёж не подключён.</p>
        </Field>
        {errors.length > 0 && <p className="text-sm text-black/70">Нужно заполнить: {errors.join(", ")}.</p>}
        <button type="submit" className="btn-primary">
          Подтвердить демо-заказ
        </button>
      </div>
      <aside className="panel h-fit p-6 lg:col-span-5">
        {items.map((item) => (
          <p key={item.key} className="flex justify-between gap-4 border-b border-black/[0.05] py-3 text-sm">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{rub(lineTotal(item, reward))}</span>
          </p>
        ))}
        <p className="mt-4 flex justify-between font-serif text-3xl">
          <span>Итого</span>
          <span>{rub(subtotal + delivery)}</span>
        </p>
      </aside>
    </form>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-3xl">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl bg-white px-4 py-3 outline-none" />
    </label>
  );
}
