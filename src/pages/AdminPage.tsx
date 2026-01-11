import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { useCategories, CategoryData } from '@/contexts/CategoryContext';
import { useBanners } from '@/contexts/BannerContext';
import { useBatchOperations } from '@/contexts/BatchOperationsContext';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  Upload, 
  Settings,
  Check,
  X,
  Image,
  Grid,
  LogOut,
  Search,
  AlertTriangle,
  FileImage,
  LayoutDashboard,
  BarChart3,
  Mail,
  ShoppingBag,
  Loader2,
  FolderEdit,
  CopyPlus,
  Sparkles,
  Tag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PageLayoutEditor } from '@/components/admin/PageLayoutEditor';
import { Dashboard } from '@/components/admin/Dashboard';
import { EmailMarketing } from '@/components/admin/EmailMarketing';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { BannerManagement } from '@/components/admin/BannerManagement';
import { CategoryProductManager } from '@/components/admin/CategoryProductManager';
import { BrandManagement } from '@/components/admin/BrandManagement';
import { CouponsManagement } from '@/components/admin/CouponsManagement';
import { BulkImport } from '@/components/admin/BulkImport';
import { BlingIntegration } from '@/components/admin/BlingIntegration';

import { useMenuItems } from '@/contexts/MenuItemsContext';



