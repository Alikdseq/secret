import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { bouquets } from "@/data/catalog";

const paths = [
  {
    href: "/create",
    title: "Создать букет",
    text: "Зайди в холодильник флориста и собери букет руками.",
    image: "/images/bouquet-luminous.jpg",
  },
  {
    href: "/help-me-choose",
    title: "Помочь выбрать",
    text: "Ответь на несколько вопросов, и мы подберём композицию.",
    image: "/images/quiz-bloom.jpg",
  },
  {
    href: "/bouquets",
    title: "Готовые букеты",
    text: "Авторские композиции от флористов SECRET.",
    image: "/images/bouquet-moonlight.jpg",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="stage pb-8">
        <p className="eyebrow">Давай начнём с простого</p>
        <h2 className="mt-3 max-w-xl font-serif text-5xl leading-[0.95] md:text-6xl">С чего начнём?</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {paths.map((path) => (
            <Link key={path.href} href={path.href} className="lift group overflow-hidden rounded-[28px] bg-white">
              <img src={path.image} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <h3 className="font-serif text-4xl">{path.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{path.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="stage grid items-center gap-8 py-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Игра</p>
          <h2 className="mt-3 font-serif text-5xl leading-[0.95] md:text-6xl">Угадай, какой это цветок?</h2>
          <p className="mt-4 max-w-md text-black/65">Каждый день — другой кадр. Имени на экране нет, пока не ответишь. Верный ответ оставляет открытку к заказу.</p>
          <Link href="/guess" className="btn-primary mt-6">
            Играть
          </Link>
        </div>
        <img src="/images/macro-peony.jpg" alt="" className="aspect-[4/3] w-full rounded-[32px] object-cover" />
      </section>
      <section className="stage pb-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-5xl">Букеты</h2>
          <Link href="/bouquets" className="text-sm text-black/50">
            Все композиции
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bouquets.slice(0, 3).map((bouquet) => (
            <ProductCard key={bouquet.slug} bouquet={bouquet} />
          ))}
        </div>
      </section>
    </>
  );
}
