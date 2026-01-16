import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Busca alertas ativos que ainda não foram disparados
  const alerts = await prisma.priceAlert.findMany({
    where: { isActive: true, triggeredAt: null },
    select: {
      id: true,
      cpuId: true,
      targetPriceCents: true,
      cpu: { select: { slug: true } },
    },
  });

  let triggered = 0;

  for (const alert of alerts) {
    // Melhor oferta atual (menor Offer.priceCents)
    const bestOffer = await prisma.offer.findFirst({
      where: { cpuId: alert.cpuId },
      orderBy: { priceCents: "asc" },
      select: { priceCents: true, store: { select: { name: true } } },
    });

    if (!bestOffer) continue;

    if (bestOffer.priceCents <= alert.targetPriceCents) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: {
          triggeredAt: new Date(),
          events: {
            create: {
              priceCents: bestOffer.priceCents,
              storeName: bestOffer.store?.name ?? null,
            },
          },
        },
      });

      triggered++;
    }
  }

  return NextResponse.json({ ok: true, checked: alerts.length, triggered });
}