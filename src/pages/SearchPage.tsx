import { useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { ProductGrid } from '@/components/ProductGrid';
import { DynamicFilters, filterProductsByAttributes } from '@/components/DynamicFilters';
import { useProducts } from '@/contexts/ProductContext';
import { Search, Loader2 } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoriesParam = searchParams.get('categories');
  const { searchProducts, loading, products } = useProducts();

  // Filter states
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Get raw search results
  const rawResults = useMemo(() => {
    if (loading || !products.length) return [];
    
    let filtered = searchProducts(query);
    
    // Filter by categories if specified
    if (categoriesParam) {
      const allowedCategories = categoriesParam.toLowerCase().split(',').map(c => c.trim());
      filtered = filtered.filter(product => {
        const productCategory = product.category.toLowerCase();
        return allowedCategories.some(cat => productCategory.includes(cat));
      });
    }
    
    return filtered;
  }, [query, categoriesParam, searchProducts, loading, products]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    let filtered = [...rawResults];

    // Apply dynamic attribute filters
    filtered = filterProductsByAttributes(filtered, selectedFilters);

    // Apply filter search query
    if (filterSearchQuery.trim()) {
      const q = filterSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Apply stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(p => (p.stock ?? 0) > 0);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(p => (p.stock ?? 0) === 0);
    }

    // Apply price filter
    if (minPrice !== null) {
      filtered = filtered.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    // Sort by price
    filtered.sort((a, b) => 
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

    return filtered;
  }, [rawResults, minPrice, maxPrice, sortOrder, selectedFilters, filterSearchQuery, stockFilter]);

  const handlePriceChange = (min: number | null, max: number | null) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <Layout>
      <div className="container-balao py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-muted-foreground" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Resultados para "{query}"
            </h1>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Buscando produtos...</span>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {filteredResults.length} {filteredResults.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              {rawResults.length !== filteredResults.length && (
                <span className="text-xs ml-2">(de {rawResults.length} resultados)</span>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <DynamicFilters
              products={rawResults}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              searchQuery={filterSearchQuery}
              onSearchChange={setFilterSearchQuery}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
            />

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={filteredResults} infiniteScroll />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;