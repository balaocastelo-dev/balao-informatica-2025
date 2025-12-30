import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type LandingPageConfig = {
  pageKey: string;
  gridQuery: string;
  fallbackQueries: string[];
};

export type LandingPageMeta = {
  pageKey: string;
  label: string;
  route: string;
  active: boolean;
  gridQuery: string;
  fallbackQueries: string[];
};

type LandingPageConfigContextValue = {
  configs: Record<string, LandingPageConfig>;
  pages: LandingPageMeta[];
  loading: boolean;
  refresh: () => Promise<void>;
  upsertConfig: (config: LandingPageConfig) => Promise<void>;
  createPage: (meta: Omit<LandingPageMeta, "active"> & { active?: boolean }) => Promise<void>;
  updatePage: (pageKey: string, updates: Partial<LandingPageMeta>) => Promise<void>;
  deletePage: (pageKey: string) => Promise<void>;
  clonePage: (sourceKey: string, newKey: string, newLabel: string, newRoute: string) => Promise<void>;
};

const LandingPageConfigContext = createContext<LandingPageConfigContextValue | null>(null);

export function LandingPageConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, LandingPageConfig>>({});
  const [pages, setPages] = useState<LandingPageMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const lp = await supabase.from("landing_pages").select("*");
      if (!lp.error && lp.data) {
        const nextPages: LandingPageMeta[] = (lp.data || []).map((row: any) => ({
          pageKey: row.page_key,
          label: row.label,
          route: row.route,
          active: !!row.active,
          gridQuery: row.grid_query || "",
          fallbackQueries: Array.isArray(row.fallback_queries) ? row.fallback_queries : [],
        }));
        setPages(nextPages);
        const nextConfigs: Record<string, LandingPageConfig> = {};
        for (const p of nextPages) {
          nextConfigs[p.pageKey] = { pageKey: p.pageKey, gridQuery: p.gridQuery, fallbackQueries: p.fallbackQueries };
        }
        setConfigs(nextConfigs);
      } else {
        const c = await supabase.from("landing_page_configs").select("*");
        if (c.error) throw c.error;
        const next: Record<string, LandingPageConfig> = {};
        for (const row of c.data || []) {
          next[row.page_key] = {
            pageKey: row.page_key,
            gridQuery: row.grid_query || "",
            fallbackQueries: Array.isArray(row.fallback_queries) ? row.fallback_queries : [],
          };
        }
        setConfigs(next);
      }
    } catch (error: any) {
      const message = String(error?.message || error || "");
      toast({ title: "Erro ao carregar configurações de landing pages", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const upsertConfig = async (config: LandingPageConfig) => {
    try {
      const payload = {
        page_key: config.pageKey,
        grid_query: config.gridQuery || "",
        fallback_queries: config.fallbackQueries || [],
        updated_at: new Date().toISOString(),
      };

      let res = await supabase.from("landing_pages").upsert(
        { ...payload, label: config.pageKey, route: `/lp/${config.pageKey}`, active: true },
        { onConflict: "page_key" }
      );
      if (res.error) {
        const alt = await supabase.from("landing_page_configs").upsert(payload, { onConflict: "page_key" });
        if (alt.error) throw alt.error;
      }

      setConfigs((current) => ({
        ...current,
        [config.pageKey]: { ...config, gridQuery: config.gridQuery || "", fallbackQueries: config.fallbackQueries || [] },
      }));
      toast({ title: "Config salva!" });
    } catch (error: any) {
      const message = String(error?.message || error || "");
      toast({ title: "Erro ao salvar config", description: message, variant: "destructive" });
    }
  };

  const createPage = async (meta: Omit<LandingPageMeta, "active"> & { active?: boolean }) => {
    try {
      const payload = {
        page_key: meta.pageKey,
        label: meta.label,
        route: meta.route,
        active: meta.active ?? true,
        grid_query: meta.gridQuery || "",
        fallback_queries: meta.fallbackQueries || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("landing_pages").upsert(payload, { onConflict: "page_key" });
      if (error) throw error;
      setPages((cur) => [
        ...cur.filter((p) => p.pageKey !== meta.pageKey),
        { pageKey: meta.pageKey, label: meta.label, route: meta.route, active: payload.active, gridQuery: payload.grid_query, fallbackQueries: payload.fallback_queries },
      ]);
      setConfigs((current) => ({
        ...current,
        [meta.pageKey]: { pageKey: meta.pageKey, gridQuery: payload.grid_query, fallbackQueries: payload.fallback_queries },
      }));
      toast({ title: "Landing criada!" });
    } catch (error: any) {
      const message = String(error?.message || error || "");
      toast({ title: "Erro ao criar landing", description: message, variant: "destructive" });
    }
  };

  const updatePage = async (pageKey: string, updates: Partial<LandingPageMeta>) => {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.label !== undefined) payload.label = updates.label;
      if (updates.route !== undefined) payload.route = updates.route;
      if (updates.active !== undefined) payload.active = updates.active;
      if (updates.gridQuery !== undefined) payload.grid_query = updates.gridQuery;
      if (updates.fallbackQueries !== undefined) payload.fallback_queries = updates.fallbackQueries;
      const { error } = await supabase.from("landing_pages").update(payload).eq("page_key", pageKey);
      if (error) throw error;
      setPages((cur) =>
        cur.map((p) =>
          p.pageKey === pageKey
            ? {
                ...p,
                label: updates.label ?? p.label,
                route: updates.route ?? p.route,
                active: updates.active ?? p.active,
                gridQuery: updates.gridQuery ?? p.gridQuery,
                fallbackQueries: updates.fallbackQueries ?? p.fallbackQueries,
              }
            : p
        )
      );
      if (updates.gridQuery !== undefined || updates.fallbackQueries !== undefined) {
        setConfigs((current) => ({
          ...current,
          [pageKey]: {
            pageKey,
            gridQuery: updates.gridQuery ?? current[pageKey]?.gridQuery ?? "",
            fallbackQueries: updates.fallbackQueries ?? current[pageKey]?.fallbackQueries ?? [],
          },
        }));
      }
      toast({ title: "Landing atualizada!" });
    } catch (error: any) {
      const message = String(error?.message || error || "");
      toast({ title: "Erro ao atualizar landing", description: message, variant: "destructive" });
    }
  };

  const deletePage = async (pageKey: string) => {
    try {
      const { error } = await supabase.from("landing_pages").delete().eq("page_key", pageKey);
      if (error) throw error;
      setPages((cur) => cur.filter((p) => p.pageKey !== pageKey));
      setConfigs((current) => {
        const next = { ...current };
        delete next[pageKey];
        return next;
      });
      toast({ title: "Landing excluída!" });
    } catch (error: any) {
      const message = String(error?.message || error || "");
      toast({ title: "Erro ao excluir landing", description: message, variant: "destructive" });
    }
  };

  const clonePage = async (sourceKey: string, newKey: string, newLabel: string, newRoute: string) => {
    const base = pages.find((p) => p.pageKey === sourceKey);
    const cfg = configs[sourceKey];
    const gridQuery = cfg?.gridQuery || base?.gridQuery || "";
    const fallbackQueries = cfg?.fallbackQueries || base?.fallbackQueries || [];
    await createPage({ pageKey: newKey, label: newLabel, route: newRoute, gridQuery, fallbackQueries });
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<LandingPageConfigContextValue>(
    () => ({ configs, pages, loading, refresh, upsertConfig, createPage, updatePage, deletePage, clonePage }),
    [configs, pages, loading]
  );

  return <LandingPageConfigContext.Provider value={value}>{children}</LandingPageConfigContext.Provider>;
}

export function useLandingPageConfigs() {
  const ctx = useContext(LandingPageConfigContext);
  if (!ctx) throw new Error("useLandingPageConfigs must be used within LandingPageConfigProvider");
  return ctx;
}

export function useLandingPageConfig(pageKey: string, fallback: LandingPageConfig) {
  const { configs, loading } = useLandingPageConfigs();
  const resolved = configs[pageKey] || fallback;
  return { config: resolved, loading };
}
