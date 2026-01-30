"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

type PriceAlertButtonProps = {
  itemType: "CPU" | "GPU" | "MOTHERBOARD";
  itemId: string;
  itemName: string;
  currentPrice: number; // em centavos
  isLoggedIn: boolean;
};

export function PriceAlertButton({
  itemType,
  itemId,
  itemName,
  currentPrice,
  isLoggedIn,
}: PriceAlertButtonProps) {
  const [loading, setLoading] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function createAlert() {
    if (!isLoggedIn) {
      setStatus("Você precisa fazer login primeiro");
      return;
    }

    const targetPriceCents = Math.round(parseFloat(targetPrice) * 100);

    if (isNaN(targetPriceCents) || targetPriceCents <= 0) {
      setStatus("Preço inválido");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          itemId,
          targetPriceCents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Erro ao criar alerta");
        return;
      }

      setStatus("✅ Alerta criado com sucesso!");
      setTargetPrice("");
      setShowForm(false);
    } catch {
      setStatus("Erro de rede ao criar alerta");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="text-sm text-muted-foreground">
        Faça login para criar alertas de preço
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          Criar alerta de preço
        </Button>
      ) : (
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Alerta de Preço</div>
          <div className="text-xs text-muted-foreground">
            Receba notificação quando {itemName} atingir o preço desejado
          </div>
          
          <Input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={`Preço alvo (atual: R$ ${(currentPrice / 100).toFixed(2)})`}
          />

          <div className="flex gap-2">
            <Button onClick={createAlert} disabled={loading} size="sm">
              {loading ? "Criando..." : "Criar alerta"}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setStatus(null);
              }}
              variant="ghost"
              size="sm"
            >
              Cancelar
            </Button>
          </div>

          {status && (
            <div className="text-xs text-muted-foreground">{status}</div>
          )}
        </div>
      )}
    </div>
  );
}