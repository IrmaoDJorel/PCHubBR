"use client";

import { useMemo } from "react";
import { FilterSection } from "@/components/filters/FilterSection";
import { CheckboxFilter } from "@/components/filters/CheckboxFilter";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import type { ProductFilters, PriceRange } from "@/lib/hooks/useProductFilters";

type CpuProduct = {
  brand: string;
  specsJson: {
    socket?: string;
    cores?: number;
  };
  bestPriceCents?: number | null;
};

type CpuFiltersProps = {
  products: CpuProduct[];
  filters: ProductFilters;
  onBrandsChange: (brands: string[]) => void;
  onSocketsChange: (sockets: string[]) => void;
  onCoresChange: (cores: string[]) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  priceRange: PriceRange;
};

/**
 * Componente de filtros específicos para CPUs
 */
export function CpuFilters({
  products,
  filters,
  onBrandsChange,
  onSocketsChange,
  onCoresChange,
  onPriceRangeChange,
  priceRange,
}: CpuFiltersProps) {
  // Extrai opções únicas dos produtos
  const filterOptions = useMemo(() => {
    const brands = new Map<string, number>();
    const sockets = new Map<string, number>();
    const coresMap = new Map<string, number>();

    products.forEach((p) => {
      // Marcas
      brands.set(p.brand, (brands.get(p.brand) || 0) + 1);

      // Sockets
      if (p.specsJson.socket) {
        sockets.set(p.specsJson.socket, (sockets.get(p.specsJson.socket) || 0) + 1);
      }

      // Cores
      if (p.specsJson.cores) {
        const coreLabel = `${p.specsJson.cores} cores`;
        coresMap.set(coreLabel, (coresMap.get(coreLabel) || 0) + 1);
      }
    });

    return {
      brands: Array.from(brands.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      sockets: Array.from(sockets.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      cores: Array.from(coresMap.entries())
        .map(([label, count]) => ({ value: label, label, count }))
        .sort((a, b) => {
          const aCores = parseInt(a.label);
          const bCores = parseInt(b.label);
          return aCores - bCores;
        }),
    };
  }, [products]);

  return (
    <>
      {/* Filtro de Marca */}
      {filterOptions.brands.length > 0 && (
        <FilterSection title="Marca">
          <CheckboxFilter
            options={filterOptions.brands}
            selected={filters.brands}
            onChange={onBrandsChange}
          />
        </FilterSection>
      )}

      {/* Filtro de Socket */}
      {filterOptions.sockets.length > 0 && (
        <FilterSection title="Socket">
          <CheckboxFilter
            options={filterOptions.sockets}
            selected={filters.sockets}
            onChange={onSocketsChange}
          />
        </FilterSection>
      )}

      {/* Filtro de Núcleos */}
      {filterOptions.cores.length > 0 && (
        <FilterSection title="Núcleos">
          <CheckboxFilter
            options={filterOptions.cores}
            selected={filters.cores}
            onChange={onCoresChange}
          />
        </FilterSection>
      )}

      {/* Filtro de Preço */}
      <FilterSection title="Faixa de Preço">
        <PriceRangeFilter
          min={priceRange[0]}
          max={priceRange[1]}
          value={filters.priceRange}
          onChange={onPriceRangeChange}
        />
      </FilterSection>
    </>
  );
}