const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Limpeza
  console.log("🗑️  Limpando dados antigos...");
  
  await prisma.productPriceSnapshot.deleteMany();
  await prisma.priceSnapshot.deleteMany();
  await prisma.productOffer.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.gpu.deleteMany();
  await prisma.motherboard.deleteMany();
  await prisma.product.deleteMany();
  await prisma.cpu.deleteMany();
  await prisma.store.deleteMany();

  console.log("✅ Dados antigos removidos\n");

  // Lojas
  console.log("🏪 Criando lojas...");

  const kabum = await prisma.store.create({
    data: { name: "Kabum", url: "https://www.kabum.com.br" },
  });

  const terabyte = await prisma.store.create({
    data: { name: "TerabyteShop", url: "https://www.terabyteshop.com.br" },
  });

  const amazon = await prisma.store.create({
    data: { name: "Amazon", url: "https://www.amazon.com.br" },
  });

  console.log(`✅ 3 lojas criadas\n`);

  // CPUs
  console.log("💻 Criando CPUs...");

  const ryzen5600 = await prisma.cpu.create({
    data: {
      name: "AMD Ryzen 5 5600",
      slug: "amd-ryzen-5-5600",
      brand: "AMD",
      cores: 6,
      threads: 12,
      baseClock: 3.5,
      boostClock: 4.4,
      socket: "AM4",
    },
  });

  const ryzen7600 = await prisma.cpu.create({
    data: {
      name: "AMD Ryzen 5 7600",
      slug: "amd-ryzen-5-7600",
      brand: "AMD",
      cores: 6,
      threads: 12,
      baseClock: 3.8,
      boostClock: 5.1,
      socket: "AM5",
    },
  });

  const i512400f = await prisma.cpu.create({
    data: {
      name: "Intel Core i5-12400F",
      slug: "intel-core-i5-12400f",
      brand: "Intel",
      cores: 6,
      threads: 12,
      baseClock: 2.5,
      boostClock: 4.4,
      socket: "LGA1700",
    },
  });

  const i713700k = await prisma.cpu.create({
    data: {
      name: "Intel Core i7-13700K",
      slug: "intel-core-i7-13700k",
      brand: "Intel",
      cores: 16,
      threads: 24,
      baseClock: 3.4,
      boostClock: 5.4,
      socket: "LGA1700",
    },
  });

  console.log(`✅ 4 CPUs criadas\n`);

  // GPUs
  console.log("🎮 Criando GPUs...");

  const rtx4060 = await prisma.product.create({
    data: {
      type: "GPU",
      name: "RTX 4060",
      slug: "rtx-4060",
      brand: "NVIDIA",
      specsJson: {},
      gpu: {
        create: {
          vramGb: 8,
          vramType: "GDDR6",
          baseClock: 1830,
          boostClock: 2460,
          tdp: 115,
          interface: "PCIe 4.0 x8",
          chipset: "AD107",
        },
      },
    },
  });

  const rx7600 = await prisma.product.create({
    data: {
      type: "GPU",
      name: "RX 7600",
      slug: "rx-7600",
      brand: "AMD",
      specsJson: {},
      gpu: {
        create: {
          vramGb: 8,
          vramType: "GDDR6",
          baseClock: 1720,
          boostClock: 2655,
          tdp: 165,
          interface: "PCIe 4.0 x8",
          chipset: "Navi 33",
        },
      },
    },
  });

  console.log(`✅ 2 GPUs criadas\n`);

  // Placas-Mãe
  console.log("🔧 Criando Placas-Mãe...");

  const b450 = await prisma.product.create({
    data: {
      type: "MOTHERBOARD",
      name: "B450 AORUS ELITE",
      slug: "b450-aorus-elite",
      brand: "Gigabyte",
      specsJson: {},
      motherboard: {
        create: {
          chipset: "B450",
          socket: "AM4",
          formFactor: "ATX",
          ramSlots: 4,
          ramType: "DDR4",
          maxRamGb: 64,
          maxRamSpeed: 3200,
          wifi: false,
          sataPorts: 6,
          m2Slots: 2,
          usbPorts: {
            usb2: 2,
            usb3: 4,
          },
        },
      },
    },
  });

  const b550 = await prisma.product.create({
    data: {
      type: "MOTHERBOARD",
      name: "B550M AORUS ELITE",
      slug: "b550m-aorus-elite",
      brand: "Gigabyte",
      specsJson: {},
      motherboard: {
        create: {
          chipset: "B550",
          socket: "AM4",
          formFactor: "Micro-ATX",
          ramSlots: 4,
          ramType: "DDR4",
          maxRamGb: 128,
          maxRamSpeed: 5100,
          wifi: false,
          sataPorts: 4,
          m2Slots: 2,
          usbPorts: {
            usb2: 2,
            usb3: 6,
          },
        },
      },
    },
  });

  console.log(`✅ 2 Placas-Mãe criadas\n`);

  // Ofertas de CPUs
  console.log("💰 Criando ofertas para CPUs...");

  await prisma.offer.createMany({
    data: [
      { cpuId: ryzen5600.id, storeId: kabum.id, priceCents: 67990, url: "https://www.kabum.com.br/produto/ryzen-5-5600" },
      { cpuId: ryzen5600.id, storeId: terabyte.id, priceCents: 72990, url: "https://www.terabyteshop.com.br/produto/ryzen-5-5600" },
      { cpuId: ryzen5600.id, storeId: amazon.id, priceCents: 97000, url: "https://www.amazon.com.br/produto/ryzen-5-5600" },
      { cpuId: ryzen7600.id, storeId: kabum.id, priceCents: 119900, url: "https://www.kabum.com.br/produto/ryzen-5-7600" },
      { cpuId: ryzen7600.id, storeId: terabyte.id, priceCents: 149900, url: "https://www.terabyteshop.com.br/produto/ryzen-5-7600" },
      { cpuId: i512400f.id, storeId: terabyte.id, priceCents: 73990, url: "https://www.terabyteshop.com.br/produto/i5-12400f" },
      { cpuId: i512400f.id, storeId: kabum.id, priceCents: 79990, url: "https://www.kabum.com.br/produto/i5-12400f" },
      { cpuId: i512400f.id, storeId: amazon.id, priceCents: 98653, url: "https://www.amazon.com.br/produto/i5-12400f" },
      { cpuId: i713700k.id, storeId: kabum.id, priceCents: 209900, url: "https://www.kabum.com.br/produto/i7-13700k" },
      { cpuId: i713700k.id, storeId: amazon.id, priceCents: 246941, url: "https://www.amazon.com.br/produto/i7-13700k" },
    ],
  });

  console.log(`✅ 10 ofertas criadas para CPUs\n`);

  // Ofertas de GPUs
  console.log("💰 Criando ofertas para GPUs...");

  await prisma.productOffer.createMany({
    data: [
      { productId: rtx4060.id, storeId: kabum.id, priceCents: 250000, url: "https://www.kabum.com.br/produto/rtx-4060" },
      { productId: rtx4060.id, storeId: terabyte.id, priceCents: 285000, url: "https://www.terabyteshop.com.br/produto/rtx-4060" },
      { productId: rx7600.id, storeId: terabyte.id, priceCents: 219900, url: "https://www.terabyteshop.com.br/produto/rx-7600" },
      { productId: rx7600.id, storeId: kabum.id, priceCents: 239900, url: "https://www.kabum.com.br/produto/rx-7600" },
      { productId: rx7600.id, storeId: amazon.id, priceCents: 268172, url: "https://www.amazon.com.br/produto/rx-7600" },
    ],
  });

  console.log(`✅ 5 ofertas criadas para GPUs\n`);

  // Ofertas de Placas-Mãe
  console.log("💰 Criando ofertas para Placas-Mãe...");

  await prisma.productOffer.createMany({
    data: [
      { productId: b450.id, storeId: kabum.id, priceCents: 80000, url: "https://www.kabum.com.br/produto/b450-aorus-elite" },
      { productId: b450.id, storeId: terabyte.id, priceCents: 88000, url: "https://www.terabyteshop.com.br/produto/b450-aorus-elite" },
      { productId: b550.id, storeId: terabyte.id, priceCents: 95000, url: "https://www.terabyteshop.com.br/produto/b550m-aorus-elite" },
      { productId: b550.id, storeId: kabum.id, priceCents: 105000, url: "https://www.kabum.com.br/produto/b550m-aorus-elite" },
      { productId: b550.id, storeId: amazon.id, priceCents: 121900, url: "https://www.amazon.com.br/produto/b550m-aorus-elite" },
    ],
  });

  console.log(`✅ 5 ofertas criadas para Placas-Mãe\n`);

  // Histórico de CPUs
  console.log("📊 Criando histórico de preços para CPUs (30 dias)...");

  const generatePriceVariation = (basePrice, day) => {
    const trendFactor = 1 - (30 - day) * 0.008;
    const randomFactor = 1 + (Math.random() - 0.5) * 0.06;
    return Math.round(basePrice * trendFactor * randomFactor);
  };

  const cpuSnapshots = [];

  for (let day = 30; day >= 1; day--) {
    cpuSnapshots.push(
      { cpuId: ryzen5600.id, storeId: kabum.id, priceCents: generatePriceVariation(74000, day), date: daysAgo(day) },
      { cpuId: ryzen5600.id, storeId: terabyte.id, priceCents: generatePriceVariation(77000, day), date: daysAgo(day) },
      { cpuId: ryzen5600.id, storeId: amazon.id, priceCents: generatePriceVariation(102000, day), date: daysAgo(day) },
      { cpuId: ryzen7600.id, storeId: kabum.id, priceCents: generatePriceVariation(127000, day), date: daysAgo(day) },
      { cpuId: ryzen7600.id, storeId: terabyte.id, priceCents: generatePriceVariation(157000, day), date: daysAgo(day) },
      { cpuId: i512400f.id, storeId: terabyte.id, priceCents: generatePriceVariation(78000, day), date: daysAgo(day) },
      { cpuId: i512400f.id, storeId: kabum.id, priceCents: generatePriceVariation(84000, day), date: daysAgo(day) },
      { cpuId: i512400f.id, storeId: amazon.id, priceCents: generatePriceVariation(104000, day), date: daysAgo(day) },
      { cpuId: i713700k.id, storeId: kabum.id, priceCents: generatePriceVariation(220000, day), date: daysAgo(day) },
      { cpuId: i713700k.id, storeId: amazon.id, priceCents: generatePriceVariation(260000, day), date: daysAgo(day) }
    );
  }

  await prisma.priceSnapshot.createMany({
    data: cpuSnapshots,
    skipDuplicates: true,
  });

  console.log(`✅ ${cpuSnapshots.length} snapshots criados para CPUs\n`);

  // Histórico de Products
  console.log("📊 Criando histórico de preços para GPUs e Placas-Mãe (30 dias)...");

  const productSnapshots = [];

  for (let day = 30; day >= 1; day--) {
    productSnapshots.push(
      { productId: rtx4060.id, storeId: kabum.id, priceCents: generatePriceVariation(265000, day), date: daysAgo(day) },
      { productId: rtx4060.id, storeId: terabyte.id, priceCents: generatePriceVariation(300000, day), date: daysAgo(day) },
      { productId: rx7600.id, storeId: terabyte.id, priceCents: generatePriceVariation(232000, day), date: daysAgo(day) },
      { productId: rx7600.id, storeId: kabum.id, priceCents: generatePriceVariation(252000, day), date: daysAgo(day) },
      { productId: rx7600.id, storeId: amazon.id, priceCents: generatePriceVariation(282000, day), date: daysAgo(day) },
      { productId: b450.id, storeId: kabum.id, priceCents: generatePriceVariation(84000, day), date: daysAgo(day) },
      { productId: b450.id, storeId: terabyte.id, priceCents: generatePriceVariation(92000, day), date: daysAgo(day) },
      { productId: b550.id, storeId: terabyte.id, priceCents: generatePriceVariation(100000, day), date: daysAgo(day) },
      { productId: b550.id, storeId: kabum.id, priceCents: generatePriceVariation(110000, day), date: daysAgo(day) },
      { productId: b550.id, storeId: amazon.id, priceCents: generatePriceVariation(128000, day), date: daysAgo(day) }
    );
  }

  await prisma.productPriceSnapshot.createMany({
    data: productSnapshots,
    skipDuplicates: true,
  });

  console.log(`✅ ${productSnapshots.length} snapshots criados para Products\n`);

  console.log("\n🎉 Seed concluído com sucesso!\n");
  console.log("📊 Resumo:");
  console.log(`  - 3 Lojas`);
  console.log(`  - 4 CPUs`);
  console.log(`  - 2 GPUs`);
  console.log(`  - 2 Placas-Mãe`);
  console.log(`  - 10 Ofertas de CPUs`);
  console.log(`  - 5 Ofertas de GPUs`);
  console.log(`  - 5 Ofertas de Placas-Mãe`);
  console.log(`  - ${cpuSnapshots.length} Snapshots de CPUs`);
  console.log(`  - ${productSnapshots.length} Snapshots de Products`);
  console.log("\n💡 Próximo passo: Execute o job de cálculo de ofertas:");
  console.log("   POST http://localhost:3000/api/jobs/calculate-offers\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });