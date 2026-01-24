import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Conta CPUs na tabela Cpu
    const cpuCount = await prisma.cpu.count();

    // Conta GPUs e Motherboards na tabela Product
    const gpuCount = await prisma.product.count({
      where: { type: "GPU" },
    });

    const motherboardCount = await prisma.product.count({
      where: { type: "MOTHERBOARD" },
    });

    const total = cpuCount + gpuCount + motherboardCount;

    return NextResponse.json({
      total,
      cpu: cpuCount,
      gpu: gpuCount,
      motherboard: motherboardCount,
    });
  } catch (error) {
    console.error("Erro ao contar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao contar produtos" },
      { status: 500 }
    );
  }
}