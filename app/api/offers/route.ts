import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Função auxiliar para recalcular ofertas de uma CPU
 */
async function recalculateCpuOffers(cpuId: string) {
  const cpu = await prisma.cpu.findUnique({
    where: { id: cpuId },
    include: { offers: { select: { priceCents: true } } },
  });

  if (!cpu) return;

  if (cpu.offers.length === 0) {
    await prisma.cpu.update({
      where: { id: cpuId },
      data: {
        bestPriceCents: null,
        worstPriceCents: null,
        offerScore: null,
        lastPriceCheck: new Date(),
      },
    });
    return;
  }

  const prices = cpu.offers.map((o: { priceCents: number }) => o.priceCents);
  const bestPrice = Math.min(...prices);
  const worstPrice = Math.max(...prices);
  
  let offerScore = 0;
  if (worstPrice > 0 && worstPrice > bestPrice) {
    offerScore = ((worstPrice - bestPrice) / worstPrice) * 100;
  }

  await prisma.cpu.update({
    where: { id: cpuId },
    data: {
      bestPriceCents: bestPrice,
      worstPriceCents: worstPrice,
      offerScore: offerScore,
      lastPriceCheck: new Date(),
    },
  });
}

/**
 * Função auxiliar para recalcular ofertas de um Product
 */
async function recalculateProductOffers(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { offers: { select: { priceCents: true } } },
  });

  if (!product) return;

  if (product.offers.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        bestPriceCents: null,
        worstPriceCents: null,
        offerScore: null,
        lastPriceCheck: new Date(),
      },
    });
    return;
  }

  const prices = product.offers.map((o: { priceCents: number }) => o.priceCents);
  const bestPrice = Math.min(...prices);
  const worstPrice = Math.max(...prices);
  
  let offerScore = 0;
  if (worstPrice > 0 && worstPrice > bestPrice) {
    offerScore = ((worstPrice - bestPrice) / worstPrice) * 100;
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      bestPriceCents: bestPrice,
      worstPriceCents: worstPrice,
      offerScore: offerScore,
      lastPriceCheck: new Date(),
    },
  });
}

export { recalculateCpuOffers, recalculateProductOffers };