import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseBRLToCents(input: string) {
  // Aceita: "650", "650,00", "650.00", "R$ 650,00"
  const s = input
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const value = Number(s);
  if (!Number.isFinite(value) || value <= 0) return null;

  return Math.round(value * 100);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailRaw = searchParams.get("email") || "";
  const email = normalizeEmail(emailRaw);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) return NextResponse.json([]);

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const emailRaw = String(body?.email || "");
  const cpuSlug = String(body?.cpuSlug || "");
  const targetPriceRaw = String(body?.targetPrice || "");

  const email = normalizeEmail(emailRaw);
  const targetPriceCents = parseBRLToCents(targetPriceRaw);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!cpuSlug) {
    return NextResponse.json({ error: "CPU inválida" }, { status: 400 });
  }

  if (targetPriceCents === null) {
    return NextResponse.json({ error: "Preço alvo inválido" }, { status: 400 });
  }

  const cpu = await prisma.cpu.findUnique({
    where: { slug: cpuSlug },
    select: { id: true },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true },
  });

  const alert = await prisma.priceAlert.upsert({
    where: {
      userId_cpuId_targetPriceCents: {
        userId: user.id,
        cpuId: cpu.id,
        targetPriceCents,
      },
    },
    update: { isActive: true, triggeredAt: null },
    create: {
      userId: user.id,
      cpuId: cpu.id,
      targetPriceCents,
      isActive: true,
    },
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

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);

  const emailRaw = String(body?.email || "");
  const alertId = String(body?.alertId || "");
  const action = String(body?.action || ""); // "deactivate" | "activate" | "rearm"

  const email = normalizeEmail(emailRaw);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!alertId) {
    return NextResponse.json({ error: "alertId inválido" }, { status: 400 });
  }

  if (!["deactivate", "activate", "rearm"].includes(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId: user.id },
    select: { id: true },
  });

  if (!alert) return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });

  if (action === "deactivate") {
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: false },
    });
  } else if (action === "activate") {
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: true },
    });
  } else if (action === "rearm") {
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { triggeredAt: null, isActive: true },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);

  const emailRaw = String(body?.email || "");
  const alertId = String(body?.alertId || "");

  const email = normalizeEmail(emailRaw);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!alertId) {
    return NextResponse.json({ error: "alertId inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId: user.id },
    select: { id: true },
  });

  if (!alert) return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });

  await prisma.priceAlertEvent.deleteMany({ where: { alertId } });
  await prisma.priceAlert.delete({ where: { id: alertId } });

  return NextResponse.json({ ok: true });
}