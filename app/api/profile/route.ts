import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const username = String(body?.username || "").trim();

  if (username && username.length < 3) {
    return NextResponse.json({ error: "Usuário deve ter pelo menos 3 caracteres" }, { status: 400 });
  }

  // Atualiza apenas o que veio preenchido
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(username ? { username } : {}),
      },
      select: { id: true, email: true, username: true, name: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar (username pode estar em uso)" }, { status: 409 });
  }
}