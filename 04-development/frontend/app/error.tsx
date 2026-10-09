"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="stage py-24">
      <p className="eyebrow">Сбой демо</p>
      <h1 className="mt-3 font-serif text-5xl">Экран не собрался.</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-black/70">{error.message}</p>
      <button type="button" onClick={reset} className="btn-primary mt-8">
        Попробовать снова
      </button>
    </div>
  );
}
