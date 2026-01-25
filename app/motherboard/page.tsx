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
import { MotherboardFilters } from "@/components/filters/MotherboardFilters";
import { useProductFilters } from "@/lib/hooks/useProductFilters";

type Motherboard = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: string;
  motherboard?: {
    socket?: string;
    chipset?: string;
    formFactor?: string;
    ramType?: string;
    ramSlots?: number;
    maxRamGb?: number;
  };
  offers: Array<{ priceCents: number; store: { name: string } }>;
  bestPriceCents?: number | null;
  worstPriceCents?: number | null;
  offerScore?: number | null;
};

type SortKey = "priceAsc" | "priceDesc";

export default function MotherboardListPage() {
  const [products, setProducts] = useState<Motherboard[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priceAsc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Busca Placas-Mãe
  useEffect(() => {
    fetch("/api/products?type=MOTHERBOARD")
      .then((r) => r.json())
      .then((data) => {
        const motherboards = data.filter((p: any) => p.type === "MOTHERBOARD");
        setProducts(motherboards);
      })
      .finally(() => setLoading(false));
  }, []);

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
    setChipsets,
    setFormFactors,
    setRamTypes,
    setPriceRange,
    clearFilters,
    activeFiltersCount,
  } = useProductFilters({
    initialPriceRange: priceRange,
  });

  // Filtro e ordenação
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => {
      return !q || p.name.toLowerCase().includes(q);
    });

    // Aplica filtros
    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }

    if (filters.sockets.length > 0) {
      list = list.filter((p) => {
        return p.motherboard?.socket && filters.sockets.includes(p.motherboard.socket);
      });
    }

    if (filters.chipsets.length > 0) {
      list = list.filter((p) => {
        return p.motherboard?.chipset && filters.chipsets.includes(p.motherboard.chipset);
      });
    }

    if (filters.formFactors.length > 0) {
      list = list.filter((p) => {
        return p.motherboard?.formFactor && filters.formFactors.includes(p.motherboard.formFactor);
      });
    }

    if (filters.ramTypes.length > 0) {
      list = list.filter((p) => {
        return p.motherboard?.ramType && filters.ramTypes.includes(p.motherboard.ramType);
      });
    }

    list = list.filter((p) => {
      const price = p.bestPriceCents || p.offers[0]?.priceCents;
      if (!price) return false;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

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
        <MotherboardFilters
          products={products}
          filters={filters}
          onBrandsChange={setBrands}
          onSocketsChange={setSockets}
          onChipsetsChange={setChipsets}
          onFormFactorsChange={setFormFactors}
          onRamTypesChange={setRamTypes}
          onPriceRangeChange={setPriceRange}
          priceRange={priceRange}
        />
      </FilterSidebar>

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "Placas-Mãe" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold">Placas-Mãe</h1>
          <p className="mt-2 text-muted-foreground">
            Compare preços de placas-mãe para Intel e AMD nas melhores lojas
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <FilterToggleButton
              activeFiltersCount={activeFiltersCount}
              onClick={() => setFiltersOpen(true)}
            />

            <Input
              placeholder="Buscar Placas-Mãe (ex.: B550, Z790...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 md:max-w-sm"
            />
          </div>

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

        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "placa-mãe encontrada" : "placas-mãe encontradas"} com os filtros aplicados
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}

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
                    <CardTitle className="flex items-start justify-between gap-2 text-base">
                      <Link
                        href={`/motherboard/${mb.slug}`}
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {mb.name}
                      </Link>

                      {mb.offerScore && mb.offerScore >= 10 && (
                        <OfferBadge offerScore={mb.offerScore} size="sm" />
                      )}
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{mb.brand}</Badge>
                      <ProductTypeBadge type="MOTHERBOARD" />
                      {mb.motherboard?.chipset && (
                        <SpecBadge>{mb.motherboard.chipset}</SpecBadge>
                      )}
                      {mb.motherboard?.socket && (
                        <SpecBadge>{mb.motherboard.socket}</SpecBadge>
                      )}
                      {mb.motherboard?.formFactor && (
                        <SpecBadge>{mb.motherboard.formFactor}</SpecBadge>
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

                    {mb.bestPriceCents && mb.worstPriceCents && mb.worstPriceCents > mb.bestPriceCents && (
                      <SavingsIndicator
                        bestPrice={mb.bestPriceCents}
                        worstPrice={mb.worstPriceCents}
                      />
                    )}

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