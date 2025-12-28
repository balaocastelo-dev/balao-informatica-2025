import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  parent_id: string | null;
}

interface CategoryContextType {
  categories: CategoryData[];
  loading: boolean;
  addCategory: (name: string, slug: string, parentId?: string) => Promise<void>;
  updateCategory: (id: string, name: string, slug: string, parentId?: string | null) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string, slug: string, parentId?: string) => {
    try {
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.order_index)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('categories')
        .insert({ 
          name, 
          slug, 
          order_index: maxOrder,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      setCategories(current => [...current, data]);
      toast({ title: "Categoria adicionada!" });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro ao adicionar categoria",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, slug: string, parentId?: string | null) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, slug, parent_id: parentId === '' ? null : parentId })
        .eq('id', id);

      if (error) throw error;
      setCategories(current =>
        current.map(cat => cat.id === id ? { ...cat, name, slug, parent_id: parentId === '' ? null : parentId ?? cat.parent_id } : cat)
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

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
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
