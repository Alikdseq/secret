"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ru">
      <body style={{ background: "#f6f1ea", color: "#171717", fontFamily: "sans-serif" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 12 }}>SECRET</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 500, margin: "12px 0" }}>Экран не собрался.</h1>
          <p>Демо споткнулось на этом шаге. Обновите страницу.</p>
          <button type="button" onClick={reset} style={{ marginTop: 24, border: 0, borderRadius: 999, background: "#1b2621", color: "#f6f1ea", padding: "12px 20px" }}>
            Ещё раз
          </button>
        </main>
      </body>
    </html>
  );
}
