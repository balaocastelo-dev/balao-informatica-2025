import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = {
  slug: string;
  name: string;
  route: string;
  order_index: number;
  active: boolean;
  image_url?: string | null;
};

type MenuItemsContextValue = {
  items: MenuItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  upsertItem: (item: MenuItem) => Promise<void>;
  updateItem: (slug: string, changes: Partial<MenuItem>) => Promise<void>;
};

const MenuItemsContext = createContext<MenuItemsContextValue | null>(null);

const DEFAULT_ITEMS: MenuItem[] = [
  { slug: "inicio", name: "Início", route: "/", order_index: 1, active: true },
  { slug: "assistencia-tecnica", name: "Assistência Técnica", route: "/manutencao", order_index: 2, active: true },
  { slug: "conserto-apple", name: "Conserto Apple", route: "/conserto-apple", order_index: 3, active: true },
  { slug: "conserto-console", name: "Conserto Console", route: "/conserto-console", order_index: 4, active: true },
  { slug: "fonte-de-notebook", name: "Fonte de Notebook", route: "/fonte-de-notebook", order_index: 5, active: true },
  { slug: "conserto-notebook", name: "Conserto de Notebook", route: "/conserto-de-notebook", order_index: 6, active: true },
  { slug: "notebook-seminovo", name: "Notebook Seminovo", route: "/notebook-seminovo-barato", order_index: 7, active: true },
  { slug: "montagem-setup-gamer", name: "Montagem Setup Gamer", route: "/setup-gamer", order_index: 8, active: true },
  { slug: "monte-seu-pc", name: "Monte seu PC", route: "/montar-pc", order_index: 9, active: true },
  { slug: "toner-para-impressora", name: "Toner para Impressora", route: "/toner-para-impressora", order_index: 10, active: true },
  { slug: "licencas-microsoft", name: "Licenças Microsoft", route: "/licencas-microsoft", order_index: 11, active: true },
  { slug: "criacao-site-ti", name: "Criação de Site e TI", route: "/criacao-de-site-e-servicos-ti", order_index: 12, active: true },
  { slug: "sobre", name: "Sobre Nós", route: "/sobre", order_index: 13, active: true },
  { slug: "consignacao", name: "Consignação", route: "/consignacao", order_index: 14, active: true },
  { slug: "lp-placa-de-video-promocao", name: "Placa de Vídeo Promoção", route: "/lp/placa-de-video-promocao", order_index: 15, active: true },
  { slug: "lp-promocao-pc-gamer", name: "Promoção PC Gamer", route: "/lp/promocao-pc-gamer", order_index: 16, active: true },
  { slug: "lp-conserto-android", name: "Conserto Android", route: "/lp/conserto-android", order_index: 17, active: true },
  { slug: "lp-acessorios-gamer", name: "Acessórios Gamer", route: "/lp/acessorios-gamer", order_index: 18, active: true },
  { slug: "lp-visita-tecnica", name: "Visita Técnica", route: "/lp/visita-tecnica", order_index: 19, active: true },
];

export function MenuItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("order_index", { ascending: true });
    if (!error && Array.isArray(data)) {
      const dbItems = data as MenuItem[];
      const merged = DEFAULT_ITEMS.map((def) => {
        const found = dbItems.find((d) => d.slug === def.slug);
        return found
          ? { ...def, ...found }
          : def;
      });
      setItems(merged);
    } else {
      setItems(DEFAULT_ITEMS);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const upsertItem = async (item: MenuItem) => {
    await supabase
      .from("menu_items")
      .upsert({
        slug: item.slug,
        name: item.name,
        route: item.route,
        order_index: item.order_index,
        active: item.active,
        image_url: item.image_url || null,
      }, { onConflict: "slug" });
    await refresh();
  };

  const updateItem = async (slug: string, changes: Partial<MenuItem>) => {
    const base = items.find((i) => i.slug === slug) || DEFAULT_ITEMS.find((i) => i.slug === slug);
    if (!base) return;
    await supabase
      .from("menu_items")
      .upsert({
        slug,
        name: changes.name ?? base.name,
        route: changes.route ?? base.route,
        order_index: changes.order_index ?? base.order_index,
        active: changes.active ?? base.active,
        image_url: changes.image_url ?? base.image_url ?? null,
      }, { onConflict: "slug" });
    await refresh();
  };

  const value = useMemo<MenuItemsContextValue>(
    () => ({ items, loading, refresh, upsertItem, updateItem }),
    [items, loading]
  );

  return <MenuItemsContext.Provider value={value}>{children}</MenuItemsContext.Provider>;
}

export function useMenuItems() {
  const ctx = useContext(MenuItemsContext);
  if (!ctx) throw new Error("MenuItemsContext not initialized");
  return ctx;
}
