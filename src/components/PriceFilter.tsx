import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

interface PriceFilterProps {
  minPrice: number | null;
  maxPrice: number | null;
  onFilterChange: (min: number | null, max: number | null) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

const PRICE_RANGES = [
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
  { label: 'R$ 500 - R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 - R$ 2.500', min: 1000, max: 2500 },
  { label: 'R$ 2.500 - R$ 5.000', min: 2500, max: 5000 },
  { label: 'Acima de R$ 5.000', min: 5000, max: null },
];

export function PriceFilter({ minPrice, maxPrice, onFilterChange, sortOrder, onSortChange }: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  const hasActiveFilter = minPrice !== null || maxPrice !== null;

  const handleRangeClick = (min: number, max: number | null) => {
    onFilterChange(min, max);
    setIsOpen(false);
  };

  const handleCustomFilter = () => {
    const min = customMin ? parseFloat(customMin) : null;
    const max = customMax ? parseFloat(customMax) : null;
    onFilterChange(min, max);
    setIsOpen(false);
  };

  const clearFilter = () => {
    onFilterChange(null, null);
    setCustomMin('');
    setCustomMax('');
  };

  const formatActiveFilter = () => {
    if (minPrice !== null && maxPrice !== null) {
      return `R$ ${minPrice.toLocaleString('pt-BR')} - R$ ${maxPrice.toLocaleString('pt-BR')}`;
    } else if (minPrice !== null) {
      return `Acima de R$ ${minPrice.toLocaleString('pt-BR')}`;
    } else if (maxPrice !== null) {
      return `Até R$ ${maxPrice.toLocaleString('pt-BR')}`;
    }
    return '';
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Sort Order */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => onSortChange('asc')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            sortOrder === 'asc' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Menor Preço
        </button>
        <button
          onClick={() => onSortChange('desc')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            sortOrder === 'desc' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Maior Preço
        </button>
      </div>

      {/* Price Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            hasActiveFilter 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-card text-foreground border-border hover:border-primary'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {hasActiveFilter ? formatActiveFilter() : 'Filtrar por preço'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[280px] animate-scale-in">
            <div className="p-4">
              <p className="text-sm font-medium text-foreground mb-3">Faixa de Preço</p>
              
              <div className="space-y-2 mb-4">
                {PRICE_RANGES.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleRangeClick(range.min, range.max)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      minPrice === range.min && maxPrice === range.max
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Valor personalizado</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customMin}
                    onChange={e => setCustomMin(e.target.value)}
                    className="input-field text-sm py-2 w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={customMax}
                    onChange={e => setCustomMax(e.target.value)}
                    className="input-field text-sm py-2 w-full"
                  />
                </div>
                <button
                  onClick={handleCustomFilter}
                  className="btn-primary w-full text-sm py-2"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filter Button */}
      {hasActiveFilter && (
        <button
          onClick={clearFilter}
          className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Limpar filtro
        </button>
      )}
    </div>
  );
}
