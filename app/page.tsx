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
import { ProductTypeBadge, SpecBadge } from "@/components/ui/product-badge";

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  specsJson: any;
  offers: Array<{ priceCents: number; store: { name: string } }>;
  gpu?: any;
  motherboard?: any;
};

type SortKey = "priceAsc" | "priceDesc";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // Busca todos os produtos (sem filtro de tipo - exibe todas as categorias)
  useEffect(() => {
    fetch("/api/products")
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
      <Breadcrumbs items={[{ label: "Todas as Peças" }]} />

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Todas as Peças</h1>
        <p className="mt-2 text-muted-foreground">
          Compare preços de CPUs, GPUs e Placas-Mãe nas melhores lojas
        </p>
      </div>

      <Separator />

      {/* Barra de busca e ordenação */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Campo de busca */}
        <Input
          placeholder="Buscar peças (ex.: Ryzen, RTX 4060, B550...)"
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
          // Estado de loading: mostra 6 skeletons
          <ProductCardSkeletonGrid count={6} />
        ) : filtered.length ? (
          // Produtos encontrados
          filtered.map((p) => {
            const bestOffer = p.offers[0];
            const hasPrice = bestOffer !== undefined;

            // Determina rota específica baseada no tipo
            const productUrl =
              p.type === "CPU"
                ? `/cpu/${p.slug}`
                : p.type === "GPU"
                  ? `/gpu/${p.slug}`
                  : p.type === "MOTHERBOARD"
                    ? `/motherboard/${p.slug}`
                    : `/products/${p.slug}`;

            return (
              <Card
                key={p.id}
                className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
                  <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={productUrl}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                  </CardTitle>

                  {/* Badges de informação */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{p.brand}</Badge>
                    <ProductTypeBadge type={p.type as "CPU" | "GPU" | "MOTHERBOARD"} />

                    {/* Specs específicas por tipo */}
                    {p.type === "CPU" && p.specsJson && (
                      <>
                        {p.specsJson.cores && (
                          <SpecBadge>
                            {p.specsJson.cores}c/{p.specsJson.threads}t
                          </SpecBadge>
                        )}
                        {p.specsJson.socket && (
                          <SpecBadge>{p.specsJson.socket}</SpecBadge>
                        )}
                      </>
                    )}
                    {p.gpu && (
                      <>
                        {p.gpu.vramGb && (
                          <SpecBadge>
                            {p.gpu.vramGb}GB {p.gpu.vramType}
                          </SpecBadge>
                        )}
                      </>
                    )}
                    {p.motherboard && (
                      <>
                        {p.motherboard.chipset && (
                          <SpecBadge>{p.motherboard.chipset}</SpecBadge>
                        )}
                        {p.motherboard.formFactor && (
                          <SpecBadge>{p.motherboard.formFactor}</SpecBadge>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Preço */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Melhor preço: </span>
                    <span className="text-lg font-bold">
                      {hasPrice
                        ? formatBRLFromCents(bestOffer.priceCents)
                        : "Sem ofertas"}
                    </span>
                    {hasPrice && (
                      <span className="ml-1 text-muted-foreground">
                        ({bestOffer.store.name})
                      </span>
                    )}
                  </div>

                  {/* Número de ofertas */}
                  <div className="text-sm text-muted-foreground">
                    {p.offers.length} oferta{p.offers.length !== 1 ? "s" : ""}{" "}
                    disponível
                    {p.offers.length !== 1 ? "is" : ""}
                  </div>

                  {/* Botão - SEM comentário interno! */}
                  <Button asChild size="sm" className="w-full md:w-auto">
                    <Link href={productUrl}>Ver detalhes e ofertas</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Nenhum produto encontrado
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Nenhuma peça encontrada</p>
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