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

  // Resolver slugs para todos os tipos
  const cpuIds = favorites.filter((f) => f.itemType === "CPU").map((f) => f.itemId);
  const productIds = favorites.filter((f) => f.itemType !== "CPU").map((f) => f.itemId);

  const cpus = await prisma.cpu.findMany({
    where: { id: { in: cpuIds } },
    select: { id: true, slug: true },
  });

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, slug: true },
  });

  const slugById = new Map([
    ...cpus.map((c) => [c.id, c.slug]),
    ...products.map((p) => [p.id, p.slug]),
  ]);

  const enriched = favorites.map((f) => ({
    ...f,
    slug: slugById.get(f.itemId) ?? null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const itemType = String(body?.itemType || "");
  const productSlug = String(body?.productSlug || "");

  if (!["CPU", "GPU", "MOTHERBOARD"].includes(itemType)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (!productSlug) return NextResponse.json({ error: "productSlug inválido" }, { status: 400 });

  let itemId: string | null = null;

  if (itemType === "CPU") {
    const cpu = await prisma.cpu.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });
    itemId = cpu.id;
  } else {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    itemId = product.id;
  }

  const fav = await prisma.favorite.upsert({
    where: {
      userId_itemType_itemId: { userId, itemType: itemType as any, itemId },
    },
    update: {},
    create: { userId, itemType: itemType as any, itemId },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, favoriteId: fav.id });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const itemType = String(body?.itemType || "");
  const productSlug = String(body?.productSlug || "");

  if (!["CPU", "GPU", "MOTHERBOARD"].includes(itemType)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (!productSlug) return NextResponse.json({ error: "productSlug inválido" }, { status: 400 });

  let itemId: string | null = null;

  if (itemType === "CPU") {
    const cpu = await prisma.cpu.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });
    itemId = cpu.id;
  } else {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    itemId = product.id;
  }

  await prisma.favorite.delete({
    where: {
      userId_itemType_itemId: { userId, itemType: itemType as any, itemId },
    },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}