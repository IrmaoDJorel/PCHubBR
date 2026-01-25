"use client";

import { useMemo } from "react";
import { FilterSection } from "@/components/filters/FilterSection";
import { CheckboxFilter } from "@/components/filters/CheckboxFilter";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import type { ProductFilters, PriceRange } from "@/lib/hooks/useProductFilters";

type GpuProduct = {
  brand: string;
  gpu?: {
    vramGb?: number;
    chipset?: string;
  };
  bestPriceCents?: number | null;
};

type GpuFiltersProps = {
  products: GpuProduct[];
  filters: ProductFilters;
  onBrandsChange: (brands: string[]) => void;
  onVramSizesChange: (vramSizes: string[]) => void;
  onChipsetsChange: (chipsets: string[]) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  priceRange: PriceRange;
};

/**
 * Componente de filtros específicos para GPUs
 */
export function GpuFilters({
  products,
  filters,
  onBrandsChange,
  onVramSizesChange,
  onChipsetsChange,
  onPriceRangeChange,
  priceRange,
}: GpuFiltersProps) {
  // Extrai opções únicas dos produtos
  const filterOptions = useMemo(() => {
    const brands = new Map<string, number>();
    const vramSizes = new Map<string, number>();
    const chipsets = new Map<string, number>();

    products.forEach((p) => {
      // Marcas
      brands.set(p.brand, (brands.get(p.brand) || 0) + 1);

      // VRAM
      if (p.gpu?.vramGb) {
        const vramLabel = `${p.gpu.vramGb}GB`;
        vramSizes.set(vramLabel, (vramSizes.get(vramLabel) || 0) + 1);
      }

      // Chipset
      if (p.gpu?.chipset) {
        chipsets.set(p.gpu.chipset, (chipsets.get(p.gpu.chipset) || 0) + 1);
      }
    });

    return {
      brands: Array.from(brands.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      vramSizes: Array.from(vramSizes.entries())
        .map(([label, count]) => ({ value: label, label, count }))
        .sort((a, b) => {
          const aSize = parseInt(a.label);
          const bSize = parseInt(b.label);
          return aSize - bSize;
        }),

      chipsets: Array.from(chipsets.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),
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

      {/* Filtro de VRAM */}
      {filterOptions.vramSizes.length > 0 && (
        <FilterSection title="Memória (VRAM)">
          <CheckboxFilter
            options={filterOptions.vramSizes}
            selected={filters.vramSizes}
            onChange={onVramSizesChange}
          />
        </FilterSection>
      )}

      {/* Filtro de Chipset */}
      {filterOptions.chipsets.length > 0 && (
        <FilterSection title="Chipset">
          <CheckboxFilter
            options={filterOptions.chipsets}
            selected={filters.chipsets}
            onChange={onChipsetsChange}
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