const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Corrigindo duplicação de lojas...");

  // Busca lojas com nome similar
  const kabumLower = await prisma.store.findFirst({
    where: { name: "Kabum" },
  });

  const kabumUpper = await prisma.store.findFirst({
    where: { name: "KaBuM!" },
  });

  if (!kabumLower && !kabumUpper) {
    console.log("❌ Nenhuma loja Kabum encontrada.");
    return;
  }

  // Se ambas existem, renomeia a segunda para Amazon
  if (kabumLower && kabumUpper) {
    console.log("✅ Encontradas duas lojas Kabum:");
    console.log(`  - ${kabumLower.name} (ID: ${kabumLower.id})`);
    console.log(`  - ${kabumUpper.name} (ID: ${kabumUpper.id})`);

    // Renomeia KaBuM! para Amazon
    await prisma.store.update({
      where: { id: kabumUpper.id },
      data: {
        name: "Amazon",
        url: "https://www.amazon.com.br",
      },
    });

    console.log(`✅ Loja "${kabumUpper.name}" renomeada para "Amazon"`);
  } else if (kabumUpper) {
    // Se só existe KaBuM!, renomeia para Kabum
    await prisma.store.update({
      where: { id: kabumUpper.id },
      data: { name: "Kabum" },
    });

    console.log(`✅ Loja "KaBuM!" renomeada para "Kabum"`);
  }

  console.log("🎉 Correção concluída!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });