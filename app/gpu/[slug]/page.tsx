"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatBRLFromCents } from "@/lib/money";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCardSkeletonGrid } from "@/components/ProductCardSkeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

type Gpu = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  gpu?: {
    vramGb?: number;
    vramType?: string;
    chipset?: string;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
};

type SortKey = "priceAsc" | "priceDesc";

export default function GpuListPage() {
  const [products, setProducts] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // Busca apenas GPUs
  useEffect(() => {
    fetch("/api/products?type=GPU")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  // Filtro e ordenação
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => {
      return !q || p.name.toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      const ap = a.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;
      const bp = b.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;

      return sort === "priceAsc" ? ap - bp : bp - ap;
    });

    return list;
  }, [products, query, sort]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "GPUs" },
        ]}
      />

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Placas de Vídeo (GPUs)</h1>
        <p className="mt-2 text-muted-foreground">
          Compare preços de GPUs NVIDIA, AMD e Intel nas melhores lojas
        </p>
      </div>

      <Separator />

      {/* Barra de busca e ordenação */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar GPUs (ex.: RTX 4060, RX 7600...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant={sort === "priceAsc" ? "default" : "outline"}
            onClick={() => setSort("priceAsc")}
            size="sm"
          >
            Menor Preço
          </Button>
          <Button
            variant={sort === "priceDesc" ? "default" : "outline"}
            onClick={() => setSort("priceDesc")}
            size="sm"
          >
            Maior Preço
          </Button>
        </div>
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading ? (
          <ProductCardSkeletonGrid count={6} />
        ) : filtered.length ? (
          filtered.map((gpu) => {
            const bestOffer = gpu.offers[0];
            const hasPrice = bestOffer !== undefined;

            return (
              <Card key={gpu.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/gpu/${gpu.slug}`}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {gpu.name}
                    </Link>
                  </CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{gpu.brand}</Badge>
                    {gpu.gpu?.chipset && (
                      <Badge variant="outline">{gpu.gpu.chipset}</Badge>
                    )}
                    {gpu.gpu?.vramGb && (
                      <Badge variant="outline">
                        {gpu.gpu.vramGb}GB {gpu.gpu.vramType || "VRAM"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Melhor preço: </span>
                    <span className="text-lg font-bold">
                      {hasPrice ? formatBRLFromCents(bestOffer.priceCents) : "Sem ofertas"}
                    </span>
                    {hasPrice && (
                      <span className="ml-1 text-muted-foreground">
                        ({bestOffer.store.name})
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {gpu.offers.length} oferta{gpu.offers.length !== 1 ? "s" : ""} disponível
                    {gpu.offers.length !== 1 ? "is" : ""}
                  </div>

                  <Button asChild size="sm" className="w-full md:w-auto">
                    <Link href={`/gpu/${gpu.slug}`}>Ver detalhes e ofertas</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Nenhuma GPU encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente ajustar sua busca ou{" "}
              <button
                onClick={() => setQuery("")}
                className="text-primary underline-offset-4 hover:underline"
              >
                limpar os filtros
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}