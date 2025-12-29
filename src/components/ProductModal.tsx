import { useEffect } from 'react';
import { Product, CATEGORIES } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingCart, Package } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const categoryInfo = CATEGORIES.find(c => c.id === product.category);

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <span className="category-badge">
            {categoryInfo?.icon} {categoryInfo?.name}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="bg-white rounded-xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-contain p-4"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                {product.name}
              </h2>

              {product.description && (
                <p className="text-muted-foreground mb-6">
                  {product.description}
                </p>
              )}

              {/* Stock info */}
              {product.stock !== undefined && (
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">
                      {product.stock} unidades em estoque
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      Produto indisponível
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou 12x de {formatPrice(product.price / 12)} sem juros
                  </p>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
