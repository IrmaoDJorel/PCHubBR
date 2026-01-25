"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type PriceRange = [number, number];

export type ProductFilters = {
  brands: string[];
  sockets: string[];
  cores: string[];
  vramSizes: string[];
  chipsets: string[];
  formFactors: string[];
  ramTypes: string[];
  priceRange: PriceRange;
};

type UseProductFiltersProps = {
  initialPriceRange: PriceRange;
};

/**
 * Hook para gerenciar filtros de produtos
 * Sincroniza estado com URL (query params)
 */
export function useProductFilters({ initialPriceRange }: UseProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado dos filtros
  const [filters, setFilters] = useState<ProductFilters>({
    brands: [],
    sockets: [],
    cores: [],
    vramSizes: [],
    chipsets: [],
    formFactors: [],
    ramTypes: [],
    priceRange: initialPriceRange,
  });

  // Carrega filtros da URL ao montar
  useEffect(() => {
    const newFilters: ProductFilters = {
      brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
      sockets: searchParams.get("sockets")?.split(",").filter(Boolean) || [],
      cores: searchParams.get("cores")?.split(",").filter(Boolean) || [],
      vramSizes: searchParams.get("vram")?.split(",").filter(Boolean) || [],
      chipsets: searchParams.get("chipsets")?.split(",").filter(Boolean) || [],
      formFactors: searchParams.get("formFactors")?.split(",").filter(Boolean) || [],
      ramTypes: searchParams.get("ramTypes")?.split(",").filter(Boolean) || [],
      priceRange: [
        parseInt(searchParams.get("minPrice") || String(initialPriceRange[0]), 10),
        parseInt(searchParams.get("maxPrice") || String(initialPriceRange[1]), 10),
      ],
    };

    setFilters(newFilters);
  }, [searchParams, initialPriceRange]);

  // Atualiza URL quando filtros mudam
  const updateURL = useCallback(
    (newFilters: ProductFilters) => {
      const params = new URLSearchParams();

      if (newFilters.brands.length) params.set("brands", newFilters.brands.join(","));
      if (newFilters.sockets.length) params.set("sockets", newFilters.sockets.join(","));
      if (newFilters.cores.length) params.set("cores", newFilters.cores.join(","));
      if (newFilters.vramSizes.length) params.set("vram", newFilters.vramSizes.join(","));
      if (newFilters.chipsets.length) params.set("chipsets", newFilters.chipsets.join(","));
      if (newFilters.formFactors.length) params.set("formFactors", newFilters.formFactors.join(","));
      if (newFilters.ramTypes.length) params.set("ramTypes", newFilters.ramTypes.join(","));

      if (newFilters.priceRange[0] !== initialPriceRange[0]) {
        params.set("minPrice", String(newFilters.priceRange[0]));
      }
      if (newFilters.priceRange[1] !== initialPriceRange[1]) {
        params.set("maxPrice", String(newFilters.priceRange[1]));
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, {
        scroll: false,
      });
    },
    [router, initialPriceRange]
  );

  // Setters individuais
  const setBrands = useCallback(
    (brands: string[]) => {
      const newFilters = { ...filters, brands };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setSockets = useCallback(
    (sockets: string[]) => {
      const newFilters = { ...filters, sockets };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setCores = useCallback(
    (cores: string[]) => {
      const newFilters = { ...filters, cores };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setVramSizes = useCallback(
    (vramSizes: string[]) => {
      const newFilters = { ...filters, vramSizes };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setChipsets = useCallback(
    (chipsets: string[]) => {
      const newFilters = { ...filters, chipsets };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setFormFactors = useCallback(
    (formFactors: string[]) => {
      const newFilters = { ...filters, formFactors };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setRamTypes = useCallback(
    (ramTypes: string[]) => {
      const newFilters = { ...filters, ramTypes };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setPriceRange = useCallback(
    (priceRange: PriceRange) => {
      const newFilters = { ...filters, priceRange };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    const resetFilters: ProductFilters = {
      brands: [],
      sockets: [],
      cores: [],
      vramSizes: [],
      chipsets: [],
      formFactors: [],
      ramTypes: [],
      priceRange: initialPriceRange,
    };
    setFilters(resetFilters);
    router.push(window.location.pathname);
  }, [router, initialPriceRange]);

  // Conta quantos filtros estão ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.brands.length;
    count += filters.sockets.length;
    count += filters.cores.length;
    count += filters.vramSizes.length;
    count += filters.chipsets.length;
    count += filters.formFactors.length;
    count += filters.ramTypes.length;

    if (
      filters.priceRange[0] !== initialPriceRange[0] ||
      filters.priceRange[1] !== initialPriceRange[1]
    ) {
      count += 1;
    }

    return count;
  }, [filters, initialPriceRange]);

  return {
    filters,
    setBrands,
    setSockets,
    setCores,
    setVramSizes,
    setChipsets,
    setFormFactors,
    setRamTypes,
    setPriceRange,
    clearFilters,
    activeFiltersCount,
  };
}