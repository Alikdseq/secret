import { NextResponse } from "next/server";
import { clearFailures, clientIp, codeMatches, sessionCookie, signSession, studioConfigured, tooManyAttempts, registerFailure } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!studioConfigured()) {
    return NextResponse.json({ ok: false, error: "Код доступа не задан на сервере." }, { status: 503 });
  }
  const ip = clientIp(request.headers);
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ ok: false, error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = String(body?.code ?? "");
  if (!codeMatches(code)) {
    registerFailure(ip);
    return NextResponse.json({ ok: false, error: "Код не подошёл." }, { status: 401 });
  }
  clearFailures(ip);
  const token = signSession();
  if (!token) return NextResponse.json({ ok: false, error: "Сессия не настроена на сервере." }, { status: 503 });
  const cookie = sessionCookie(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
