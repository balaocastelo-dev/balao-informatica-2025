import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, GripVertical, Search, Package, X, Upload } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/product';

interface Brand {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  gradient: string;
  active: boolean;
  order_index: number;
}

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState<Brand | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const { products, updateProduct } = useProducts();
  
  const [newBrand, setNewBrand] = useState({
    name: '',
    slug: '',
    gradient: 'from-gray-800 to-gray-900'
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('order_index');
    
    if (error) {
      toast({ title: 'Erro ao carregar marcas', variant: 'destructive' });
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  const handleAddBrand = async () => {
    if (!newBrand.name || !newBrand.slug) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('brands').insert({
      name: newBrand.name.toUpperCase(),
      slug: newBrand.slug.toLowerCase().replace(/\s+/g, '-'),
      gradient: newBrand.gradient,
      order_index: brands.length + 1
    });

    if (error) {
      toast({ title: 'Erro ao adicionar marca', variant: 'destructive' });
    } else {
      toast({ title: 'Marca adicionada!' });
      fetchBrands();
      setShowAddModal(false);
      setNewBrand({ name: '', slug: '', gradient: 'from-gray-800 to-gray-900' });
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;

    const { error } = await supabase
      .from('brands')
      .update({
        name: editingBrand.name,
        slug: editingBrand.slug,
        gradient: editingBrand.gradient,
        active: editingBrand.active
      })
      .eq('id', editingBrand.id);

    if (error) {
      toast({ title: 'Erro ao atualizar marca', variant: 'destructive' });
    } else {
      toast({ title: 'Marca atualizada!' });
      fetchBrands();
      setEditingBrand(null);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) return;

    const { error } = await supabase.from('brands').delete().eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir marca', variant: 'destructive' });
    } else {
      toast({ title: 'Marca excluída!' });
      fetchBrands();
    }
  };

  const handleImageUpload = async (brand: Brand, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${brand.slug}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('brands')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Erro ao fazer upload', variant: 'destructive' });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('brands')
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from('brands')
      .update({ image_url: publicUrl })
      .eq('id', brand.id);

    if (error) {
      toast({ title: 'Erro ao salvar imagem', variant: 'destructive' });
    } else {
      toast({ title: 'Imagem atualizada!' });
      fetchBrands();
    }
  };

  // Get products for a brand (search by brand name in product name)
  const getBrandProducts = (brand: Brand) => {
    // Special handling for Intel - only show processors and Arc GPUs
    if (brand.slug.toLowerCase() === 'intel') {
      return products.filter(p => {
        const nameLower = p.name.toLowerCase();
        const categoryLower = p.category.toLowerCase();
        const isProcessor = categoryLower === 'processadores' && nameLower.includes('intel');
        const isArcGpu = (categoryLower === 'placa-de-video' || categoryLower === 'placas-de-video') && 
                         (nameLower.includes('arc a') || nameLower.includes('intel arc'));
        return isProcessor || isArcGpu;
      });
    }
    
    return products.filter(p => 
      p.name.toLowerCase().includes(brand.name.toLowerCase()) ||
      p.name.toLowerCase().includes(brand.slug.toLowerCase())
    );
  };

  // Get all products NOT associated with the brand
  const getAvailableProducts = (brand: Brand) => {
    const brandProducts = getBrandProducts(brand);
    const brandProductIds = new Set(brandProducts.map(p => p.id));
    
    let available = products.filter(p => !brandProductIds.has(p.id));
    
    if (productSearch.trim()) {
      const query = productSearch.toLowerCase();
      available = available.filter(p => p.name.toLowerCase().includes(query));
    }
    
    return available.slice(0, 50);
  };

  // Add brand name to product (so it appears in brand search)
  const addProductToBrand = async (product: Product, brand: Brand) => {
    const newName = `${product.name} ${brand.name}`;
    await updateProduct(product.id, { name: newName });
    toast({ title: 'Produto associado à marca!' });
  };

  // Remove brand name from product
  const removeProductFromBrand = async (product: Product, brand: Brand) => {
    const newName = product.name.replace(new RegExp(`\\s*${brand.name}\\s*`, 'gi'), '').trim();
    await updateProduct(product.id, { name: newName });
    toast({ title: 'Produto removido da marca!' });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const gradientOptions = [
    { label: 'Preto/Amarelo (Corsair)', value: 'from-gray-900 via-gray-800 to-yellow-600' },
    { label: 'Verde (NVIDIA)', value: 'from-green-600 via-green-700 to-gray-900' },
    { label: 'Azul (Intel)', value: 'from-blue-500 via-blue-600 to-blue-800' },
    { label: 'Vermelho (AMD/Kingston)', value: 'from-red-600 via-red-700 to-gray-900' },
    { label: 'Ciano (Logitech)', value: 'from-cyan-400 via-teal-500 to-gray-800' },
    { label: 'Roxo/Vermelho (HyperX)', value: 'from-red-600 via-purple-700 to-gray-900' },
    { label: 'Azul/Vermelho (ASUS)', value: 'from-blue-900 via-gray-800 to-red-600' },
  ];

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Gerenciar Marcas Recomendadas</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Marca
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Brand Preview */}
            <div className={`aspect-[16/10] bg-gradient-to-br ${brand.gradient} flex items-center justify-center relative overflow-hidden`}>
              {brand.image_url ? (
                <img src={brand.image_url} alt={brand.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white tracking-wider drop-shadow-lg">
                  {brand.name}
                </span>
              )}
              
              {/* Upload overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="text-white text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Upload Imagem</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(brand, file);
                  }}
                />
              </label>
            </div>

            {/* Brand Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground">{brand.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${brand.active ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {brand.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {getBrandProducts(brand).length} produtos associados
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowProductsModal(brand)}
                  className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1"
                >
                  <Package className="w-3 h-3" />
                  Produtos
                </button>
                <button
                  onClick={() => setEditingBrand(brand)}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id)}
                  className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Nova Marca</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Marca</label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                    className="input-field"
                    placeholder="Ex: CORSAIR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={newBrand.slug}
                    onChange={e => setNewBrand({ ...newBrand, slug: e.target.value })}
                    className="input-field"
                    placeholder="Ex: corsair"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cor/Gradiente</label>
                  <select
                    value={newBrand.gradient}
                    onChange={e => setNewBrand({ ...newBrand, gradient: e.target.value })}
                    className="input-field"
                  >
                    {gradientOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className={`aspect-[16/10] bg-gradient-to-br ${newBrand.gradient} rounded-lg flex items-center justify-center`}>
                  <span className="text-xl font-black text-white tracking-wider">
                    {newBrand.name || 'PREVIEW'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={handleAddBrand} className="btn-primary flex-1">
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="modal-overlay" onClick={() => setEditingBrand(null)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Editar Marca</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingBrand.name}
                    onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingBrand.slug}
                    onChange={e => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gradiente</label>
                  <select
                    value={editingBrand.gradient}
                    onChange={e => setEditingBrand({ ...editingBrand, gradient: e.target.value })}
                    className="input-field"
                  >
                    {gradientOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBrand.active}
                    onChange={e => setEditingBrand({ ...editingBrand, active: e.target.checked })}
                    className="rounded"
                  />
                  <span>Ativo</span>
                </label>

                {/* Preview */}
                <div className={`aspect-[16/10] bg-gradient-to-br ${editingBrand.gradient} rounded-lg flex items-center justify-center`}>
                  {editingBrand.image_url ? (
                    <img src={editingBrand.image_url} alt={editingBrand.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-xl font-black text-white tracking-wider">
                      {editingBrand.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditingBrand(null)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={handleUpdateBrand} className="btn-primary flex-1">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && (
        <div className="modal-overlay" onClick={() => setShowProductsModal(null)}>
          <div className="modal-content max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Produtos da marca {showProductsModal.name}
                </h2>
                <button onClick={() => setShowProductsModal(null)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Current Brand Products */}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">
                    Produtos Associados ({getBrandProducts(showProductsModal).length})
                  </h3>
                  <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {getBrandProducts(showProductsModal).length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Nenhum produto associado a esta marca
                      </div>
                    ) : (
                      getBrandProducts(showProductsModal).map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 hover:bg-secondary/50">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-contain bg-white rounded border" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeProductFromBrand(product, showProductsModal)}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Products */}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Adicionar Produtos</h3>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar produto..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>

                  <div className="max-h-[350px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {getAvailableProducts(showProductsModal).length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        {productSearch ? 'Nenhum produto encontrado' : 'Digite para buscar'}
                      </div>
                    ) : (
                      getAvailableProducts(showProductsModal).map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 hover:bg-secondary/50">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-contain bg-white rounded border" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => addProductToBrand(product, showProductsModal)}
                            className="btn-primary py-1.5 px-3 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}