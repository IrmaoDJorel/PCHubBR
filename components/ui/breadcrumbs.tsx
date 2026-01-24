import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipo para cada item do breadcrumb
export type BreadcrumbItem = {
  label: string;      // Texto exibido
  href?: string;      // Link (opcional - último item geralmente não tem link)
};

// Props do componente
type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Componente Breadcrumbs
 * 
 * Exibe uma trilha de navegação (Home > CPUs > Produto X)
 * Melhora UX (usuário sabe onde está) e SEO (estrutura de navegação)
 * 
 * @example
 * <Breadcrumbs items={[
 *   { label: "Home", href: "/" },
 *   { label: "CPUs", href: "/cpu" },
 *   { label: "Ryzen 7 5800X" }
 * ]} />
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* Se tem href e não é o último, renderiza como link */}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              // Último item ou sem href = texto normal (página atual)
              <span
                className={cn(
                  isLast
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}

            {/* Separador (seta) - não exibe no último item */}
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}