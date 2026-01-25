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
import { OfferBadge, SavingsIndicator } from "@/components/ui/offer-badge";

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
  bestPriceCents?: number | null;
  worstPriceCents?: number | null;
  offerScore?: number | null;
};

type SortKey = "priceAsc" | "priceDesc" | "bestOffer";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("bestOffer");
  const [showAll, setShowAll] = useState(false);

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

    // Se não está mostrando todos, filtra apenas produtos com offerScore >= 10%
    if (!showAll) {
      list = list.filter((p) => p.offerScore && p.offerScore >= 10);
    }

    // Ordena
    list = [...list].sort((a, b) => {
      if (sort === "bestOffer") {
        const aScore = a.offerScore ?? -1;
        const bScore = b.offerScore ?? -1;
        return bScore - aScore; // Decrescente (maior desconto primeiro)
      }

      const ap = a.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;
      const bp = b.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;

      return sort === "priceAsc" ? ap - bp : bp - ap;
    });

    // Limita a 20 produtos quando mostra só ofertas
    if (!showAll) {
      list = list.slice(0, 20);
    }

    return list;
  }, [products, query, sort, showAll]);

  // Contador de ofertas ativas (produtos com offerScore >= 10%)
  const activeOffersCount = useMemo(() => {
    return products.filter((p) => p.offerScore && p.offerScore >= 10).length;
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: showAll ? "Todas as Peças" : "Melhores Ofertas" }]}
      />

      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            {showAll ? "Todas as Peças" : "🔥 Melhores Ofertas"}
          </h1>

          {/* Badge de contador de ofertas */}
          {!showAll && activeOffersCount > 0 && (
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-600 dark:text-red-400">
              {activeOffersCount} ofertas ativas
            </span>
          )}
        </div>

        <p className="mt-2 text-muted-foreground">
          {showAll
            ? "Compare preços de CPUs, GPUs e Placas-Mãe nas melhores lojas"
            : "Os maiores descontos do momento em hardware de PC"}
        </p>
      </div>

      <Separator />

      {/* Toggle para mostrar todas as peças ou só ofertas */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {showAll ? (
              <span className="text-xl">📦</span>
            ) : (
              <span className="text-xl">🔥</span>
            )}
          </div>
          <div>
            <p className="font-medium">
              {showAll
                ? "Mostrando todos os produtos"
                : "Mostrando apenas ofertas especiais"}
            </p>
            <p className="text-sm text-muted-foreground">
              {showAll
                ? `${filtered.length} produtos disponíveis`
                : `Top ${Math.min(filtered.length, 20)} melhores descontos`}
            </p>
          </div>
        </div>

        <Button
          variant={showAll ? "outline" : "default"}
          onClick={() => setShowAll(!showAll)}
          size="sm"
        >
          {showAll ? "Ver Apenas Ofertas" : "Ver Todas as Peças"}
        </Button>
      </div>

      {/* Estatísticas (só aparece quando mostra ofertas) */}
      {!showAll && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {Math.max(...filtered.map((p) => p.offerScore || 0)).toFixed(0)}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Maior desconto</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {filtered.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Ofertas ativas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(
                    filtered.reduce((sum, p) => sum + (p.offerScore || 0), 0) /
                    filtered.length
                  ).toFixed(0)}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Desconto médio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            variant={sort === "bestOffer" ? "default" : "outline"}
            onClick={() => setSort("bestOffer")}
            size="sm"
          >
            🔥 Melhor Oferta
          </Button>
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
                className="group animate-in fade-in-50 slide-in-from-bottom-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    <Link
                      href={productUrl}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>

                    {/* Badge de oferta */}
                    {p.offerScore && p.offerScore >= 10 && (
                      <OfferBadge offerScore={p.offerScore} size="sm" />
                    )}
                  </CardTitle>

                  {/* Badges de informação */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{p.brand}</Badge>
                    <ProductTypeBadge
                      type={p.type as "CPU" | "GPU" | "MOTHERBOARD"}
                    />

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

                  {/* Indicador de economia */}
                  {p.bestPriceCents &&
                    p.worstPriceCents &&
                    p.worstPriceCents > p.bestPriceCents && (
                      <SavingsIndicator
                        bestPrice={p.bestPriceCents}
                        worstPrice={p.worstPriceCents}
                      />
                    )}

                  {/* Número de ofertas */}
                  <div className="text-sm text-muted-foreground">
                    {p.offers.length} oferta{p.offers.length !== 1 ? "s" : ""}{" "}
                    disponível
                    {p.offers.length !== 1 ? "is" : ""}
                  </div>

                  {/* Botão */}
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
            {showAll ? (
              <>
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
              </>
            ) : (
              <>
                <div className="mb-4 text-6xl">😔</div>
                <p className="text-lg font-medium">
                  Nenhuma oferta especial no momento
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Novas ofertas aparecem quando há diferença significativa de
                  preços entre lojas
                </p>
                <Button
                  onClick={() => setShowAll(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Ver todos os produtos
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}