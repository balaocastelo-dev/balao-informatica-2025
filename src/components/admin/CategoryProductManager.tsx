import { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories, CategoryData } from '@/contexts/CategoryContext';
import { Product } from '@/types/product';
import { Search, Plus, X, ChevronRight, Package, FolderOpen, ArrowRight, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export function CategoryProductManager() {
  const { products, updateProduct, loading } = useProducts();
  const { categories } = useCategories();
  
  const [searchCategory, setSearchCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveCategorySearch, setMoveCategorySearch] = useState('');

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchCategory.trim()) return categories;
    const query = searchCategory.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.slug.toLowerCase().includes(query)
    );
  }, [categories, searchCategory]);

  // Get products in selected category
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];

    // "todos" shows the entire catalog
    let filtered = selectedCategory.slug === 'todos'
      ? [...products]
      : products.filter(p => p.category === selectedCategory.slug);

    if (productSearch.trim()) {
      const query = productSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCategory, products, productSearch]);

  // Get products NOT in selected category (for adding)
  const availableProducts = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory.slug === 'todos') return [];

    let filtered = products.filter(p => p.category !== selectedCategory.slug);

    if (addProductSearch.trim()) {
      const query = addProductSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 50);
  }, [selectedCategory, products, addProductSearch]);

  // Filter categories for move modal
  const moveCategories = useMemo(() => {
    let filtered = categories.filter(c => c.id !== selectedCategory?.id);
    if (moveCategorySearch.trim()) {
      const query = moveCategorySearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.slug.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [categories, selectedCategory, moveCategorySearch]);

  // Add product to category
  const handleAddProduct = (product: Product) => {
    if (!selectedCategory) return;
    
    updateProduct(product.id, { category: selectedCategory.slug });
    toast({ 
      title: 'Produto adicionado!',
      description: `"${product.name}" foi movido para ${selectedCategory.name}`
    });
  };

  // Remove product from category (move to "outros")
  const handleRemoveFromCategory = (product: Product) => {
    updateProduct(product.id, { category: 'outros' });
    toast({ 
      title: 'Produto removido da categoria',
      description: `"${product.name}" foi movido para "Outros"`
    });
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Select/deselect all products
  const toggleSelectAll = () => {
    if (selectedProducts.size === categoryProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(categoryProducts.map(p => p.id)));
    }
  };

  // Move selected products to another category
  const handleMoveProducts = async (targetCategory: CategoryData) => {
    const count = selectedProducts.size;
    
    for (const productId of selectedProducts) {
      await updateProduct(productId, { category: targetCategory.slug });
    }
    
    setSelectedProducts(new Set());
    setShowMoveModal(false);
    setMoveCategorySearch('');
    
    toast({
      title: 'Produtos movidos!',
      description: `${count} produto(s) movido(s) para "${targetCategory.name}"`
    });
  };

  // Clear selection when category changes
  const handleCategorySelect = (category: CategoryData) => {
    setSelectedCategory(category);
    setSelectedProducts(new Set());
    setProductSearch('');
  };

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Get parent categories
  const parentCategories = filteredCategories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId);

  const allSelected = categoryProducts.length > 0 && selectedProducts.size === categoryProducts.length;
  const someSelected = selectedProducts.size > 0 && selectedProducts.size < categoryProducts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Gerenciar Produtos por Categoria</h2>
        {loading && (
          <span className="text-sm text-muted-foreground">Carregando produtos...</span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="bg-card border border-border rounded-xl max-h-[500px] overflow-y-auto">
            {parentCategories.map(category => {
              const subs = getSubcategories(category.id);
              const isSelected = selectedCategory?.id === category.id;
              const productCount = category.slug === 'todos'
                ? products.length
                : products.filter(p => p.category === category.slug).length;
              
              return (
                <div key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isSelected ? 'bg-primary-foreground/20' : 'bg-secondary'
                      }`}>
                        {productCount}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                  
                  {/* Subcategories */}
                  {subs.length > 0 && (
                    <div className="border-l-2 border-border ml-4">
                      {subs.map(sub => {
                        const subCount = products.filter(p => p.category === sub.slug).length;
                        const subSelected = selectedCategory?.id === sub.id;
                        
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleCategorySelect(sub)}
                            className={`w-full flex items-center justify-between p-2 pl-4 text-sm text-left transition-colors ${
                              subSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              subSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                            }`}>
                              {subCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Products in Category */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar produto na categoria..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {selectedProducts.size > 0 && (
                    <button
                      onClick={() => setShowMoveModal(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Mover {selectedProducts.size} produto(s)
                    </button>
                  )}
                  {selectedCategory.slug !== 'todos' && (
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {selectedCategory.name}
                    <span className="text-muted-foreground font-normal">
                      ({categoryProducts.length} produtos)
                    </span>
                  </h3>
                  {categoryProducts.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                      />
                      {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                    </label>
                  )}
                </div>

                {categoryProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum produto nesta categoria
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
                    {categoryProducts.map(product => (
                      <div 
                        key={product.id} 
                        className={`flex items-center justify-between p-3 transition-colors ${
                          selectedProducts.has(product.id) ? 'bg-primary/5' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-contain bg-white rounded border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        {selectedCategory.slug !== 'todos' && (
                          <button
                            onClick={() => handleRemoveFromCategory(product)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                            title="Remover da categoria"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">Selecione uma categoria</h3>
              <p className="text-muted-foreground">
                Escolha uma categoria à esquerda para ver e gerenciar seus produtos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Adicionar Produto em "{selectedCategory.name}"
                </h2>
                <button 
                  onClick={() => setShowAddProductModal(false)} 
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar produto para adicionar..."
                  value={addProductSearch}
                  onChange={e => setAddProductSearch(e.target.value)}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {availableProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {addProductSearch ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                  </div>
                ) : (
                  availableProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain bg-white rounded border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(product.price)} • Atual: {categories.find(c => c.slug === product.category)?.name || product.category}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Mostrando até 50 resultados. Use a busca para encontrar produtos específicos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Move Products Modal */}
      {showMoveModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Mover {selectedProducts.size} produto(s)
                </h2>
                <button 
                  onClick={() => setShowMoveModal(false)} 
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground mb-4">
                Selecione a categoria de destino:
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={moveCategorySearch}
                  onChange={e => setMoveCategorySearch(e.target.value)}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {moveCategories.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma categoria encontrada
                  </div>
                ) : (
                  moveCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleMoveProducts(category)}
                      className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{category.name}</span>
                        {category.parent_id && (
                          <span className="text-xs text-muted-foreground">
                            (subcategoria)
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
