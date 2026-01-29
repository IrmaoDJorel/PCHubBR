"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatBRLFromCents } from "@/lib/money";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FavoriteProductButton } from "@/components/ui/FavoriteProductButton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PriceHistoryChart } from "@/components/ui/price-history-chart";

type CpuDetail = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  specsJson: {
    cores?: number;
    threads?: number;
    socket?: string;
    baseClock?: number;
    boostClock?: number;
    hasIntegratedGraphics?: boolean;
    tdp?: number;
    cache?: number;
    manufacturer?: string;
    generation?: string;
    releaseYear?: number;
  };
  offers: Array<{ priceCents: number; url: string; store: { name: string } }>;
  priceSnapshots: Array<{ priceCents: number; date: string; store: { name: string } }>;
};

function formatClockGHz(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(1)} GHz`;
}

export default function CpuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [cpu, setCpu] = useState<CpuDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Sessão
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Alerta
  const [targetPrice, setTargetPrice] = useState("");
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [alertLoading, setAlertLoading] = useState(false);

  async function loadSession() {
    try {
      const res = await fetch("/api/session");
      const data = await res.json().catch(() => null);
      setLoggedIn(Boolean(data?.loggedIn));
    } catch {
      setLoggedIn(false);
    } finally {
      setSessionLoaded(true);
    }
  }

  async function createAlert() {
    setAlertStatus(null);

    if (!sessionLoaded) {
      setAlertStatus("Carregando sessão...");
      return;
    }

    if (!loggedIn) {
      window.location.href = `/login`;
      return;
    }

    setAlertLoading(true);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpuSlug: slug,
          targetPrice,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (res.status === 401) {
        window.location.href = `/login`;
        return;
      }

      if (!res.ok) {
        setAlertStatus(data?.error || "Erro ao criar alerta");
        return;
      }

      setAlertStatus("Alerta criado ✅ (gerencie em Minha conta)");
    } catch {
      setAlertStatus("Falha de rede ao criar alerta");
    } finally {
      setAlertLoading(false);
    }
  }

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then(setCpu)
      .finally(() => setLoading(false));
  }, [slug]);

  const bestOffer = useMemo(() => {
    if (!cpu?.offers?.length) return null;

    let best = cpu.offers[0];
    for (const o of cpu.offers) {
      if (o.priceCents < best.priceCents) best = o;
    }
    return best;
  }, [cpu]);

  const offersSorted = useMemo(() => {
    if (!cpu?.offers?.length) return [];
    return [...cpu.offers].sort((a, b) => a.priceCents - b.priceCents);
  }, [cpu]);

  if (loading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-6 w-48" />
        
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!cpu) {
    return (
      <main className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "CPUs", href: "/cpu" },
            { label: "Não encontrada" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>CPU não encontrada</CardTitle>
            <CardDescription>Verifique o link ou volte para a lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/cpu">Voltar para CPUs</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "CPUs", href: "/cpu" },
          { label: cpu.name },
        ]}
      />

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/cpu">← Voltar para CPUs</Link>
        </Button>

        {bestOffer ? (
          <div className="text-sm text-muted-foreground">
            Melhor oferta:{" "}
            <span className="font-semibold text-foreground">{formatBRLFromCents(bestOffer.priceCents)}</span>{" "}
            <span>({bestOffer.store.name})</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Sem ofertas no momento</div>
        )}
      </div>

      <div className="grid gap-4">
        {/* Header da CPU */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{cpu.name}</CardTitle>
            <CardDescription>
              {cpu.brand} • Processador
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{cpu.brand}</Badge>
              <Badge variant="outline">CPU</Badge>
              {cpu.specsJson.cores && (
                <Badge variant="outline">
                  {cpu.specsJson.cores}c/{cpu.specsJson.threads}t
                </Badge>
              )}
              {cpu.specsJson.socket && (
                <Badge variant="outline">Socket {cpu.specsJson.socket}</Badge>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Melhor oferta</div>
                <div className="text-2xl font-semibold">
                  {bestOffer ? formatBRLFromCents(bestOffer.priceCents) : "—"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bestOffer ? bestOffer.store.name : "Nenhuma loja com oferta ativa"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {bestOffer ? (
                  <Button asChild>
                    <a href={bestOffer.url} target="_blank" rel="noreferrer">
                      Ir para a oferta
                    </a>
                  </Button>
                ) : (
                  <Button disabled>Ir para a oferta</Button>
                )}

                <Button variant="outline" asChild>
                  <a href="#offers">Ver todas</a>
                </Button>

                <FavoriteProductButton productType="CPU" productSlug={cpu.slug} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de preço */}
        <Card>
          <CardHeader>
            <CardTitle>Alerta de preço</CardTitle>
            <CardDescription>
              {loggedIn
                ? "Crie um alerta e gerencie em Minha conta."
                : "Faça login para criar alertas."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Preço alvo (R$)</div>
                <Input
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="650,00"
                  inputMode="decimal"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={createAlert} disabled={alertLoading || !targetPrice}>
                  {alertLoading ? "Criando..." : loggedIn ? "Criar alerta" : "Entrar para criar"}
                </Button>
              </div>
            </div>

            {alertStatus ? <div className="text-sm text-muted-foreground">{alertStatus}</div> : null}
          </CardContent>
        </Card>

        {/* Ofertas */}
        <Card id="offers">
          <CardHeader>
            <CardTitle>Ofertas atuais</CardTitle>
            <CardDescription>Ordenadas do menor para o maior preço.</CardDescription>
          </CardHeader>

          <CardContent>
            {offersSorted.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loja</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {offersSorted.map((o, i) => {
                    const isBest =
                      bestOffer &&
                      o.store.name === bestOffer.store.name &&
                      o.priceCents === bestOffer.priceCents;

                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {o.store.name}
                            {isBest ? <Badge>Melhor</Badge> : null}
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-semibold">
                          {formatBRLFromCents(o.priceCents)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button asChild size="sm" variant={isBest ? "default" : "outline"}>
                            <a href={o.url} target="_blank" rel="noreferrer">
                              Ver
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-muted-foreground">Sem ofertas.</div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <PriceHistoryChart history={cpu.priceSnapshots} />

        {/* Specs Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle>Especificações técnicas</CardTitle>
            <CardDescription>Informações do catálogo.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Marca</span>
                <span className="font-medium">{cpu.brand}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Socket</span>
                <span className="font-medium">{cpu.specsJson.socket || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Núcleos / Threads</span>
                <span className="font-medium">
                  {cpu.specsJson.cores || "—"} cores / {cpu.specsJson.threads || "—"} threads
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clock base</span>
                <span className="font-medium">{formatClockGHz(cpu.specsJson.baseClock)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clock boost</span>
                <span className="font-medium">{formatClockGHz(cpu.specsJson.boostClock)}</span>
              </div>

              {/* ✅ NOVOS CAMPOS */}
              {cpu.specsJson.hasIntegratedGraphics !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">GPU integrada</span>
                  <span className="font-medium">
                    {cpu.specsJson.hasIntegratedGraphics ? "Sim" : "Não"}
                  </span>
                </div>
              )}

              {cpu.specsJson.tdp && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TDP</span>
                  <span className="font-medium">{cpu.specsJson.tdp}W</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}