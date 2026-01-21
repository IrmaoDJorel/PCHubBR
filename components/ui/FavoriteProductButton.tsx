"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function FavoriteProductButton({ productType, productSlug }: { productType: string; productSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [fav, setFav] = useState<boolean | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) {
        setFav(null); // não autenticado ou erro
        return;
      }
      const data = await res.json();
      const isFav = Array.isArray(data) && data.some((x) => x?.itemType === productType && x?.slug === productSlug);
      setFav(isFav);
    } catch {
      setFav(null);
    }
  }

  async function toggle() {
    setLoading(true);
    try {
      const method = fav ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: productType, productSlug }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      await refresh();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Se não conseguiu determinar (ex.: não logado), ainda deixa o CTA
  const label = fav ? "Remover dos favoritos" : "Favoritar";

  return (
    <Button variant={fav ? "outline" : "default"} onClick={toggle} disabled={loading}>
      {loading ? "Aguarde..." : label}
    </Button>
  );
}