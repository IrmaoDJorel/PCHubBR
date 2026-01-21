import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Primeiro tenta buscar na tabela Product (GPU/Motherboard)
  let product = await prisma.product.findUnique({
    where: { slug },
    include: {
      offers: {
        include: { store: true },
        orderBy: { priceCents: "asc" },
      },
      priceSnapshots: {
        include: { store: true },
        orderBy: { date: "desc" },
        take: 30,
      },
      gpu: true,
      motherboard: true,
    },
  });

  // Se não encontrou, tenta buscar na tabela Cpu (legado)
  if (!product) {
    const cpu = await prisma.cpu.findUnique({
      where: { slug },
      include: {
        offers: {
          include: { store: true },
          orderBy: { priceCents: "asc" },
        },
        priceSnapshots: {
          include: { store: true },
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (cpu) {
      // Converter CPU para formato Product
      product = {
        id: cpu.id,
        type: "CPU",
        name: cpu.name,
        slug: cpu.slug,
        brand: cpu.brand,
        specsJson: {
          cores: cpu.cores,
          threads: cpu.threads,
          baseClock: cpu.baseClock,
          boostClock: cpu.boostClock,
          socket: cpu.socket,
        },
        offers: cpu.offers,
        priceSnapshots: cpu.priceSnapshots,
        gpu: null,
        motherboard: null,
      } as any;
    }
  }

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  return NextResponse.json(product);
}