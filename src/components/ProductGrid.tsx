import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ChevronDown, Grid3X3, List, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'list' | 'compact';

interface ProductGridProps {
  products: Product[];
  title?: string;
  initialLimit?: number;
  loadMoreCount?: number;
  showViewToggle?: boolean;
  infiniteScroll?: boolean;
}

export function ProductGrid({ 
  products, 
  title, 
  initialLimit = 12,
  loadMoreCount = 12,
  showViewToggle = true,
  infiniteScroll = false
}: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + loadMoreCount, products.length));
      setIsLoading(false);
    }, 100);
  }, [hasMore, isLoading, loadMoreCount, products.length]);

  // Reset visible count when products change (e.g., when changing category)
  useEffect(() => {
    setVisibleCount(initialLimit);
  }, [products, initialLimit]);

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      { 
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [infiniteScroll, hasMore, isLoading, handleLoadMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Nenhum produto encontrado.
        </p>
      </div>
    );
  }

  const getGridClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col gap-3';
      case 'compact':
        return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3';
      case 'grid':
      default:
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6';
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h2>
        )}
        
        {showViewToggle && (
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="h-8 w-8 p-0"
              title="Grade compacta"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
              title="Grade grande"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
              title="Lista"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className={getGridClasses()}>
        {visibleProducts.map((product, index) => (
          <div 
            key={product.id}
          >
            <ProductCard
              product={product}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger for infinite scroll */}
      {infiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Carregando mais produtos...</span>
            </div>
          )}
        </div>
      )}

      {/* Manual load more button (when not using infinite scroll) */}
      {!infiniteScroll && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                Ver mais ({products.length - visibleCount} restantes)
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}