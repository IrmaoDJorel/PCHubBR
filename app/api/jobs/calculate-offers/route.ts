import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/jobs/calculate-offers
 * 
 * Job para calcular e atualizar cache de ofertas
 * - Calcula bestPrice, worstPrice e offerScore para todos os produtos
 * - Atualiza timestamp de lastPriceCheck
 * 
 * Deve ser executado periodicamente (cron job ou manualmente)
 */
export async function POST(request: Request) {
  try {
    // Segurança: verificar se tem authorization header (opcional)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET; // Adicione isso no .env

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    let updatedCpus = 0;
    let updatedProducts = 0;

    // ==========================================
    // 1. PROCESSAR CPUs (tabela legada)
    // ==========================================
    const cpus = await prisma.cpu.findMany({
      include: {
        offers: {
          select: { priceCents: true },
        },
      },
    });

    for (const cpu of cpus) {
      if (cpu.offers.length === 0) {
        // Sem ofertas: limpa cache
        await prisma.cpu.update({
          where: { id: cpu.id },
          data: {
            bestPriceCents: null,
            worstPriceCents: null,
            offerScore: null,
            lastPriceCheck: new Date(),
          },
        });
        continue;
      }

      // Calcula min e max
      const prices = cpu.offers.map((o) => o.priceCents);
      const bestPrice = Math.min(...prices);
      const worstPrice = Math.max(...prices);

      // Calcula offerScore (percentual de desconto)
      let offerScore = 0;
      if (worstPrice > 0 && worstPrice > bestPrice) {
        offerScore = ((worstPrice - bestPrice) / worstPrice) * 100;
      }

      // Atualiza cache
      await prisma.cpu.update({
        where: { id: cpu.id },
        data: {
          bestPriceCents: bestPrice,
          worstPriceCents: worstPrice,
          offerScore: offerScore,
          lastPriceCheck: new Date(),
        },
      });

      updatedCpus++;
    }

    // ==========================================
    // 2. PROCESSAR PRODUCTS (GPU e Motherboard)
    // ==========================================
    const products = await prisma.product.findMany({
      include: {
        offers: {
          select: { priceCents: true },
        },
      },
    });

    for (const product of products) {
      if (product.offers.length === 0) {
        // Sem ofertas: limpa cache
        await prisma.product.update({
          where: { id: product.id },
          data: {
            bestPriceCents: null,
            worstPriceCents: null,
            offerScore: null,
            lastPriceCheck: new Date(),
          },
        });
        continue;
      }

      // Calcula min e max
      const prices = product.offers.map((o) => o.priceCents);
      const bestPrice = Math.min(...prices);
      const worstPrice = Math.max(...prices);

      // Calcula offerScore
      let offerScore = 0;
      if (worstPrice > 0 && worstPrice > bestPrice) {
        offerScore = ((worstPrice - bestPrice) / worstPrice) * 100;
      }

      // Atualiza cache
      await prisma.product.update({
        where: { id: product.id },
        data: {
          bestPriceCents: bestPrice,
          worstPriceCents: worstPrice,
          offerScore: offerScore,
          lastPriceCheck: new Date(),
        },
      });

      updatedProducts++;
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Ofertas calculadas com sucesso",
      stats: {
        cpusProcessed: cpus.length,
        cpusUpdated: updatedCpus,
        productsProcessed: products.length,
        productsUpdated: updatedProducts,
        durationMs: duration,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular ofertas:", error);
    return NextResponse.json(
      { error: "Erro ao processar ofertas" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/calculate-offers
 * 
 * Retorna informações sobre o último cálculo
 */
export async function GET() {
  try {
    // Busca CPUs e Products com lastPriceCheck mais recente
    const lastCpuCheck = await prisma.cpu.findFirst({
      where: { lastPriceCheck: { not: null } },
      orderBy: { lastPriceCheck: "desc" },
      select: { lastPriceCheck: true },
    });

    const lastProductCheck = await prisma.product.findFirst({
      where: { lastPriceCheck: { not: null } },
      orderBy: { lastPriceCheck: "desc" },
      select: { lastPriceCheck: true },
    });

    // Conta quantos têm ofertas calculadas
    const cpusWithOffers = await prisma.cpu.count({
      where: { offerScore: { not: null } },
    });

    const productsWithOffers = await prisma.product.count({
      where: { offerScore: { not: null } },
    });

    return NextResponse.json({
      lastCheck: {
        cpu: lastCpuCheck?.lastPriceCheck || null,
        product: lastProductCheck?.lastPriceCheck || null,
      },
      itemsWithOffers: {
        cpus: cpusWithOffers,
        products: productsWithOffers,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar info de ofertas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações" },
      { status: 500 }
    );
  }
}