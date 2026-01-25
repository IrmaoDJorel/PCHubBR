"use client";

import { useMemo } from "react";
import { FilterSection } from "@/components/filters/FilterSection";
import { CheckboxFilter } from "@/components/filters/CheckboxFilter";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import type { ProductFilters, PriceRange } from "@/lib/hooks/useProductFilters";

type MotherboardProduct = {
  brand: string;
  motherboard?: {
    socket?: string;
    chipset?: string;
    formFactor?: string;
    ramType?: string;
  };
  bestPriceCents?: number | null;
};

type MotherboardFiltersProps = {
  products: MotherboardProduct[];
  filters: ProductFilters;
  onBrandsChange: (brands: string[]) => void;
  onSocketsChange: (sockets: string[]) => void;
  onChipsetsChange: (chipsets: string[]) => void;
  onFormFactorsChange: (formFactors: string[]) => void;
  onRamTypesChange: (ramTypes: string[]) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  priceRange: PriceRange;
};

/**
 * Componente de filtros específicos para Placas-Mãe
 */
export function MotherboardFilters({
  products,
  filters,
  onBrandsChange,
  onSocketsChange,
  onChipsetsChange,
  onFormFactorsChange,
  onRamTypesChange,
  onPriceRangeChange,
  priceRange,
}: MotherboardFiltersProps) {
  // Extrai opções únicas dos produtos
  const filterOptions = useMemo(() => {
    const brands = new Map<string, number>();
    const sockets = new Map<string, number>();
    const chipsets = new Map<string, number>();
    const formFactors = new Map<string, number>();
    const ramTypes = new Map<string, number>();

    products.forEach((p) => {
      // Marcas
      brands.set(p.brand, (brands.get(p.brand) || 0) + 1);

      // Sockets
      if (p.motherboard?.socket) {
        sockets.set(p.motherboard.socket, (sockets.get(p.motherboard.socket) || 0) + 1);
      }

      // Chipsets
      if (p.motherboard?.chipset) {
        chipsets.set(p.motherboard.chipset, (chipsets.get(p.motherboard.chipset) || 0) + 1);
      }

      // Form Factors
      if (p.motherboard?.formFactor) {
        formFactors.set(p.motherboard.formFactor, (formFactors.get(p.motherboard.formFactor) || 0) + 1);
      }

      // RAM Types
      if (p.motherboard?.ramType) {
        ramTypes.set(p.motherboard.ramType, (ramTypes.get(p.motherboard.ramType) || 0) + 1);
      }
    });

    return {
      brands: Array.from(brands.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      sockets: Array.from(sockets.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      chipsets: Array.from(chipsets.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      formFactors: Array.from(formFactors.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => {
          // Ordena por tamanho: ATX > Micro-ATX > Mini-ITX
          const order = ["ATX", "Micro-ATX", "Mini-ITX"];
          return order.indexOf(a.label) - order.indexOf(b.label);
        }),

      ramTypes: Array.from(ramTypes.entries())
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

      {/* Filtro de Form Factor */}
      {filterOptions.formFactors.length > 0 && (
        <FilterSection title="Tamanho (Form Factor)">
          <CheckboxFilter
            options={filterOptions.formFactors}
            selected={filters.formFactors}
            onChange={onFormFactorsChange}
          />
        </FilterSection>
      )}

      {/* Filtro de Tipo de RAM */}
      {filterOptions.ramTypes.length > 0 && (
        <FilterSection title="Tipo de RAM">
          <CheckboxFilter
            options={filterOptions.ramTypes}
            selected={filters.ramTypes}
            onChange={onRamTypesChange}
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