import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandingPageConfigs, type LandingPageConfig } from "@/contexts/LandingPageConfigContext";

type LandingDef = {
  pageKey: string;
  label: string;
  route: string;
  defaultConfig: LandingPageConfig;
};

const LANDINGS: LandingDef[] = [
  {
    pageKey: "manutencao",
    label: "Assistência Técnica (Manutenção)",
    route: "/manutencao",
    defaultConfig: { pageKey: "manutencao", gridQuery: "manutenção", fallbackQueries: ["upgrade", "ssd", "memória", "memoria"] },
  },
  {
    pageKey: "conserto-apple",
    label: "Conserto Apple",
    route: "/conserto-apple",
    defaultConfig: { pageKey: "conserto-apple", gridQuery: "iphone", fallbackQueries: ["ipad", "macbook", "imac", "airpods", "apple"] },
  },
  {
    pageKey: "conserto-console",
    label: "Conserto Console",
    route: "/conserto-console",
    defaultConfig: {
      pageKey: "conserto-console",
      gridQuery: "console",
      fallbackQueries: ["playstation", "ps5", "ps4", "xbox", "nintendo", "switch", "controle"],
    },
  },
  {
    pageKey: "fonte-de-notebook",
    label: "Fonte de Notebook",
    route: "/fonte-de-notebook",
    defaultConfig: { pageKey: "fonte-de-notebook", gridQuery: "fonte notebook", fallbackQueries: ["carregador", "usb-c", "magsafe", "notebook"] },
  },
  {
    pageKey: "conserto-de-notebook",
    label: "Conserto de Notebook",
    route: "/conserto-de-notebook",
    defaultConfig: {
      pageKey: "conserto-de-notebook",
      gridQuery: "notebook",
      fallbackQueries: ["ssd", "memória", "memoria", "fonte notebook", "carregador"],
    },
  },
  {
    pageKey: "notebook-seminovo-barato",
    label: "Notebook Seminovo Barato",
    route: "/notebook-seminovo-barato",
    defaultConfig: { pageKey: "notebook-seminovo-barato", gridQuery: "seminovo", fallbackQueries: ["notebook", "laptop", "ssd", "memoria"] },
  },
  {
    pageKey: "montagem-setup-gamer",
    label: "Montagem Setup Gamer",
    route: "/montagem-setup-gamer",
    defaultConfig: {
      pageKey: "montagem-setup-gamer",
      gridQuery: "pc gamer",
      fallbackQueries: ["placa de vídeo", "rtx", "radeon", "processador", "memoria", "ssd", "fonte", "gabinete", "monitor"],
    },
  },
  {
    pageKey: "toner-para-impressora",
    label: "Toner para Impressora",
    route: "/toner-para-impressora",
    defaultConfig: {
      pageKey: "toner-para-impressora",
      gridQuery: "toner",
      fallbackQueries: ["cartucho", "laserjet", "brother", "hp", "samsung", "canon"],
    },
  },
  {
    pageKey: "licencas-microsoft",
    label: "Licenças Microsoft",
    route: "/licencas-microsoft",
    defaultConfig: {
      pageKey: "licencas-microsoft",
      gridQuery: "microsoft",
      fallbackQueries: ["windows", "office", "365", "server", "sql", "licença", "licenca"],
    },
  },
  {
    pageKey: "criacao-de-site-e-servicos-ti",
    label: "Criação de Site e Serviços de T.I.",
    route: "/criacao-de-site-e-servicos-ti",
    defaultConfig: {
      pageKey: "criacao-de-site-e-servicos-ti",
      gridQuery: "microsoft",
      fallbackQueries: ["office", "windows", "roteador", "switch", "wifi", "cabo", "notebook", "ssd", "memoria"],
    },
  },
];

const parseFallback = (raw: string) =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

export function LandingPagesManager() {
  const { configs, loading, upsertConfig, refresh } = useLandingPageConfigs();
  const [draft, setDraft] = useState<Record<string, { gridQuery: string; fallback: string }>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, { gridQuery: string; fallback: string }> = {};
    for (const def of LANDINGS) {
      const resolved = configs[def.pageKey] || def.defaultConfig;
      next[def.pageKey] = {
        gridQuery: resolved.gridQuery,
        fallback: (resolved.fallbackQueries || []).join(", "),
      };
    }
    setDraft(next);
  }, [configs]);

  const rows = useMemo(() => LANDINGS, []);

  const handleSave = async (def: LandingDef) => {
    const d = draft[def.pageKey] || { gridQuery: "", fallback: "" };
    setSavingKey(def.pageKey);
    await upsertConfig({
      pageKey: def.pageKey,
      gridQuery: d.gridQuery || "",
      fallbackQueries: parseFallback(d.fallback || ""),
    });
    setSavingKey(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">Configure o filtro do grid de produtos de cada landing.</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          Recarregar
        </Button>
      </div>

      <div className="grid gap-4">
        {rows.map((def) => {
          const d = draft[def.pageKey] || { gridQuery: def.defaultConfig.gridQuery, fallback: def.defaultConfig.fallbackQueries.join(", ") };
          const isSaving = savingKey === def.pageKey;
          return (
            <div key={def.pageKey} className="admin-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{def.label}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{def.route}</span>
                    <Link to={def.route} target="_blank" className="inline-flex items-center gap-1 hover:text-foreground">
                      abrir <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <Button onClick={() => handleSave(def)} disabled={loading || isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Filtro principal</label>
                  <input
                    type="text"
                    value={d.gridQuery}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [def.pageKey]: { ...d, gridQuery: e.target.value } }))}
                    className="input-field"
                    placeholder={def.defaultConfig.gridQuery}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Esse termo é aplicado primeiro no grid.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Fallbacks (separados por vírgula)</label>
                  <input
                    type="text"
                    value={d.fallback}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [def.pageKey]: { ...d, fallback: e.target.value } }))}
                    className="input-field"
                    placeholder={def.defaultConfig.fallbackQueries.join(", ")}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Usado para completar resultados quando vier pouco produto.</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

