"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Lista de categorias disponíveis
const categories = [
  { label: "Todas as Peças", href: "/" },
  { label: "CPUs", href: "/cpu" },
  { label: "GPUs", href: "/gpu" },
  { label: "Placas-Mãe", href: "/motherboard" },
] as const;

/**
 * Componente CategoryNav
 * 
 * Barra de navegação horizontal com categorias de produtos
 * Destaca visualmente a categoria ativa (página atual)
 * Responsiva: scroll horizontal no mobile
 * 
 * Usa usePathname() do Next.js para detectar a rota atual
 */
export function CategoryNav() {
  const pathname = usePathname(); // Hook do Next.js 13+ (App Router)

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
            // "/" é exata, outras verificam se pathname começa com href
            const isActive =
              pathname === category.href ||
              (category.href !== "/" && pathname.startsWith(category.href));

            return (
              <Link
                key={category.href}
                href={category.href}
                className={cn(
                  // Estilos base
                  "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  // Estado ativo: fundo primary, texto branco
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : // Estado inativo: hover com fundo accent
                      "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {category.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}