import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/counts
 * Retorna contagem de produtos por categoria
 */
export async function GET() {
  try {
    // Conta CPUs (tabela legada)
    const cpuCount = await prisma.cpu.count();

    // Conta produtos genéricos por tipo
    const gpuCount = await prisma.product.count({
      where: { type: "GPU" },
    });

    const motherboardCount = await prisma.product.count({
      where: { type: "MOTHERBOARD" },
    });

    const total = cpuCount + gpuCount + motherboardCount;

    return NextResponse.json({
      cpu: cpuCount,
      gpu: gpuCount,
      motherboard: motherboardCount,
      total,
    });
  } catch (error) {
    console.error("Erro ao buscar contadores:", error);
    
    // Retorna zeros em caso de erro
    return NextResponse.json(
      {
        cpu: 0,
        gpu: 0,
        motherboard: 0,
        total: 0,
      },
      { status: 200 } // Retorna 200 mesmo com erro para não quebrar o frontend
    );
  }
}