const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct, deleteProducts, importProducts, refreshProducts } = useProducts();
  const { categories, addCategory, updateCategory, deleteCategory, refreshCategories, reorderCategories } = useCategories();
  const { banners, addBanner, updateBanner, deleteBanner } = useBanners();
  const { runBatchPriceIncrease, runBatchPriceDiscount, runBatchDelete, runBatchCategoryChange, isRunning } = useBatchOperations();
  
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'bulk-import' | 'banners' | 'categories' | 'brands' | 'layout' | 'email' | 'orders' | 'bling' | 'config' | 'coupons'>('dashboard');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    image: '',
    category: '',
    description: '',
    stock: '',
    sourceUrl: '',
  });

  // Banner form state
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', title: '', link: '' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Duplicates state
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<{ name: string; products: typeof products }[]>([]);

  // Products filter state
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [productSort, setProductSort] = useState<'newest' | 'name_asc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('newest');
  const [productMinPrice, setProductMinPrice] = useState<string>('');
  const [productMaxPrice, setProductMaxPrice] = useState<string>('');
  const [productModelFilter, setProductModelFilter] = useState<string>('');
  const [productNameFilter, setProductNameFilter] = useState<string>('');
  const [productIdFilter, setProductIdFilter] = useState<string>('');

  // Integrações removidas

  // Batch price increase state
  const [showPriceIncreaseModal, setShowPriceIncreaseModal] = useState(false);
  const [priceIncreasePercent, setPriceIncreasePercent] = useState('10');

  // Batch price discount state
  const [showPriceDiscountModal, setShowPriceDiscountModal] = useState(false);
  const [priceDiscountPercent, setPriceDiscountPercent] = useState('10');

  // Batch category change state
  const [showCategoryChangeModal, setShowCategoryChangeModal] = useState(false);
  const [newBatchCategory, setNewBatchCategory] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const handleDuplicateProduct = async (product: Product) => {
    await addProduct({
      name: `${product.name} (Cópia)`,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      image: product.image,
      category: product.category,
      stock: product.stock,
      sourceUrl: product.sourceUrl,
    });
    toast({ title: 'Produto duplicado!' });
    refreshProducts();
  };

  // Filtered products based on filters
  const filteredProducts = useMemo(() => {
    let list = products;

    const parsePriceInput = (val: string): number | null => {
      if (!val) return null;
      let s = val.trim();
      if (!s) return null;
      s = s.replace(/\s/g, '');
      s = s.replace(/^[Rr]\$?/, '');
      if (s.includes(',')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
      const num = parseFloat(s);
      return isNaN(num) ? null : num;
    };

    if (productCategoryFilter) {
      list = list.filter(p => p.category === productCategoryFilter);
    }

    const nameQ = productNameFilter.trim().toLowerCase();
    if (nameQ) {
      list = list.filter(p => p.name.toLowerCase().includes(nameQ));
    }

    const idQ = productIdFilter.trim().toLowerCase();
    if (idQ) {
      list = list.filter(p => p.id.toLowerCase().includes(idQ));
    }

    const modelQ = productModelFilter.trim().toLowerCase();
    if (modelQ) {
      list = list.filter(p => p.name.toLowerCase().includes(modelQ));
    }

    if (productStockFilter === 'in') {
      list = list.filter(p => (p.stock || 0) > 0);
    } else if (productStockFilter === 'out') {
      list = list.filter(p => (p.stock || 0) <= 0);
    }

    const min = parsePriceInput(productMinPrice);
    const max = parsePriceInput(productMaxPrice);
    if (min !== null && !isNaN(min)) {
      list = list.filter(p => p.price >= min);
    }
    if (max !== null && !isNaN(max)) {
      list = list.filter(p => p.price <= max);
    }

    const sortKey = productSort;
    list = [...list].sort((a, b) => {
      if (sortKey === 'newest') return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
      if (sortKey === 'name_asc') return a.name.localeCompare(b.name, 'pt-BR');
      if (sortKey === 'price_asc') return a.price - b.price;
      if (sortKey === 'price_desc') return b.price - a.price;
      if (sortKey === 'stock_asc') return (a.stock || 0) - (b.stock || 0);
      if (sortKey === 'stock_desc') return (b.stock || 0) - (a.stock || 0);
      return 0;
    });

    return list;
  }, [products, productCategoryFilter, productNameFilter, productIdFilter, productModelFilter, productStockFilter, productMinPrice, productMaxPrice, productSort]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      
      // Apenas o usuário balaocastelo@gmail.com é admin
      setIsAdmin(user.email === 'balaocastelo@gmail.com');
    };
    checkAdmin();
  }, [user]);

  const handleLogout = () => {
    navigate('/');
  };
  
  const { items: menuItems, loading: menuLoading, updateItem, refresh: refreshMenu } = useMenuItems();
  const [categoryOrder, setCategoryOrder] = useState(categories);
  const [menuOrder, setMenuOrder] = useState(menuItems);
  useEffect(() => {
    setCategoryOrder([...categories].sort((a, b) => a.order_index - b.order_index));
  }, [categories]);
  useEffect(() => {
    setMenuOrder([...menuItems].sort((a, b) => a.order_index - b.order_index));
  }, [menuItems]);
  const reorder = <T,>(list: T[], from: number, to: number): T[] => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };
  const [dragIndexCat, setDragIndexCat] = useState<number | null>(null);
  const [dragIndexMenu, setDragIndexMenu] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      costPrice: '',
      image: '',
      category: categories[0]?.slug || '',
      description: '',
      stock: '',
      sourceUrl: '',
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      image: formData.image,
      category: formData.category,
      description: formData.description,
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      sourceUrl: formData.sourceUrl || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({ title: 'Produto atualizado com sucesso!' });
    } else {
      addProduct(productData);
      toast({ title: 'Produto adicionado com sucesso!' });
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || '',
      image: product.image,
      category: product.category,
      description: product.description || '',
      stock: product.stock?.toString() || '',
      sourceUrl: product.sourceUrl || '',
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?`)) {
      const productIdsToDelete = [...selectedProducts];
      setSelectedProducts([]);
      await runBatchDelete(productIdsToDelete, deleteProduct);
      refreshProducts();
    }
  };

  const handleBatchPriceIncrease = async () => {
    if (selectedProducts.length === 0) return;
    
    const percent = parseFloat(priceIncreasePercent);
    if (isNaN(percent) || percent <= 0) {
      toast({ title: 'Informe uma porcentagem válida', variant: 'destructive' });
      return;
    }

    const productData = products.map(p => ({ id: p.id, price: p.price }));
    const productIdsToUpdate = [...selectedProducts];
    
    setShowPriceIncreaseModal(false);
    setSelectedProducts([]);
    setPriceIncreasePercent('10');
    
    await runBatchPriceIncrease(productIdsToUpdate, productData, percent);
    refreshProducts();
  };

  const handleBatchPriceDiscount = async () => {
    if (selectedProducts.length === 0) return;
    
    const percent = parseFloat(priceDiscountPercent);
    if (isNaN(percent) || percent <= 0 || percent >= 100) {
      toast({ title: 'Informe uma porcentagem válida (entre 0 e 100)', variant: 'destructive' });
      return;
    }

    const productData = products.map(p => ({ id: p.id, price: p.price }));
    const productIdsToUpdate = [...selectedProducts];
    
    setShowPriceDiscountModal(false);
    setSelectedProducts([]);
    setPriceDiscountPercent('10');
    
    await runBatchPriceDiscount(productIdsToUpdate, productData, percent);
    refreshProducts();
  };

  const handleBatchCategoryChange = async () => {
    if (selectedProducts.length === 0 || !newBatchCategory) return;
    
    const productIdsToUpdate = [...selectedProducts];
    
    setShowCategoryChangeModal(false);
    setSelectedProducts([]);
    
    await runBatchCategoryChange(productIdsToUpdate, newBatchCategory, updateProduct);
    setNewBatchCategory('');
    refreshProducts();
  };



  const generateFallbackDescription = (productName: string): string => {
    const name = productName.trim();
    const lower = name.toLowerCase();
    const isNotebook = lower.includes('notebook') || lower.includes('laptop');
    const isMonitor = lower.includes('monitor') || lower.includes('tela');
    const isGPU = lower.includes('placa de vídeo') || lower.includes('placa de video') || lower.includes('gpu') || lower.includes('rtx') || lower.includes('gtx') || lower.includes('radeon');
    const isSSD = lower.includes('ssd') || lower.includes('nvme');
    const isCPU = lower.includes('processador') || lower.includes('cpu') || lower.includes('ryzen') || lower.includes('intel');

    const ramMatch = lower.match(/\b(\d{1,3})\s*(gb|g)\s*(ram)?\b/i);
    const storageMatch = lower.match(/\b(\d{1,4})\s*(gb|tb)\s*(ssd|hd|nvme)?\b/i);
    const screenMatch = lower.match(/\b(\d{1,2}(?:[.,]\d)?)\s*(?:["']|pol|inch|polegadas)?\b/i);

    const specs: string[] = [];
    if (ramMatch) specs.push(`${ramMatch[1]}GB de RAM`);
    if (storageMatch) {
      const val = storageMatch[1];
      const unit = storageMatch[2].toUpperCase();
      specs.push(`${val}${unit} de armazenamento`);
    }
    if (screenMatch && (isNotebook || isMonitor)) specs.push(`${String(screenMatch[1]).replace(',', '.')}” de tela`);

    const hook =
      isNotebook
        ? 'Mobilidade e desempenho para estudar, trabalhar e criar.'
        : isMonitor
        ? 'Imagem nítida e fluida para produtividade e jogos.'
        : isGPU
        ? 'Gráficos impressionantes e altas taxas de FPS.'
        : isSSD
        ? 'Velocidade de leitura e escrita para carregar tudo em segundos.'
        : isCPU
        ? 'Performance eficiente para multitarefa e responsividade.'
        : 'Desempenho e confiabilidade com excelente custo-benefício.';

    const specsText = specs.length ? ` Destaques: ${specs.join(' · ')}.` : '';
    return `Apresente-se com o ${name}. ${hook}${specsText} Ideal para quem busca qualidade, suporte e condições especiais na Balão da Informática.`;
  };



  const handleBulkGenerateDescriptions = async () => {
    if (selectedProducts.length === 0) return;
    try {
      setIsBulkGenerating(true);
      setBulkProgress({ done: 0, total: selectedProducts.length });
      toast({ title: `Gerando descrições para ${selectedProducts.length} produto(s)...` });
      const byId = new Map(products.map(p => [p.id, p]));
      const tasks = selectedProducts
        .map(id => byId.get(id))
        .filter((p): p is Product => !!p && !!p.name);
      const concurrency = 3;
      let index = 0;
      const postApi = async (path: string, body: unknown): Promise<unknown | null> => {
        try {
          const resp = await fetch(`/api/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!resp.ok) return null;
          return await resp.json();
        } catch {
          return null;
        }
      };
      const runNext = async () => {
        if (index >= tasks.length) return;
        const current = tasks[index++];
        try {
          const { data, error } = await supabase.functions.invoke('generate-product-description', {
            body: { name: current.name, source_url: current.sourceUrl || undefined }
          });
          let text = '';
          if (!error && typeof data?.description === 'string' && data.description.trim()) {
            text = `<p>${data.description.trim()}</p>`;
          } else {
            const apiData = await postApi('generate-product-description', { name: current.name, source_url: current.sourceUrl || undefined });
            const apiDesc = apiData && typeof (apiData as { description?: unknown }).description === 'string'
              ? String((apiData as { description?: unknown }).description).trim()
              : '';
            text = apiDesc ? `<p>${apiDesc}</p>` : `<p>${generateFallbackDescription(current.name)}</p>`;
          }
          await updateProduct(current.id, { description: text, aiGenerated: true });
        } catch {
          const text = `<p>${generateFallbackDescription(current.name)}</p>`;
          await updateProduct(current.id, { description: text, aiGenerated: true });
        } finally {
          setBulkProgress(prev => ({ done: prev.done + 1, total: prev.total }));
          await runNext();
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }).map(() => runNext()));
      toast({ title: 'Descrições geradas!' });
      setSelectedProducts([]);
      await refreshProducts();
    } catch {
      toast({ title: 'Erro ao gerar descrições', variant: 'destructive' });
    } finally {
      setIsBulkGenerating(false);
    }
  };




  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = bannerForm.imageUrl;
    
    // If file is selected, upload it first
    if (bannerFile) {
      setUploadingBanner(true);
      try {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('banners')
          .upload(fileName, bannerFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Upload error:', error);
          toast({ 
            title: 'Erro no upload', 
            description: error.message,
            variant: 'destructive' 
          });
          setUploadingBanner(false);
          return;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      } catch (err) {
        console.error('Upload error:', err);
        toast({ 
          title: 'Erro no upload',
          variant: 'destructive' 
        });
        setUploadingBanner(false);
        return;
      }
      setUploadingBanner(false);
    }
    
    if (!imageUrl) {
      toast({ 
        title: 'Adicione uma imagem',
        description: 'Faça upload de um arquivo ou insira uma URL.',
        variant: 'destructive' 
      });
      return;
    }
    
    addBanner(imageUrl, bannerForm.title, bannerForm.link);
    setBannerForm({ imageUrl: '', title: '', link: '' });
    setBannerFile(null);
    setShowBannerModal(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.slug) return;
    
    if (editingCategory) {
      await updateCategory(editingCategory, categoryForm.name, categoryForm.slug, categoryForm.parentId || null);
      setEditingCategory(null);
    } else {
      await addCategory(categoryForm.name, categoryForm.slug, categoryForm.parentId || undefined);
    }
    setCategoryForm({ name: '', slug: '', parentId: '' });
    setShowCategoryModal(false);
  };

  const handleEditCategory = (category: CategoryData) => {
    setCategoryForm({ 
      name: category.name, 
      slug: category.slug, 
      parentId: category.parent_id || '' 
    });
    setEditingCategory(category.id);
    setShowCategoryModal(true);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts(current =>
      current.includes(id)
        ? current.filter(pid => pid !== id)
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    const allFilteredSelected = filteredProducts.every(p => selectedProducts.includes(p.id));
    
    if (allFilteredSelected && filteredProducts.length > 0) {
      // Deselect only filtered products
      setSelectedProducts(current => current.filter(id => !filteredProducts.some(p => p.id === id)));
    } else {
      // Select all filtered products (add to existing selection)
      const filteredIds = filteredProducts.map(p => p.id);
      setSelectedProducts(current => [...new Set([...current, ...filteredIds])]);
    }
  };

  // Scan for duplicates
  const scanForDuplicates = () => {
    const normalizedMap = new Map<string, typeof products>();
    
    products.forEach(product => {
      // Normalize the name: lowercase, remove extra spaces, remove special chars
      const normalized = product.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
      
      if (normalizedMap.has(normalized)) {
        normalizedMap.get(normalized)!.push(product);
      } else {
        normalizedMap.set(normalized, [product]);
      }
    });

    // Filter only groups with more than one product (duplicates)
    const duplicates = Array.from(normalizedMap.entries())
      .filter(([_, group]) => group.length > 1)
      .map(([name, group]) => ({ name, products: group }));

    setDuplicateGroups(duplicates);
    setShowDuplicatesModal(true);

    if (duplicates.length === 0) {
      toast({ title: 'Nenhum produto duplicado encontrado!' });
    } else {
      toast({ 
        title: `${duplicates.length} grupo(s) de duplicados encontrados!`,
        description: `Total de ${duplicates.reduce((acc, g) => acc + g.products.length, 0)} produtos duplicados.`
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 w-full max-w-md border border-border">
          <div className="text-center mb-8">
            <img
              src="https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png"
              alt="Balão da Informática"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-2">Você precisa entrar na sua conta para continuar</p>
          </div>
          <div className="space-y-4">
            <Link to="/auth?redirect=/admin" className="btn-primary w-full text-center">Entrar</Link>
            <Link to="/" className="btn-secondary w-full text-center">Voltar para a loja</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 w-full max-w-md border border-border text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground">Sua conta não possui acesso administrativo.</p>
          <div className="mt-6 flex gap-2">
            <Link to="/" className="btn-secondary flex-1 text-center">Voltar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-admin">
          <div className="flex items-center justify-between h-16">
          <Link to="/">
              <img
                src="https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png"
                alt="Balão da Informática"
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-foreground">
                Painel Administrativo
              </h1>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-admin py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bulk-import' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importação em Massa
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'banners' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" />
            Banners
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'categories' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Grid className="w-4 h-4" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'brands' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4" />
            Marcas
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'layout' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'email' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Marketing
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'coupons' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Tag className="w-4 h-4" />
            Cupons
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'config' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuração
          </button>
          <button
            onClick={() => {}}
            className="hidden"
          />
          <button
            onClick={() => setActiveTab('bling')}
            className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bling' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Bling ERP
          </button>
          {/* Integrações e Chat Central removidos */}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && <Dashboard />}

        {/* Email Marketing Tab */}
        {activeTab === 'email' && <EmailMarketing />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrdersManagement />}

        {/* Bling Tab */}
        {activeTab === 'bling' && (
          <div className="space-y-8">
            <BlingIntegration />
          </div>
        )}

        {/* Integrações removidas */}

        {/* Configuração Tab */}
        {activeTab === 'config' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Organização por Arrastar e Soltar</h2>
                <p className="text-muted-foreground">Reordene categorias e o menu de navegação</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="admin-card">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Categorias</h3>
                <div className="space-y-2">
                  {categoryOrder.map((cat, idx) => (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={() => setDragIndexCat(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndexCat === null) return;
                        setCategoryOrder(reorder(categoryOrder, dragIndexCat, idx));
                        setDragIndexCat(null);
                      }}
                      className="flex items-center justify-between p-2 border border-border rounded-lg bg-card cursor-move"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-muted-foreground">{idx + 1}</span>
                        <div>
                          <div className="font-medium text-foreground">{cat.name}</div>
                          <div className="text-xs text-muted-foreground">{cat.slug}</div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">ID: {cat.id}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={async () => {
                      await reorderCategories(categoryOrder);
                    }}
                    className="btn-primary"
                  >
                    Salvar ordem das categorias
                  </button>
                </div>
              </div>
              <div className="admin-card">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Menu de Navegação</h3>
                {menuLoading ? (
                  <div className="py-6 text-sm text-muted-foreground">Carregando...</div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {menuOrder.map((item, idx) => (
                        <div
                          key={item.slug}
                          draggable
                          onDragStart={() => setDragIndexMenu(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIndexMenu === null) return;
                            setMenuOrder(reorder(menuOrder, dragIndexMenu, idx));
                            setDragIndexMenu(null);
                          }}
                          className="flex items-center justify-between p-2 border border-border rounded-lg bg-card cursor-move"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-muted-foreground">{idx + 1}</span>
                            <div>
                              <div className="font-medium text-foreground">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.route}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'}`}>
                            {item.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={async () => {
                          for (let i = 0; i < menuOrder.length; i++) {
                            const it = menuOrder[i];
                            await updateItem(it.slug, { order_index: i + 1 });
                          }
                          await refreshMenu();
                          toast({ title: 'Ordem do menu atualizada!' });
                        }}
                        className="btn-primary"
                      >
                        Salvar ordem do menu
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
 
 

        {/* Bulk Import Tab */}
        {activeTab === 'bulk-import' && (
          <div className="space-y-6">
            <BulkImport />
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="admin-card">
                <Package className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
              </div>
              <div className="admin-card">
                <Settings className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categorias</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
              <button
                onClick={() => setActiveTab('bulk-import')}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar em Massa
              </button>
              {selectedProducts.length > 0 && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir ({selectedProducts.length})
                  </button>
                  <button
                    onClick={async () => {
                      const n = selectedProducts.length;
                      if (n === 0) return;
                      if (!confirm(`Deseja gerar descrições com IA para os ${n} produtos selecionados? Isso pode levar alguns minutos.`)) {
                        return;
                      }
                      await handleBulkGenerateDescriptions();
                    }}
                    disabled={isBulkGenerating}
                    className={`bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isBulkGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isBulkGenerating
                      ? `Gerando (${bulkProgress.done}/${bulkProgress.total})`
                      : `✨ Gerar Descrição IA (${selectedProducts.length})`}
                  </button>
                  <button
                    onClick={() => setShowPriceIncreaseModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <span className="font-bold">+%</span>
                    Aumentar Preço ({selectedProducts.length})
                  </button>
                  <button
                    onClick={() => setShowPriceDiscountModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
                  >
                    <span className="font-bold">-%</span>
                    Desconto ({selectedProducts.length})
                  </button>
                  <button
                    onClick={() => setShowCategoryChangeModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <FolderEdit className="w-4 h-4" />
                    Categoria ({selectedProducts.length})
                  </button>
                </>
              )}
              {products.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja EXCLUIR TODOS os ${products.length} produtos? Esta ação não pode ser desfeita!`)) {
                      deleteProducts(products.map(p => p.id));
                      setSelectedProducts([]);
                      toast({ title: 'Todos os produtos foram excluídos!' });
                    }
                  }}
                  className="bg-destructive/80 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </button>
              )}
              <button
                onClick={scanForDuplicates}
                className="btn-secondary flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar Duplicados
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={productCategoryFilter}
                onChange={(e) => {
                  setProductCategoryFilter(e.target.value);
                  setSelectedProducts([]); // Clear selection when changing filter
                }}
                className="input-field w-auto min-w-[200px]"
                disabled={isRunning}
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value as 'all' | 'in' | 'out')}
                  className="input-field w-auto min-w-[180px]"
                  disabled={isRunning}
                >
                  <option value="all">Todos os estoques</option>
                  <option value="in">Somente com estoque</option>
                  <option value="out">Somente sem estoque</option>
                </select>

                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value as typeof productSort)}
                  className="input-field w-auto min-w-[180px]"
                  disabled={isRunning}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="name_asc">Nome (A→Z)</option>
                  <option value="price_asc">Preço (menor)</option>
                  <option value="price_desc">Preço (maior)</option>
                  <option value="stock_asc">Estoque (menor)</option>
                  <option value="stock_desc">Estoque (maior)</option>
                </select>
                <input
                  value={productMinPrice}
                  onChange={(e) => setProductMinPrice(e.target.value)}
                  className="input-field w-auto min-w-[140px]"
                  placeholder="Preço mín."
                  disabled={isRunning}
                />
                <input
                  value={productMaxPrice}
                  onChange={(e) => setProductMaxPrice(e.target.value)}
                  className="input-field w-auto min-w-[140px]"
                  placeholder="Preço máx."
                  disabled={isRunning}
                />
                <input
                  value={productModelFilter}
                  onChange={(e) => setProductModelFilter(e.target.value)}
                  className="input-field w-auto min-w-[200px]"
                  placeholder="Modelo (ex.: Galaxy, iPhone)"
                  disabled={isRunning}
                />
              </div>

              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={productNameFilter}
                    onChange={(e) => setProductNameFilter(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Nome do produto (estrito)"
                    disabled={isRunning}
                  />
                  {productNameFilter.trim() && (
                    <button
                      type="button"
                      onClick={() => setProductNameFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-lg transition-colors"
                      title="Limpar"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <input
                  value={productIdFilter}
                  onChange={(e) => setProductIdFilter(e.target.value)}
                  className="input-field w-auto min-w-[160px]"
                  placeholder="ID"
                  disabled={isRunning}
                />
                <button
                  type="button"
                  onClick={() => refreshProducts()}
                  className="btn-secondary px-4 py-3 flex items-center gap-2"
                  disabled={isRunning || productsLoading}
                  title="Atualizar lista"
                >
                  <Loader2 className={`w-4 h-4 ${productsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>

              <span className="text-sm text-muted-foreground">
                Exibindo <strong className="text-foreground">{filteredProducts.length}</strong> de {products.length}
              </span>
            </div>

            {/* Products Table */}
            <div className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="p-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Produto</th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Custo</th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Preço Final</th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Estoque</th>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-contain bg-white rounded"
                            />
                            <span className="font-medium text-foreground text-sm line-clamp-1 max-w-xs">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="text-xs text-muted-foreground">
                            {categories.find(c => c.slug === product.category)?.name || product.category}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground text-sm">
                          {product.costPrice ? formatPrice(product.costPrice) : '-'}
                        </td>
                        <td className="p-2 font-semibold text-primary text-sm">
                          {formatPrice(product.price)}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            (product.stock || 0) > 5 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDuplicateProduct(product)}
                              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                              title="Duplicar produto"
                            >
                              <CopyPlus className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Excluir este produto?')) {
                                  deleteProduct(product.id);
                                  toast({ title: 'Produto excluído!' });
                                }
                              }}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && <BannerManagement />}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="admin-card">
            <CouponsManagement />
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {/* Category Product Manager */}
            <div className="admin-card">
              <CategoryProductManager />
            </div>

            {/* Categories List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Gerenciar Categorias</h2>
                <button
                  onClick={() => {
                    setCategoryForm({ name: '', slug: '', parentId: '' });
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Categoria
                </button>
              </div>

              <div className="grid gap-3">
                {/* Parent categories */}
                {categories.filter(c => !c.parent_id).map(category => {
                  const subcategories = categories.filter(c => c.parent_id === category.id);
                  return (
                    <div key={category.id} className="admin-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir categoria "${category.name}"?`)) {
                                deleteCategory(category.id);
                              }
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subcategories */}
                      {subcategories.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-border space-y-2">
                          {subcategories.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between py-2">
                              <div>
                                <p className="font-medium text-foreground text-sm">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">Slug: {sub.slug}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditCategory(sub)}
                                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <Edit className="w-3 h-3 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir subcategoria "${sub.name}"?`)) {
                                      deleteCategory(sub.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="admin-card">
            <BrandManagement />
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="admin-card">
            <PageLayoutEditor />
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Preço de Custo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Preço Final</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Link do Produto</label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://www.kabum.com.br/produto/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Estoque</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-foreground">Descrição</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.name.trim()) {
                          toast({ title: 'Informe o nome do produto', variant: 'destructive' });
                          return;
                        }
                        setIsGeneratingDescription(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('generate-product-description', {
                            body: { name: formData.name, source_url: formData.sourceUrl || undefined }
                          });
                          let text = !error && typeof data?.description === 'string' ? data.description.trim() : '';
                          if (!text) {
                            try {
                              const resp = await fetch('/api/generate-product-description', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: formData.name, source_url: formData.sourceUrl || undefined }),
                              });
                              if (resp.ok) {
                                const apiJson = await resp.json();
                                text = apiJson && typeof apiJson.description === 'string' ? String(apiJson.description).trim() : '';
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }
                          if (text) {
                            setFormData({ ...formData, description: `<p>${text}</p>` });
                            toast({ title: 'Descrição gerada com IA' });
                          } else {
                            const fallback = generateFallbackDescription(formData.name);
                            setFormData({ ...formData, description: `<p>${fallback}</p>` });
                            toast({ title: 'Descrição gerada (simulada)' });
                          }
                        } catch {
                          const fallback = generateFallbackDescription(formData.name);
                          setFormData({ ...formData, description: `<p>${fallback}</p>` });
                          toast({ title: 'Descrição gerada (simulada)' });
                        } finally {
                          setIsGeneratingDescription(false);
                        }
                      }}
                      className="btn-secondary flex items-center gap-2 px-3 py-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingDescription ? 'Gerando...' : '✨ Gerar Descrição com IA'}
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="input-field min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingProduct ? 'Salvar Alterações' : 'Adicionar'}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Banner Modal */}
      {showBannerModal && (
        <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Adicionar Banner</h2>
                <button onClick={() => setShowBannerModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBanner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload de Imagem
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBannerFile(file);
                          setBannerForm({ ...bannerForm, imageUrl: '' });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {bannerFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileImage className="w-8 h-8 text-primary" />
                        <p className="text-sm text-foreground font-medium">{bannerFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(bannerFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerFile(null);
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remover arquivo
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique ou arraste uma imagem aqui
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG ou WEBP (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-sm text-muted-foreground">ou</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={bannerForm.imageUrl}
                    onChange={e => {
                      setBannerForm({ ...bannerForm, imageUrl: e.target.value });
                      if (e.target.value) setBannerFile(null);
                    }}
                    className="input-field"
                    placeholder="https://..."
                    disabled={!!bannerFile}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Título (opcional)</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Link (opcional)</label>
                  <input
                    type="text"
                    value={bannerForm.link}
                    onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="input-field"
                    placeholder="/categoria/notebooks"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      'Adicionar Banner'
                    )}
                  </button>
                  <button type="button" onClick={() => setShowBannerModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ 
                      ...categoryForm, 
                      name: e.target.value,
                      slug: editingCategory ? categoryForm.slug : e.target.value.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                    })}
                    className="input-field"
                    placeholder="Ex: Periféricos"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="input-field"
                    placeholder="Ex: perifericos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Categoria Pai (opcional)</label>
                  <select
                    value={categoryForm.parentId}
                    onChange={e => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Nenhuma (categoria principal)</option>
                    {categories
                      .filter(c => !c.parent_id && c.id !== editingCategory)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione uma categoria pai para criar uma subcategoria
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                  <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Modal */}
      {showDuplicatesModal && (
        <div className="modal-overlay" onClick={() => setShowDuplicatesModal(false)}>
          <div className="modal-content max-w-4xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-foreground">Produtos Duplicados</h2>
                </div>
                <button onClick={() => setShowDuplicatesModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action buttons at top */}
              <div className="flex justify-between gap-3 pb-4 border-b border-border mb-4">
                <button
                  onClick={() => {
                    const totalToDelete = duplicateGroups.reduce((acc, g) => acc + g.products.length - 1, 0);
                    if (confirm(`Manter apenas o mais barato de cada grupo?\n\nIsso excluirá ${totalToDelete} produto(s) duplicados.`)) {
                      const idsToDelete: string[] = [];
                      
                      duplicateGroups.forEach(group => {
                        // Sort by price ascending, keep the first (cheapest)
                        const sorted = [...group.products].sort((a, b) => a.price - b.price);
                        // Add all except the cheapest to delete list
                        sorted.slice(1).forEach(p => idsToDelete.push(p.id));
                      });

                      if (idsToDelete.length > 0) {
                        deleteProducts(idsToDelete);
                        setDuplicateGroups([]);
                        toast({ 
                          title: `${idsToDelete.length} produto(s) duplicado(s) excluído(s)!`,
                          description: 'Apenas os mais baratos foram mantidos.'
                        });
                      }
                    }
                  }}
                  disabled={duplicateGroups.length === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Manter Apenas os Mais Baratos
                </button>
                <button onClick={() => setShowDuplicatesModal(false)} className="btn-secondary">
                  Fechar
                </button>
              </div>

              {duplicateGroups.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum produto duplicado encontrado.</p>
              ) : (
                <div className="overflow-y-auto flex-1 space-y-6">
                  {duplicateGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {group.products.length} produtos com nome similar
                      </p>
                      <div className="space-y-2">
                        {group.products.map(product => (
                          <div key={product.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-contain bg-white rounded"
                              />
                              <div>
                                <p className="font-medium text-foreground text-sm line-clamp-1">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                                {product.costPrice && (
                                  <p className="text-xs text-muted-foreground">Custo: {formatPrice(product.costPrice)}</p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  deleteProduct(product.id);
                                  setDuplicateGroups(prev => 
                                    prev.map(g => ({
                                      ...g,
                                      products: g.products.filter(p => p.id !== product.id)
                                    })).filter(g => g.products.length > 1)
                                  );
                                  toast({ title: 'Produto excluído!' });
                                }}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Price Increase Modal */}
      {showPriceIncreaseModal && (
        <div className="modal-overlay" onClick={() => setShowPriceIncreaseModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Aumentar Preço em Lote</h2>
                <button onClick={() => setShowPriceIncreaseModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{selectedProducts.length}</strong> produto(s) selecionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Porcentagem de aumento (%)
                  </label>
                  <input
                    type="number"
                    value={priceIncreasePercent}
                    onChange={(e) => setPriceIncreasePercent(e.target.value)}
                    className="input-field text-lg font-bold"
                    placeholder="10"
                    min="0.1"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Ex: 10% irá multiplicar o preço por 1.10
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPriceIncreaseModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBatchPriceIncrease}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-green-700 transition-colors font-medium"
                  >
                    Aplicar +{priceIncreasePercent}%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Price Discount Modal */}
      {showPriceDiscountModal && (
        <div className="modal-overlay" onClick={() => setShowPriceDiscountModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Aplicar Desconto em Lote</h2>
                <button onClick={() => setShowPriceDiscountModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{selectedProducts.length}</strong> produto(s) selecionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Porcentagem de desconto (%)
                  </label>
                  <input
                    type="number"
                    value={priceDiscountPercent}
                    onChange={(e) => setPriceDiscountPercent(e.target.value)}
                    className="input-field text-lg font-bold"
                    placeholder="10"
                    min="0.1"
                    max="99"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Ex: 10% irá multiplicar o preço por 0.90
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPriceDiscountModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBatchPriceDiscount}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg flex-1 hover:bg-orange-600 transition-colors font-medium"
                  >
                    Aplicar -{priceDiscountPercent}%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Category Change Modal */}
      {showCategoryChangeModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryChangeModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Alterar Categoria em Lote</h2>
                <button onClick={() => setShowCategoryChangeModal(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{selectedProducts.length}</strong> produto(s) selecionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nova categoria
                  </label>
                  <select
                    value={newBatchCategory}
                    onChange={(e) => setNewBatchCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCategoryChangeModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBatchCategoryChange}
                    disabled={!newBatchCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Alterar Categoria
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
