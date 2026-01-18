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

type Cpu = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  cores: number;
  threads: number;
  bestPriceCents: number | null;
  bestStoreName: string | null;
  offerCount: number;
};

type SortKey = "name" | "priceAsc" | "priceDesc";

export default function Home() {
  const [cpus, setCpus] = useState<Cpu[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<"ALL" | "AMD" | "Intel">("ALL");
  const [sort, setSort] = useState<SortKey>("priceAsc");

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/cpus")
      .then((r) => r.json())
      .then(setCpus)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  fetch("/api/session")
    .then((r) => r.json())
    .then((d) => setLoggedIn(Boolean(d?.loggedIn)))
    .finally(() => setSessionLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = cpus.filter((c) => {
      const matchQuery = !q || c.name.toLowerCase().includes(q);
      const matchBrand = brand === "ALL" || c.brand === brand;
      return matchQuery && matchBrand;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);

      const ap = a.bestPriceCents ?? Number.POSITIVE_INFINITY;
      const bp = b.bestPriceCents ?? Number.POSITIVE_INFINITY;

      if (sort === "priceAsc") return ap - bp;
      return bp - ap;
    });

    return list;
  }, [cpus, query, brand, sort]);

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
          placeholder="Buscar CPU (ex.: 5600, 12400F...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          <Button variant={brand === "ALL" ? "default" : "outline"} onClick={() => setBrand("ALL")}>
            Todas
          </Button>
          <Button variant={brand === "AMD" ? "default" : "outline"} onClick={() => setBrand("AMD")}>
            AMD
          </Button>
          <Button
            variant={brand === "Intel" ? "default" : "outline"}
            onClick={() => setBrand("Intel")}
          >
            Intel
          </Button>

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
          filtered.map((c) => {
            const hasPrice = c.bestPriceCents !== null;

            return (
              <Card key={c.id} className="transition hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/cpu/${c.slug}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{c.brand}</Badge>
                    <Badge variant="outline">
                      {c.cores}c/{c.threads}t
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Melhor preço:</span>{" "}
                    <span className="font-semibold">
                      {hasPrice ? formatBRLFromCents(c.bestPriceCents!) : "Sem ofertas"}
                    </span>
                    {hasPrice ? (
                      <span className="text-muted-foreground"> ({c.bestStoreName ?? "loja"})</span>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground">{c.offerCount} oferta(s)</div>

                  <div>
                    <Button asChild size="sm">
                      <Link href={`/cpu/${c.slug}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground">Nenhuma CPU encontrada.</div>
        )}
      </div>
    </main>
  );
}