import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Save, Plus, Copy, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandingPageConfigs } from "@/contexts/LandingPageConfigContext";

const parseFallback = (raw: string) =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

export function LandingPagesManager() {
  const { pages, loading, refresh, createPage, updatePage, deletePage, clonePage } = useLandingPageConfigs();
  const [draft, setDraft] = useState<Record<string, { label: string; route: string; gridQuery: string; fallback: string; active: boolean }>>({});
  const [newPage, setNewPage] = useState<{ pageKey: string; label: string; route: string; gridQuery: string; fallback: string }>({
    pageKey: "",
    label: "",
    route: "",
    gridQuery: "",
    fallback: "",
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const rows = useMemo(() => pages, [pages]);

  useEffect(() => {
    const next: Record<string, { label: string; route: string; gridQuery: string; fallback: string; active: boolean }> = {};
    for (const p of pages) {
      next[p.pageKey] = {
        label: p.label,
        route: p.route,
        gridQuery: p.gridQuery,
        fallback: (p.fallbackQueries || []).join(", "),
        active: !!p.active,
      };
    }
    setDraft(next);
  }, [pages]);

  const handleSave = async (key: string) => {
    const d = draft[key];
    if (!d) return;
    setSavingKey(key);
    await updatePage(key, {
      label: d.label,
      route: d.route,
      active: d.active,
      gridQuery: d.gridQuery || "",
      fallbackQueries: parseFallback(d.fallback || ""),
    });
    setSavingKey(null);
  };

  const handleCreate = async () => {
    const pageKey = newPage.pageKey.trim();
    const label = newPage.label.trim() || pageKey;
    const route = newPage.route.trim() || `/lp/${pageKey}`;
    if (!pageKey) return;
    await createPage({
      pageKey,
      label,
      route,
      gridQuery: newPage.gridQuery.trim(),
      fallbackQueries: parseFallback(newPage.fallback),
    });
    setNewPage({ pageKey: "", label: "", route: "", gridQuery: "", fallback: "" });
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">Crie, edite, clone e remova. Controle filtros do grid e fallbacks.</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          Recarregar
        </Button>
      </div>

      <div className="admin-card">
        <div className="grid md:grid-cols-5 gap-3">
          <input
            placeholder="pageKey"
            value={newPage.pageKey}
            onChange={(e) => setNewPage((cur) => ({ ...cur, pageKey: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="label"
            value={newPage.label}
            onChange={(e) => setNewPage((cur) => ({ ...cur, label: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="route (/lp/slug)"
            value={newPage.route}
            onChange={(e) => setNewPage((cur) => ({ ...cur, route: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="grid"
            value={newPage.gridQuery}
            onChange={(e) => setNewPage((cur) => ({ ...cur, gridQuery: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="fallbacks, separadas por vírgula"
            value={newPage.fallback}
            onChange={(e) => setNewPage((cur) => ({ ...cur, fallback: e.target.value }))}
            className="input-field"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map((p) => {
          const d = draft[p.pageKey] || { label: p.label, route: p.route, gridQuery: p.gridQuery, fallback: p.fallbackQueries.join(", "), active: !!p.active };
          const isSaving = savingKey === p.pageKey;
          return (
            <div key={p.pageKey} className="admin-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{d.label} <span className="text-xs text-muted-foreground">({p.pageKey})</span></p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{d.route}</span>
                    <Link to={d.route} target="_blank" className="inline-flex items-center gap-1 hover:text-foreground">
                      abrir <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleSave(p.pageKey)} disabled={loading || isSaving} className="gap-2">
                    <Save className="w-4 h-4" />
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => clonePage(p.pageKey, `${p.pageKey}-clone`, `${d.label} (Clone)`, d.route.startsWith("/lp/") ? `${d.route}-clone` : `/lp/${p.pageKey}-clone`)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Clonar
                  </Button>
                  <Button variant="destructive" onClick={() => deletePage(p.pageKey)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={d.label}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [p.pageKey]: { ...d, label: e.target.value } }))}
                    className="input-field"
                    placeholder="label"
                  />
                  <input
                    type="text"
                    value={d.route}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [p.pageKey]: { ...d, route: e.target.value } }))}
                    className="input-field"
                    placeholder="/lp/slug"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDraft((cur) => ({ ...cur, [p.pageKey]: { ...d, active: !d.active } }))}
                      className={`px-3 py-2 rounded-lg border ${d.active ? "bg-green-50 border-green-200 text-green-700" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}
                    >
                      {d.active ? (
                        <span className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> Ativa</span>
                      ) : (
                        <span className="inline-flex items-center gap-2"><X className="w-4 h-4" /> Inativa</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={d.gridQuery}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [p.pageKey]: { ...d, gridQuery: e.target.value } }))}
                    className="input-field"
                    placeholder="filtro principal"
                  />
                  <input
                    type="text"
                    value={d.fallback}
                    onChange={(e) => setDraft((cur) => ({ ...cur, [p.pageKey]: { ...d, fallback: e.target.value } }))}
                    className="input-field"
                    placeholder="fallbacks, separadas por vírgula"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
