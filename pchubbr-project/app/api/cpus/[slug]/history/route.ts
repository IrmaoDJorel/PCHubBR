import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const cpu = await prisma.cpu.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!cpu) return NextResponse.json({ error: "CPU não encontrada" }, { status: 404 });

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { cpuId: cpu.id, date: { gte: startDate } },
    select: {
      date: true,
      priceCents: true,
      store: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(snapshots);
}