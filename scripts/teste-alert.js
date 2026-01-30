const token = process.env.CRON_SECRET || "1d0bbbf507a43bd6bfac2735a491b89e2179e5718661103a29cb55336ae4eeff";

async function testAlertCreation() {
  console.log("🧪 Testando criação de alertas...\n");

  const testCases = [
    {
      type: "CPU",
      description: "Alerta para Ryzen 5 5600",
      body: {
        itemType: "CPU",
        itemId: "ID_DA_CPU_AQUI", // Substituir por ID real do banco
        targetPriceCents: 60000, // R$ 600,00
      },
    },
    {
      type: "GPU",
      description: "Alerta para RTX 4060",
      body: {
        itemType: "GPU",
        itemId: "ID_DA_GPU_AQUI", // Substituir por ID real do banco
        targetPriceCents: 250000, // R$ 2.500,00
      },
    },
  ];

  for (const test of testCases) {
    console.log(`📌 ${test.description}`);

    try {
      const response = await fetch("http://localhost:3000/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": "pchubbr_session=SEU_TOKEN_DE_SESSÃO_AQUI", // Obter do navegador
        },
        body: JSON.stringify(test.body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Sucesso! Alerta ID: ${data.alert?.id}\n`);
      } else {
        console.log(`❌ Erro: ${data.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Falha de rede: ${error.message}\n`);
    }
  }
}

testAlertCreation();