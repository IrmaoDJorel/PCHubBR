import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      itemType: true,
      itemId: true,
      createdAt: true,
    },
  });

  // MVP: resolver CPU details inline (evita join polimórfico)
  const cpuIds = favorites.filter((f) => f.itemType === "CPU").map((f) => f.itemId);

  const cpus = await prisma.cpu.findMany({
    where: { id: { in: cpuIds } },
    select: { id: true, name: true, slug: true },
  });

  const cpuById = new Map(cpus.map((c) => [c.id, c]));

  const enriched = favorites.map((f) => {
    if (f.itemType === "CPU") {
      return {
        ...f,
        cpu: cpuById.get(f.itemId) ?? null,
      };
    }
    return { ...f };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const itemType = String(body?.itemType || "");
  const cpuSlug = String(body?.cpuSlug || "");

  if (itemType !== "CPU") return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (!cpuSlug) return NextResponse.json({ error: "cpuSlug inválido" }, { status: 400 });

  const cpu = await prisma.cpu.findUnique({
    where: { slug: cpuSlug },
    select: { id: true },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const fav = await prisma.favorite.upsert({
    where: {
      userId_itemType_itemId: { userId, itemType: "CPU", itemId: cpu.id },
    },
    update: {},
    create: { userId, itemType: "CPU", itemId: cpu.id },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, favoriteId: fav.id });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const itemType = String(body?.itemType || "");
  const cpuSlug = String(body?.cpuSlug || "");

  if (itemType !== "CPU") return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (!cpuSlug) return NextResponse.json({ error: "cpuSlug inválido" }, { status: 400 });

  const cpu = await prisma.cpu.findUnique({
    where: { slug: cpuSlug },
    select: { id: true },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  await prisma.favorite.delete({
    where: {
      userId_itemType_itemId: { userId, itemType: "CPU", itemId: cpu.id },
    },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}