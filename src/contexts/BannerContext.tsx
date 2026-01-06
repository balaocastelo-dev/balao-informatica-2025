import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BannerData {
  id: string;
  image_url: string;
  title?: string;
  link?: string;
  order_index: number;
  active: boolean;
}

interface BannerContextType {
  banners: BannerData[];
  loading: boolean;
  addBanner: (imageUrl: string, title?: string, link?: string) => Promise<void>;
  updateBanner: (id: string, updates: Partial<BannerData>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Erro ao carregar banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async (imageUrl: string, title?: string, link?: string) => {
    try {
      const maxOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.order_index)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('banners')
        .insert({ 
          image_url: imageUrl, 
          title: title || null, 
          link: link || null, 
          order_index: maxOrder,
          active: true 
        })
        .select()
        .single();

      if (error) throw error;
      setBanners(current => [...current, data]);
      toast({ title: "Banner adicionado!" });
    } catch (error) {
      console.error('Error adding banner:', error);
      toast({
        title: "Erro ao adicionar banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, updates: Partial<BannerData>) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setBanners(current =>
        current.map(banner => banner.id === id ? { ...banner, ...updates } : banner)
      );
      toast({ title: "Banner atualizado!" });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Erro ao atualizar banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBanners(current => current.filter(banner => banner.id !== id));
      toast({ title: "Banner excluído!" });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Erro ao excluir banner",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshBanners = async () => {
    setLoading(true);
    await fetchBanners();
  };

  return (
    <BannerContext.Provider
      value={{
        banners,
        loading,
        addBanner,
        updateBanner,
        deleteBanner,
        refreshBanners,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
}
