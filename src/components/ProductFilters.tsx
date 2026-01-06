import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useCategories } from '@/contexts/CategoryContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProductFiltersProps {
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
}

const PRICE_RANGES = [
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
  { label: 'R$ 500 - R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 - R$ 2.500', min: 1000, max: 2500 },
  { label: 'R$ 2.500 - R$ 5.000', min: 2500, max: 5000 },
  { label: 'Acima de R$ 5.000', min: 5000, max: null },
];

export function ProductFilters({
  minPrice,
  maxPrice,
  onPriceChange,
  sortOrder,
  onSortChange,
  selectedCategories,
  onCategoriesChange,
  searchQuery,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
}: ProductFiltersProps) {
  const { categories } = useCategories();
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isStockOpen, setIsStockOpen] = useState(true);

  const parentCategories = [...categories.filter(c => !c.parent_id)].sort((a, b) => a.order_index - b.order_index);
  const hasActiveFilters = minPrice !== null || maxPrice !== null || selectedCategories.length > 0 || searchQuery || stockFilter !== 'all';
  const activeFiltersCount = (minPrice !== null || maxPrice !== null ? 1 : 0) + selectedCategories.length + (stockFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleRangeClick = (min: number, max: number | null) => {
    onPriceChange(min, max);
  };

  const handleCustomFilter = () => {
    const min = customMin ? parseFloat(customMin) : null;
    const max = customMax ? parseFloat(customMax) : null;
    onPriceChange(min, max);
  };

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      onCategoriesChange(selectedCategories.filter(c => c !== slug));
    } else {
      onCategoriesChange([...selectedCategories, slug]);
    }
  };

  const clearAllFilters = () => {
    onPriceChange(null, null);
    onCategoriesChange([]);
    onSearchChange('');
    onStockFilterChange('all');
    setCustomMin('');
    setCustomMax('');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search within results */}
      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">Buscar</Label>
        <input
          type="text"
          placeholder="Filtrar produtos..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sort Order */}
      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">Ordenar por</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSortChange('asc')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              sortOrder === 'asc' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            Menor Preço
          </button>
          <button
            onClick={() => onSortChange('desc')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              sortOrder === 'desc' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            Maior Preço
          </button>
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Faixa de Preço
          {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isPriceOpen && (
          <div className="space-y-2">
            {PRICE_RANGES.map((range, index) => (
              <button
                key={index}
                onClick={() => handleRangeClick(range.min, range.max)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  minPrice === range.min && maxPrice === range.max
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-muted text-secondary-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-border mt-3">
              <p className="text-xs text-muted-foreground mb-2">Valor personalizado</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMin}
                  onChange={e => setCustomMin(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={customMax}
                  onChange={e => setCustomMax(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm"
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleCustomFilter}>
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Categorias
          {isCategoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isCategoryOpen && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {parentCategories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.slug}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={() => toggleCategory(category.slug)}
                />
                <Label htmlFor={category.slug} className="text-sm cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Filter */}
      <div>
        <button
          onClick={() => setIsStockOpen(!isStockOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Disponibilidade
          {isStockOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isStockOpen && (
          <div className="space-y-2">
            <button
              onClick={() => onStockFilterChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                stockFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-muted text-secondary-foreground'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => onStockFilterChange('in-stock')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                stockFilter === 'in-stock'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-muted text-secondary-foreground'
              }`}
            >
              Em estoque
            </button>
            <button
              onClick={() => onStockFilterChange('out-of-stock')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                stockFilter === 'out-of-stock'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-muted text-secondary-foreground'
              }`}
            >
              Sem estoque
            </button>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpar todos os filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Filtros
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
