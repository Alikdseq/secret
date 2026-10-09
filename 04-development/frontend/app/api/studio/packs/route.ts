import { NextResponse } from "next/server";
import { hasStudioSession } from "@/lib/studio-auth";
import { enabledPacks, readStudio, updateStudio, type StudioPack } from "@/lib/studio-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const manage = new URL(request.url).searchParams.get("scope") === "manage";
  if (manage && !(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const data = readStudio();
  return NextResponse.json({ packs: manage ? data.packs : enabledPacks(data) });
}

export async function POST(request: Request) {
  if (!(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Partial<StudioPack> | null;
  const name = String(body?.name ?? "").trim().slice(0, 60);
  const price = Math.round(Number(body?.price ?? 0));
  if (!name) return NextResponse.json({ error: "Нужно название упаковки." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0 || price > 100_000) return NextResponse.json({ error: "Проверьте цену упаковки." }, { status: 400 });
  try {
    await updateStudio((data) => {
      data.packs.push({
        id: `pack-${Date.now().toString(36)}`,
        name,
        price,
        description: String(body?.description ?? "").trim().slice(0, 180),
        enabled: body?.enabled !== false,
        order: data.packs.length,
        image: imageOrEmpty(body?.image),
        color: "#F3E6D6",
        ink: "#171717",
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasStudioSession())) return NextResponse.json({ error: "Нужен вход в SECRET STUDIO." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; patch?: Partial<StudioPack>; move?: -1 | 1 } | null;
  if (!body?.id) return NextResponse.json({ error: "Нет упаковки." }, { status: 400 });
  try {
    await updateStudio((data) => {
      const index = data.packs.findIndex((item) => item.id === body.id);
      if (index < 0) throw new Error("Упаковка не найдена.");
      if (body.move) {
        const next = index + body.move;
        if (next < 0 || next >= data.packs.length) return;
        const [item] = data.packs.splice(index, 1);
        data.packs.splice(next, 0, item);
        data.packs.forEach((pack, order) => {
          pack.order = order;
        });
        return;
      }
      const current = data.packs[index];
      const price = body.patch?.price === undefined ? current.price : Math.round(Number(body.patch.price));
      if (!Number.isFinite(price) || price < 0 || price > 100_000) throw new Error("Проверьте цену упаковки.");
      data.packs[index] = {
        ...current,
        name: body.patch?.name === undefined ? current.name : String(body.patch.name).trim().slice(0, 60),
        price,
        description: body.patch?.description === undefined ? current.description : String(body.patch.description).trim().slice(0, 180),
        enabled: body.patch?.enabled === undefined ? current.enabled : Boolean(body.patch.enabled),
        image: body.patch?.image === undefined ? current.image : imageOrEmpty(body.patch.image),
      };
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить." }, { status: 400 });
  }
}

function imageOrEmpty(value: unknown) {
  const image = String(value ?? "");
  if (!image) return "";
  if (!image.startsWith("data:image/jpeg") && !image.startsWith("data:image/png") && !image.startsWith("data:image/webp") && !image.startsWith("/images/")) {
    throw new Error("Фото упаковки не подходит.");
  }
  if (image.startsWith("data:") && image.length > 1_800_000) throw new Error("Фото упаковки слишком большое.");
  return image;
}
