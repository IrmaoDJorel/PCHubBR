import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const cpu = await prisma.cpu.findUnique({
    where: { slug: params.slug },
    include: { offers: { include: { store: true } } },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const prices = cpu.offers.map((o: { price: number }) => o.price);  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  return NextResponse.json({ ...cpu, minPrice, maxPrice });
}