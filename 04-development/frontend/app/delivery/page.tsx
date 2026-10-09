import Link from "next/link";
import { DELIVERY_FEE, FREE_FROM, rub } from "@/lib/money";

const faqs = [
  ["Это настоящая доставка SECRET?", "Нет. На экране демонстрационный сценарий. Зоны, тариф и часы магазина сюда не передавались."],
  ["Когда привезут?", "В демо можно выбрать дату и время. Фраза, которую держим: когда получатель получит букет."],
  ["Можно забрать самому?", "Самовывоз в макете не обещаем: адреса магазина в проекте нет."],
];

export default function DeliveryPage() {
  return (
    <div className="stage max-w-4xl py-12">
      <p className="eyebrow">Демо-условия</p>
      <h1 className="mt-3 font-serif text-6xl md:text-7xl">Куда отправим SECRET?</h1>
      <p className="mt-5 max-w-2xl leading-7 text-black/65">
        Мы не продаём строку «доставка {rub(DELIVERY_FEE)}». Мы собираем момент: адрес, день и час, когда букет окажется у человека.
        Цифры ниже не тариф магазина.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["По городу", `В демо ${rub(DELIVERY_FEE)}, бесплатно от ${rub(FREE_FROM)}`],
          ["Время", "Слот выбирается при заказе. Пример в макете — 18:00"],
          ["Оплата", "На экране: онлайн или при получении. Деньги не списываются"],
        ].map(([title, text]) => (
          <article key={title} className="rounded-[24px] bg-white/75 p-5">
            <h2 className="font-serif text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-black/65">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 space-y-4">
        {faqs.map(([q, a]) => (
          <article key={q}>
            <h2 className="font-serif text-2xl">{q}</h2>
            <p className="mt-1 text-sm leading-6 text-black/65">{a}</p>
          </article>
        ))}
      </div>
      <Link href="/checkout" className="btn-primary mt-10">
        К оформлению
      </Link>
    </div>
  );
}
