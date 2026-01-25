const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Atualizando ofertas para Amazon...");

  // Busca loja Amazon
  const amazon = await prisma.store.findFirst({
    where: { name: "Amazon" },
  });

  if (!amazon) {
    console.log("❌ Loja Amazon não encontrada. Execute fix-duplicate-stores.js primeiro.");
    return;
  }

  console.log(`✅ Amazon encontrada (ID: ${amazon.id})`);

  // Busca CPUs
  const ryzen5600 = await prisma.cpu.findFirst({
    where: { slug: "amd-ryzen-5-5600" },
  });

  const i512400f = await prisma.cpu.findFirst({
    where: { slug: "intel-core-i5-12400f" },
  });

  // Atualiza ofertas de CPUs
  if (ryzen5600) {
    const updated = await prisma.offer.updateMany({
      where: {
        cpuId: ryzen5600.id,
        storeId: amazon.id,
      },
      data: {
        url: "https://www.amazon.com.br/produto/ryzen-5-5600",
      },
    });

    if (updated.count > 0) {
      console.log(`✅ ${updated.count} oferta(s) atualizada(s) para Ryzen 5 5600 na Amazon`);
    } else {
      console.log("ℹ️  Nenhuma oferta da Amazon para Ryzen 5 5600 (normal se não existia antes)");
    }
  }

  if (i512400f) {
    const updated = await prisma.offer.updateMany({
      where: {
        cpuId: i512400f.id,
        storeId: amazon.id,
      },
      data: {
        url: "https://www.amazon.com.br/produto/i5-12400f",
      },
    });

    if (updated.count > 0) {
      console.log(`✅ ${updated.count} oferta(s) atualizada(s) para i5-12400F na Amazon`);
    } else {
      console.log("ℹ️  Nenhuma oferta da Amazon para i5-12400F");
    }
  }

  console.log("🎉 Atualização concluída!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });