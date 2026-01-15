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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CpuDetail = {
  name: string;
  brand: string;
  cores: number;
  threads: number;
  baseClock: number;
  boostClock?: number | null;
  socket: string;

  offers: Array<{ priceCents: number; url: string; store: { name: string } }>;

  // Recomendo que sua API retorne assim (em centavos):
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

  const historyByStore = useMemo(() => {
    // Agrupa histórico por loja pra ficar legível e “bonito”
    const map = new Map<string, Snapshot[]>();
    for (const s of history) {
      const key = s.store.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([storeName, items]) => {
      const sorted = [...items].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const last = sorted[sorted.length - 1] ?? null;
      const min = sorted.reduce((acc, cur) => Math.min(acc, cur.priceCents), Number.POSITIVE_INFINITY);
      const max = sorted.reduce((acc, cur) => Math.max(acc, cur.priceCents), 0);

      return {
        storeName,
        items: sorted,
        lastPriceCents: last?.priceCents ?? null,
        minPriceCents: Number.isFinite(min) ? min : null,
        maxPriceCents: sorted.length ? max : null,
      };
    });
  }, [history]);

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
            <span className="font-semibold text-foreground">
              {formatBRLFromCents(bestOffer.priceCents)}
            </span>{" "}
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
              <Badge variant="outline">{cpu.cores}c/{cpu.threads}t</Badge>
              <Badge variant="outline">Socket {cpu.socket}</Badge>
              <Badge variant="outline">Base {formatClockGHz(cpu.baseClock)}</Badge>
              <Badge variant="outline">Boost {formatClockGHz(cpu.boostClock)}</Badge>
            </div>

            <Separator />

            {/* “Best offer” destacado */}
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

              <div className="flex gap-2">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ofertas */}
        <Card id="offers">
          <CardHeader>
            <CardTitle>Ofertas atuais</CardTitle>
            <CardDescription>
              Ordenadas do menor para o maior preço.
            </CardDescription>
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
                    const isBest = bestOffer && o.store.name === bestOffer.store.name && o.priceCents === bestOffer.priceCents;

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
        <Card>
          <CardHeader>
            <CardTitle>Histórico (30 dias)</CardTitle>
            <CardDescription>
              Agrupado por loja. (Depois a gente transforma em gráfico.)
            </CardDescription>
          </CardHeader>

          <CardContent>
            {historyByStore.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {historyByStore.map((g) => (
                  <Card key={g.storeName} className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">{g.storeName}</CardTitle>
                      <CardDescription>
                        Último:{" "}
                        <span className="font-semibold text-foreground">
                          {g.lastPriceCents !== null ? formatBRLFromCents(g.lastPriceCents) : "—"}
                        </span>
                        {" • "}
                        Min:{" "}
                        {g.minPriceCents !== null ? formatBRLFromCents(g.minPriceCents) : "—"}
                        {" • "}
                        Máx:{" "}
                        {g.maxPriceCents !== null ? formatBRLFromCents(g.maxPriceCents) : "—"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {g.items.slice(-10).map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(s.date).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="font-medium">{formatBRLFromCents(s.priceCents)}</span>
                        </div>
                      ))}

                      {g.items.length > 10 ? (
                        <div className="text-xs text-muted-foreground">
                          Mostrando os últimos 10 de {g.items.length} registros.
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Sem histórico.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}