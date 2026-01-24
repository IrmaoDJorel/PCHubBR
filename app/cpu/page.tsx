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

type Cpu = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  specsJson: {
    cores?: number;
    threads?: number;
    socket?: string;
    baseClock?: string;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
};

type SortKey = "priceAsc" | "priceDesc";

export default function CpuListPage() {
  const [products, setProducts] = useState<Cpu[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // Busca apenas CPUs
  useEffect(() => {
    fetch("/api/products?type=CPU")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  // Filtro e ordenação
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Filtra por busca
    let list = products.filter((p) => {
      return !q || p.name.toLowerCase().includes(q);
    });

    // Ordena por preço
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
          { label: "CPUs" },
        ]}
      />

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Processadores (CPUs)</h1>
        <p className="mt-2 text-muted-foreground">
          Compare preços de processadores Intel e AMD nas melhores lojas
        </p>
      </div>

      <Separator />

      {/* Barra de busca e ordenação */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Campo de busca */}
        <Input
          placeholder="Buscar CPUs (ex.: Ryzen 5 5600, Core i5 13400...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />

        {/* Botões de ordenação */}
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
          filtered.map((cpu) => {
            const bestOffer = cpu.offers[0];
            const hasPrice = bestOffer !== undefined;

            return (
              <Card key={cpu.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/cpu/${cpu.slug}`}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {cpu.name}
                    </Link>
                  </CardTitle>

                  {/* Badges de informação */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{cpu.brand}</Badge>
                    {cpu.specsJson.cores && (
                      <Badge variant="outline">
                        {cpu.specsJson.cores}c/{cpu.specsJson.threads}t
                      </Badge>
                    )}
                    {cpu.specsJson.socket && (
                      <Badge variant="outline">{cpu.specsJson.socket}</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Preço */}
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

                  {/* Número de ofertas */}
                  <div className="text-sm text-muted-foreground">
                    {cpu.offers.length} oferta{cpu.offers.length !== 1 ? "s" : ""} disponível
                    {cpu.offers.length !== 1 ? "is" : ""}
                  </div>

                  {/* Botão */}
                  <Button asChild size="sm" className="w-full md:w-auto">
                    <Link href={`/cpu/${cpu.slug}`}>Ver detalhes e ofertas</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Nenhum produto encontrado
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Nenhuma CPU encontrada</p>
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