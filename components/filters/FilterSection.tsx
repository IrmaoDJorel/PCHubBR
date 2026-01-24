"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

/**
 * Seção de filtro colapsável
 * Base para todos os tipos de filtros (checkbox, range, etc.)
 */
export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left font-medium transition-colors hover:text-primary"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}