import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, signSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`register:${ip}`, 5, 60_000);

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns instantes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);

  const email = normalizeEmail(String(body?.email || ""));
  const usernameRaw = String(body?.username || "").trim();
  const username = usernameRaw.toLowerCase();
  const password = String(body?.password || "");

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: "Usuário deve ter entre 3 e 20 caracteres" }, { status: 400 });
  }

  if (!/^[a-z0-9._]+$/.test(username)) {
    return NextResponse.json(
      { error: "Usuário só pode conter letras minúsculas, números, ponto e underline" },
      { status: 400 }
    );
  }

  if (/^[._]/.test(username) || /[._]$/.test(username)) {
    return NextResponse.json(
      { error: "Usuário não pode começar ou terminar com ponto/underline" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Senha deve ter pelo menos 8 caracteres" }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });

  if (exists) {
    return NextResponse.json({ error: "Email ou usuário já em uso" }, { status: 409 });
  }

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