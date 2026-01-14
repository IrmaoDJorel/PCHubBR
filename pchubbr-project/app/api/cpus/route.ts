import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cpus = await prisma.cpu.findMany({
    select: { id: true, name: true, slug: true, brand: true, cores: true, threads: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cpus);
}