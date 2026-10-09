"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rub } from "@/lib/money";
import type { CartItem } from "@/lib/store";

type Order = {
  id: string;
  form: { buyer: string; recipient: string; address: string; date: string; time: string; pay: string };
  items: CartItem[];
  total: number;
};

export function SuccessView() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("secret-order");
    if (!raw) return;
    try {
      setOrder(JSON.parse(raw) as Order);
    } catch {
      setOrder(null);
    }
  }, []);

  if (!order) {
    return (
      <div className="stage py-24">
        <h1 className="font-serif text-5xl">Заказа на этом экране нет.</h1>
        <Link href="/" className="btn-primary mt-6">
          Вернуться домой
        </Link>
      </div>
    );
  }

  return (
    <div className="stage max-w-3xl py-16">
      <p className="eyebrow">Демо-заказ</p>
      <h1 className="mt-3 font-serif text-6xl md:text-7xl">SECRET готов.</h1>
      <p className="mt-4 text-black/65">Мы получили твой заказ. Это макет: флорист его не видит, оплата не прошла.</p>
      <div className="panel mt-8 space-y-3 p-6 text-sm leading-6">
        <p>Номер {order.id}</p>
        <p>Сумма {rub(order.total)}</p>
        <p>
          Когда: {order.form.date} в {order.form.time}
        </p>
        <p>Куда: {order.form.address}</p>
        <p>Получатель: {order.form.recipient || "не указан"}</p>
        <p>От кого: {order.form.buyer}</p>
        <div className="pt-2">
          {order.items.map((item) => (
            <p key={item.key}>
              {item.name} × {item.qty}
            </p>
          ))}
        </div>
      </div>
      <Link href="/" className="btn-primary mt-8">
        Вернуться в магазин
      </Link>
    </div>
  );
}
