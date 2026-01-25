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

// Imports de filtros
import { FilterSidebar } from "@/components/filters/FilterSlidebar";
import { FilterToggleButton } from "@/components/filters/FilterToggleButton";
import { GpuFilters } from "@/components/filters/GpuFilters";
import { useProductFilters } from "@/lib/hooks/useProductFilters";

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
    baseClock?: number;
    boostClock?: number;
    tdp?: number;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
  // ✅ Campos de oferta
  bestPriceCents?: number | null;
  worstPriceCents?: number | null;
  offerScore?: number | null;
};

type SortKey = "priceAsc" | "priceDesc";

export default function GpuListPage() {
  const [products, setProducts] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  // ✅ Estado de filtros mobile
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Busca GPUs
  useEffect(() => {
    fetch("/api/products?type=GPU")
      .then((r) => r.json())
      .then((data) => {
        // Filtra apenas GPUs
        const gpus = data.filter((p: any) => p.type === "GPU");
        setProducts(gpus);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Calcula range de preço inicial
  const priceRange = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 1000000]; // R$ 0 - R$ 10.000

    const prices = products
      .map((p) => p.bestPriceCents || p.offers[0]?.priceCents)
      .filter((price): price is number => price !== undefined && price !== null);

    if (prices.length === 0) return [0, 1000000];

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return [Math.floor(min / 1000) * 1000, Math.ceil(max / 1000) * 1000];
  }, [products]);

  // ✅ Hook de filtros
  const {
    filters,
    setBrands,
    setVramSizes,
    setChipsets,
    setPriceRange,
    clearFilters,
    activeFiltersCount,
  } = useProductFilters({
    initialPriceRange: priceRange,
  });

  // ✅ Filtro, ordenação e aplicação de filtros
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Filtra por busca
    let list = products.filter((p) => {
      return !q || p.name.toLowerCase().includes(q);
    });

    // Aplica filtros
    // Filtro por marca
    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }

    // Filtro por VRAM
    if (filters.vramSizes.length > 0) {
      list = list.filter((p) => {
        if (!p.gpu?.vramGb) return false;
        const vramLabel = `${p.gpu.vramGb}GB`;
        return filters.vramSizes.includes(vramLabel);
      });
    }

    // Filtro por Chipset
    if (filters.chipsets.length > 0) {
      list = list.filter((p) => {
        return p.gpu?.chipset && filters.chipsets.includes(p.gpu.chipset);
      });
    }

    // Filtro por faixa de preço
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
      {/* ✅ Sidebar de Filtros */}
      <FilterSidebar
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <GpuFilters
          products={products}
          filters={filters}
          onBrandsChange={setBrands}
          onVramSizesChange={setVramSizes}
          onChipsetsChange={setChipsets}
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

        {/* ✅ Barra de busca e ordenação */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Botão de filtros (mobile) + Campo de busca */}
          <div className="flex gap-2">
            <FilterToggleButton
              activeFiltersCount={activeFiltersCount}
              onClick={() => setFiltersOpen(true)}
            />

            <Input
              placeholder="Buscar GPUs (ex.: RTX 4060, RX 7600...)"
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

        {/* ✅ Indicador de resultados */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "GPU encontrada" : "GPUs encontradas"} com os filtros aplicados
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
            filtered.map((gpu) => {
              const bestOffer = gpu.offers[0];
              const hasPrice = bestOffer !== undefined;

              return (
                <Card key={gpu.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    {/* ✅ Título com badge de oferta */}
                    <CardTitle className="flex items-start justify-between gap-2 text-base">
                      <Link
                        href={`/gpu/${gpu.slug}`}
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {gpu.name}
                      </Link>

                      {/* Badge de oferta */}
                      {gpu.offerScore && gpu.offerScore >= 10 && (
                        <OfferBadge offerScore={gpu.offerScore} size="sm" />
                      )}
                    </CardTitle>

                    {/* ✅ Badges de informação atualizadas */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{gpu.brand}</Badge>
                      <ProductTypeBadge type="GPU" />
                      {gpu.gpu?.vramGb && (
                        <SpecBadge>
                          {gpu.gpu.vramGb}GB {gpu.gpu.vramType || "VRAM"}
                        </SpecBadge>
                      )}
                      {gpu.gpu?.chipset && (
                        <SpecBadge>{gpu.gpu.chipset}</SpecBadge>
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

                    {/* ✅ Indicador de economia */}
                    {gpu.bestPriceCents && gpu.worstPriceCents && gpu.worstPriceCents > gpu.bestPriceCents && (
                      <SavingsIndicator
                        bestPrice={gpu.bestPriceCents}
                        worstPrice={gpu.worstPriceCents}
                      />
                    )}

                    {/* Número de ofertas */}
                    <div className="text-sm text-muted-foreground">
                      {gpu.offers.length} oferta{gpu.offers.length !== 1 ? "s" : ""} disponível
                      {gpu.offers.length !== 1 ? "is" : ""}
                    </div>

                    {/* Botão */}
                    <Button asChild size="sm" className="w-full md:w-auto">
                      <Link href={`/gpu/${gpu.slug}`}>Ver detalhes e ofertas</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Nenhum produto encontrado
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">Nenhuma GPU encontrada</p>
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