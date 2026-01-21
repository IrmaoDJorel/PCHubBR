"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatBRLFromCents } from "@/lib/money";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
};

type SortKey = "name" | "priceAsc" | "priceDesc";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<"ALL" | "CPU" | "GPU" | "MOTHERBOARD">("ALL");
  const [brand, setBrand] = useState<"ALL" | "AMD" | "Intel" | "NVIDIA" | "Gigabyte" | "ASUS" | "MSI">("ALL");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const typeParam = type === "ALL" ? "" : `?type=${type}`;
    fetch(`/api/products${typeParam}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => setLoggedIn(Boolean(d?.loggedIn)))
      .finally(() => setSessionLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => {
      const matchQuery = !q || p.name.toLowerCase().includes(q);
      const matchType = type === "ALL" || p.type === type;
      const matchBrand = brand === "ALL" || p.brand === brand;
      return matchQuery && matchType && matchBrand;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);

      const ap = a.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;
      const bp = b.offers[0]?.priceCents ?? Number.POSITIVE_INFINITY;

      if (sort === "priceAsc") return ap - bp;
      return bp - ap;
    });

    return list;
  }, [products, query, type, brand, sort]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">PCHubBR</h1>
          <p className="text-sm text-muted-foreground">Comparador de preços (MVP)</p>
        </div>

        <div className="flex gap-2">
          {!sessionLoaded ? null : loggedIn ? (
            <Button asChild>
              <Link href="/profile">Minha conta</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar (ex.: 5600, RTX 4060...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          {/* Filtro de Tipo */}
          <Button variant={type === "ALL" ? "default" : "outline"} onClick={() => setType("ALL")}>
            Todos
          </Button>
          <Button variant={type === "CPU" ? "default" : "outline"} onClick={() => setType("CPU")}>
            CPUs
          </Button>
          <Button variant={type === "GPU" ? "default" : "outline"} onClick={() => setType("GPU")}>
            GPUs
          </Button>
          <Button variant={type === "MOTHERBOARD" ? "default" : "outline"} onClick={() => setType("MOTHERBOARD")}>
            Placas-Mãe
          </Button>

          {/* Filtro de Marca (expandido) */}
          <Button variant={brand === "ALL" ? "default" : "outline"} onClick={() => setBrand("ALL")}>
            Todas Marcas
          </Button>
          <Button variant={brand === "AMD" ? "default" : "outline"} onClick={() => setBrand("AMD")}>
            AMD
          </Button>
          <Button variant={brand === "Intel" ? "default" : "outline"} onClick={() => setBrand("Intel")}>
            Intel
          </Button>
          <Button variant={brand === "NVIDIA" ? "default" : "outline"} onClick={() => setBrand("NVIDIA")}>
            NVIDIA
          </Button>
          <Button variant={brand === "Gigabyte" ? "default" : "outline"} onClick={() => setBrand("Gigabyte")}>
            Gigabyte
          </Button>
          <Button variant={brand === "ASUS" ? "default" : "outline"} onClick={() => setBrand("ASUS")}>
            ASUS
          </Button>
          <Button variant={brand === "MSI" ? "default" : "outline"} onClick={() => setBrand("MSI")}>
            MSI
          </Button>

          {/* Ordenação */}
          <Button variant={sort === "priceAsc" ? "default" : "outline"} onClick={() => setSort("priceAsc")}>
            Menor preço
          </Button>
          <Button variant={sort === "priceDesc" ? "default" : "outline"} onClick={() => setSort("priceDesc")}>
            Maior preço
          </Button>
          <Button variant={sort === "name" ? "default" : "outline"} onClick={() => setSort("name")}>
            Nome
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length ? (
          filtered.map((p) => {
            const bestOffer = p.offers[0];
            const hasPrice = bestOffer !== undefined;

            return (
              <Card key={p.id} className="transition hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/products/${p.slug}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{p.brand}</Badge>
                    <Badge variant="outline">{p.type}</Badge>
                    {p.type === "CPU" && p.specsJson && (
                      <Badge variant="outline">
                        {p.specsJson.cores}c/{p.specsJson.threads}t
                      </Badge>
                    )}
                    {p.gpu && (
                      <Badge variant="outline">
                        {p.gpu.vramGb}GB {p.gpu.vramType}
                      </Badge>
                    )}
                    {p.motherboard && (
                      <Badge variant="outline">
                        {p.motherboard.chipset}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Melhor preço:</span>{" "}
                    <span className="font-semibold">
                      {hasPrice ? formatBRLFromCents(bestOffer.priceCents) : "Sem ofertas"}
                    </span>
                    {hasPrice ? (
                      <span className="text-muted-foreground"> ({bestOffer.store.name})</span>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground">{p.offers.length} oferta(s)</div>

                  <div>
                    <Button asChild size="sm">
                      <Link href={`/products/${p.slug}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground">Nenhum produto encontrado.</div>
        )}
      </div>
    </main>
  );
}