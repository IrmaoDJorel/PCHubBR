"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatBRLFromCents } from "@/lib/money";

type Me = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  createdAt: string;
};

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

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [me, setMe] = useState<Me | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function loadAll() {
    setStatus(null);
    setLoading(true);

    try {
      const [meRes, alertsRes] = await Promise.all([fetch("/api/me"), fetch("/api/alerts")]);

      const meText = await meRes.text();
      const alertsText = await alertsRes.text();

      const meData = meText ? JSON.parse(meText) : null;
      const alertsData = alertsText ? JSON.parse(alertsText) : null;

      if (!meRes.ok) {
        setStatus(meData?.error || "Erro ao carregar perfil");
        return;
      }

      setMe(meData);
      setName(meData?.name ?? "");
      setUsername(meData?.username ?? "");

      if (!alertsRes.ok) {
        setStatus(alertsData?.error || "Erro ao carregar alertas");
        setAlerts([]);
      } else {
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      }
    } catch {
      setStatus("Falha de rede ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setStatus(data?.error || "Erro ao salvar perfil");
        return;
      }

      setMe(data.user);
      setStatus("Perfil atualizado ✅");
    } catch {
      setStatus("Falha de rede ao salvar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setStatus(data?.error || "Erro ao alterar senha");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setStatus("Senha alterada ✅");
    } catch {
      setStatus("Falha de rede ao alterar senha");
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
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setStatus(data?.error || "Erro ao atualizar alerta");
        return;
      }

      await loadAll();
      setStatus("Alerta atualizado ✅");
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
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
        setStatus(data?.error || "Erro ao excluir alerta");
        return;
        }

        await loadAll();
        setStatus("Alerta excluído ✅");
    } catch {
        setStatus("Falha de rede ao excluir alerta");
    } finally {
        setLoading(false);
    }
    }

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
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
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Dados da sua conta.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {me ? (
              <>
                <div className="text-sm text-muted-foreground">Email: {me.email}</div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Nome</div>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Usuário</div>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seuusuario" />
                  </div>
                </div>

                <Button onClick={saveProfile} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar perfil"}
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Carregando perfil...</div>
            )}

            {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>Requer sua senha atual.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <Input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Senha atual"
              type="password"
              autoComplete="current-password"
            />
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha (mínimo 8)"
              type="password"
              autoComplete="new-password"
            />
            <Button onClick={changePassword} disabled={loading || !currentPassword || newPassword.length < 8}>
              Alterar senha
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus alertas</CardTitle>
            <CardDescription>Gerencie alertas diretamente pelo perfil.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {alerts.length ? (
              <div className="grid gap-3">
                {alerts.map((a) => {
                  const lastEvent = a.events?.[0] ?? null;
                  const fired = Boolean(a.triggeredAt);

                  return (
                    <div key={a.id} className="rounded-md border p-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{a.cpu.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Criado em {formatDateTimeBR(a.createdAt)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {a.isActive ? <Badge variant="secondary">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                          {fired ? <Badge>Disparado</Badge> : <Badge variant="outline">Aguardando</Badge>}
                          <Badge variant="outline">Alvo: {formatBRLFromCents(a.targetPriceCents)}</Badge>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="text-sm text-muted-foreground">
                        {lastEvent
                          ? `Último evento: ${formatBRLFromCents(lastEvent.priceCents)}${lastEvent.storeName ? ` (${lastEvent.storeName})` : ""} • ${formatDateTimeBR(lastEvent.createdAt)}`
                          : "Nenhum evento ainda."}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
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

                        <Button
                            variant="destructive"
                            onClick={() => deleteAlert(a.id)}
                            disabled={loading}
                            >
                            Excluir
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Você ainda não tem alertas.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}   