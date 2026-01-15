import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const cpu = await prisma.cpu.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      cores: true,
      threads: true,
      baseClock: true,
      boostClock: true,
      socket: true,
      offers: {
        select: {
          priceCents: true,
          url: true,
          store: { select: { name: true } },
        },
        orderBy: { priceCents: "asc" },
      },
    },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const prices = cpu.offers.map((o) => o.priceCents);
  const minPriceCents = prices.length ? prices[0] : null; // já está ordenado
  const maxPriceCents = prices.length ? prices[prices.length - 1] : null;

  return NextResponse.json({ ...cpu, minPriceCents, maxPriceCents });
}