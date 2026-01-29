const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adicionando ofertas fake para testes...");

  // Busca lojas existentes
  const kabum = await prisma.store.findFirst({ where: { name: "KaBuM!" } });
  const terabyte = await prisma.store.findFirst({ where: { name: "TerabyteShop" } });
  
  if (!kabum || !terabyte) {
    console.error("❌ Lojas não encontradas. Execute seed básico primeiro.");
    return;
  }

  // Busca CPUs
  const ryzen5600 = await prisma.cpu.findFirst({
    where: { slug: "amd-ryzen-5-5600" },
  });
  
  const i512400f = await prisma.cpu.findFirst({
    where: { slug: "intel-core-i5-12400f" },
  });

  if (ryzen5600) {
    // Atualiza oferta existente do Kabum (se existir)
    const existingKabum = await prisma.offer.findFirst({
      where: { 
        cpuId: ryzen5600.id,
        storeId: kabum.id,
      },
    });

    if (existingKabum) {
      console.log("✅ Oferta Kabum já existe para Ryzen 5 5600");
    } else {
      await prisma.offer.create({
        data: {
          cpuId: ryzen5600.id,
          storeId: kabum.id,
          priceCents: 67990,
          url: "https://www.kabum.com.br/produto/ryzen-5-5600",
        },
      });
      console.log("✅ Oferta Kabum criada para Ryzen 5 5600");
    }

    // Adiciona oferta TerabyteShop (mais cara - 30% de diferença)
    const existingTerabyte = await prisma.offer.findFirst({
      where: { 
        cpuId: ryzen5600.id,
        storeId: terabyte.id,
      },
    });

    if (existingTerabyte) {
      await prisma.offer.update({
        where: { id: existingTerabyte.id },
        data: { priceCents: 97000 },
      });
      console.log("✅ Oferta TerabyteShop atualizada para Ryzen 5 5600");
    } else {
      await prisma.offer.create({
        data: {
          cpuId: ryzen5600.id,
          storeId: terabyte.id,
          priceCents: 97000,
          url: "https://www.terabyteshop.com.br/produto/ryzen-5-5600",
        },
      });
      console.log("✅ Oferta TerabyteShop criada para Ryzen 5 5600");
    }
  }

  if (i512400f) {
    // Atualiza oferta existente do TerabyteShop (se existir)
    const existingTerabyte = await prisma.offer.findFirst({
      where: { 
        cpuId: i512400f.id,
        storeId: terabyte.id,
      },
    });

    if (existingTerabyte) {
      console.log("✅ Oferta TerabyteShop já existe para i5-12400F");
    } else {
      await prisma.offer.create({
        data: {
          cpuId: i512400f.id,
          storeId: terabyte.id,
          priceCents: 73990,
          url: "https://www.terabyteshop.com.br/produto/i5-12400f",
        },
      });
      console.log("✅ Oferta TerabyteShop criada para i5-12400F");
    }

    // Adiciona oferta Kabum (mais cara - 25% de diferença)
    const existingKabum = await prisma.offer.findFirst({
      where: { 
        cpuId: i512400f.id,
        storeId: kabum.id,
      },
    });

    if (existingKabum) {
      await prisma.offer.update({
        where: { id: existingKabum.id },
        data: { priceCents: 98653 },
      });
      console.log("✅ Oferta Kabum atualizada para i5-12400F");
    } else {
      await prisma.offer.create({
        data: {
          cpuId: i512400f.id,
          storeId: kabum.id,
          priceCents: 98653,
          url: "https://www.kabum.com.br/produto/i5-12400f",
        },
      });
      console.log("✅ Oferta Kabum criada para i5-12400F");
    }
  }

  // Adiciona oferta para GPU (RTX 4060)
  const rtx4060 = await prisma.product.findFirst({
    where: { slug: "rtx-4060" },
  });

  if (rtx4060) {
    const existingTerabyte = await prisma.productOffer.findFirst({
      where: { 
        productId: rtx4060.id,
        storeId: terabyte.id,
      },
    });

    if (existingTerabyte) {
      await prisma.productOffer.update({
        where: { id: existingTerabyte.id },
        data: { priceCents: 285000 },
      });
      console.log("✅ Oferta TerabyteShop atualizada para RTX 4060");
    } else {
      await prisma.productOffer.create({
        data: {
          productId: rtx4060.id,
          storeId: terabyte.id,
          priceCents: 285000,
          url: "https://www.terabyteshop.com.br/produto/rtx-4060",
        },
      });
      console.log("✅ Oferta TerabyteShop criada para RTX 4060");
    }
  }

  console.log("🎉 Seed de ofertas concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });