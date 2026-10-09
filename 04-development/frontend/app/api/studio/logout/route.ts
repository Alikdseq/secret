import { NextResponse } from "next/server";
import { clearCookie } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const cookie = clearCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
