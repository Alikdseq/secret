"use client";

import Link from "next/link";
import { useState } from "react";

export function Hero() {
  const [shift, setShift] = useState({ x: 0, y: 0 });

  return (
    <section
      className="stage grid min-h-[calc(100vh-5rem)] items-center gap-8 py-8 lg:grid-cols-12 lg:py-4"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setShift({ x, y });
      }}
      onMouseLeave={() => setShift({ x: 0, y: 0 })}
    >
      <div className="lg:col-span-5">
        <p className="eyebrow">Цветы — это эмоции</p>
        <h1 className="mt-5 font-serif text-[64px] leading-[0.88] tracking-[-0.03em] md:text-[88px]">
          Не выбирай
          <br />
          букет.
          <br />
          Создай его.
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-black/65">
          Интерактивный сервис, где ты можешь собрать букет, который говорит за тебя.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/create" className="btn-primary">
            Создать букет
          </Link>
          <Link href="/help-me-choose" className="btn-ghost">
            Помочь выбрать
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/45">
          <Link href="/bouquets" className="hover:text-black">
            Смотреть букеты
          </Link>
          <Link href="/guess" className="hover:text-black">
            Угадать цветок
          </Link>
          <Link href="/delivery" className="hover:text-black">
            Доставка
          </Link>
        </div>
      </div>
      <div className="relative lg:col-span-7">
        <div
          className="relative mx-auto aspect-[5/4] max-h-[760px] w-full"
          style={{ transform: `translate(${shift.x * 18}px, ${shift.y * 12}px) rotate(${shift.x * 3}deg)`, transition: "transform 0.4s ease" }}
        >
          <img src="/images/hero-peony.jpg" alt="Крупный цветок SECRET" className="h-full w-full rounded-[36px] object-cover object-[68%_center]" />
          <span className="floaty absolute left-[8%] top-[18%] h-16 w-12 rounded-full bg-[#f3d5d2]/80 blur-[1px]" />
          <span className="floaty absolute bottom-[16%] right-[10%] h-10 w-8 rounded-full bg-white/80" style={{ animationDelay: "1.2s" }} />
        </div>
      </div>
    </section>
  );
}
