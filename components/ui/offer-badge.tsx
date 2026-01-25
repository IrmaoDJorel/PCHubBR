import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type OfferBadgeProps = {
  offerScore: number;
  size?: "sm" | "md" | "lg";
};

/**
 * Badge visual de desconto
 * Mostra percentual de economia com ícone de chama
 * 
 * Cores por faixa:
 * - 30%+: Vermelho (oferta quente)
 * - 20-29%: Laranja (boa oferta)
 * - 10-19%: Amarelo (oferta moderada)
 * - <10%: Sem badge (não vale destaque)
 */
export function OfferBadge({ offerScore, size = "md" }: OfferBadgeProps) {
  // Não mostra badge para descontos menores que 10%
  if (offerScore < 10) return null;

  // Define cor baseada no percentual
  const getBadgeColor = () => {
    if (offerScore >= 30) {
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 ring-red-500/20";
    }
    if (offerScore >= 20) {
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 ring-orange-500/20";
    }
    return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 ring-yellow-500/20";
  };

  // Define tamanho
  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-2.5 py-1",
    lg: "text-base gap-2 px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-bold ring-2",
        getBadgeColor(),
        sizeClasses[size]
      )}
    >
      <Flame className={cn("fill-current", iconSizes[size])} />
      -{offerScore.toFixed(0)}%
    </Badge>
  );
}

/**
 * Indicador de economia em reais
 */
export function SavingsIndicator({
  bestPrice,
  worstPrice,
}: {
  bestPrice: number;
  worstPrice: number;
}) {
  const savings = worstPrice - bestPrice;

  if (savings <= 0) return null;

  return (
    <span className="text-xs font-medium text-green-600 dark:text-green-400">
      Economize R$ {(savings / 100).toFixed(2)}
    </span>
  );
}