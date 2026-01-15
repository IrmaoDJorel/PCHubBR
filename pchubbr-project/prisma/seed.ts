import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0); // fixa meio-dia pra não variar por fuso
  return d;
}

async function main() {
  // Limpeza (ordem importa por FK)
  await prisma.priceSnapshot.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.cpu.deleteMany();

  // Stores
  const kabum = await prisma.store.create({
    data: { name: "KaBuM!", url: "https://www.kabum.com.br" },
  });

  const terabyte = await prisma.store.create({
    data: { name: "TerabyteShop", url: "https://www.terabyteshop.com.br" },
  });

  // CPUs
  const r5600 = await prisma.cpu.create({
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

  // Offers (preço atual)
  await prisma.offer.createMany({
    data: [
      {
        cpuId: r5600.id,
        storeId: kabum.id,
        priceCents: 69990,
        url: "https://www.kabum.com.br/produto/ryzen-5-5600",
      },
      {
        cpuId: r5600.id,
        storeId: terabyte.id,
        priceCents: 67990,
        url: "https://www.terabyteshop.com.br/produto/ryzen-5-5600",
      },
      {
        cpuId: i512400f.id,
        storeId: kabum.id,
        priceCents: 74990,
        url: "https://www.kabum.com.br/produto/i5-12400f",
      },
      {
        cpuId: i512400f.id,
        storeId: terabyte.id,
        priceCents: 73990,
        url: "https://www.terabyteshop.com.br/produto/i5-12400f",
      },
    ],
  });

  // Histórico (30 dias) por CPU + Loja
  const snapshots: Array<{ cpuId: string; storeId: string; priceCents: number; date: Date }> = [];

  for (let day = 30; day >= 1; day--) {
    // Ryzen 5 5600
    snapshots.push({
      cpuId: r5600.id,
      storeId: kabum.id,
      priceCents: Math.round((720 - (30 - day) * 1.2) * 100),
      date: daysAgo(day),
});
    snapshots.push({
      cpuId: r5600.id,
      storeId: terabyte.id,
      priceCents: Math.round((705 - (30 - day) * 1.0) * 100),
      date: daysAgo(day),
    });

    // i5-12400F
    snapshots.push({
      cpuId: i512400f.id,
      storeId: kabum.id,
      priceCents: 780 - (30 - day) * 1.1,
      date: daysAgo(day),
    });
    snapshots.push({
      cpuId: i512400f.id,
      storeId: terabyte.id,
      priceCents: 770 - (30 - day) * 1.0,
      date: daysAgo(day),
    });
  }

  // Se você adicionou @@unique([cpuId, storeId, date]), use createMany com skipDuplicates
  await prisma.priceSnapshot.createMany({
    data: snapshots,
    skipDuplicates: true,
  });

  console.log("Seed concluído ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });