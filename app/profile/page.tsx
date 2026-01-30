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

// ✅ TIPO ATUALIZADO para suportar múltiplos tipos de produtos
type AlertItem = {
  id: string;
  itemType: "CPU" | "GPU" | "MOTHERBOARD"; // ✅ NOVO
  itemId: string; // ✅ NOVO
  targetPriceCents: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
  cpu?: { name: string; slug: string } | null; // ✅ Opcional (compatibilidade)
  product?: { // ✅ NOVO: dados genéricos do produto
    name: string;
    slug: string;
    url: string;
    currentPrice: number | null;
  } | null;
  events: Array<{ priceCents: number; storeName: string | null; createdAt: string }>;
};

type FavoriteItem = {
  id: string;
  itemType: string; // "CPU", "GPU", "MOTHERBOARD"
  itemId: string;
  createdAt: string;
  slug: string | null; // Slug resolvido
};

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [me, setMe] = useState<Me | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function loadAll() {
    setStatus(null);
    setLoading(true);

    try {
      const [meRes, alertsRes, favRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/alerts"),
        fetch("/api/favorites"),
      ]);

      const meText = await meRes.text();
      const alertsText = await alertsRes.text();
      const favText = await favRes.text();

      const meData = meText ? JSON.parse(meText) : null;
      const alertsData = alertsText ? JSON.parse(alertsText) : null;
      const favData = favText ? JSON.parse(favText) : null;

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

      if (!favRes.ok) {
        setFavorites([]);
      } else {
        setFavorites(Array.isArray(favData) ? favData : []);
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

  async function removeFavorite(itemType: string, productSlug: string) {
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, productSlug }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setStatus(data?.error || "Erro ao remover favorito");
        return;
      }

      await loadAll();
      setStatus("Favorito removido ✅");
    } catch {
      setStatus("Falha de rede ao remover favorito");
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
            <CardTitle>Meus favoritos</CardTitle>
            <CardDescription>Peças salvas para acompanhar depois.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {favorites.length ? (
              <div className="grid gap-3">
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-md border p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{f.itemType}</div>
                      <div className="font-medium">
                        {f.slug ? `${f.itemType} - ${f.slug}` : "Item indisponível"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {f.slug ? (
                        <Button asChild variant="outline">
                          <Link href={`/products/${f.slug!}`}>Ver</Link>
                        </Button>
                      ) : null}

                      {f.slug ? (
                        <Button
                          variant="destructive"
                            onClick={() => {
                            const ok = confirm("Remover este favorito?");
                            if (ok) removeFavorite(f.itemType, f.slug!);
                          }}
                          disabled={loading}
                        >
                          Remover
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Você ainda não favoritou nada.</div>
            )}
          </CardContent>
        </Card>

        {/* ✅ CARD DE ALERTAS ATUALIZADO */}
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

                  // ✅ NOVO: Determinar nome e slug do produto (compatibilidade com alertas antigos)
                  const productName = a.product?.name || a.cpu?.name || "Produto não disponível";
                  const productSlug = a.product?.slug || a.cpu?.slug || null;
                  const productUrl = a.product?.url || (productSlug ? `/products/${productSlug}` : null);
                  const currentPrice = a.product?.currentPrice;

                  return (
                    <div key={a.id} className="rounded-md border p-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{productName}</div>
                          
                          {/* ✅ NOVO: Badges de tipo e status */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{a.itemType}</Badge>
                            {a.isActive ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inativo</Badge>
                            )}
                            {fired ? (
                              <Badge className="bg-blue-600">Disparado</Badge>
                            ) : (
                              <Badge variant="outline">Aguardando</Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Criado em {formatDateTimeBR(a.createdAt)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Alvo: {formatBRLFromCents(a.targetPriceCents)}</Badge>
                          {currentPrice !== null && currentPrice !== undefined && (
                            <Badge variant="secondary">Atual: {formatBRLFromCents(currentPrice)}</Badge>
                          )}
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="text-sm text-muted-foreground">
                        {lastEvent
                          ? `Último evento: ${formatBRLFromCents(lastEvent.priceCents)}${
                              lastEvent.storeName ? ` (${lastEvent.storeName})` : ""
                            } • ${formatDateTimeBR(lastEvent.createdAt)}`
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

                        {/* ✅ NOVO: Link dinâmico baseado no tipo de produto */}
                        {productUrl ? (
                          <Button asChild variant="outline">
                            <Link href={productUrl}>Ver {a.itemType}</Link>
                          </Button>
                        ) : null}

                        <Button
                          variant="destructive"
                          onClick={() => {
                            const ok = confirm("Excluir este alerta? Essa ação não pode ser desfeita.");
                            if (ok) deleteAlert(a.id);
                          }}
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