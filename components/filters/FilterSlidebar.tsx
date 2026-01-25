"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type FilterSidebarProps = {
  children: React.ReactNode;
  activeFiltersCount: number;
  onClearFilters: () => void;
  isOpen?: boolean;
  onClose?: () => void;
};

/**
 * Sidebar de filtros responsiva
 * Desktop: Sidebar fixa à esquerda
 * Mobile: Overlay deslizante
 */
export function FilterSidebar({
  children,
  activeFiltersCount,
  onClearFilters,
  isOpen = true,
  onClose,
}: FilterSidebarProps) {
  return (
    <>
      {/* Overlay no mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background p-6 transition-transform md:sticky md:top-0 md:z-0 md:h-screen md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header do filtro */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Filtros</h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {activeFiltersCount} {activeFiltersCount === 1 ? "filtro ativo" : "filtros ativos"}
              </p>
            )}
          </div>

          {/* Botão fechar (só mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Botão limpar filtros */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mb-4 w-full"
          >
            Limpar filtros
          </Button>
        )}

        {/* Área de scroll com filtros */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">{children}</div>
        </ScrollArea>
      </aside>
    </>
  );
}