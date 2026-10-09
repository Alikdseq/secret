import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { bouquets, type Availability, type Listing, type Tag } from "@/data/catalog";
import { gamePacks } from "@/data/fridge";

export type StudioProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  composition: string;
  packaging: string;
  availability: Availability;
  description: string;
  category: Tag;
  qty: number;
  image: string;
  listing: Listing;
  locked: boolean;
  updatedAt: string;
};

export type StudioPack = {
  id: string;
  name: string;
  price: number;
  description: string;
  enabled: boolean;
  order: number;
  image: string;
  color: string;
  ink: string;
};

type Database = { products: StudioProduct[]; packs: StudioPack[] };

const filePath = path.join(process.cwd(), "data", "studio-db.json");
let chain: Promise<unknown> = Promise.resolve();

function seed(): Database {
  const now = new Date().toISOString();
  return {
    products: bouquets.map((item) => ({
      id: `catalog:${item.slug}`,
      slug: item.slug,
      name: item.name,
      price: item.price,
      composition: item.composition,
      packaging: "Ivory",
      availability: "in_stock" as const,
      description: item.story,
      category: item.tags[0] ?? "author",
      qty: 1,
      image: item.image,
      listing: "published" as const,
      locked: true,
      updatedAt: now,
    })),
    packs: gamePacks.map((item, index) => ({
      id: item.id,
      name: item.label,
      price: item.price,
      description: item.line,
      enabled: true,
      order: index,
      image: "",
      color: item.color,
      ink: item.ink,
    })),
  };
}

function read(): Database {
  try {
    const raw = readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as Database;
    if (!Array.isArray(data.products) || !Array.isArray(data.packs)) return seed();
    return data;
  } catch {
    return seed();
  }
}

function write(data: Database) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function updateStudio(change: (data: Database) => void) {
  const run = chain.then(() => {
    const data = read();
    change(data);
    try {
      write(data);
    } catch {
      throw new Error("Сервер не смог записать общую базу. На этой машине диск закрыт для записи.");
    }
    return data;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readStudio() {
  return read();
}

export function publicProducts(data = read()) {
  return data.products
    .filter((item) => item.listing === "published")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function enabledPacks(data = read()) {
  return data.packs.filter((item) => item.enabled).sort((a, b) => a.order - b.order);
}

const tags = new Set(["author", "roses", "peonies", "mono", "composition", "gifts"]);

export function cleanProduct(input: Partial<StudioProduct>, current?: StudioProduct) {
  const name = String(input.name ?? current?.name ?? "").trim().slice(0, 80);
  const price = Math.round(Number(input.price ?? current?.price ?? 0));
  const availability = (input.availability ?? current?.availability ?? "in_stock") as Availability;
  const listing = (input.listing ?? current?.listing ?? "draft") as Listing;
  const category = String(input.category ?? current?.category ?? "author");
  const image = String(input.image ?? current?.image ?? "");
  if (!["in_stock", "made_to_order", "sold"].includes(availability)) throw new Error("Неизвестный статус наличия.");
  if (!["published", "draft", "hidden", "archived"].includes(listing)) throw new Error("Неизвестный статус карточки.");
  if (!tags.has(category)) throw new Error("Неизвестная категория.");
  if (image && !image.startsWith("/images/") && !image.startsWith("data:image/jpeg") && !image.startsWith("data:image/png") && !image.startsWith("data:image/webp")) {
    throw new Error("Фото должно быть снимком JPEG, PNG или WebP.");
  }
  if (image.startsWith("data:") && image.length > 1_800_000) throw new Error("Фото слишком большое. Снимите ближе или выберите другой кадр.");
  if (listing === "published") {
    if (!name) throw new Error("Нужно название.");
    if (!Number.isFinite(price) || price < 1 || price > 500_000) throw new Error("Укажите цену от 1 до 500 000 ₽.");
    if (!image) throw new Error("Нужна фотография букета.");
  }
  const qty = Math.max(0, Math.min(99, Math.round(Number(input.qty ?? current?.qty ?? 1))));
  return {
    name,
    price: Number.isFinite(price) ? Math.max(0, price) : 0,
    composition: String(input.composition ?? current?.composition ?? "").trim().slice(0, 400),
    packaging: String(input.packaging ?? current?.packaging ?? "").trim().slice(0, 80),
    availability: qty === 0 && availability === "in_stock" ? "sold" : availability,
    description: String(input.description ?? current?.description ?? "").trim().slice(0, 800),
    category: category as Tag,
    qty: availability === "sold" ? 0 : qty,
    image,
    listing,
  };
}
