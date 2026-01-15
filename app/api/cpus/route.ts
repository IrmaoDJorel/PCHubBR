import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cpus = await prisma.cpu.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      cores: true,
      threads: true,
      offers: {
        select: {
          priceCents: true,
          store: { select: { name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = cpus.map((cpu) => {
    const offers = cpu.offers ?? [];
    let bestPriceCents: number | null = null;
    let bestStoreName: string | null = null;

    for (const o of offers) {
      if (bestPriceCents === null || o.priceCents < bestPriceCents) {
        bestPriceCents = o.priceCents;
        bestStoreName = o.store?.name ?? null;
      }
    }

    return {
      id: cpu.id,
      name: cpu.name,
      slug: cpu.slug,
      brand: cpu.brand,
      cores: cpu.cores,
      threads: cpu.threads,
      bestPriceCents,
      bestStoreName,
      offerCount: offers.length,
    };
  });

  return NextResponse.json(result);
}