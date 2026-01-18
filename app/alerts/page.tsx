"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBRLFromCents } from "@/lib/money";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type AlertItem = {
  id: string;
  targetPriceCents: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
  cpu: { name: string; slug: string };
  events: Array<{ priceCents: number; storeName: string | null; createdAt: string }>;
};

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function loadAlerts() {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/alerts");
      const text = await res.text();

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Resposta inválida do servidor" };
      }

      if (!res.ok) {
        setStatus(data?.error || "Erro ao carregar alertas");
        setAlerts([]);
        return;
      }

      setAlerts(Array.isArray(data) ? data : []);
      if (!data?.length) setStatus("Você ainda não tem alertas.");
    } catch {
      setStatus("Falha de rede ao carregar alertas");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  async function patchAlert(alertId: string, action: "deactivate" | "activate" | "rearm") {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Resposta inválida do servidor" };
      }

      if (!res.ok) {
        setStatus(data?.error || "Erro ao atualizar alerta");
        return;
      }

      await loadAlerts();

      if (action === "deactivate") setStatus("Alerta desativado ✅");
      if (action === "activate") setStatus("Alerta reativado ✅");
      if (action === "rearm") setStatus("Alerta rearmado ✅");
    } catch {
      setStatus("Falha de rede ao atualizar alerta");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAlert(alertId: string) {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Resposta inválida do servidor" };
      }

      if (!res.ok) {
        setStatus(data?.error || "Erro ao excluir alerta");
        return;
      }

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setStatus("Alerta excluído ✅");
    } catch {
      setStatus("Falha de rede ao excluir alerta");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setStatus(null);
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/">← Voltar</Link>
        </Button>

        <Button variant="outline" onClick={logout} disabled={loading}>
          Sair
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Meus alertas</CardTitle>
            <CardDescription>Gerencie seus alertas (ativo, rearmar, excluir).</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button onClick={loadAlerts} disabled={loading}>
                {loading ? "Carregando..." : "Recarregar"}
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  setStatus(null);
                  setLoading(true);
                  try {
                    await fetch("/api/jobs/check-alerts", { method: "POST" });
                    setStatus("Verificação executada ✅");
                    await loadAlerts();
                  } catch {
                    setStatus("Falha de rede ao executar verificação");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Rodar verificação
              </Button>
            </div>

            {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
          </CardContent>
        </Card>

        {alerts.length ? (
          <div className="grid gap-4">
            {alerts.map((a) => {
              const lastEvent = a.events?.[0] ?? null;
              const fired = Boolean(a.triggeredAt);

              return (
                <Card key={a.id}>
                  <CardHeader className="space-y-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          <Link href={`/cpu/${a.cpu.slug}`} className="hover:underline">
                            {a.cpu.name}
                          </Link>
                        </CardTitle>
                        <CardDescription>Criado em {formatDateTimeBR(a.createdAt)}</CardDescription>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {a.isActive ? <Badge variant="secondary">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                        {fired ? <Badge>Disparado</Badge> : <Badge variant="outline">Aguardando</Badge>}
                        <Badge variant="outline">Alvo: {formatBRLFromCents(a.targetPriceCents)}</Badge>
                      </div>
                    </div>

                    <Separator />
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3">
                    {fired ? (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Disparado em:</span>{" "}
                        <span className="font-medium">{formatDateTimeBR(a.triggeredAt!)}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Ainda não disparou.</div>
                    )}

                    {lastEvent ? (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Último evento:</span>{" "}
                        <span className="font-medium">{formatBRLFromCents(lastEvent.priceCents)}</span>
                        <span className="text-muted-foreground">
                          {lastEvent.storeName ? ` (${lastEvent.storeName})` : ""}
                          {" • "}
                          {formatDateTimeBR(lastEvent.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {a.isActive ? (
                        <Button variant="outline" onClick={() => patchAlert(a.id, "deactivate")} disabled={loading}>
                          Desativar
                        </Button>
                      ) : (
                        <Button onClick={() => patchAlert(a.id, "activate")} disabled={loading}>
                          Reativar
                        </Button>
                      )}

                      {fired ? (
                        <Button variant="secondary" onClick={() => patchAlert(a.id, "rearm")} disabled={loading}>
                          Rearmar
                        </Button>
                      ) : null}

                      <Button asChild variant="outline">
                        <Link href={`/cpu/${a.cpu.slug}`}>Ver CPU</Link>
                      </Button>

                      <Button variant="destructive" onClick={() => deleteAlert(a.id)} disabled={loading}>
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}