import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Middleware do Prisma para recalcular ofertas automaticamente
 */
export function setupPrismaMiddleware() {
  prisma.$use(async (params: any, next: any) => {
    const result = await next(params);

    // Detecta operações em Offer ou ProductOffer
    const isOfferOperation =
      params.model === 'Offer' || params.model === 'ProductOffer';
    const isMutation =
      params.action === 'create' ||
      params.action === 'update' ||
      params.action === 'delete' ||
      params.action === 'createMany' ||
      params.action === 'updateMany' ||
      params.action === 'deleteMany';

    if (isOfferOperation && isMutation) {
      // Recalcula assincronamente (não bloqueia a resposta)
      setImmediate(async () => {
        try {
          if (params.model === 'Offer') {
            const cpuId =
              params.args?.data?.cpuId ||
              params.args?.where?.cpuId ||
              result?.cpuId;

            if (cpuId) {
              await recalculateCpuOffer(cpuId);
            }
          }

          if (params.model === 'ProductOffer') {
            const productId =
              params.args?.data?.productId ||
              params.args?.where?.productId ||
              result?.productId;

            if (productId) {
              await recalculateProductOffer(productId);
            }
          }
        } catch (err) {
          console.error('Erro ao recalcular ofertas:', err);
        }
      });
    }

    return result;
  });
}

async function recalculateCpuOffer(cpuId: string) {
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
      offerScore,
      lastPriceCheck: new Date(),
    },
  });
}

async function recalculateProductOffer(productId: string) {
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
      offerScore,
      lastPriceCheck: new Date(),
    },
  });
}