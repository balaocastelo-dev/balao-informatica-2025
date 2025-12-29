import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  getProductsByCategory: (category: Category) => Product[];
  searchProducts: (query: string) => Product[];
  importProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[], profitMargin: number) => Promise<void>;
  bulkImportProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const extractAttributes = (name: string, description?: string) => {
    const text = `${name} ${description || ''}`.toLowerCase();
    let ramGb: number | undefined;
    let storageGb: number | undefined;
    let screenInches: number | undefined;

    const ramMatch = text.match(/\b(\d{1,3})\s*(gb|g)\s*(?:ram|mem[oó]ria)?\b/i);
    if (ramMatch) {
      const n = Number(ramMatch[1]);
      if (!isNaN(n)) ramGb = n;
    }

    const storageMatch = text.match(/\b(\d{1,4})\s*(gb|tb)\s*(?:ssd|hd|hdd)?\b/i);
    if (storageMatch) {
      const n = Number(storageMatch[1]);
      const unit = String(storageMatch[2]).toUpperCase();
      const gb = unit === 'TB' ? n * 1024 : n;
      if (!isNaN(gb)) storageGb = gb;
    }

    const screenMatch = text.match(/\b(\d{1,2}(?:[.,]\d)?)\s*(?:["']|pol|inch|polegadas)?\b/i);
    if (screenMatch) {
      const val = String(screenMatch[1]).replace(',', '.');
      const num = Number(val);
      if (!isNaN(num)) screenInches = num;
    }

    return { ramGb, storageGb, screenInches };
  };

  const fetchProducts = async () => {
    try {
      // TODO: Loading all products at once will affect performance as the database grows.
      // Consider implementing server-side pagination or infinite scrolling in the future.
      // Currently using batch fetching to bypass 1000 row limit.
      const allProducts: Product[] = [];
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedProducts: Product[] = data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            price: Number(p.price),
            costPrice: p.cost_price ? Number(p.cost_price) : undefined,
            image: p.image || '/placeholder.svg',
            category: p.category as Category,
            stock: p.stock,
            sourceUrl: p.source_url || undefined,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
            ramGb: typeof p.ram_gb === 'number' ? p.ram_gb : undefined,
            storageGb: typeof p.storage_gb === 'number' ? p.storage_gb : undefined,
            screenInches: typeof p.screen_inches === 'number' ? p.screen_inches : undefined,
          }));
          allProducts.push(...mappedProducts);
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      setProducts(allProducts);
      console.log(`Loaded ${allProducts.length} products`);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const attrs = extractAttributes(product.name, product.description);
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description || null,
          price: product.price,
          cost_price: product.costPrice || null,
          image: product.image || null,
          category: product.category,
          stock: product.stock,
          source_url: product.sourceUrl || null,
          ram_gb: attrs.ramGb ?? null,
          storage_gb: attrs.storageGb ?? null,
          screen_inches: attrs.screenInches ?? null,
        })
        .select()
        .single();

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description || null,
            price: product.price,
            cost_price: product.costPrice || null,
            image: product.image || null,
            category: product.category,
            stock: product.stock,
            source_url: product.sourceUrl || null,
          })
          .select()
          .single();
        if (fallbackError) throw fallbackError;
        const newProduct: Product = {
          id: fallbackData.id,
          name: fallbackData.name,
          description: fallbackData.description || undefined,
          price: Number(fallbackData.price),
          costPrice: fallbackData.cost_price ? Number(fallbackData.cost_price) : undefined,
          image: fallbackData.image || '/placeholder.svg',
          category: fallbackData.category as Category,
          stock: fallbackData.stock,
          sourceUrl: fallbackData.source_url || undefined,
          createdAt: new Date(fallbackData.created_at),
          updatedAt: new Date(fallbackData.updated_at),
          ...attrs,
        };
        setProducts(current => [newProduct, ...current]);
        return;
      }

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        costPrice: data.cost_price ? Number(data.cost_price) : undefined,
        image: data.image || '/placeholder.svg',
        category: data.category as Category,
        stock: data.stock,
        sourceUrl: data.source_url || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        ramGb: typeof data.ram_gb === 'number' ? data.ram_gb : attrs.ramGb,
        storageGb: typeof data.storage_gb === 'number' ? data.storage_gb : attrs.storageGb,
        screenInches: typeof data.screen_inches === 'number' ? data.screen_inches : attrs.screenInches,
        status: data.status || undefined,
        tags: Array.isArray(data.tags) ? data.tags : undefined,
        aiGenerated: typeof data.ai_generated === 'boolean' ? data.ai_generated : undefined,
        aiConfidence: data.ai_confidence || undefined,
      };

      setProducts(current => [newProduct, ...current]);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro ao adicionar produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.sourceUrl !== undefined) dbUpdates.source_url = updates.sourceUrl;
      const existing = products.find(p => p.id === id);
      const textName = updates.name ?? existing?.name ?? '';
      const textDesc = updates.description ?? existing?.description ?? '';
      const attrs = extractAttributes(textName, typeof textDesc === 'string' ? textDesc : undefined);
      dbUpdates.ram_gb = attrs.ramGb ?? null;
      dbUpdates.storage_gb = attrs.storageGb ?? null;
      dbUpdates.screen_inches = attrs.screenInches ?? null;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        const fallbackUpdates: Record<string, unknown> = { ...dbUpdates };
        delete fallbackUpdates.ram_gb;
        delete fallbackUpdates.storage_gb;
        delete fallbackUpdates.screen_inches;
        const { error: fallbackError } = await supabase
          .from('products')
          .update(fallbackUpdates)
          .eq('id', id);
        if (fallbackError) throw fallbackError;
      }

      setProducts(current =>
        current.map(product =>
          product.id === id
            ? { ...product, ...updates, ...attrs, updatedAt: new Date() }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro ao atualizar produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(current => current.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProducts = async (ids: string[]) => {
    try {
      // Delete in batches of 50 to avoid URL length limits
      const batchSize = 50;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', batch);

        if (error) throw error;
      }

      setProducts(current => current.filter(product => !ids.includes(product.id)));
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Erro ao excluir produtos",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProductsByCategory = (category: Category) => {
    return products.filter(product => product.category === category);
  };

  const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const importProducts = async (
    newProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
    profitMargin: number
  ) => {
    try {
      const productsToInsert = newProducts.map(product => {
        const attrs = extractAttributes(product.name, product.description);
        return {
          name: product.name,
          description: product.description || null,
          price: product.costPrice ? product.costPrice * (1 + profitMargin / 100) : product.price,
          cost_price: product.costPrice || null,
          image: product.image || null,
          category: product.category,
          stock: product.stock,
          source_url: product.sourceUrl || null,
          ram_gb: attrs.ramGb ?? null,
          storage_gb: attrs.storageGb ?? null,
          screen_inches: attrs.screenInches ?? null,
        };
      });

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) {
        const fallback = newProducts.map(product => ({
          name: product.name,
          description: product.description || null,
          price: product.costPrice ? product.costPrice * (1 + profitMargin / 100) : product.price,
          cost_price: product.costPrice || null,
          image: product.image || null,
          category: product.category,
          stock: product.stock,
          source_url: product.sourceUrl || null,
        }));
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .insert(fallback)
          .select();
        if (fallbackError) throw fallbackError;
        const mappedProducts: Product[] = (fallbackData || []).map(p => {
          const attrs = extractAttributes(p.name, p.description || undefined);
          return {
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            price: Number(p.price),
            costPrice: p.cost_price ? Number(p.cost_price) : undefined,
            image: p.image || '/placeholder.svg',
            category: p.category as Category,
            stock: p.stock,
            sourceUrl: p.source_url || undefined,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
            ...attrs,
          };
        });
        setProducts(current => [...mappedProducts, ...current]);
        toast({
          title: "Produtos importados!",
          description: `${mappedProducts.length} produtos foram importados com sucesso.`,
        });
        return;
      }

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: Number(p.price),
        costPrice: p.cost_price ? Number(p.cost_price) : undefined,
        image: p.image || '/placeholder.svg',
        category: p.category as Category,
        stock: p.stock,
        sourceUrl: p.source_url || undefined,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        ramGb: typeof p.ram_gb === 'number' ? p.ram_gb : undefined,
        storageGb: typeof p.storage_gb === 'number' ? p.storage_gb : undefined,
        screenInches: typeof p.screen_inches === 'number' ? p.screen_inches : undefined,
        status: p.status || undefined,
        tags: Array.isArray(p.tags) ? p.tags : undefined,
        aiGenerated: typeof p.ai_generated === 'boolean' ? p.ai_generated : undefined,
        aiConfidence: p.ai_confidence || undefined,
      }));

      setProducts(current => [...mappedProducts, ...current]);

      toast({
        title: "Produtos importados!",
        description: `${mappedProducts.length} produtos foram importados com sucesso.`,
      });
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "Erro ao importar produtos",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    await fetchProducts();
  };

  const bulkImportProducts = async (
    newProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
  ) => {
    try {
      const payload = newProducts.map(p => ({
        name: p.name,
        description: p.description || null,
        price: p.price,
        cost_price: p.costPrice || null,
        image: p.image || null,
        category: p.category,
        stock: p.stock,
        source_url: p.sourceUrl || null,
        ram_gb: typeof p.ramGb === 'number' ? p.ramGb : null,
        storage_gb: typeof p.storageGb === 'number' ? p.storageGb : null,
        screen_inches: typeof p.screenInches === 'number' ? p.screenInches : null,
        status: p.status || null,
        tags: p.tags || null,
        ai_generated: typeof p.aiGenerated === 'boolean' ? p.aiGenerated : null,
        ai_confidence: p.aiConfidence || null,
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select();

      if (error) {
        const fallback = newProducts.map(p => ({
          name: p.name,
          description: p.description || null,
          price: p.price,
          cost_price: p.costPrice || null,
          image: p.image || null,
          category: p.category,
          stock: p.stock,
          source_url: p.sourceUrl || null,
        }));
        const { data: fbData, error: fbErr } = await supabase
          .from('products')
          .insert(fallback)
          .select();
        if (fbErr) throw fbErr;
        const mappedProducts: Product[] = (fbData || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || undefined,
          price: Number(p.price),
          costPrice: p.cost_price ? Number(p.cost_price) : undefined,
          image: p.image || '/placeholder.svg',
          category: p.category as Category,
          stock: p.stock,
          sourceUrl: p.source_url || undefined,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        }));
        setProducts(current => [...mappedProducts, ...current]);
        toast({ title: "Importação concluída!", description: `${mappedProducts.length} produtos inseridos.` });
        return;
      }

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: Number(p.price),
        costPrice: p.cost_price ? Number(p.cost_price) : undefined,
        image: p.image || '/placeholder.svg',
        category: p.category as Category,
        stock: p.stock,
        sourceUrl: p.source_url || undefined,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        ramGb: typeof p.ram_gb === 'number' ? p.ram_gb : undefined,
        storageGb: typeof p.storage_gb === 'number' ? p.storage_gb : undefined,
        screenInches: typeof p.screen_inches === 'number' ? p.screen_inches : undefined,
        status: p.status || undefined,
        tags: Array.isArray(p.tags) ? p.tags : undefined,
        aiGenerated: typeof p.ai_generated === 'boolean' ? p.ai_generated : undefined,
        aiConfidence: p.ai_confidence || undefined,
      }));

      setProducts(current => [...mappedProducts, ...current]);
      toast({ title: "Importação concluída!", description: `${mappedProducts.length} produtos inseridos.` });
    } catch (error) {
      console.error('Error bulk importing products:', error);
      toast({ title: "Erro na importação", variant: "destructive" });
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        getProductsByCategory,
        searchProducts,
        importProducts,
        bulkImportProducts,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
