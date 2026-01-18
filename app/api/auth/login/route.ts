import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const loginRaw = String(body?.login || "").trim();
  const password = String(body?.password || "");

  if (!loginRaw) return NextResponse.json({ error: "Informe email ou usuário" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Informe a senha" }, { status: 400 });

  const login = loginRaw.includes("@") ? normalizeEmail(loginRaw) : loginRaw;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: loginRaw.includes("@") ? login : "__nope__" }, { username: login }],
    },
    select: { id: true, passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const token = await signSessionToken(user.id);

  const res = NextResponse.json({ ok: true });

  res.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}