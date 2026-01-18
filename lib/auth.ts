import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "pchubbr_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado no .env");
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export async function signSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// Para APIs: leia cookie via NextRequest (ou request.headers)
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}