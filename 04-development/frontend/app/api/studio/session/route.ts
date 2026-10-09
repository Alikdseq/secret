import { NextResponse } from "next/server";
import { hasStudioSession, studioConfigured } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: await hasStudioSession(), configured: studioConfigured() });
}
