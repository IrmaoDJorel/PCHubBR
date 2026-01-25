/**
 * Script para executar cálculo de ofertas
 * Execute: node scripts/run-offer-calculation.js
 */

const token = process.env.CRON_SECRET || "1d0bbbf507a43bd6bfac2735a491b89e2179e5718661103a29cb55336ae4eeff";

async function runOfferCalculation() {
  console.log("🚀 Iniciando cálculo de ofertas...\n");

  try {
    const response = await fetch("http://localhost:3000/api/jobs/calculate-offers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Sucesso!\n");
      console.log("📊 Estatísticas:");
      console.log(`   - CPUs processadas: ${data.stats.cpusProcessed}`);
      console.log(`   - CPUs atualizadas: ${data.stats.cpusUpdated}`);
      console.log(`   - Produtos processados: ${data.stats.productsProcessed}`);
      console.log(`   - Produtos atualizados: ${data.stats.productsUpdated}`);
      console.log(`   - Duração: ${data.stats.durationMs}ms\n`);
    } else {
      console.error("❌ Erro:", data.error || "Erro desconhecido");
    }
  } catch (error) {
    console.error("❌ Falha ao conectar com a API:", error.message);
    console.log("\n⚠️  Certifique-se que o servidor está rodando (npm run dev)");
  }
}

runOfferCalculation();