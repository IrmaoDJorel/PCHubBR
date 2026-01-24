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

type Motherboard = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  motherboard?: {
    chipset?: string;
    socket?: string;
    formFactor?: string;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
};

type SortKey = "priceAsc" | "priceDesc";

export default function MotherboardListPage() {
  const [products, setProducts] = useState<Motherboard[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // Busca apenas Placas-Mãe
  useEffect(() => {
    fetch("/api/products?type=MOTHERBOARD")
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
          { label: "Placas-Mãe" },
        ]}
      />

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Placas-Mãe</h1>
        <p className="mt-2 text-muted-foreground">
          Compare preços de placas-mãe para Intel e AMD nas melhores lojas
        </p>
      </div>

      <Separator />

      {/* Barra de busca e ordenação */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar placas-mãe (ex.: B550, Z790...)"
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
          filtered.map((mb) => {
            const bestOffer = mb.offers[0];
            const hasPrice = bestOffer !== undefined;

            return (
              <Card key={mb.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/motherboard/${mb.slug}`}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {mb.name}
                    </Link>
                  </CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{mb.brand}</Badge>
                    {mb.motherboard?.chipset && (
                      <Badge variant="outline">{mb.motherboard.chipset}</Badge>
                    )}
                    {mb.motherboard?.socket && (
                      <Badge variant="outline">{mb.motherboard.socket}</Badge>
                    )}
                    {mb.motherboard?.formFactor && (
                      <Badge variant="outline">{mb.motherboard.formFactor}</Badge>
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
                    {mb.offers.length} oferta{mb.offers.length !== 1 ? "s" : ""} disponível
                    {mb.offers.length !== 1 ? "is" : ""}
                  </div>

                  <Button asChild size="sm" className="w-full md:w-auto">
                    <Link href={`/motherboard/${mb.slug}`}>Ver detalhes e ofertas</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Nenhuma placa-mãe encontrada</p>
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