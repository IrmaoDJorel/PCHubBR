"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ProductCounts = {
  total: number;
  cpu: number;
  gpu: number;
  motherboard: number;
};

// Lista de categorias disponíveis
const categories = [
  { label: "Todas as Peças", href: "/", key: "total" },
  { label: "CPUs", href: "/cpu", key: "cpu" },
  { label: "GPUs", href: "/gpu", key: "gpu" },
  { label: "Placas-Mãe", href: "/motherboard", key: "motherboard" },
] as const;

/**
 * Componente CategoryNav
 * 
 * Barra de navegação horizontal com categorias de produtos
 * Exibe contadores de produtos por categoria
 * Destaca visualmente a categoria ativa (página atual)
 * Responsiva: scroll horizontal no mobile
 */
export function CategoryNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<ProductCounts | null>(null);

  // Busca contadores de produtos ao montar o componente
  useEffect(() => {
    fetch("/api/products/count")
      .then((r) => r.json())
      .then(setCounts)
      .catch((err) => console.error("Erro ao buscar contadores:", err));
  }, []);

  return (
    <nav
      className="border-b bg-background"
      aria-label="Categorias de produtos"
    >
      <div className="mx-auto max-w-5xl px-4">
        {/* Container com scroll horizontal no mobile */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto py-2">
          {categories.map((category) => {
            // Verifica se é a categoria ativa
            const isActive =
              pathname === category.href ||
              (category.href !== "/" && pathname.startsWith(category.href));

            // Pega o contador específico da categoria
            const count = counts?.[category.key as keyof ProductCounts];

            return (
              <Link
                key={category.href}
                href={category.href}
                className={cn(
                  // Estilos base
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  // Estado ativo: fundo primary, texto branco
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : // Estado inativo: hover com fundo accent
                      "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{category.label}</span>
                {/* Contador (badge) */}
                {count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}