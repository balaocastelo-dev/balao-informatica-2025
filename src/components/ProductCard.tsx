import { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  viewMode?: 'grid' | 'list' | 'compact';
}

export function ProductCard({ product, onClick, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success('Produto adicionado ao carrinho!');
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/produto/${product.id}`);
    }
  };

  const ImageComponent = ({ className, containerClass }: { className: string; containerClass: string }) => (
    <div className={`product-image-container ${containerClass}`}>
      {/* Skeleton loader */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      )}
      <img
        src={product.image}
        alt={product.name}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        style={{
          imageRendering: 'auto',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
      />
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-xs">Sem imagem</span>
        </div>
      )}
    </div>
  );

  // List view layout
  if (viewMode === 'list') {
    return (
      <article 
        className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <ImageComponent 
          containerClass="w-20 h-20 flex-shrink-0 rounded overflow-hidden"
          className="w-full h-full object-contain p-1"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            12x de {formatPrice(product.price / 12)}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          <button
            onClick={handleAddToCart}
            className="btn-cart text-xs py-1 px-3 flex items-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            Comprar
          </button>
        </div>
      </article>
    );
  }

  // Compact grid view (smaller cards)
  if (viewMode === 'compact') {
    return (
      <article 
        className="product-card cursor-pointer group"
        onClick={handleClick}
      >
        <div className="relative aspect-square">
          <ImageComponent 
            containerClass="absolute inset-0"
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10">
              {product.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-secondary/80 text-foreground text-[10px] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="text-xs font-medium text-foreground line-clamp-2 min-h-[32px]">{product.name}</h3>
          {product.description && (
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="mt-2 space-y-1">
            <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
            <p className="text-[10px] text-muted-foreground">
              12x {formatPrice(product.price / 12)}
            </p>
          </div>
        </div>
      </article>
    );
  }

  // Default grid view
  return (
    <article 
      className="product-card cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative aspect-square">
        <ImageComponent 
          containerClass="absolute inset-0"
          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
        {/* Custom Badges */}
        {Array.isArray(product.tags) && product.tags.filter(t => t.startsWith('badge:')).map((tag, i) => (
          <span 
            key={`badge-${i}`} 
            className="absolute left-3 bg-[#E30613] text-white text-xs font-bold px-2 py-1 rounded z-10 shadow-md uppercase tracking-wide"
            style={{ top: `${12 + i * 32}px` }}
          >
            {tag.replace('badge:', '')}
          </span>
        ))}
        {Array.isArray(product.tags) && product.tags.filter(t => !t.startsWith('badge:')).length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1 z-10">
            {product.tags.filter(t => !t.startsWith('badge:')).slice(0, 3).map((tag, i) => (
              <span key={i} className="bg-secondary/80 text-foreground text-[11px] px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto pt-3 space-y-2">
          <p className="product-card-price">{formatPrice(product.price)}</p>
          
          <p className="text-xs text-muted-foreground">
            ou 12x de {formatPrice(product.price / 12)} sem juros
          </p>
          
          <button
            onClick={handleAddToCart}
            className="btn-cart w-full flex items-center justify-center gap-2 text-sm py-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
