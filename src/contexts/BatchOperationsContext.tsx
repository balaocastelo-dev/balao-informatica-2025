import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BatchProgress {
  current: number;
  total: number;
  label: string;
  isMinimized: boolean;
}

interface BatchOperationsContextType {
  batchProgress: BatchProgress | null;
  isRunning: boolean;
  toggleMinimized: () => void;
  runBatchPriceIncrease: (productIds: string[], products: { id: string; price: number }[], percent: number) => Promise<void>;
  runBatchPriceDiscount: (productIds: string[], products: { id: string; price: number }[], percent: number) => Promise<void>;
  runBatchDelete: (productIds: string[], onDeleteProduct: (id: string) => Promise<void>) => Promise<void>;
  runBatchCategoryChange: (productIds: string[], newCategory: string, onUpdateProduct: (id: string, data: any) => Promise<void>) => Promise<void>;
}

const BatchOperationsContext = createContext<BatchOperationsContextType | undefined>(undefined);

export function BatchOperationsProvider({ children }: { children: ReactNode }) {
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const toggleMinimized = useCallback(() => {
    setBatchProgress(prev => prev ? { ...prev, isMinimized: !prev.isMinimized } : null);
  }, []);

  const runBatchPriceIncrease = useCallback(async (
    productIds: string[], 
    products: { id: string; price: number }[], 
    percent: number
  ) => {
    if (isRunning) {
      toast({ title: 'Já existe uma operação em andamento', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    const multiplier = 1 + (percent / 100);
    const total = productIds.length;
    let updated = 0;

    setBatchProgress({ current: 0, total, label: `Aumentando preços em ${percent}%...`, isMinimized: false });

    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        await supabase.from('products').update({ price: newPrice }).eq('id', productId);
        updated++;
        setBatchProgress(prev => prev ? { ...prev, current: updated } : null);
      }
    }

    setBatchProgress(null);
    setIsRunning(false);
    toast({ title: `Preço de ${updated} produto(s) aumentado em ${percent}%!` });
  }, [isRunning]);

  const runBatchPriceDiscount = useCallback(async (
    productIds: string[], 
    products: { id: string; price: number }[], 
    percent: number
  ) => {
    if (isRunning) {
      toast({ title: 'Já existe uma operação em andamento', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    const multiplier = 1 - (percent / 100);
    const total = productIds.length;
    let updated = 0;

    setBatchProgress({ current: 0, total, label: `Aplicando desconto de ${percent}%...`, isMinimized: false });

    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        await supabase.from('products').update({ price: newPrice }).eq('id', productId);
        updated++;
        setBatchProgress(prev => prev ? { ...prev, current: updated } : null);
      }
    }

    setBatchProgress(null);
    setIsRunning(false);
    toast({ title: `Preço de ${updated} produto(s) reduzido em ${percent}%!` });
  }, [isRunning]);

  const runBatchDelete = useCallback(async (
    productIds: string[],
    onDeleteProduct: (id: string) => Promise<void>
  ) => {
    if (isRunning) {
      toast({ title: 'Já existe uma operação em andamento', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    const total = productIds.length;

    setBatchProgress({ current: 0, total, label: 'Excluindo produtos...', isMinimized: false });

    for (let i = 0; i < productIds.length; i++) {
      await onDeleteProduct(productIds[i]);
      setBatchProgress(prev => prev ? { ...prev, current: i + 1 } : null);
    }

    setBatchProgress(null);
    setIsRunning(false);
    toast({ title: `${total} produto(s) excluído(s)!` });
  }, [isRunning]);

  const runBatchCategoryChange = useCallback(async (
    productIds: string[],
    newCategory: string,
    onUpdateProduct: (id: string, data: any) => Promise<void>
  ) => {
    if (isRunning) {
      toast({ title: 'Já existe uma operação em andamento', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    const total = productIds.length;
    let updated = 0;

    setBatchProgress({ current: 0, total, label: `Alterando categoria...`, isMinimized: false });

    for (const productId of productIds) {
      await onUpdateProduct(productId, { category: newCategory });
      updated++;
      setBatchProgress(prev => prev ? { ...prev, current: updated } : null);
    }

    setBatchProgress(null);
    setIsRunning(false);
    toast({ title: `Categoria de ${updated} produto(s) alterada!` });
  }, [isRunning]);

  return (
    <BatchOperationsContext.Provider value={{
      batchProgress,
      isRunning,
      toggleMinimized,
      runBatchPriceIncrease,
      runBatchPriceDiscount,
      runBatchDelete,
      runBatchCategoryChange,
    }}>
      {children}
    </BatchOperationsContext.Provider>
  );
}

export function useBatchOperations() {
  const context = useContext(BatchOperationsContext);
  if (!context) {
    throw new Error('useBatchOperations must be used within a BatchOperationsProvider');
  }
  return context;
}