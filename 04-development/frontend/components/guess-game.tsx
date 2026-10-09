"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { flowerForDate, isCorrect, type GameFlower } from "@/data/game";
import { useShop } from "@/lib/store";

const rows = ["йцукенгшщзхъ".split(""), "фывапролджэ".split(""), ["ё", ..."ячсмитьбю".split("")]];

export function GuessGame() {
  const setReward = useShop((s) => s.setReward);
  const [flower, setFlower] = useState<GameFlower | null>(null);
  const [value, setValue] = useState("");
  const [state, setState] = useState<"play" | "wrong" | "right">("play");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const today = new Date();
    const current = flowerForDate(today);
    setFlower(current);
    const saved = window.sessionStorage.getItem(`secret-guess-${current.id}-${today.toDateString()}`);
    if (saved === "yes") {
      setState("right");
      setReward(true);
    }
  }, [setReward]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!flower || state === "right") return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.key === "Backspace") {
        event.preventDefault();
        setValue((current) => current.slice(0, -1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        submit();
      } else if (/^[а-яёА-ЯЁ]$/.test(event.key) && value.length < 24) {
        event.preventDefault();
        setValue((current) => current + event.key.toLowerCase());
        setState("play");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function typeLetter(letter: string) {
    if (state === "right" || value.length >= 24) return;
    setState("play");
    setValue((current) => current + letter);
  }

  function submit() {
    if (!flower || !value.trim()) return;
    if (isCorrect(flower, value)) {
      setState("right");
      setReward(true);
      window.sessionStorage.setItem(`secret-guess-${flower.id}-${new Date().toDateString()}`, "yes");
      return;
    }
    setState("wrong");
    setShake(true);
    window.setTimeout(() => setShake(false), 350);
  }

  if (!flower) {
    return <div className="stage py-24 font-serif text-4xl text-black/30">Собираем цветок дня…</div>;
  }

  return (
    <div className="stage grid gap-10 py-10 lg:grid-cols-12 lg:py-14">
      <div className="lg:col-span-8">
        <p className="eyebrow">Каждый день — новый цветок</p>
        <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-7xl">Угадай, какой это цветок?</h1>
        <p className="mt-4 max-w-lg text-black/60">Узнаешь его? Название скрыто, пока не ответишь.</p>
        <div className={`relative mt-8 overflow-hidden rounded-[32px] bg-white ${shake ? "shake" : ""}`}>
          <img
            src={flower.image}
            alt="Цветок дня"
            className={`aspect-[16/10] w-full object-cover transition duration-700 ${state === "right" ? "scale-105" : "scale-100"}`}
          />
        </div>
        <div className="mt-6 flex min-h-16 flex-wrap gap-2">
          {value.split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, scale: 0.7, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.18 }}
              className="grid h-14 w-12 place-items-center rounded-2xl bg-white font-serif text-3xl"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        {state === "wrong" && <p className="mt-3 text-sm text-black/60">Пока нет. Попробуй ещё.</p>}
        {state === "right" && (
          <div className="mt-6">
            <h2 className="font-serif text-5xl">Ты угадал!</h2>
            <p className="mt-2 text-black/70">
              Это {flower.name.toLowerCase()}. {flower.line} Тебе подарок от SECRET: открытка к букету бесплатно.
            </p>
            <Link href="/bouquets" className="btn-primary mt-5">
              Выбрать букет
            </Link>
          </div>
        )}
        <div className="mt-6 space-y-2">
          {rows.map((row) => (
            <div key={row.join("")} className="flex flex-wrap justify-center gap-1.5">
              {row.map((letter) => (
                <button key={letter} type="button" onClick={() => typeLetter(letter)} className="h-11 min-w-9 rounded-xl bg-white px-2 text-sm uppercase shadow-sm transition hover:-translate-y-0.5">
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-2 pt-2">
            <button type="button" onClick={() => setValue((current) => current.slice(0, -1))} className="grid h-11 w-14 place-items-center rounded-xl bg-white" aria-label="Стереть">
              <Delete size={16} />
            </button>
            <button type="button" onClick={submit} className="btn-primary">
              Угадать
            </button>
          </div>
        </div>
      </div>
      <aside className="lg:col-span-4">
        <div className="panel p-6">
          <p className="eyebrow">Как это работает</p>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-black/70">
            <li>01 — Смотришь цветок. Имени на экране нет.</li>
            <li>02 — Печатаешь с клавиатуры или кнопками.</li>
            <li>03 — Верный ответ открывает подарок: открытка к заказу.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
