"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Heart, Search, ShoppingBag, X } from "lucide-react";
import { bouquets, flowers } from "@/data/catalog";
import { lineTotal, useShop } from "@/lib/store";
import { rub } from "@/lib/money";

const links = [
  ["/bouquets", "Букеты"],
  ["/create", "Создать букет"],
  ["/help-me-choose", "Помочь выбрать"],
  ["/guess", "Игра"],
  ["/delivery", "Доставка"],
  ["/about", "О нас"],
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const items = useShop((s) => s.items);
  const favorites = useShop((s) => s.favorites);
  const reward = useShop((s) => s.guessReward);
  const toast = useShop((s) => s.toast);
  const searchOpen = useShop((s) => s.searchOpen);
  const favOpen = useShop((s) => s.favOpen);
  const setSearchOpen = useShop((s) => s.setSearchOpen);
  const setFavOpen = useShop((s) => s.setFavOpen);
  const [compact, setCompact] = useState(false);
  const [more, setMore] = useState(false);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const pending = useShop.persist.rehydrate() as Promise<void> | void;
    const mark = () => useShop.setState({ ready: true });
    if (pending && typeof pending.then === "function") pending.then(mark, mark);
    else mark();
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setFavOpen(false);
    setMore(false);
  }, [pathname, setFavOpen, setSearchOpen]);

  const subtotal = items.reduce((sum, item) => sum + lineTotal(item, reward), 0);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-black/[0.04] backdrop-blur-xl transition ${
          compact ? "bg-[#f6f1ea]/80" : "bg-[#f6f1ea]/55"
        }`}
      >
        <div className={`stage flex items-center gap-6 ${compact ? "h-16" : "h-20"}`}>
          <Link href="/" className="font-serif text-[28px] leading-none tracking-[0.16em]">
            SECRET
          </Link>
          <nav className="hidden flex-1 items-center gap-6 xl:flex">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`text-[13px] transition hover:text-black ${pathname === href ? "text-black" : "text-black/55"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <IconButton label="Поиск" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </IconButton>
            <IconButton label="Избранное" onClick={() => setFavOpen(true)}>
              <Heart size={18} fill={favorites.length ? "currentColor" : "none"} />
            </IconButton>
            <Link href="/cart" aria-label="Корзина" className="relative rounded-full p-3 transition hover:bg-white/70">
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cta px-1 text-[10px] text-ivory">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className="min-h-[70vh] pb-24 md:pb-0">{children}</main>
      <footer className="mt-20 border-t border-black/[0.06]">
        <div className="stage flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-4xl tracking-[0.14em]">SECRET</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-black/60">
              Цветы, которые говорят за тебя. Это демонстрационный макет, не официальный сайт магазина. Цены, составы и
              доставка здесь — демо-данные.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/60">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-black">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-[#f6f1ea]/92 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 px-2 py-2 text-[10px] uppercase tracking-[0.12em]">
          <Tab href="/" label="Главная" active={pathname === "/"} />
          <Tab href="/bouquets" label="Букеты" active={pathname.startsWith("/bouquets")} />
          <Link href="/create" className="-mt-4 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cta text-[10px] text-ivory">Создать</span>
          </Link>
          <Tab href="/guess" label="Игра" active={pathname === "/guess"} />
          <button type="button" onClick={() => setMore(true)} className="grid place-items-center text-black/60">
            Ещё
          </button>
        </div>
      </nav>
      {more && (
        <button type="button" className="fixed inset-0 z-50 bg-black/20 md:hidden" onClick={() => setMore(false)}>
          <div
            className="absolute inset-x-3 bottom-20 rounded-[28px] bg-paper p-5 text-left shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="block border-b border-black/[0.05] py-3 text-sm">
                {label}
              </Link>
            ))}
            <Link href="/cart" className="block py-3 text-sm">
              Корзина {count > 0 ? `· ${rub(subtotal)}` : ""}
            </Link>
          </div>
        </button>
      )}
      {searchOpen && <SearchOverlay />}
      {favOpen && <FavDrawer />}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-cta px-5 py-3 text-sm text-ivory md:bottom-8">
          {toast}
        </div>
      )}
    </>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="rounded-full p-3 transition hover:bg-white/70">
      {children}
    </button>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`grid place-items-center ${active ? "text-black" : "text-black/45"}`}>
      {label}
    </Link>
  );
}

