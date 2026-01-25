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
import { OfferBadge, SavingsIndicator } from "@/components/ui/offer-badge";

import { FilterSidebar } from "@/components/filters/FilterSlidebar";
import { FilterToggleButton } from "@/components/filters/FilterToggleButton";
import { CpuFilters } from "@/components/filters/CpuFilters";
import { useProductFilters } from "@/lib/hooks/useProductFilters";

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
    baseClock?: number;
    boostClock?: number;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
  bestPriceCents?: number | null;
  worstPriceCents?: number | null;
  offerScore?: number | null;
};

type SortKey = "priceAsc" | "priceDesc";

export default function CpuListPage() {
  const [products, setProducts] = useState<Cpu[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // Estado de filtros mobile
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Calcula range de preço inicial
  const priceRange = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 500000]; // R$ 0 - R$ 5.000

    const prices = products
      .map((p) => p.bestPriceCents || p.offers[0]?.priceCents)
      .filter((price): price is number => price !== undefined && price !== null);

    if (prices.length === 0) return [0, 500000];

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return [Math.floor(min / 1000) * 1000, Math.ceil(max / 1000) * 1000];
  }, [products]);

  // Hook de filtros
  const {
    filters,
    setBrands,
    setSockets,
    setCores,
    setPriceRange,
    clearFilters,
    activeFiltersCount,
  } = useProductFilters({
    initialPriceRange: priceRange,
  });

  // Busca apenas CPUs
  useEffect(() => {
    fetch("/api/products?type=CPU")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  // Filtro, ordenação e aplicação de filtros
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Filtra por busca
    let list = products.filter((p) => {
      return !q || p.name.toLowerCase().includes(q);
    });

    // Aplica filtros de marca
    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }

    // Aplica filtros de socket
    if (filters.sockets.length > 0) {
      list = list.filter((p) => {
        return p.specsJson.socket && filters.sockets.includes(p.specsJson.socket);
      });
    }

    // Aplica filtros de cores
    if (filters.cores.length > 0) {
      list = list.filter((p) => {
        if (!p.specsJson.cores) return false;
        const coreLabel = `${p.specsJson.cores} cores`;
        return filters.cores.includes(coreLabel);
      });
    }

    // Aplica filtro de faixa de preço
    list = list.filter((p) => {
      const price = p.bestPriceCents || p.offers[0]?.priceCents;
      if (!price) return false;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Ordena por preço
    list = [...list].sort((a, b) => {
      const ap = a.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;
      const bp = b.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;

      return sort === "priceAsc" ? ap - bp : bp - ap;
    });

    return list;
  }, [products, query, sort, filters]);

  return (
    <div className="flex gap-6">
      {/* Sidebar de Filtros */}
      <FilterSidebar
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <CpuFilters
          products={products}
          filters={filters}
          onBrandsChange={setBrands}
          onSocketsChange={setSockets}
          onCoresChange={setCores}
          onPriceRangeChange={setPriceRange}
          priceRange={priceRange}
        />
      </FilterSidebar>

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-6">
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
          {/* Botão de filtros (mobile) + Campo de busca */}
          <div className="flex gap-2">
            <FilterToggleButton
              activeFiltersCount={activeFiltersCount}
              onClick={() => setFiltersOpen(true)}
            />

            <Input
              placeholder="Buscar CPUs (ex.: Ryzen 5 5600, Core i5 13400...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 md:max-w-sm"
            />
          </div>

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

        {/* Indicador de resultados */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "CPU encontrada" : "CPUs encontradas"} com os filtros aplicados
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}

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
                    <CardTitle className="flex items-start justify-between gap-2 text-base">
                      <Link
                        href={`/cpu/${cpu.slug}`}
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {cpu.name}
                      </Link>

                      {/* Badge de oferta */}
                      {cpu.offerScore && cpu.offerScore >= 10 && (
                        <OfferBadge offerScore={cpu.offerScore} size="sm" />
                      )}
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

                    {/* Indicador de economia */}
                    {cpu.bestPriceCents && cpu.worstPriceCents && cpu.worstPriceCents > cpu.bestPriceCents && (
                      <SavingsIndicator
                        bestPrice={cpu.bestPriceCents}
                        worstPrice={cpu.worstPriceCents}
                      />
                    )}

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
                  onClick={() => {
                    setQuery("");
                    clearFilters();
                  }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  limpar os filtros
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}