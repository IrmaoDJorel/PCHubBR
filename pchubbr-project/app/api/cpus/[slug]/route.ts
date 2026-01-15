import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const cpu = await prisma.cpu.findUnique({
    where: { slug },
    include: { offers: { include: { store: true } } },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const prices = cpu.offers.map((o) => o.priceCents);
  const minPriceCents = prices.length ? Math.min(...prices) : null;
  const maxPriceCents = prices.length ? Math.max(...prices) : null;

  return NextResponse.json({ ...cpu, minPriceCents, maxPriceCents });
}