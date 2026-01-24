import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Cpu, Monitor, Component } from "lucide-react";

type ProductType = "CPU" | "GPU" | "MOTHERBOARD";

const productConfig = {
  CPU: {
    icon: Cpu,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "Processador",
  },
  GPU: {
    icon: Monitor,
    color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    label: "Placa de Vídeo",
  },
  MOTHERBOARD: {
    icon: Component,
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    label: "Placa-Mãe",
  },
};

/**
 * Badge customizada para tipos de produtos
 * Mostra ícone + label com cores específicas por categoria
 */
export function ProductTypeBadge({ type }: { type: ProductType }) {
  const config = productConfig[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Badge de especificações (cores, socket, etc.)
 */
export function SpecBadge({
  children,
  variant = "outline",
}: {
  children: React.ReactNode;
  variant?: "outline" | "secondary";
}) {
  return (
    <Badge
      variant={variant}
      className="gap-1 font-mono text-xs"
    >
      {children}
    </Badge>
  );
}