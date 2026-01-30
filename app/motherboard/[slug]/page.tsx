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
import { PriceHistoryChart } from "@/components/ui/price-history-chart";
import { PriceAlertButton } from "@/components/PriceAlertButton"; // ✅ NOVO IMPORT
import { useAuth } from "@/hooks/useAuth"; // ✅ NOVO IMPORT

type MotherboardDetail = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  motherboard: {
    chipset?: string;
    socket?: string;
    formFactor?: string;
    ramSlots?: number;
    maxRamGb?: number;
    ramType?: string;
    maxRamSpeed?: number;
    m2Slots?: number;
    sataPorts?: number;
    sataSlots?: number;
    pciSlots?: number;
    wifi?: boolean;
    bluetooth?: boolean;
    ethernet?: string;
    usbPorts?: {
      usb3?: number;
      usb2?: number;
      usbC?: number;
    };
    releaseYear?: number;
  };
  offers: Array<{ priceCents: number; url: string; store: { name: string } }>;
  priceSnapshots: Array<{ priceCents: number; date: string; store: { name: string } }>;
};

export default function MotherboardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [motherboard, setMotherboard] = useState<MotherboardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth(); // ✅ NOVO HOOK

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then(setMotherboard)
      .finally(() => setLoading(false));
  }, [slug]);

  const bestOffer = useMemo(() => {
    if (!motherboard?.offers?.length) return null;

    let best = motherboard.offers[0];
    for (const o of motherboard.offers) {
      if (o.priceCents < best.priceCents) best = o;
    }
    return best;
  }, [motherboard]);

  const offersSorted = useMemo(() => {
    if (!motherboard?.offers?.length) return [];
    return [...motherboard.offers].sort((a, b) => a.priceCents - b.priceCents);
  }, [motherboard]);

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

  if (!motherboard) {
    return (
      <main className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "Placas-Mãe", href: "/motherboard" },
            { label: "Não encontrada" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Placa-mãe não encontrada</CardTitle>
            <CardDescription>Verifique o link ou volte para a lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/motherboard">Voltar para Placas-Mãe</Link>
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
          { label: "Placas-Mãe", href: "/motherboard" },
          { label: motherboard.name },
        ]}
      />

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/motherboard">← Voltar para Placas-Mãe</Link>
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
        {/* Header da Placa-Mãe */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{motherboard.name}</CardTitle>
            <CardDescription>
              {motherboard.brand} • Placa-Mãe
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{motherboard.brand}</Badge>
              <Badge variant="outline">Placa-Mãe</Badge>
              {motherboard.motherboard.chipset && (
                <Badge variant="outline">Chipset {motherboard.motherboard.chipset}</Badge>
              )}
              {motherboard.motherboard.socket && (
                <Badge variant="outline">Socket {motherboard.motherboard.socket}</Badge>
              )}
              {motherboard.motherboard.formFactor && (
                <Badge variant="outline">{motherboard.motherboard.formFactor}</Badge>
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

                <FavoriteProductButton productType="MOTHERBOARD" productSlug={motherboard.slug} />
              </div>
            </div>

            {/* ✅ NOVO: Botão de Alerta de Preço */}
            <Separator />
            
            <PriceAlertButton
              itemType="MOTHERBOARD"
              itemId={motherboard.id}
              itemName={motherboard.name}
              currentPrice={bestOffer?.priceCents || 0}
              isLoggedIn={isLoggedIn}
            />
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
        <PriceHistoryChart history={motherboard.priceSnapshots} />

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
                <span className="font-medium">{motherboard.brand}</span>
              </div>

              {motherboard.motherboard?.chipset && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chipset</span>
                  <span className="font-medium">{motherboard.motherboard.chipset}</span>
                </div>
              )}

              {motherboard.motherboard?.socket && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Socket</span>
                  <span className="font-medium">{motherboard.motherboard.socket}</span>
                </div>
              )}

              {motherboard.motherboard?.formFactor && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Formato</span>
                  <span className="font-medium">{motherboard.motherboard.formFactor}</span>
                </div>
              )}

              {motherboard.motherboard?.ramSlots && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slots de RAM</span>
                  <span className="font-medium">
                    {motherboard.motherboard.ramSlots}x {motherboard.motherboard.ramType || "DDR4"}
                  </span>
                </div>
              )}

              {motherboard.motherboard?.maxRamGb && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">RAM máxima</span>
                  <span className="font-medium">{motherboard.motherboard.maxRamGb}GB</span>
                </div>
              )}

              {motherboard.motherboard?.maxRamSpeed && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Velocidade RAM máxima</span>
                  <span className="font-medium">{motherboard.motherboard.maxRamSpeed} MHz</span>
                </div>
              )}

              {motherboard.motherboard?.m2Slots && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slots M.2</span>
                  <span className="font-medium">{motherboard.motherboard.m2Slots}</span>
                </div>
              )}

              {motherboard.motherboard?.sataPorts && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Portas SATA</span>
                  <span className="font-medium">{motherboard.motherboard.sataPorts}</span>
                </div>
              )}

              {motherboard.motherboard?.wifi !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wi-Fi integrado</span>
                  <span className="font-medium">
                    {motherboard.motherboard.wifi ? "Sim" : "Não"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}