import { NextResponse } from "next/server";
import { hasStudioSession } from "@/lib/studio-auth";
import { cleanProduct, publicProducts, readStudio, updateStudio, type StudioProduct } from "@/lib/studio-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toCard(item: StudioProduct) {
  return {
    slug: item.slug,
    name: item.name,
    epithet: item.packaging || (item.availability === "sold" ? "продан" : item.availability === "made_to_order" ? "под заказ" : "в наличии"),
    composition: item.composition,
    story: item.description,
    price: item.price,
    image: item.image,
    hover: item.image,
    tags: [item.category],
    availability: item.availability,
    listing: item.listing,
    qty: item.qty,
    packaging: item.packaging,
    studioId: item.id,
    locked: item.locked,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const manage = url.searchParams.get("scope") === "manage";
  const slug = url.searchParams.get("slug");
  if (manage && !(await hasStudioSession())) {
    return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  }
  const data = readStudio();
  const source = manage ? data.products : publicProducts(data);
  const list = slug ? source.filter((item) => item.slug === slug) : source;
  return NextResponse.json({ products: list.map(toCard), packs: data.packs });
}

export async function POST(request: Request) {
  if (!(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Partial<StudioProduct> | null;
  if (!body) return NextResponse.json({ error: "Пустая карточка." }, { status: 400 });
  try {
    const fields = cleanProduct(body);
    const id = `studio-${Date.now().toString(36)}`;
    let created: StudioProduct | null = null;
    await updateStudio((data) => {
      created = {
        id,
        slug: id,
        ...fields,
        locked: false,
        updatedAt: new Date().toISOString(),
      };
      data.products.unshift(created);
    });
    return NextResponse.json({ ok: true, product: created ? toCard(created) : null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; patch?: Partial<StudioProduct> } | null;
  if (!body?.id) return NextResponse.json({ error: "Нет карточки." }, { status: 400 });
  try {
    await updateStudio((data) => {
      const index = data.products.findIndex((item) => item.id === body.id);
      if (index < 0) throw new Error("Карточка не найдена.");
      const current = data.products[index];
      const fields = cleanProduct({ ...current, ...body.patch, image: body.patch?.image || current.image }, current);
      data.products[index] = { ...current, ...fields, updatedAt: new Date().toISOString() };
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Нет карточки." }, { status: 400 });
  try {
    await updateStudio((data) => {
      const current = data.products.find((item) => item.id === body.id);
      if (!current) throw new Error("Карточка не найдена.");
      if (current.locked) {
        current.listing = "archived";
        current.updatedAt = new Date().toISOString();
        return;
      }
      data.products = data.products.filter((item) => item.id !== body.id);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось удалить." }, { status: 400 });
  }
}
