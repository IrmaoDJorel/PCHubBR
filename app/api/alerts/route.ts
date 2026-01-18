import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

function parseBRLToCents(input: string) {
  const s = input
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const value = Number(s);
  if (!Number.isFinite(value) || value <= 0) return null;

  return Math.round(value * 100);
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const alerts = await prisma.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetPriceCents: true,
      isActive: true,
      triggeredAt: true,
      createdAt: true,
      cpu: { select: { name: true, slug: true } },
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { priceCents: true, storeName: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const cpuSlug = String(body?.cpuSlug || "");
  const targetPriceRaw = String(body?.targetPrice || "");
  const targetPriceCents = parseBRLToCents(targetPriceRaw);

  if (!cpuSlug) return NextResponse.json({ error: "CPU inválida" }, { status: 400 });
  if (targetPriceCents === null) return NextResponse.json({ error: "Preço alvo inválido" }, { status: 400 });

  const cpu = await prisma.cpu.findUnique({
    where: { slug: cpuSlug },
    select: { id: true },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const alert = await prisma.priceAlert.upsert({
    where: {
      userId_cpuId_targetPriceCents: {
        userId,
        cpuId: cpu.id,
        targetPriceCents,
      },
    },
    update: { isActive: true, triggeredAt: null },
    create: { userId, cpuId: cpu.id, targetPriceCents, isActive: true },
    select: {
      id: true,
      targetPriceCents: true,
      isActive: true,
      triggeredAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, alert });
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const alertId = String(body?.alertId || "");
  const action = String(body?.action || "");

  if (!alertId) return NextResponse.json({ error: "alertId inválido" }, { status: 400 });
  if (!["deactivate", "activate", "rearm"].includes(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
    select: { id: true },
  });

  if (!alert) return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });

  if (action === "deactivate") {
    await prisma.priceAlert.update({ where: { id: alertId }, data: { isActive: false } });
  } else if (action === "activate") {
    await prisma.priceAlert.update({ where: { id: alertId }, data: { isActive: true } });
  } else if (action === "rearm") {
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { triggeredAt: null, isActive: true },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const alertId = String(body?.alertId || "");

  if (!alertId) return NextResponse.json({ error: "alertId inválido" }, { status: 400 });

  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
    select: { id: true },
  });

  if (!alert) return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });

  await prisma.priceAlertEvent.deleteMany({ where: { alertId } });
  await prisma.priceAlert.delete({ where: { id: alertId } });

  return NextResponse.json({ ok: true });
}