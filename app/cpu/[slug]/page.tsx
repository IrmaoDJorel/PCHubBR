"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatBRLFromCents } from "@/lib/money";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriceHistoryChart } from "@/components/ui/price-history-chart";
import { Input } from "@/components/ui/input";

import { FavoriteCPUButton } from "@/components/ui/FavoriteCPUButton";

type CpuDetail = {
  name: string;
  brand: string;
  cores: number;
  threads: number;
  baseClock: number;
  boostClock?: number | null;
  socket: string;

  offers: Array<{ priceCents: number; url: string; store: { name: string } }>;

  minPriceCents?: number | null;
  maxPriceCents?: number | null;
};

type Snapshot = { priceCents: number; date: string; store: { name: string } };

function formatClockGHz(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(1)} GHz`;
}

export default function CpuPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [cpu, setCpu] = useState<CpuDetail | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // Sessão (para UX: esconder email e redirecionar para login quando necessário)
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Alerta de preço (agora é por usuário logado)
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
    void loadSession();
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    Promise.all([
      fetch(`/api/cpus/${slug}`).then((r) => r.json()),
      fetch(`/api/cpus/${slug}/history?days=30`).then((r) => r.json()),
    ])
      .then(([cpuData, hist]) => {
        setCpu(cpuData);
        setHistory(hist);
      })
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
      <main className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="mt-6 grid gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!cpu) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU não encontrada</CardTitle>
            <CardDescription>Verifique o link ou volte para a lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/">← Voltar</Link>
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

      <div className="mt-6 grid gap-4">
        {/* Header do “produto” */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{cpu.name}</CardTitle>
            <CardDescription>
              {cpu.brand} • {cpu.cores}c/{cpu.threads}t • Socket {cpu.socket}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{cpu.brand}</Badge>
              <Badge variant="outline">
                {cpu.cores}c/{cpu.threads}t
              </Badge>
              <Badge variant="outline">Socket {cpu.socket}</Badge>
              <Badge variant="outline">Base {formatClockGHz(cpu.baseClock)}</Badge>
              <Badge variant="outline">Boost {formatClockGHz(cpu.boostClock)}</Badge>
            </div>

            <Separator />

            {/* “Best offer” destacado */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Melhor oferta</div>
                <div className="text-2xl font-semibold">{bestOffer ? formatBRLFromCents(bestOffer.priceCents) : "—"}</div>
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

                {/* Favorito */}
                <FavoriteCPUButton cpuSlug={slug} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de preço (por usuário logado) */}
        <Card>
          <CardHeader>
            <CardTitle>Alerta de preço</CardTitle>
            <CardDescription>
              {loggedIn
                ? "Crie um alerta e gerencie em Minha conta."
                : "Faça login para criar alertas (MVP)."}
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

                <Button
                  variant="outline"
                  onClick={async () => {
                    setAlertStatus(null);
                    await fetch("/api/jobs/check-alerts", { method: "POST" });

                    setAlertStatus(
                      "Job executado ✅ (se houver alertas com preço abaixo do alvo, eles disparam)"
                    );
                  }}
                >
                  Testar job
                </Button>
              </div>
            </div>

            {alertStatus ? <div className="text-sm text-muted-foreground">{alertStatus}</div> : null}

            <div className="text-xs text-muted-foreground">
              Dica: use um alvo <strong>acima</strong> do melhor preço atual para ver o disparo rápido no MVP.
            </div>
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

                        <TableCell className="text-right font-semibold">{formatBRLFromCents(o.priceCents)}</TableCell>

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
        {history?.length ? (
          <PriceHistoryChart history={history} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Histórico (30 dias)</CardTitle>
              <CardDescription>Sem dados de histórico.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Ainda não há registros de preço para esta CPU.</div>
            </CardContent>
          </Card>
        )}

        {/* Especificações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle>Especificações técnicas</CardTitle>
            <CardDescription>Informações do catálogo (MVP).</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Marca</span>
                <span className="font-medium">{cpu.brand}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cores / Threads</span>
                <span className="font-medium">
                  {cpu.cores}c / {cpu.threads}t
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Socket</span>
                <span className="font-medium">{cpu.socket}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clock base</span>
                <span className="font-medium">{formatClockGHz(cpu.baseClock)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clock boost</span>
                <span className="font-medium">{formatClockGHz(cpu.boostClock)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}