import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  parent_id: string | null;
  emoji?: string | null;
}

interface CategoryContextType {
  categories: CategoryData[];
  loading: boolean;
  addCategory: (name: string, slug: string, parentId?: string, emoji?: string) => Promise<CategoryData>;
  updateCategory: (id: string, name: string, slug: string, parentId?: string | null, emoji?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (reordered: CategoryData[]) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Verifique sua conexão ou tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string, slug: string, parentId?: string, emoji?: string) => {
    try {
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.order_index ?? 0)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('categories')
        .insert({ 
          name, 
          slug, 
          order_index: maxOrder,
          parent_id: parentId || null,
          emoji: emoji || null
        })
        .select()
        .single();

      if (error) throw error;
      setCategories(current => [...current, data]);
      toast({ title: "Categoria adicionada!" });
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message || "Verifique se o slug já existe ou tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, slug: string, parentId?: string | null, emoji?: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name, 
          slug, 
          parent_id: parentId === '' ? null : parentId,
          emoji: emoji || null
        })
        .eq('id', id);

      if (error) throw error;
      setCategories(current =>
        current.map(cat => cat.id === id ? { 
          ...cat, 
          name, 
          slug, 
          parent_id: parentId === '' ? null : parentId ?? cat.parent_id,
          emoji: emoji || null
        } : cat)
      );
      toast({ title: "Categoria atualizada!" });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro ao atualizar categoria",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(current => current.filter(cat => cat.id !== id));
      toast({ title: "Categoria excluída!" });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro ao excluir categoria",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshCategories = async () => {
    setLoading(true);
    await fetchCategories();
  };
  
  const reorderCategories = async (reordered: CategoryData[]) => {
    try {
      for (let i = 0; i < reordered.length; i++) {
        const cat = reordered[i];
        await supabase
          .from('categories')
          .update({ order_index: i + 1 })
          .eq('id', cat.id);
      }
      setCategories(reordered.map((c, i) => ({ ...c, order_index: i + 1 })));
      toast({ title: "Ordem de categorias atualizada!" });
    } catch {
      toast({ title: "Erro ao reordenar categorias", variant: "destructive" });
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
