import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Product } from '@/types/product';

interface ExtractedAttribute {
  key: string;
  label: string;
  values: { value: string; count: number }[];
}

interface DynamicFiltersProps {
  products: Product[];
  categorySlug?: string;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
}

// Attribute extraction patterns based on category
const ATTRIBUTE_PATTERNS: Record<string, { key: string; label: string; patterns: RegExp[]; extract?: (match: RegExpMatchArray) => string }[]> = {
  // Processadores
  'processadores': [
    { key: 'brand', label: 'Marca', patterns: [/\b(AMD|Intel)\b/i] },
    { key: 'socket', label: 'Socket', patterns: [/\b(AM4|AM5|LGA\s*1700|LGA\s*1200|LGA\s*1151)\b/i] },
    { key: 'series', label: 'Série', patterns: [/\b(Ryzen\s*[3579]|Core\s*i[3579])\b/i] },
    { key: 'cores', label: 'Núcleos', patterns: [/\b(\d+)\s*(?:cores?|núcleos?)\b/i], extract: (m) => `${m[1]} cores` },
  ],
  // Placas-mãe
  'placas-mae': [
    { key: 'brand', label: 'Marca', patterns: [/\b(ASUS|Gigabyte|MSI|ASRock|Biostar)\b/i] },
    { key: 'socket', label: 'Socket', patterns: [/\b(AM4|AM5|LGA\s*1700|LGA\s*1200|LGA\s*1151)\b/i] },
    { key: 'chipset', label: 'Chipset', patterns: [/\b(B[45][56]0|X[56][79]0|A[56]20|Z[67][89]0|H[56][17]0)\b/i] },
    { key: 'memory', label: 'Memória', patterns: [/\b(DDR4|DDR5)\b/i] },
    { key: 'formfactor', label: 'Form Factor', patterns: [/\b(ATX|Micro-?ATX|mATX|Mini-?ITX|E-?ATX)\b/i] },
  ],
  // Memória RAM
  'memoria-ram': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Kingston|Corsair|G\.?Skill|Crucial|HyperX|XPG|Patriot)\b/i] },
    { key: 'type', label: 'Tipo', patterns: [/\b(DDR4|DDR5)\b/i] },
    { key: 'capacity', label: 'Capacidade', patterns: [/\b(\d+)\s*GB\b/i], extract: (m) => `${m[1]}GB` },
    { key: 'speed', label: 'Velocidade', patterns: [/\b(\d{4})\s*MHz\b/i], extract: (m) => `${m[1]}MHz` },
    { key: 'kit', label: 'Kit', patterns: [/\b(2x\d+|4x\d+)\s*GB\b/i] },
  ],
  // SSD/HD
  'ssd-hd': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Samsung|Kingston|WD|Western\s*Digital|Seagate|Crucial|Sandisk|XPG)\b/i] },
    { key: 'type', label: 'Tipo', patterns: [/\b(SSD|HD|HDD|NVMe|SATA|M\.?2)\b/i] },
    { key: 'capacity', label: 'Capacidade', patterns: [/\b(\d+)\s*(TB|GB)\b/i], extract: (m) => `${m[1]}${m[2].toUpperCase()}` },
    { key: 'interface', label: 'Interface', patterns: [/\b(NVMe|SATA\s*III?|PCIe\s*[34]\.0)\b/i] },
  ],
  // Placas de vídeo
  'placa-de-video': [
    { key: 'brand', label: 'Fabricante', patterns: [/\b(ASUS|Gigabyte|MSI|EVGA|Zotac|Galax|PNY|XFX|Sapphire|PowerColor)\b/i] },
    { key: 'gpu', label: 'GPU', patterns: [/\b(RTX\s*\d{4}|GTX\s*\d{4}|RX\s*\d{4})\s*(Ti|Super|XT|XTX)?/i] },
    { key: 'vram', label: 'VRAM', patterns: [/\b(\d+)\s*GB\b/i], extract: (m) => `${m[1]}GB` },
    { key: 'line', label: 'Linha', patterns: [/\b(RTX|GTX|RX)\b/i] },
  ],
  // Coolers
  'coolers': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Cooler\s*Master|Noctua|Corsair|DeepCool|be\s*quiet!?|Arctic|NZXT|Thermaltake)\b/i] },
    { key: 'type', label: 'Tipo', patterns: [/\b(Air|Water|AIO|Torre|Tower)\b/i] },
    { key: 'size', label: 'Tamanho', patterns: [/\b(\d{2,3})\s*mm\b/i], extract: (m) => `${m[1]}mm` },
    { key: 'socket', label: 'Socket', patterns: [/\b(AM4|AM5|LGA\s*1700|LGA\s*1200|Intel|AMD)\b/i] },
  ],
  // Fontes
  'fontes': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Corsair|EVGA|Seasonic|Cooler\s*Master|Thermaltake|XPG|Gigabyte|be\s*quiet!?|NZXT)\b/i] },
    { key: 'wattage', label: 'Potência', patterns: [/\b(\d{3,4})\s*W\b/i], extract: (m) => `${m[1]}W` },
    { key: 'certification', label: 'Certificação', patterns: [/\b80\s*Plus\s*(Bronze|Silver|Gold|Platinum|Titanium)?\b/i] },
    { key: 'modular', label: 'Modular', patterns: [/\b(Full\s*Modular|Semi\s*Modular|Modular|Não\s*Modular)\b/i] },
  ],
  // Gabinetes
  'gabinetes': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Corsair|NZXT|Cooler\s*Master|Thermaltake|Lian\s*Li|Fractal|Phanteks|be\s*quiet!?)\b/i] },
    { key: 'size', label: 'Tamanho', patterns: [/\b(Full\s*Tower|Mid\s*Tower|Mini\s*Tower|Mini-?ITX|Micro-?ATX)\b/i] },
    { key: 'color', label: 'Cor', patterns: [/\b(Preto|Branco|Black|White|RGB)\b/i] },
  ],
  // Monitores
  'monitores': [
    { key: 'brand', label: 'Marca', patterns: [/\b(LG|Samsung|Dell|ASUS|Acer|AOC|BenQ|Philips|ViewSonic)\b/i] },
    { key: 'size', label: 'Tamanho', patterns: [/\b(\d{2})["\']?\s*(?:pol|inch|polegadas)?\b/i], extract: (m) => `${m[1]}"` },
    { key: 'resolution', label: 'Resolução', patterns: [/\b(Full\s*HD|1080p|2K|QHD|1440p|4K|UHD|2160p)\b/i] },
    { key: 'refresh', label: 'Taxa de Atualização', patterns: [/\b(\d{2,3})\s*Hz\b/i], extract: (m) => `${m[1]}Hz` },
    { key: 'panel', label: 'Painel', patterns: [/\b(IPS|VA|TN|OLED)\b/i] },
  ],
  // Notebooks
  'notebooks': [
    { key: 'brand', label: 'Marca', patterns: [/\b(Dell|HP|Lenovo|ASUS|Acer|Samsung|Apple|MSI)\b/i] },
    { key: 'processor', label: 'Processador', patterns: [/\b(Core\s*i[3579]|Ryzen\s*[3579]|M[123])\b/i] },
    { key: 'ram', label: 'RAM', patterns: [/\b(\d+)\s*GB\s*(?:RAM)?\b/i], extract: (m) => `${m[1]}GB RAM` },
    { key: 'storage', label: 'Armazenamento', patterns: [/\b(\d+)\s*(GB|TB)\s*(?:SSD|HD)?\b/i], extract: (m) => `${m[1]}${m[2]}` },
    { key: 'screen', label: 'Tela', patterns: [/\b(\d{2}(?:\.\d)?)["\']?\b/i], extract: (m) => `${m[1]}"` },
  ],
  // Licenças
  'licencas': [
    { key: 'software', label: 'Software', patterns: [/\b(Windows|Office|Microsoft\s*365|Antivirus|Adobe)\b/i] },
    { key: 'version', label: 'Versão', patterns: [/\b(Home|Pro|Professional|Enterprise|365)\b/i] },
  ],
  // Default for other categories
  'default': [
    { key: 'brand', label: 'Marca', patterns: [/\b(ASUS|Gigabyte|MSI|Corsair|Kingston|Samsung|LG|Dell|HP|Lenovo|Acer|Intel|AMD)\b/i] },
  ],
};

const PRICE_RANGES = [
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
  { label: 'R$ 500 - R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 - R$ 2.500', min: 1000, max: 2500 },
  { label: 'R$ 2.500 - R$ 5.000', min: 2500, max: 5000 },
  { label: 'Acima de R$ 5.000', min: 5000, max: null },
];

function extractAttributes(products: Product[], categorySlug?: string): ExtractedAttribute[] {
  const patterns = ATTRIBUTE_PATTERNS[categorySlug || ''] || ATTRIBUTE_PATTERNS['default'];
  const attributeMap: Record<string, Map<string, number>> = {};

  patterns.forEach(({ key }) => {
    attributeMap[key] = new Map();
  });

  products.forEach(product => {
    const text = `${product.name} ${product.description || ''}`;
  });

  products.forEach(product => {
    const text = `${product.name} ${product.description || ''}`;
    
    patterns.forEach(({ key, patterns: regexPatterns, extract }) => {
      for (const pattern of regexPatterns) {
        const match = text.match(pattern);
        if (match) {
          const value = extract ? extract(match) : match[0].trim();
          const normalizedValue = value.toUpperCase().replace(/\s+/g, ' ');
          const currentCount = attributeMap[key].get(normalizedValue) || 0;
          attributeMap[key].set(normalizedValue, currentCount + 1);
          break;
        }
      }
    });
  });

  return patterns
    .map(({ key, label }) => ({
      key,
      label,
      values: Array.from(attributeMap[key].entries())
        .map(([value, count]) => ({ value, count }))
        .filter(({ count }) => count > 0)
        .sort((a, b) => b.count - a.count),
    }))
    .filter(attr => attr.values.length > 1); // Only show attributes with multiple options
}

export function DynamicFilters({
  products,
  categorySlug,
  minPrice,
  maxPrice,
  onPriceChange,
  sortOrder,
  onSortChange,
  selectedFilters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
}: DynamicFiltersProps) {
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    stock: true,
  });

  // Extract dynamic attributes from products
  const extractedAttributes = useMemo(
    () => extractAttributes(products, categorySlug),
    [products, categorySlug]
  );

  // Initialize open sections for extracted attributes
  useMemo(() => {
    extractedAttributes.forEach(attr => {
      if (openSections[attr.key] === undefined) {
        setOpenSections(prev => ({ ...prev, [attr.key]: true }));
      }
    });
  }, [extractedAttributes]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFilter = (attrKey: string, value: string) => {
    const current = selectedFilters[attrKey] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFiltersChange({
      ...selectedFilters,
      [attrKey]: updated,
    });
  };

  const handleRangeClick = (min: number, max: number | null) => {
    onPriceChange(min, max);
  };

  const handleCustomFilter = () => {
    const min = customMin ? parseFloat(customMin) : null;
    const max = customMax ? parseFloat(customMax) : null;
    onPriceChange(min, max);
  };

  const clearAllFilters = () => {
    onPriceChange(null, null);
    onFiltersChange({});
    onSearchChange('');
    onStockFilterChange('all');
    setCustomMin('');
    setCustomMax('');
  };

  const hasActiveFilters = minPrice !== null || maxPrice !== null || 
    Object.values(selectedFilters).some(arr => arr.length > 0) || 
    searchQuery || stockFilter !== 'all';

  const activeFiltersCount = (minPrice !== null || maxPrice !== null ? 1 : 0) + 
    Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0) + 
    (stockFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
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
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Faixa de Preço
          {openSections['price'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections['price'] && (
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

      {/* Dynamic Attribute Filters */}
      {extractedAttributes.map(attr => (
        <div key={attr.key}>
          <button
            onClick={() => toggleSection(attr.key)}
            className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
          >
            {attr.label}
            {openSections[attr.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections[attr.key] && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {attr.values.map(({ value, count }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${attr.key}-${value}`}
                    checked={(selectedFilters[attr.key] || []).includes(value)}
                    onCheckedChange={() => toggleFilter(attr.key, value)}
                  />
                  <Label 
                    htmlFor={`${attr.key}-${value}`} 
                    className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                  >
                    <span>{value}</span>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {count}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Stock Filter */}
      <div>
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Disponibilidade
          {openSections['stock'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections['stock'] && (
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
        <div className="sticky top-24 bg-card border border-border rounded-xl p-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
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
      <div className="lg:hidden mb-4">
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
          <SheetContent side="left" className="w-[300px] overflow-y-auto bg-background">
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

// Helper function to filter products by dynamic filters
export function filterProductsByAttributes(
  products: Product[],
  selectedFilters: Record<string, string[]>,
  categorySlug?: string
): Product[] {
  const activeFilters = Object.entries(selectedFilters).filter(([_, values]) => values.length > 0);
  
  if (activeFilters.length === 0) return products;

  const patterns = ATTRIBUTE_PATTERNS[categorySlug || ''] || ATTRIBUTE_PATTERNS['default'];

  return products.filter(product => {
    const text = `${product.name} ${product.description || ''}`;
    
    return activeFilters.every(([attrKey, selectedValues]) => {
      const attrPattern = patterns.find(p => p.key === attrKey);
      if (!attrPattern) return true;

      for (const pattern of attrPattern.patterns) {
        const match = text.match(pattern);
        if (match) {
          const value = attrPattern.extract ? attrPattern.extract(match) : match[0].trim();
          const normalizedValue = value.toUpperCase().replace(/\s+/g, ' ');
          if (selectedValues.includes(normalizedValue)) {
            return true;
          }
        }
      }
      return false;
    });
  });
}
