"use client";

import { useEffect, useState } from "react";

type ProductCounts = {
  cpu: number;
  gpu: number;
  motherboard: number;
  total: number;
};

/**
 * Hook para buscar contadores de produtos por categoria
 * Faz cache local para evitar múltiplas requisições
 */
export function useProductCounts() {
  const [counts, setCounts] = useState<ProductCounts>({
    cpu: 0,
    gpu: 0,
    motherboard: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já tem cache (sessionStorage)
    const cached = sessionStorage.getItem("productCounts");
    const cacheTime = sessionStorage.getItem("productCountsTime");

    // Cache válido por 5 minutos
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime, 10);
      if (age < 5 * 60 * 1000) {
        setCounts(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    // Busca contadores
    fetch("/api/products/counts")
      .then((r) => r.json())
      .then((data) => {
        const newCounts = {
          cpu: data.cpu || 0,
          gpu: data.gpu || 0,
          motherboard: data.motherboard || 0,
          total: data.total || 0,
        };
        setCounts(newCounts);
        
        // Salva no cache
        sessionStorage.setItem("productCounts", JSON.stringify(newCounts));
        sessionStorage.setItem("productCountsTime", Date.now().toString());
      })
      .catch(() => {
        // Em caso de erro, mantém zeros
        setCounts({ cpu: 0, gpu: 0, motherboard: 0, total: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  return { counts, loading };
}