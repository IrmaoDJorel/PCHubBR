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
import { FavoriteProductButton } from "@/components/ui/FavoriteProductButton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

type GpuDetail = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  gpu: {
    vramGb?: number;
    vramType?: string;
    chipset?: string;
    baseClock?: number;
    boostClock?: number;
    tdp?: number;
    interface?: string;
    manufacturer?: string;
    series?: string;
    rayTracing?: boolean;
    dlss?: boolean;
    pciSlots?: number;
    powerConnectors?: string;
    length?: number;
    releaseYear?: number;
  };
  offers: Array<{ priceCents: number; url: string; store: { name: string } }>;
  priceSnapshots: Array<{ priceCents: number; date: string; store: { name: string } }>;
};

export default function GpuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [gpu, setGpu] = useState<GpuDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then(setGpu)
      .finally(() => setLoading(false));
  }, [slug]);

  const bestOffer = useMemo(() => {
    if (!gpu?.offers?.length) return null;

    let best = gpu.offers[0];
    for (const o of gpu.offers) {
      if (o.priceCents < best.priceCents) best = o;
    }
    return best;
  }, [gpu]);

  const offersSorted = useMemo(() => {
    if (!gpu?.offers?.length) return [];
    return [...gpu.offers].sort((a, b) => a.priceCents - b.priceCents);
  }, [gpu]);

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

  if (!gpu) {
    return (
      <main className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "GPUs", href: "/gpu" },
            { label: "Não encontrada" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>GPU não encontrada</CardTitle>
            <CardDescription>Verifique o link ou volte para a lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/gpu">Voltar para GPUs</Link>
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
          { label: "GPUs", href: "/gpu" },
          { label: gpu.name },
        ]}
      />

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/gpu">← Voltar para GPUs</Link>
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
        {/* Header da GPU */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{gpu.name}</CardTitle>
            <CardDescription>
              {gpu.brand} • Placa de Vídeo
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{gpu.brand}</Badge>
              <Badge variant="outline">GPU</Badge>
              {gpu.gpu.chipset && <Badge variant="outline">{gpu.gpu.chipset}</Badge>}
              {gpu.gpu.vramGb && (
                <Badge variant="outline">
                  {gpu.gpu.vramGb}GB {gpu.gpu.vramType || "VRAM"}
                </Badge>
              )}
              {gpu.gpu.tdp && <Badge variant="outline">TDP {gpu.gpu.tdp}W</Badge>}
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

                <FavoriteProductButton productType="GPU" productSlug={gpu.slug} />
              </div>
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
        {gpu.priceSnapshots?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de preço (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                Preço mínimo: {formatBRLFromCents(Math.min(...gpu.priceSnapshots.map((s) => s.priceCents)))}
                <br />
                Preço máximo: {formatBRLFromCents(Math.max(...gpu.priceSnapshots.map((s) => s.priceCents)))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Histórico (30 dias)</CardTitle>
              <CardDescription>Sem dados de histórico.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Ainda não há registros de preço para esta GPU.
              </div>
            </CardContent>
          </Card>
        )}

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
                <span className="font-medium">{gpu.brand}</span>
              </div>

              {/* ✅ NOVO CAMPO */}
              {gpu.gpu?.chipset && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chipset</span>
                  <span className="font-medium">{gpu.gpu.chipset}</span>
                </div>
              )}

              {gpu.gpu?.vramGb && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">VRAM</span>
                  <span className="font-medium">
                    {gpu.gpu.vramGb}GB {gpu.gpu.vramType || ""}
                  </span>
                </div>
              )}

              {gpu.gpu?.baseClock && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clock base</span>
                  <span className="font-medium">{gpu.gpu.baseClock} MHz</span>
                </div>
              )}

              {gpu.gpu?.boostClock && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clock boost</span>
                  <span className="font-medium">{gpu.gpu.boostClock} MHz</span>
                </div>
              )}

              {gpu.gpu?.tdp && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TDP</span>
                  <span className="font-medium">{gpu.gpu.tdp}W</span>
                </div>
              )}

              {gpu.gpu?.interface && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interface</span>
                  <span className="font-medium">{gpu.gpu.interface}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}