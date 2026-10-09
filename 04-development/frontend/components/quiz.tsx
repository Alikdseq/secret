"use client";

import { useState } from "react";
import Link from "next/link";
import { bouquets, type Bouquet } from "@/data/catalog";
import { rub } from "@/lib/money";

const questions = [
  {
    key: "who",
    title: "Кому ты хочешь сделать подарок?",
    options: ["Маме", "Любимой", "Сестре", "Подруге", "Коллеге", "Другому человеку"],
  },
  {
    key: "occasion",
    title: "По какому поводу?",
    options: ["День рождения", "Годовщина", "Спасибо", "Просто так", "Извиниться", "Хочу удивить"],
  },
  {
    key: "character",
    title: "Какая она?",
    options: ["Нежная", "Яркая", "Элегантная", "Романтичная", "Необычная", "Минималистичная"],
  },
  {
    key: "budget",
    title: "Бюджет",
    options: ["до 3 000 ₽", "3–5 000 ₽", "5–7 000 ₽", "7–10 000 ₽", "10 000+ ₽"],
  },
] as const;

const byCharacter: Record<string, string> = {
  Нежная: "luminous",
  Яркая: "love-story",
  Элегантная: "white-harmony",
  Романтичная: "pink-secret",
  Необычная: "royal",
  Минималистичная: "moonlight",
};

const bands: Record<string, [number, number]> = {
  "до 3 000 ₽": [0, 4500],
  "3–5 000 ₽": [4500, 5400],
  "5–7 000 ₽": [5400, 7000],
  "7–10 000 ₽": [6900, 9000],
  "10 000+ ₽": [7200, 20000],
};

function pick(answers: Record<string, string>): Bouquet {
  const preferred = bouquets.find((item) => item.slug === byCharacter[answers.character]) ?? bouquets[0];
  const [min, max] = bands[answers.budget] ?? [0, 20000];
  const inBand = bouquets.filter((item) => item.price >= min && item.price <= max);
  return inBand.find((item) => item.slug === preferred.slug) ?? inBand[0] ?? preferred;
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= questions.length;
  const bouquet = done ? pick(answers) : null;

  return (
    <div className="stage grid items-center gap-10 py-10 lg:grid-cols-12 lg:py-16">
      <div className="lg:col-span-6">
        <p className="eyebrow">{done ? "Подбор" : `${step + 1} / ${questions.length}`}</p>
        {!done && (
          <>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">{step === 0 ? "Не знаешь, что подарить?" : questions[step].title}</h1>
            {step === 0 && <p className="mt-5 max-w-md text-black/60">Ответь на несколько вопросов, и мы подберём композицию.</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {questions[step].options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [questions[step].key]: option }));
                    setStep((value) => value + 1);
                  }}
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm transition hover:-translate-y-0.5 hover:border-black/30"
                >
                  {option}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="mt-8 text-sm text-black/45">
                Назад
              </button>
            )}
          </>
        )}
        {done && bouquet && (
          <>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">Кажется, мы нашли твой SECRET.</h1>
            <p className="mt-5 font-serif text-4xl">{bouquet.name}</p>
            <p className="mt-2 text-black/60">{rub(bouquet.price)}</p>
            <p className="mt-4 max-w-md leading-7 text-black/70">
              Для «{answers.who?.toLowerCase()}», повод — {answers.occasion?.toLowerCase()}. Характер — {answers.character?.toLowerCase()}. {bouquet.story}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/bouquets/${bouquet.slug}`} className="btn-primary">
                Это то, что я искал
              </Link>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                }}
              >
                Попробовать ещё
              </button>
            </div>
          </>
        )}
      </div>
      <div className="relative lg:col-span-6">
        <img
          src={bouquet?.image ?? "/images/quiz-bloom.jpg"}
          alt={bouquet ? bouquet.name : "Цветочная скульптура"}
          className="aspect-[4/5] w-full rounded-[36px] object-cover"
        />
      </div>
    </div>
  );
}
