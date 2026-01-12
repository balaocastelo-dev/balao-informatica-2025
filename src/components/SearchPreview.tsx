import { Product } from '@/types/product';
import { useNavigate } from 'react-router-dom';

interface SearchPreviewProps {
  results: Product[];
  visible: boolean;
  onSelect: (product?: Product) => void;
}

export function SearchPreview({ results, visible, onSelect }: SearchPreviewProps) {
  const navigate = useNavigate();

  if (!visible || results.length === 0) return null;

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/produto/${product.id}`);
    onSelect(product);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-h-[300px] overflow-y-auto">
        {results.map(product => (
          <div 
            key={product.id}
            className="flex items-center gap-3 p-3 hover:bg-secondary/80 cursor-pointer transition-colors border-b last:border-0 border-border group"
            onClick={(e) => handleProductClick(e, product)}
          >
            <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-border p-1 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-bold text-primary">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 p-2 text-center border-t border-border">
        <span className="text-xs text-muted-foreground">
          Pressione <kbd className="font-sans px-1 rounded bg-background border border-border">Enter</kbd> para ver todos
        </span>
      </div>
    </div>
  );
}
