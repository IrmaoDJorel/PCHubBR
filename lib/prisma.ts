import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query"],
  });

// ============================================
// ✅ MIDDLEWARE PARA RECÁLCULO AUTOMÁTICO
// ============================================
if (!globalForPrisma.prisma) {
  // Apenas configura middleware se o cliente suportar `$use`.
  if (typeof (prisma as any).$use === "function") {
    setupPrismaMiddleware();
  } else {
    console.warn("prisma.$use não disponível — middleware de recálculo desabilitado");
  }
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ============================================
// ✅ FUNÇÃO DE CONFIGURAÇÃO DO MIDDLEWARE
// ============================================
function setupPrismaMiddleware() {
  prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
    const result = await next(params);

    // Detecta operações em Offer ou ProductOffer
    const isOfferModel = params.model === 'Offer' || params.model === 'ProductOffer';
    const isMutation = ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany'].includes(params.action);

    if (isOfferModel && isMutation) {
      // Recalcula assincronamente (não bloqueia resposta)
      setImmediate(async () => {
        try {
          if (params.model === 'Offer') {
            // Identifica o cpuId afetado
            let cpuId: string | null = null;

            if (params.action === 'create' || params.action === 'update') {
              cpuId = params.args?.data?.cpuId || result?.cpuId || null;
            } else if (params.action === 'delete') {
              cpuId = params.args?.where?.cpuId || result?.cpuId || null;
            }

            if (cpuId) {
              await recalculateCpuOffer(cpuId);
            }
          }

          if (params.model === 'ProductOffer') {
            // Identifica o productId afetado
            let productId: string | null = null;

            if (params.action === 'create' || params.action === 'update') {
              productId = params.args?.data?.productId || result?.productId || null;
            } else if (params.action === 'delete') {
              productId = params.args?.where?.productId || result?.productId || null;
            }

            if (productId) {
              await recalculateProductOffer(productId);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao recalcular cache de ofertas:', error);
        }
      });
    }

    return result;
  });
}

// ============================================
// ✅ FUNÇÕES DE RECÁLCULO DE OFERTAS
// ============================================

/**
 * Recalcula os campos de cache de ofertas para uma CPU específica
 */
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

  console.log(`🔄 Cache atualizado: CPU ${cpu.name} → offerScore: ${offerScore.toFixed(1)}%`);
}

/**
 * Recalcula os campos de cache de ofertas para um Product específico (GPU/Motherboard)
 */
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

  console.log(`🔄 Cache atualizado: Product ${product.name} → offerScore: ${offerScore.toFixed(1)}%`);
}