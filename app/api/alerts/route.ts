import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { AlertItemType, getAlertItemData, getProductUrl } from "@/lib/alerts";

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
    select: {
      id: true,
      itemType: true,
      itemId: true,
      targetPriceCents: true,
      isActive: true,
      triggeredAt: true,
      createdAt: true,

      // Relações legadas (para CPUs antigas)
      cpu: {
        select: { name: true, slug: true },
      },

      events: {
        select: {
          priceCents: true,
          storeName: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Enriquecer dados dos alertas com informações do produto
  const enrichedAlerts = await Promise.all(
    alerts.map(async (alert: any) => {
      let productData: any = null;

      // Se for CPU e tiver relação legada, usar ela
      if (alert.itemType === "CPU" && alert.cpu) {
        productData = alert.cpu;
      } else {
        // Buscar dados do produto baseado no tipo
        productData = await getAlertItemData(
          alert.itemType as AlertItemType,
          alert.itemId
        );
      }

      return {
        ...alert,
        product: productData
          ? {
              name: productData.name,
              slug: productData.slug,
              url: getProductUrl(alert.itemType as AlertItemType, productData.slug),
              currentPrice: productData.bestPriceCents ?? null, // ✅ AJUSTE
            }
          : null,
      };
    })
  );

  return NextResponse.json(enrichedAlerts);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  // Novos campos
  const itemType = String(body?.itemType || "").toUpperCase(); // "CPU" | "GPU" | "MOTHERBOARD"
  const itemId = String(body?.itemId || "");
  const targetPriceCents = parseInt(body?.targetPriceCents, 10);

  // Validação
  if (!["CPU", "GPU", "MOTHERBOARD"].includes(itemType)) {
    return NextResponse.json(
      { error: "Tipo de produto inválido. Use: CPU, GPU ou MOTHERBOARD" },
      { status: 400 }
    );
  }

  if (!itemId || isNaN(targetPriceCents) || targetPriceCents <= 0) {
    return NextResponse.json(
      { error: "Dados inválidos (itemId ou targetPriceCents)" },
      { status: 400 }
    );
  }

  // Verifica se o produto existe
  const productData = await getAlertItemData(itemType as AlertItemType, itemId);
  if (!productData) {
    return NextResponse.json(
      { error: `${itemType} não encontrado(a)` },
      { status: 404 }
    );
  }

  // Verifica se já existe alerta ativo para este produto
  const existingAlert = await prisma.priceAlert.findFirst({
    where: {
      userId,
      itemType,
      itemId,
      isActive: true,
    },
  });

  if (existingAlert) {
    return NextResponse.json(
      { error: "Você já possui um alerta ativo para este produto" },
      { status: 409 }
    );
  }

  // Cria o alerta
  const alert = await prisma.priceAlert.create({
    data: {
      userId,
      itemType,
      itemId,
      cpuId: itemType === "CPU" ? itemId : null, // Compatibilidade temporária
      targetPriceCents,
      isActive: true,
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