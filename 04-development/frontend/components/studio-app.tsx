"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Availability, Bouquet, Listing, Tag } from "@/data/catalog";
import { categories } from "@/data/catalog";
import { notifyCatalog } from "@/lib/use-public-bouquets";
import { rub } from "@/lib/money";

type Pack = {
  id: string;
  name: string;
  price: number;
  description: string;
  enabled: boolean;
  image: string;
  color: string;
};

type Draft = {
  id?: string;
  name: string;
  price: string;
  composition: string;
  packaging: string;
  availability: Availability;
  description: string;
  category: Tag;
  qty: string;
  image: string;
  listing: Listing;
  locked?: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  price: "",
  composition: "",
  packaging: "",
  availability: "in_stock",
  description: "",
  category: "author",
  qty: "1",
  image: "",
  listing: "published",
});

const availabilityLabel: Record<Availability, string> = {
  in_stock: "В наличии",
  made_to_order: "Под заказ",
  sold: "Продан",
};

export function StudioApp() {
  const params = useSearchParams();
  const openedEdit = useRef(false);
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"new" | "stock" | "packs">("new");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [filter, setFilter] = useState<"stock" | "order" | "archive" | "draft">("stock");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const response = await fetch("/api/studio/products?scope=manage");
    if (!response.ok) return;
    const data = (await response.json()) as { products: Bouquet[]; packs: Pack[] };
    setProducts(data.products);
    setPacks(data.packs);
  }

  useEffect(() => {
    fetch("/api/studio/session")
      .then((response) => response.json())
      .then((data: { ok?: boolean; configured?: boolean }) => {
        setOn(Boolean(data.ok));
        setConfigured(data.configured !== false);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (on) void refresh();
  }, [on]);

  useEffect(() => {
    const editId = params.get("edit");
    if (!on || !editId || openedEdit.current || products.length === 0) return;
    const item = products.find((product) => product.studioId === editId);
    if (!item) return;
    openedEdit.current = true;
    edit(item);
  }, [on, params, products]);

  async function enter() {
    setError("");
    const response = await fetch("/api/studio/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error || "Код не подошёл.");
      return;
    }
    setCode("");
    setOn(true);
  }

  async function leave() {
    await fetch("/api/studio/logout", { method: "POST" });
    setOn(false);
  }

  async function save(listing: Listing) {
    setError("");
    setNotice("");
    const payload = {
      name: draft.name,
      price: Number(draft.price),
      composition: draft.composition,
      packaging: draft.packaging,
      availability: draft.availability,
      description: draft.description,
      category: draft.category,
      qty: Number(draft.qty || 1),
      image: draft.image,
      listing,
    };
    const response = await fetch("/api/studio/products", {
      method: draft.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft.id ? { id: draft.id, patch: payload } : payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Не удалось сохранить.");
      return;
    }
    setNotice(listing === "draft" ? "Черновик сохранён." : "Карточка опубликована. Она уже в каталоге.");
    setDraft(emptyDraft());
    notifyCatalog();
    await refresh();
    if (listing === "published") setTab("stock");
  }

  async function patchProduct(id: string, patch: Record<string, unknown>) {
    const response = await fetch("/api/studio/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, patch }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Не удалось обновить.");
      return;
    }
    notifyCatalog();
    await refresh();
  }

  function edit(item: Bouquet) {
    setDraft({
      id: item.studioId,
      name: item.name,
      price: String(item.price),
      composition: item.composition,
      packaging: item.packaging || "",
      availability: item.availability || "in_stock",
      description: item.story,
      category: item.tags[0] || "author",
      qty: String(item.qty ?? 1),
      image: item.image,
      listing: item.listing || "published",
      locked: item.locked,
    });
    setTab("new");
    setNotice("");
    setError("");
  }

  function duplicate(item: Bouquet) {
    setDraft({
      name: `${item.name} — копия`,
      price: String(item.price),
      composition: item.composition,
      packaging: item.packaging || "",
      availability: "in_stock",
      description: item.story,
      category: item.tags[0] || "author",
      qty: "1",
      image: item.image,
      listing: "draft",
    });
    setTab("new");
    setNotice("Это копия. Проверьте фото и опубликуйте как новый букет.");
  }

  const visible = products.filter((item) => {
    if (filter === "draft") return item.listing === "draft";
    if (filter === "archive") return item.listing === "archived" || item.listing === "hidden" || item.availability === "sold";
    if (filter === "order") return item.listing === "published" && item.availability === "made_to_order";
    return item.listing === "published" && item.availability === "in_stock";
  });

  if (!ready) return <section className="stage py-16 text-sm text-black/45">Открываем SECRET STUDIO…</section>;

  if (!on) {
    return (
      <section className="stage grid min-h-[70vh] place-items-center py-10">
        <form
          className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-soft"
          onSubmit={(event) => {
            event.preventDefault();
            void enter();
          }}
        >
          <p className="eyebrow">Для команды</p>
          <h1 className="mt-2 font-serif text-5xl leading-none">SECRET STUDIO</h1>
          <p className="mt-3 text-sm leading-6 text-black/60">Панель управления магазином. Введите код доступа.</p>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            type="password"
            autoComplete="current-password"
            inputMode="text"
            placeholder="Код доступа"
            className="mt-6 h-14 w-full rounded-2xl bg-[#f6f1ea] px-4 text-lg outline-none"
          />
          {error && <p className="mt-3 text-sm text-[#8C3A3A]">{error}</p>}
          {!configured && <p className="mt-3 text-sm text-[#8C3A3A]">Код не задан на сервере. Покупательский кабинет здесь не открывается.</p>}
          <button type="submit" className="btn-primary mt-5 w-full">
            Продолжить
          </button>
          <p className="mt-4 text-xs leading-5 text-black/40">Код проверяется на сервере и не хранится в странице. Это демо, не официальный вход магазина.</p>
        </form>
      </section>
    );
  }

  return (
    <section className="stage py-6 pb-28">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Режим управления</p>
          <h1 className="mt-1 font-serif text-4xl">SECRET STUDIO</h1>
        </div>
        <button type="button" onClick={() => void leave()} className="text-sm text-black/45">
          Выйти
        </button>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["new", draft.id ? "Правка" : "Новый букет"],
            ["stock", "Ассортимент"],
            ["packs", "Упаковка"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${tab === id ? "bg-cta text-ivory" : "bg-white"}`}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-[#8C3A3A]">{error}</p>}
      {notice && <p className="mt-4 text-sm text-black/60">{notice}</p>}

      {tab === "new" && (
        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save("published");
          }}
        >
          <p className="text-xs uppercase tracking-[0.14em] text-black/35">{draft.id ? "Редактирование" : "Черновик"}</p>
          <PhotoField image={draft.image} onChange={(image) => setDraft((current) => ({ ...current, image }))} />
          <Field label="Название букета *">
            <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="field" />
          </Field>
          <Field label="Цена, ₽ *">
            <input required inputMode="numeric" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value.replace(/[^\d]/g, "") })} className="field" />
          </Field>
          <Field label="Состав букета">
            <input value={draft.composition} onChange={(event) => setDraft({ ...draft, composition: event.target.value })} placeholder="Роза · Пион · Эвкалипт" className="field" />
          </Field>
          <Field label="Категория">
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Tag })} className="field">
              {categories.filter((item) => item.id !== "all").map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Упаковка">
            <div className="flex flex-wrap gap-2">
              {packs.map((pack) => (
                <button key={pack.id} type="button" onClick={() => setDraft({ ...draft, packaging: pack.name })} className={`rounded-full px-3 py-2 text-sm ${draft.packaging === pack.name ? "bg-cta text-ivory" : "bg-white"}`}>
                  {pack.name}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Наличие">
            <div className="grid gap-2">
              {(Object.keys(availabilityLabel) as Availability[]).map((id) => (
                <button key={id} type="button" onClick={() => setDraft({ ...draft, availability: id, qty: id === "sold" ? "0" : draft.qty || "1" })} className={`rounded-2xl px-4 py-3 text-left text-sm ${draft.availability === id ? "bg-cta text-ivory" : "bg-white"}`}>
                  {availabilityLabel[id]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Сколько таких букетов">
            <input inputMode="numeric" value={draft.qty} onChange={(event) => setDraft({ ...draft, qty: event.target.value.replace(/[^\d]/g, "") })} className="field" />
          </Field>
          <Field label="Описание">
            <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="field min-h-28" placeholder="Повод, настроение, что важно знать" />
          </Field>
          <button type="submit" className="btn-primary">
            Опубликовать
          </button>
          <button type="button" onClick={() => void save("draft")} className="btn-ghost">
            Сохранить черновик
          </button>
        </form>
      )}

      {tab === "stock" && (
        <div className="mt-5">
          <div className="flex gap-2 overflow-x-auto">
            {(
              [
                ["stock", "В наличии"],
                ["order", "Под заказ"],
                ["archive", "Архив"],
                ["draft", "Черновики"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFilter(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${filter === id ? "bg-cta text-ivory" : "bg-white"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {visible.map((item) => (
              <article key={item.studioId || item.slug} className="grid grid-cols-[88px_1fr] gap-3 rounded-[24px] bg-white p-3">
                <img src={item.image} alt="" className="h-28 w-full rounded-2xl object-cover" />
                <div>
                  <p className="font-serif text-2xl leading-none">{item.name}</p>
                  <p className="mt-1 text-sm">{item.availability === "sold" ? "Продан" : rub(item.price)}</p>
                  <p className="text-xs text-black/45">
                    {availabilityLabel[item.availability || "in_stock"]}
                    {item.listing === "hidden" ? " · скрыт" : item.listing === "archived" ? " · архив" : ""} · {item.qty ?? 1} шт.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Mini onClick={() => edit(item)}>Изменить</Mini>
                    {item.availability === "sold" ? (
                      <Mini onClick={() => item.studioId && void patchProduct(item.studioId, { availability: "in_stock", qty: 1, listing: "published" })}>Вернуть</Mini>
                    ) : (
                      <Mini onClick={() => item.studioId && void patchProduct(item.studioId, { availability: "sold", qty: 0 })}>Продан</Mini>
                    )}
                    <Mini onClick={() => item.studioId && void patchProduct(item.studioId, { listing: item.listing === "hidden" ? "published" : "hidden" })}>
                      {item.listing === "hidden" ? "Показать" : "Скрыть"}
                    </Mini>
                    <Mini onClick={() => duplicate(item)}>Дубль</Mini>
                    <Mini onClick={() => item.studioId && setPendingDelete(item.studioId)}>Удалить</Mini>
                  </div>
                  {pendingDelete === item.studioId && (
                    <div className="mt-2 rounded-2xl bg-[#f6f1ea] p-3 text-sm">
                      <p>{item.locked ? "Карточка из демо-каталога уйдёт в архив, её можно вернуть." : "Убрать карточку из каталога?"}</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => setPendingDelete(null)} className="rounded-full bg-white px-3 py-2">
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void fetch("/api/studio/products", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.studioId }) }).then(() => {
                              setPendingDelete(null);
                              notifyCatalog();
                              return refresh();
                            });
                          }}
                          className="rounded-full bg-cta px-3 py-2 text-ivory"
                        >
                          {item.locked ? "В архив" : "Удалить"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
            {visible.length === 0 && <p className="text-sm text-black/45">В этом списке пусто.</p>}
          </div>
        </div>
      )}

      {tab === "packs" && <PackDesk packs={packs} onChange={refresh} onError={setError} />}
    </section>
  );
}

function PackDesk({ packs, onChange, onError }: { packs: Pack[]; onChange: () => Promise<void>; onError: (value: string) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  async function addPack() {
    const response = await fetch("/api/studio/packs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, price: Number(price || 0), description, image }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      onError(data.error || "Не удалось добавить упаковку.");
      return;
    }
    setName("");
    setPrice("");
    setDescription("");
    setImage("");
    await onChange();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const response = await fetch("/api/studio/packs", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) onError(data.error || "Не удалось обновить упаковку.");
    else await onChange();
  }

  return (
    <div className="mt-5 grid gap-3">
      <p className="text-sm leading-6 text-black/55">Фото упаковки — для карточки товара. В игре бумага по-прежнему цветной слой: снимок сам не оборачивает чужой букет.</p>
      {packs.map((pack, index) => (
        <article key={pack.id} className="rounded-[24px] bg-white p-3">
          <div className="flex gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl" style={{ background: pack.color }}>
              {pack.image && <img src={pack.image} alt="" className="h-full w-full object-cover" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-2xl leading-none">{pack.name}</p>
              <p className="text-sm">{rub(pack.price)}{pack.enabled ? "" : " · выключена"}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Mini onClick={() => void patch(pack.id, { patch: { enabled: !pack.enabled } })}>{pack.enabled ? "Выключить" : "Включить"}</Mini>
            <Mini onClick={() => void patch(pack.id, { move: -1 })} disabled={index === 0}>Выше</Mini>
            <Mini onClick={() => void patch(pack.id, { move: 1 })} disabled={index === packs.length - 1}>Ниже</Mini>
          </div>
        </article>
      ))}
      <div className="grid gap-3 rounded-[24px] bg-white p-4">
        <p className="text-sm">Новая упаковка</p>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Название" className="field" />
        <input value={price} inputMode="numeric" onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))} placeholder="Цена, ₽" className="field" />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Коротко, какая она" className="field" />
        <PhotoField image={image} onChange={setImage} />
        <button type="button" onClick={() => void addPack()} className="btn-primary">
          Добавить упаковку
        </button>
      </div>
    </div>
  );
}

function PhotoField({ image, onChange }: { image: string; onChange: (value: string) => void }) {
  async function take(file: File | undefined) {
    if (!file) return;
    onChange(await shrinkPhoto(file));
  }

  return (
    <div className="grid gap-2">
      {image && <img src={image} alt="" className="aspect-[4/5] w-full rounded-[28px] object-cover" />}
      <label className="btn-primary cursor-pointer text-center">
        Сфотографировать букет
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => void take(event.target.files?.[0])} />
      </label>
      <label className="btn-ghost cursor-pointer text-center">
        Выбрать фото из галереи
        <input type="file" accept="image/*" className="hidden" onChange={(event) => void take(event.target.files?.[0])} />
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-black/50">{label}</span>
      {children}
    </label>
  );
}

function Mini({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="rounded-full bg-[#f6f1ea] px-3 py-2 text-xs disabled:opacity-30">
      {children}
    </button>
  );
}

function shrinkPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Не удалось прочитать фото."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Фото не открылось."));
    };
    image.src = url;
  });
}
