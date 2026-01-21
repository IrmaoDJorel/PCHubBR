import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "CPU", "GPU", "MOTHERBOARD" ou null (todos)

  const result = [];

  // Se type é null ou "CPU", buscar CPUs
  if (!type || type === "CPU") {
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
          orderBy: { priceCents: "asc" },
          take: 1,
        },
      },
    });

    // Converter para formato Product
    const cpuProducts = cpus.map((c) => ({
      id: c.id,
      type: "CPU",
      name: c.name,
      slug: c.slug,
      brand: c.brand,
      specsJson: { cores: c.cores, threads: c.threads },
      offers: c.offers,
      gpu: null,
      motherboard: null,
    }));

    result.push(...cpuProducts);
  }

  // Se type é null ou GPU/MOTHERBOARD, buscar produtos
  if (!type || type === "GPU" || type === "MOTHERBOARD") {
    const where = type ? { type: type as any } : {};
    
    const products = await prisma.product.findMany({
      where,
      include: {
        offers: {
          include: { store: true },
          orderBy: { priceCents: "asc" },
          take: 1,
        },
        gpu: type === "GPU" || !type,
        motherboard: type === "MOTHERBOARD" || !type,
      },
    });

    result.push(...products);
  }

  return NextResponse.json(result);
}