import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  reprocessProductsWithAI: (ids: string[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  getProductsByCategory: (category: Category) => Product[];
  searchProducts: (query: string) => Product[];
  importProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[], profitMargin: number) => Promise<void>;
  bulkImportProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[], onProgress?: (current: number, total: number) => void) => Promise<void>;
  refreshProducts: () => Promise<void>;
  isImporting: boolean;
  importProgress: number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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
            status: p.status || undefined,
            tags: Array.isArray(p.tags) ? p.tags : undefined,
            aiGenerated: typeof p.ai_generated === 'boolean' ? p.ai_generated : undefined,
            aiConfidence: p.ai_confidence || undefined,
            additionalCategories: p.additional_categories || [],
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
          tags: product.tags || null,
          additional_categories: product.additionalCategories || null,
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
            tags: product.tags || null,
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
        try {
          const ribbons = Array.isArray(product.tags)
            ? product.tags
                .filter((t) => typeof t === 'string' && t.startsWith('badge:'))
                .map((t) => t.replace(/^badge:/, '').trim())
                .filter((t) => t.length > 0)
            : [];
          if (ribbons.length > 0) {
            await supabase
              .from('product_ribbons')
              .upsert(
                ribbons.map((r) => ({
                  product_id: fallbackData.id,
                  ribbon_type: r,
                  is_active: true,
                })),
                { onConflict: 'product_id,ribbon_type' }
              );
          }
        } catch {
        }
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
        additionalCategories: data.additional_categories || [],
      };

      setProducts(current => [newProduct, ...current]);
      try {
        const ribbons = Array.isArray(product.tags)
          ? product.tags
              .filter((t) => typeof t === 'string' && t.startsWith('badge:'))
              .map((t) => t.replace(/^badge:/, '').trim())
              .filter((t) => t.length > 0)
          : [];
        if (ribbons.length > 0) {
          await supabase
            .from('product_ribbons')
            .upsert(
              ribbons.map((r) => ({
                product_id: data.id,
                ribbon_type: r,
                is_active: true,
              })),
              { onConflict: 'product_id,ribbon_type' }
            );
        }
      } catch {
      }
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
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.aiGenerated !== undefined) dbUpdates.ai_generated = updates.aiGenerated;
      if (updates.aiConfidence !== undefined) dbUpdates.ai_confidence = updates.aiConfidence;
      if (updates.additionalCategories !== undefined) dbUpdates.additional_categories = updates.additionalCategories;
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

  const reprocessProductsWithAI = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const product = products.find(p => p.id === id);
        if (!product) continue;
        const name = product.name;
        const isNotebook = /\b(notebook|laptop)\b/i.test(name);
        const isMonitor = /\b(monitor|tela)\b/i.test(name);
        const attrs = extractAttributes(name);
        const confident = !!(attrs.ramGb || attrs.storageGb || attrs.screenInches);
        const short =
          isNotebook
            ? `Notebook ${name} pensado para produtividade e mobilidade.`
            : isMonitor
            ? `Monitor ${name} com visual moderno para um setup organizado.`
            : `Produto ${name} com excelente custo-benefício. Ideal para uso diário e tarefas comuns.`;
        await updateProduct(id, {
          description: short,
          aiGenerated: true,
          aiConfidence: confident ? 'medium' : 'low',
          ...attrs,
        });
      }
      toast({ title: "Produtos reprocessados com IA" });
    } catch (error) {
      console.error('Error reprocessing with AI:', error);
      toast({ title: "Erro ao reprocessar com IA", variant: "destructive" });
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
    return products.filter(product => 
      product.category === category || 
      product.additionalCategories?.includes(category)
    );
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
          tags: product.tags || null,
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
          tags: product.tags || null,
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
        try {
          for (const row of fallbackData || []) {
            const ribbons = Array.isArray(row.tags)
              ? row.tags
                  .filter((t: any) => typeof t === 'string' && t.startsWith('badge:'))
                  .map((t: string) => t.replace(/^badge:/, '').trim())
                  .filter((t: string) => t.length > 0)
              : [];
            if (ribbons.length > 0) {
              await supabase
                .from('product_ribbons')
                .upsert(
                  ribbons.map((r) => ({
                    product_id: row.id,
                    ribbon_type: r,
                    is_active: true,
                  })),
                  { onConflict: 'product_id,ribbon_type' }
                );
            }
          }
        } catch {
        }
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
      try {
        for (const row of data || []) {
          const ribbons = Array.isArray(row.tags)
            ? row.tags
                .filter((t: any) => typeof t === 'string' && t.startsWith('badge:'))
                .map((t: string) => t.replace(/^badge:/, '').trim())
                .filter((t: string) => t.length > 0)
            : [];
          if (ribbons.length > 0) {
            await supabase
              .from('product_ribbons')
              .upsert(
                ribbons.map((r) => ({
                  product_id: row.id,
                  ribbon_type: r,
                  is_active: true,
                })),
                { onConflict: 'product_id,ribbon_type' }
              );
          }
        }
      } catch {
      }

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
    onProgress?: (current: number, total: number) => void,
  ) => {
    if (isImporting) {
      toast({ title: "Importação já em andamento", description: "Aguarde o término da importação atual." });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const total = newProducts.length;
      const accepted: any[] = [];
      const rejected: { index: number; reason: string }[] = [];
      const seenNames = new Set<string>();
      const seenUrls = new Set<string>();

      for (let i = 0; i < total; i++) {
        const p = newProducts[i];
        const name = String(p.name || "").trim();
        const priceOk = typeof p.price === "number" && !Number.isNaN(p.price) && p.price > 0;
        const category = String(p.category || "").trim();
        if (!name) {
          rejected.push({ index: i, reason: "Nome vazio" });
          continue;
        }
        if (!priceOk) {
          rejected.push({ index: i, reason: "Preço inválido" });
          continue;
        }
        if (!category) {
          rejected.push({ index: i, reason: "Categoria vazia" });
          continue;
        }
        if (seenNames.has(name) && (!p.sourceUrl || !p.sourceUrl.trim())) {
          rejected.push({ index: i, reason: "Duplicado pelo nome no lote" });
          continue;
        }
        if (p.sourceUrl && seenUrls.has(p.sourceUrl)) {
          rejected.push({ index: i, reason: "Duplicado pela URL no lote" });
          continue;
        }
        seenNames.add(name);
        if (p.sourceUrl) seenUrls.add(p.sourceUrl);
        const safeTags = Array.isArray(p.tags)
          ? p.tags.filter((t) => typeof t === "string" && t.trim().length > 0)
          : [];
        accepted.push({
          name,
          description: p.description || null,
          price: p.price,
          cost_price: p.costPrice || null,
          image: p.image || null,
          category,
          stock: typeof p.stock === "number" ? p.stock : 0,
          source_url: p.sourceUrl || null,
          ram_gb: typeof p.ramGb === 'number' ? p.ramGb : null,
          storage_gb: typeof p.storageGb === 'number' ? p.storageGb : null,
          screen_inches: typeof p.screenInches === 'number' ? p.screenInches : null,
          status: p.status || null,
          tags: safeTags.length > 0 ? safeTags : null,
          ai_generated: typeof p.aiGenerated === 'boolean' ? p.aiGenerated : null,
          ai_confidence: p.aiConfidence || null,
        });
      }

      if (rejected.length > 0) {
        console.info("[BulkImport] Rejeitados:", rejected);
        toast({
          title: "Itens rejeitados na validação",
          description: `${rejected.length} itens foram descartados`,
        });
      }

      const payload = accepted;
      let successCount = 0;
      let errorCount = 0;

      const ribbonsFromTags = (tags: string[] | null): string[] => {
        if (!Array.isArray(tags)) return [];
        return tags
          .filter((t) => typeof t === "string" && t.startsWith("badge:"))
          .map((t) => t.replace(/^badge:/, "").trim())
          .filter((s) => s.length > 0);
      };

      for (let i = 0; i < payload.length; i++) {
        let item = payload[i];

        if (item.source_url) {
          try {
            type ScrapeExtractResult = {
              produto?: {
                ficha_tecnica?: string;
                sobre_produto?: string;
              };
            };
            const asScrapeResult = (value: unknown): ScrapeExtractResult | null => {
              if (!value || typeof value !== 'object') return null;
              if (!('produto' in value)) return null;
              const produto = (value as { produto?: unknown }).produto;
              if (!produto || typeof produto !== 'object') return { produto: undefined };
              const p = produto as Record<string, unknown>;
              return {
                produto: {
                  ficha_tecnica: typeof p.ficha_tecnica === 'string' ? p.ficha_tecnica : undefined,
                  sobre_produto: typeof p.sobre_produto === 'string' ? p.sobre_produto : undefined,
                },
              };
            };
            const { data: scrapeData } = await supabase.functions.invoke('scrape-extract-product', {
              body: { url: item.source_url, name: item.name },
            });
            const parsed = asScrapeResult(scrapeData);
            const sobre = parsed?.produto?.sobre_produto;
            if (sobre && !item.description) {
              item = { ...item, description: sobre.trim() };
            }
          } catch (err) {
            console.error("[BulkImport] Erro ao enriquecer descrição:", err);
          }
        }

        const { data: singleData, error: singleError } = await supabase
          .from('products')
          .insert(item)
          .select()
          .single();

        if (singleData) {
          try {
            const ribbons = ribbonsFromTags(item.tags as any);
            if (ribbons.length > 0) {
              await supabase
                .from('product_ribbons')
                .upsert(
                  ribbons.map((r) => ({
                    product_id: singleData.id,
                    ribbon_type: r,
                    is_active: true,
                  })),
                  { onConflict: 'product_id,ribbon_type' }
                );
            }
          } catch (err) {
            console.error("[BulkImport] Erro ao persistir ribbons (insert):", err);
          }
          successCount++;
          const newProduct: Product = {
            id: singleData.id,
            name: singleData.name,
            description: singleData.description || undefined,
            price: Number(singleData.price),
            costPrice: singleData.cost_price ? Number(singleData.cost_price) : undefined,
            image: singleData.image || '/placeholder.svg',
            category: singleData.category as Category,
            stock: singleData.stock,
            sourceUrl: singleData.source_url || undefined,
            createdAt: new Date(singleData.created_at),
            updatedAt: new Date(singleData.updated_at),
            ramGb: typeof singleData.ram_gb === 'number' ? singleData.ram_gb : undefined,
            storageGb: typeof singleData.storage_gb === 'number' ? singleData.storage_gb : undefined,
            screenInches: typeof singleData.screen_inches === 'number' ? singleData.screen_inches : undefined,
            status: singleData.status || undefined,
            tags: Array.isArray(singleData.tags) ? singleData.tags : undefined,
            aiGenerated: typeof singleData.ai_generated === 'boolean' ? singleData.ai_generated : undefined,
            aiConfidence: singleData.ai_confidence || undefined,
          };
          
          setProducts(current => [newProduct, ...current]);
        } else {
          const isDuplicate = singleError?.code === '23505';
          
          if (isDuplicate) {
            let existingProduct = null;

            if (item.source_url) {
              const { data } = await supabase
                .from('products')
                .select('id')
                .eq('source_url', item.source_url)
                .maybeSingle();
              existingProduct = data;
            }

            if (!existingProduct && item.name) {
              const { data } = await supabase
                .from('products')
                .select('id')
                .eq('name', item.name)
                .maybeSingle();
              existingProduct = data;
            }

            if (existingProduct) {
              const updatePayload = {
                name: item.name,
                price: item.price,
                category: item.category,
                tags: item.tags,
                image: item.image || undefined, 
              };

              const { error: updateError } = await supabase
                .from('products')
                .update(updatePayload)
                .eq('id', existingProduct.id);

              if (!updateError) {
                try {
                  const ribbons = ribbonsFromTags(item.tags as any);
                  if (ribbons.length > 0) {
                    await supabase
                      .from('product_ribbons')
                      .upsert(
                        ribbons.map((r) => ({
                          product_id: existingProduct.id,
                          ribbon_type: r,
                          is_active: true,
                        })),
                        { onConflict: 'product_id,ribbon_type' }
                      );
                  }
                } catch (err) {
                  console.error("[BulkImport] Erro ao persistir ribbons (update):", err);
                }
                successCount++;
                continue;
              } else {
                console.error('Error updating existing product:', item.name, updateError);
              }
            } else {
              console.error('Duplicate error but could not find existing product to update:', item.name);
            }
          }

          console.error('Error importing item:', item.name, singleError);
          const simpleItem = {
            name: item.name,
            description: item.description,
            price: item.price,
            cost_price: item.cost_price,
            image: item.image,
            category: item.category,
            stock: item.stock,
            source_url: item.source_url,
            tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : null
          };
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .insert(simpleItem)
            .select()
            .single();

          if (fallbackError) {
            console.error('Error importing item (fallback):', item.name, fallbackError);
          }

          if (fallbackData) {
            try {
              const ribbons = ribbonsFromTags(item.tags as any);
              if (ribbons.length > 0) {
                await supabase
                  .from('product_ribbons')
                  .upsert(
                    ribbons.map((r) => ({
                      product_id: fallbackData.id,
                      ribbon_type: r,
                      is_active: true,
                    })),
                    { onConflict: 'product_id,ribbon_type' }
                  );
              }
            } catch (err) {
              console.error("[BulkImport] Erro ao persistir ribbons (fallback):", err);
            }
            successCount++;
            setProducts(current => [{
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
            }, ...current]);
          } else {
            errorCount++;
          }
        }

        const current = i + 1;
        setImportProgress(Math.round((current / payload.length) * 100));
        if (onProgress) {
          onProgress(current, payload.length);
        }
        if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }

      toast({ 
        title: "Importação finalizada", 
        description: `Sucesso: ${successCount}. Falhas: ${errorCount}.`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
      console.info("[BulkImport] Finalizado:", { successCount, errorCount, totalAccepted: payload.length, totalRejected: rejected.length });
      
      await refreshProducts();

    } catch (error) {
      console.error('Error bulk importing products:', error);
      toast({ title: "Erro crítico na importação", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        reprocessProductsWithAI,
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
