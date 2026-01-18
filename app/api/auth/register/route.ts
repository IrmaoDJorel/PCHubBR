import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = normalizeEmail(String(body?.email || ""));
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (!email.includes("@")) return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  if (username.length < 3) return NextResponse.json({ error: "Usuário deve ter pelo menos 3 caracteres" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Senha deve ter pelo menos 8 caracteres" }, { status: 400 });

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });

  if (exists) return NextResponse.json({ error: "Email ou usuário já em uso" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true },
  });

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