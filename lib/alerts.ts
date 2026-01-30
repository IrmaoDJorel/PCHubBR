import { prisma } from "@/lib/prisma";

export type AlertItemType = "CPU" | "GPU" | "MOTHERBOARD";

/**
 * Busca dados do produto baseado no tipo de alerta
 * Retorna { name, slug, bestPriceCents, offers }
 */
export async function getAlertItemData(itemType: AlertItemType, itemId: string) {
  switch (itemType) {
    case "CPU":
      return await prisma.cpu.findUnique({
        where: { id: itemId },
        select: {
          id: true,
          name: true,
          slug: true,
          bestPriceCents: true,
          offers: {
            select: { priceCents: true, store: { select: { name: true } } },
            orderBy: { priceCents: "asc" },
            take: 1,
          },
        },
      });

    case "GPU":
      const gpuProduct = await prisma.product.findUnique({
        where: { id: itemId, type: "GPU" },
        select: {
          id: true,
          name: true,
          slug: true,
          bestPriceCents: true,
          offers: {
            select: { priceCents: true, store: { select: { name: true } } },
            orderBy: { priceCents: "asc" },
            take: 1,
          },
        },
      });
      return gpuProduct;

    case "MOTHERBOARD":
      const mbProduct = await prisma.product.findUnique({
        where: { id: itemId, type: "MOTHERBOARD" },
        select: {
          id: true,
          name: true,
          slug: true,
          bestPriceCents: true,
          offers: {
            select: { priceCents: true, store: { select: { name: true } } },
            orderBy: { priceCents: "asc" },
            take: 1,
          },
        },
      });
      return mbProduct;

    default:
      return null;
  }
}

/**
 * Monta URL do produto baseado no tipo
 */
export function getProductUrl(itemType: AlertItemType, slug: string): string {
  switch (itemType) {
    case "CPU":
      return `/cpu/${slug}`;
    case "GPU":
      return `/gpu/${slug}`;
    case "MOTHERBOARD":
      return `/motherboard/${slug}`;
    default:
      return "/";
  }
}