import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PageBlock {
  id: string;
  block_type: string;
  title: string | null;
  category_slug: string | null;
  order_index: number;
  active: boolean;
}

interface PageBlocksContextType {
  blocks: PageBlock[];
  loading: boolean;
  addBlock: (blockType: string, title: string | null, categorySlug: string | null) => Promise<void>;
  updateBlock: (id: string, updates: Partial<PageBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (reorderedBlocks: PageBlock[]) => Promise<void>;
  refreshBlocks: () => Promise<void>;
}

const PageBlocksContext = createContext<PageBlocksContextType | undefined>(undefined);

export function PageBlocksProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error('Error fetching page blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const addBlock = async (blockType: string, title: string | null, categorySlug: string | null) => {
    try {
      const maxOrder = blocks.length > 0 
        ? Math.max(...blocks.map(b => b.order_index)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('page_blocks')
        .insert({ 
          block_type: blockType, 
          title, 
          category_slug: categorySlug,
          order_index: maxOrder 
        })
        .select()
        .single();

      if (error) throw error;
      setBlocks(current => [...current, data]);
      toast({ title: "Bloco adicionado!" });
    } catch (error) {
      console.error('Error adding block:', error);
      toast({ title: "Erro ao adicionar bloco", variant: "destructive" });
    }
  };

  const updateBlock = async (id: string, updates: Partial<PageBlock>) => {
    try {
      const { error } = await supabase
        .from('page_blocks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setBlocks(current =>
        current.map(block => block.id === id ? { ...block, ...updates } : block)
      );
      toast({ title: "Bloco atualizado!" });
    } catch (error) {
      console.error('Error updating block:', error);
      toast({ title: "Erro ao atualizar bloco", variant: "destructive" });
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('page_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBlocks(current => current.filter(block => block.id !== id));
      toast({ title: "Bloco removido!" });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({ title: "Erro ao remover bloco", variant: "destructive" });
    }
  };

  const reorderBlocks = async (reorderedBlocks: PageBlock[]) => {
    try {
      // Update order_index for all blocks
      const updates = reorderedBlocks.map((block, index) => ({
        id: block.id,
        order_index: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('page_blocks')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      setBlocks(reorderedBlocks.map((block, index) => ({ ...block, order_index: index + 1 })));
      toast({ title: "Ordem atualizada!" });
    } catch (error) {
      console.error('Error reordering blocks:', error);
      toast({ title: "Erro ao reordenar blocos", variant: "destructive" });
    }
  };

  const refreshBlocks = async () => {
    setLoading(true);
    await fetchBlocks();
  };

  return (
    <PageBlocksContext.Provider
      value={{
        blocks,
        loading,
        addBlock,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        refreshBlocks,
      }}
    >
      {children}
    </PageBlocksContext.Provider>
  );
}

export function usePageBlocks() {
  const context = useContext(PageBlocksContext);
  if (context === undefined) {
    throw new Error('usePageBlocks must be used within a PageBlocksProvider');
  }
  return context;
}
