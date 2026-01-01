import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  status: "draft" | "published";
  categories: string[] | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function BlogManagement() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    cover_image_url: "",
    author: "",
    status: "draft" as "draft" | "published",
    categoriesRaw: "",
    tagsRaw: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .order("updated_at", { ascending: false });
    if (!error) setArticles((data || []) as BlogArticle[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a => a.title.toLowerCase().includes(q) || (a.content || "").toLowerCase().includes(q));
  }, [articles, search]);

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      content: "",
      cover_image_url: "",
      author: "",
      status: "draft",
      categoriesRaw: "",
      tagsRaw: "",
    });
    setEditing(null);
  };

  const startCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const startEdit = (a: BlogArticle) => {
    setForm({
      title: a.title || "",
      slug: a.slug || "",
      content: a.content || "",
      cover_image_url: a.cover_image_url || "",
      author: a.author || "",
      status: a.status || "draft",
      categoriesRaw: (a.categories || []).join(", "),
      tagsRaw: (a.tags || []).join(", "),
    });
    setEditing(a);
    setShowModal(true);
  };

  const handleUploadCover = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const path = `blog/${form.slug || "sem-slug"}/${fileName}`;
      const { error } = await supabase.storage.from("banners").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/*",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl || "" }));
      toast({ title: "Imagem enviada" });
    } catch {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    }
    setUploading(false);
  };

  const saveArticle = async () => {
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      content: form.content.trim(),
      cover_image_url: form.cover_image_url.trim() || null,
      author: form.author.trim() || null,
      status: form.status,
      categories: form.categoriesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      published_at: form.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as any;

    if (!payload.title || !payload.content) {
      toast({ title: "Título e conteúdo são obrigatórios", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("blog_articles")
      .upsert(payload, { onConflict: "slug" })
      .select();
    if (error) {
      toast({ title: "Erro ao salvar artigo", variant: "destructive" });
      return;
    }
    toast({ title: "Artigo salvo!" });
    setShowModal(false);
    await fetchArticles();
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    const { error } = await supabase.from("blog_articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
      return;
    }
    toast({ title: "Excluído" });
    await fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog</h2>
          <p className="text-muted-foreground">Gerencie artigos: criar, editar, publicar e excluir</p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Artigo
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título ou conteúdo" />
        <Button variant="secondary" className="gap-2" onClick={() => fetchArticles()}>
          <Search className="w-4 h-4" />
          Buscar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold">Nenhum artigo</h3>
          <p className="text-muted-foreground">Clique em “Novo Artigo” para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="text-lg">{a.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.cover_image_url && (
                  <img src={a.cover_image_url} alt={a.title} className="w-full h-32 object-cover rounded" />
                )}
                <div className="text-sm text-muted-foreground">
                  Status: {a.status === "published" ? "Publicado" : "Rascunho"}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="gap-2" onClick={() => startEdit(a)}>
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="destructive" className="gap-2" onClick={() => deleteArticle(a.id)}>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editing ? "Editar Artigo" : "Novo Artigo"}</h3>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Fechar</Button>
            </div>
            <div className="space-y-3">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" />
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (opcional)" />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Conteúdo (Markdown ou texto)"
                className="w-full h-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <Input
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="URL da imagem de capa"
                />
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Enviar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCover(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Autor (opcional)" />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <Input
                value={form.categoriesRaw}
                onChange={(e) => setForm({ ...form, categoriesRaw: e.target.value })}
                placeholder="Categorias (separadas por vírgula)"
              />
              <Input
                value={form.tagsRaw}
                onChange={(e) => setForm({ ...form, tagsRaw: e.target.value })}
                placeholder="Tags (separadas por vírgula)"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button onClick={saveArticle}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

