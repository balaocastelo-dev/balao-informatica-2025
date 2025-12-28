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
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        })
        .select()
        .single();

      if (error) throw error;

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

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setProducts(current =>
        current.map(product =>
          product.id === id
            ? { ...product, ...updates, updatedAt: new Date() }
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
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const ngrams = (s: string) => {
      const t = s.replace(/\s+/g, '');
      const res: string[] = [];
      for (let i = 0; i < Math.max(1, t.length - 2); i++) res.push(t.slice(i, i + 3));
      if (res.length === 0 && t.length > 0) res.push(t);
      return res;
    };
    const jaccard = (a: string[], b: string[]) => {
      const sa = new Set(a);
      const sb = new Set(b);
      let inter = 0;
      for (const x of sa) if (sb.has(x)) inter++;
      const union = sa.size + sb.size - inter;
      return union === 0 ? 0 : inter / union;
    };
    const levenshtein = (a: string, b: string) => {
      const m = a.length, n = b.length;
      if (m === 0) return n;
      if (n === 0) return m;
      const dp = Array.from({ length: n + 1 }, (_, j) => j);
      for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
          const temp = dp[j];
          dp[j] = Math.min(
            dp[j] + 1,
            dp[j - 1] + 1,
            prev + (a[i - 1] === b[j - 1] ? 0 : 1)
          );
          prev = temp;
        }
      }
      return dp[n];
    };
    const nq = normalize(query);
    if (!nq) return products;
    const qTokens = nq.split(' ');
    const qTris = ngrams(nq);
    const scored = products.map(p => {
      const name = normalize(p.name);
      const desc = normalize(p.description || '');
      const cat = normalize(p.category);
      let score = 0;
      if (name.includes(nq)) score = Math.max(score, 1);
      if (name.startsWith(nq)) score = Math.max(score, 0.95);
      const nameWords = name.split(' ');
      for (const t of qTokens) {
        for (const w of nameWords) {
          const d = levenshtein(t, w);
          const s = 1 - d / Math.max(t.length, w.length, 1);
          score = Math.max(score, 0.9 * s);
        }
      }
      const triSimName = jaccard(qTris, ngrams(name));
      score = Math.max(score, 0.8 * triSimName);
      const triSimDesc = jaccard(qTris, ngrams(desc));
      score = Math.max(score, 0.4 * triSimDesc);
      if (cat.includes(nq)) score = Math.max(score, 0.7);
      const triSimCat = jaccard(qTris, ngrams(cat));
      score = Math.max(score, 0.5 * triSimCat);
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const results = scored.filter(s => s.score > 0.15).map(s => s.p);
    if (results.length > 0) return results;
    return scored.slice(0, Math.min(24, scored.length)).map(s => s.p);
  };

  const importProducts = async (
    newProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
    profitMargin: number
  ) => {
    try {
      const productsToInsert = newProducts.map(product => ({
        name: product.name,
        description: product.description || null,
        price: product.costPrice ? product.costPrice * (1 + profitMargin / 100) : product.price,
        cost_price: product.costPrice || null,
        image: product.image || null,
        category: product.category,
        stock: product.stock,
        source_url: product.sourceUrl || null,
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) throw error;

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
