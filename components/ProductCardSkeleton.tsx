import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductCardSkeleton
 * 
 * Placeholder visual exibido enquanto produtos estão carregando
 * Melhora percepção de performance (usuário sabe que algo está acontecendo)
 * 
 * Estrutura idêntica ao ProductCard real para evitar "layout shift"
 */
export function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        {/* Título do produto */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Badges (marca, tipo, specs) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preço */}
        <Skeleton className="h-4 w-2/3" />
        
        {/* Número de ofertas */}
        <Skeleton className="h-4 w-1/3" />
        
        {/* Botão */}
        <Skeleton className="h-9 w-28" />
      </CardContent>
    </Card>
  );
}

/**
 * ProductCardSkeletonGrid
 * 
 * Helper para exibir múltiplos skeletons em grid
 * 
 * @example
 * {loading && <ProductCardSkeletonGrid count={6} />}
 */
export function ProductCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
}