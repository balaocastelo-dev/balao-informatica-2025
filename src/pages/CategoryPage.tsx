import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductGrid } from '@/components/ProductGrid';
import { DynamicFilters, filterProductsByAttributes } from '@/components/DynamicFilters';
import { SEOHead, BreadcrumbSchema } from '@/components/SEOHead';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories } from '@/contexts/CategoryContext';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { products, loading } = useProducts();
  const { categories } = useCategories();

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const category = categories.find(c => c.slug === categoryId);
  const isAllProducts = categoryId === 'todos';
  
  // Get all subcategory slugs for a parent category
  const getSubcategorySlugs = (parentSlug: string): string[] => {
    const parentCategory = categories.find(c => c.slug === parentSlug);
    if (!parentCategory) return [parentSlug];
    
    const subcategories = categories.filter(c => c.parent_id === parentCategory.id);
    if (subcategories.length === 0) return [parentSlug];
    
    // Return parent slug + all subcategory slugs
    return [parentSlug, ...subcategories.map(c => c.slug)];
  };

  // Get all subcategory names for a parent category (to support legacy/broken data)
  const getSubcategoryNames = (parentSlug: string): string[] => {
    const parentCategory = categories.find(c => c.slug === parentSlug);
    if (!parentCategory) return [];
    
    const subcategories = categories.filter(c => c.parent_id === parentCategory.id);
    
    // Return parent name + all subcategory names
    return [parentCategory.name, ...subcategories.map(c => c.name)];
  };
  
  // If category is "todos", show all products, otherwise filter by category and subcategories
  const rawProducts = useMemo(() => {
    if (isAllProducts) {
      return [...products];
    }
    if (!categoryId) return [];
    
    const categorySlugs = getSubcategorySlugs(categoryId);
    const categoryNames = getSubcategoryNames(categoryId);
    
    return products.filter(p => 
      categorySlugs.includes(p.category) || 
      categoryNames.includes(p.category)
    );
  }, [products, categoryId, categories, isAllProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...rawProducts];

    // Apply dynamic attribute filters
    filtered = filterProductsByAttributes(filtered, selectedFilters, categoryId);

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
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
  }, [rawProducts, minPrice, maxPrice, sortOrder, selectedFilters, searchQuery, stockFilter, categoryId]);

  const handleFilterChange = (min: number | null, max: number | null) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  if (!isAllProducts && !category) {
    return (
      <Layout>
        <div className="container-balao py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Categoria não encontrada
          </h1>
        </div>
      </Layout>
    );
  }

  const pageTitle = isAllProducts ? 'Todos os Produtos' : category?.name || '';
  const categoryUrl = `https://www.balao.info/categoria/${categoryId}`;

  return (
    <Layout>
      <SEOHead 
        title={`${pageTitle} | Balão da Informática - Campinas`}
        description={`Compre ${pageTitle} na Balão da Informática em Campinas. ${filteredProducts.length} produtos com os melhores preços. Entrega rápida para Campinas e região!`}
        keywords={`${pageTitle}, ${pageTitle} campinas, comprar ${pageTitle}, balão da informática, loja de informática campinas`}
        url={categoryUrl}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.balao.info' },
        { name: pageTitle, url: categoryUrl }
      ]} />
      <div className="container-balao pt-0 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-2 sm:mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filters Sidebar */}
          <DynamicFilters
            products={rawProducts}
            categorySlug={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handleFilterChange}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Carregando produtos...</p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} infiniteScroll />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
