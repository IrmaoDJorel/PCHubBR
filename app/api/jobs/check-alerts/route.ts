import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAlertItemData } from "@/lib/alerts"; // ✅ NOVO IMPORT

/**
 * POST /api/jobs/check-alerts
 * 
 * Job para verificar alertas de preço ativos
 * Marca como "disparado" quando preço alvo é atingido
 * 
 * Suporta: CPU, GPU, MOTHERBOARD (e futuros tipos)
 * Futuramente: adicionar envio de notificação aqui
 */
export async function POST(request: Request) {
  try {
    // ✅ NOVO: Segurança com token de cron
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ MODIFICADO: Busca alertas ativos de TODOS os tipos
    const alerts = await prisma.priceAlert.findMany({
      where: { 
        isActive: true, 
        triggeredAt: null // Ainda não foram disparados
      },
      select: {
        id: true,
        itemType: true, // ✅ NOVO
        itemId: true,   // ✅ NOVO
        cpuId: true,    // Manter para compatibilidade
        targetPriceCents: true,
        user: {
          select: { id: true, email: true }, // Para futura notificação
        },
      },
    });

    let triggered = 0;
    let errors = 0;

    for (const alert of alerts) {
      try {
        // ✅ NOVO: Buscar dados do produto baseado no tipo
        const productData = await getAlertItemData(
          alert.itemType as "CPU" | "GPU" | "MOTHERBOARD",
          alert.itemId
        );

        if (!productData) {
          console.warn(`Produto não encontrado: ${alert.itemType} ${alert.itemId}`);
          errors++;
          continue;
        }

        // ✅ MODIFICADO: Buscar melhor oferta do produto
        const bestOffer = productData.offers?.[0];

        if (!bestOffer) {
          console.warn(`Sem ofertas para: ${alert.itemType} ${alert.itemId}`);
          continue;
        }

        const currentPrice = bestOffer.priceCents;
        const storeName = bestOffer.store?.name;

        // ✅ Verificar se atingiu o preço alvo
        if (currentPrice <= alert.targetPriceCents) {
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              triggeredAt: new Date(),
              events: {
                create: {
                  priceCents: currentPrice,
                  storeName: storeName ?? null,
                },
              },
            },
          });

          // 🔔 FUTURAMENTE: adicionar envio de notificação aqui
          // await sendPriceAlertEmail({
          //   email: alert.user.email,
          //   productType: alert.itemType,
          //   productName: productData.name,
          //   targetPrice: alert.targetPriceCents,
          //   currentPrice: currentPrice,
          //   storeName: storeName,
          // });

          triggered++;
          console.log(`✅ Alerta disparado: ${alert.itemType} ${productData.name} - ${currentPrice / 100}`);
        }
      } catch (error) {
        console.error(`Erro ao processar alerta ${alert.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Checagem de alertas concluída",
      stats: {
        alertsChecked: alerts.length,
        alertsTriggered: triggered,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Erro ao checar alertas:", error);
    return NextResponse.json(
      { error: "Erro ao processar alertas" },
      { status: 500 }
    );
  }
}