import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type LandingPageConfig = {
  pageKey: string;
  gridQuery: string;
  fallbackQueries: string[];
};

type LandingPageConfigContextValue = {
  configs: Record<string, LandingPageConfig>;
  loading: boolean;
  refresh: () => Promise<void>;
  upsertConfig: (config: LandingPageConfig) => Promise<void>;
};

const LandingPageConfigContext = createContext<LandingPageConfigContextValue | null>(null);

export function LandingPageConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, LandingPageConfig>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("landing_page_configs").select("*");
      if (error) throw error;

      const next: Record<string, LandingPageConfig> = {};
      for (const row of data || []) {
        next[row.page_key] = {
          pageKey: row.page_key,
          gridQuery: row.grid_query || "",
          fallbackQueries: Array.isArray(row.fallback_queries) ? row.fallback_queries : [],
        };
      }
      setConfigs(next);
    } catch (error: any) {
      const message = String(error?.message || error || "");
      if (message.includes("Could not find the table") || error?.code === "42P01") {
        toast({
          title: "Configuração do Supabase",
          description: "Tabela landing_page_configs não existe no banco. Rode as migrations do projeto.",
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({ title: "Erro ao carregar configs das landing pages", variant: "destructive" });
      }
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

      const { error } = await supabase.from("landing_page_configs").upsert(payload, { onConflict: "page_key" });
      if (error) throw error;

      setConfigs((current) => ({
        ...current,
        [config.pageKey]: { ...config, gridQuery: config.gridQuery || "", fallbackQueries: config.fallbackQueries || [] },
      }));
      toast({ title: "Config salva!" });
    } catch (error: any) {
      const message = String(error?.message || error || "");
      if (message.includes("Could not find the table") || error?.code === "42P01") {
        toast({
          title: "Tabela ausente",
          description: "landing_page_configs não existe no banco. Rode as migrations.",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }
      toast({ title: "Erro ao salvar config", variant: "destructive" });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<LandingPageConfigContextValue>(() => ({ configs, loading, refresh, upsertConfig }), [configs, loading]);

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

