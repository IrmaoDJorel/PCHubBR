"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FilterToggleButtonProps = {
  activeFiltersCount: number;
  onClick: () => void;
};

/**
 * Botão para abrir filtros no mobile
 */
export function FilterToggleButton({
  activeFiltersCount,
  onClick,
}: FilterToggleButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="md:hidden"
    >
      <SlidersHorizontal className="mr-2 h-4 w-4" />
      Filtros
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
}