function SearchOverlay() {
  const setSearchOpen = useShop((s) => s.setSearchOpen);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const q = query.trim().toLowerCase();
  const foundBouquets = useMemo(
    () => bouquets.filter((item) => `${item.name} ${item.composition} ${item.epithet}`.toLowerCase().includes(q)),
    [q],
  );
  const foundFlowers = useMemo(() => flowers.filter((item) => item.name.toLowerCase().includes(q)), [q]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (foundBouquets[0]) router.push(`/bouquets/${foundBouquets[0].slug}`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f1ea]/95 backdrop-blur-xl">
      <div className="stage pt-8">
        <div className="flex items-start justify-between gap-6">
          <form onSubmit={submit} className="w-full">
            <p className="eyebrow">Поиск</p>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что ищем?"
              className="mt-4 w-full bg-transparent font-serif text-5xl outline-none placeholder:text-black/20 md:text-7xl"
            />
          </form>
          <button type="button" aria-label="Закрыть" onClick={() => setSearchOpen(false)} className="rounded-full p-3 hover:bg-white">
            <X />
          </button>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <section>
            <p className="eyebrow">Букеты</p>
            <div className="mt-4 space-y-3">
              {(q ? foundBouquets : bouquets).slice(0, 5).map((item) => (
                <Link key={item.slug} href={`/bouquets/${item.slug}`} className="flex items-center gap-4">
                  <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <span>
                    <span className="block font-serif text-2xl">{item.name}</span>
                    <span className="text-sm text-black/50">{item.epithet}</span>
                  </span>
                </Link>
              ))}
              {q && foundBouquets.length === 0 && <p className="text-sm text-black/50">Такого букета в демо нет.</p>}
            </div>
          </section>
          <section>
            <p className="eyebrow">Цветы</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(q ? foundFlowers : flowers).map((item) => (
                <Link key={item.id} href="/create" className="rounded-full bg-white px-4 py-2 text-sm">
                  {item.name}
                </Link>
              ))}
              {q && foundFlowers.length === 0 && <p className="text-sm text-black/50">В демо такого цветка нет.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FavDrawer() {
  const favorites = useShop((s) => s.favorites);
  const toggleFav = useShop((s) => s.toggleFav);
  const setFavOpen = useShop((s) => s.setFavOpen);
  const saved = bouquets.filter((item) => favorites.includes(item.slug));

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setFavOpen(false)}>
      <aside className="absolute bottom-0 right-0 top-0 w-full max-w-md overflow-auto bg-[#f6f1ea] p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-4xl">Избранное</h2>
          <button type="button" aria-label="Закрыть" onClick={() => setFavOpen(false)}>
            <X />
          </button>
        </div>
        <div className="mt-8 space-y-4">
          {saved.length === 0 && <p className="text-sm leading-6 text-black/60">Пока пусто. Сердце на карточке сохраняет букет в этом браузере, без аккаунта.</p>}
          {saved.map((item) => (
            <div key={item.slug} className="flex gap-4">
              <Link href={`/bouquets/${item.slug}`} onClick={() => setFavOpen(false)}>
                <img src={item.image} alt="" className="h-24 w-20 rounded-2xl object-cover" />
              </Link>
              <div className="flex-1">
                <Link href={`/bouquets/${item.slug}`} onClick={() => setFavOpen(false)} className="font-serif text-2xl">
                  {item.name}
                </Link>
                <p className="text-sm text-black/50">{rub(item.price)}</p>
                <button type="button" onClick={() => toggleFav(item.slug)} className="mt-2 text-xs uppercase tracking-[0.14em] text-black/50">
                  Убрать
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
