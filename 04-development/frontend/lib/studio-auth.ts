import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "secret_studio";
const attempts = new Map<string, { count: number; until: number }>();

function sessionKey() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) return null;
  return value;
}

export function studioConfigured() {
  const code = process.env.SECRET_STUDIO_CODE;
  return Boolean(sessionKey() && code && code.length >= 4);
}

export function tooManyAttempts(ip: string) {
  const row = attempts.get(ip);
  if (!row || row.until < Date.now()) return false;
  return row.count >= 5;
}

export function registerFailure(ip: string) {
  const row = attempts.get(ip);
  if (!row || row.until < Date.now()) {
    attempts.set(ip, { count: 1, until: Date.now() + 15 * 60 * 1000 });
    return;
  }
  row.count += 1;
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}

export function codeMatches(input: string) {
  const expected = process.env.SECRET_STUDIO_CODE ?? "";
  const left = createHmac("sha256", "secret-studio-code").update(input).digest();
  const right = createHmac("sha256", "secret-studio-code").update(expected).digest();
  return expected.length >= 4 && input.length > 0 && timingSafeEqual(left, right);
}

export function signSession() {
  const key = sessionKey();
  if (!key) return null;
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  const mac = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function sessionValid(token: string | undefined) {
  const key = sessionKey();
  if (!key || !token) return false;
  const [body, mac] = token.split(".");
  if (!body || !mac) return false;
  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function hasStudioSession() {
  const jar = await cookies();
  return sessionValid(jar.get(COOKIE)?.value);
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  };
}

export function clearCookie() {
  return {
    name: COOKIE,
    value: "",
    options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 },
  };
}

export function clientIp(header: Headers) {
  return header.get("x-forwarded-for")?.split(",")[0]?.trim() || header.get("x-real-ip") || "local";
}
