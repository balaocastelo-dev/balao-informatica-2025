import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface GPUFilterProps {
  onFilterChange: (filters: string[]) => void;
  activeFilters: string[];
}

const GPU_LINES = [
  { id: 'rx', label: 'AMD RX', keywords: ['rx ', 'radeon rx'] },
  { id: 'rtx', label: 'NVIDIA RTX', keywords: ['rtx ', 'geforce rtx'] },
  { id: 'gtx', label: 'NVIDIA GTX', keywords: ['gtx ', 'geforce gtx'] },
];

const GPU_SERIES = [
  { id: '40', label: 'Série 40', keywords: ['4060', '4070', '4080', '4090'] },
  { id: '50', label: 'Série 50', keywords: ['5060', '5070', '5080', '5090'] },
  { id: '60', label: 'Série 60', keywords: ['3060', '2060', '1060', '6600', '7600'] },
  { id: '70', label: 'Série 70', keywords: ['3070', '2070', '1070', '6700', '7700'] },
  { id: '80', label: 'Série 80', keywords: ['3080', '2080', '1080', '6800', '7800'] },
  { id: '90', label: 'Série 90', keywords: ['3090', '2090', '6900', '7900'] },
];

export function GPUFilter({ onFilterChange, activeFilters }: GPUFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      onFilterChange(activeFilters.filter(f => f !== filterId));
    } else {
      onFilterChange([...activeFilters, filterId]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <span className="font-medium">Filtrar GPU</span>
        {activeFilters.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {activeFilters.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-4 z-50 min-w-[280px] animate-scale-in">
          {/* GPU Lines */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Linha</h4>
            <div className="flex flex-wrap gap-2">
              {GPU_LINES.map(line => (
                <button
                  key={line.id}
                  onClick={() => toggleFilter(line.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFilters.includes(line.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {line.label}
                </button>
              ))}
            </div>
          </div>

          {/* GPU Series */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Série</h4>
            <div className="flex flex-wrap gap-2">
              {GPU_SERIES.map(series => (
                <button
                  key={series.id}
                  onClick={() => toggleFilter(series.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFilters.includes(series.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {series.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to filter products by GPU filters
export function filterProductsByGPU(products: any[], filters: string[]) {
  if (filters.length === 0) return products;

  const allFilters = [...GPU_LINES, ...GPU_SERIES];
  
  return products.filter(product => {
    const nameLower = product.name.toLowerCase();
    
    return filters.some(filterId => {
      const filterConfig = allFilters.find(f => f.id === filterId);
      if (!filterConfig) return false;
      
      return filterConfig.keywords.some(keyword => 
        nameLower.includes(keyword.toLowerCase())
      );
    });
  });
}
