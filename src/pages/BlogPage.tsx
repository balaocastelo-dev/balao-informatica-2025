import { useEffect, useMemo, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Grid, List } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { listPublished, type BlogArticle } from "@/lib/blogStorage";

type Article = BlogArticle;

export default function BlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const p = parseInt(params.get("page") || "1", 10);
    setQuery(q);
    setPage(isNaN(p) ? 1 : Math.max(1, p));
  }, [location.search]);

  const fetchArticles = useCallback(() => {
    setLoading(true);
    const { items, total } = listPublished({
      query,
      tag: selectedTag,
      category: selectedCategory,
      page,
      pageSize,
    });
    setArticles(items as Article[]);
    setTotalCount(total);
    setLoading(false);
  }, [query, selectedTag, selectedCategory, page, pageSize]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const url = "https://www.balao.info/blog";
  const title = "Blog | Balão da Informática";
  const description = "Artigos, dicas e notícias sobre computadores, notebooks e hardware.";
  const keywords = "blog, computadores, hardware, notebooks, dicas, notícias";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("page", "1");
    navigate(`/blog?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(newPage));
    navigate(`/blog?${params.toString()}`);
  };

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="website" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Blog", url }]} />

      <div className="container-balao py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Blog</h1>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artigos…"
          />
          <Button type="submit">Buscar</Button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold">Nenhum artigo encontrado</h2>
            <p className="text-muted-foreground mt-2">Tente ajustar a busca ou volte mais tarde.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                {a.cover_image_url && (
                  <img
                    src={a.cover_image_url}
                    alt={a.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <CardDescription>
                    {a.author ? `Por ${a.author}` : "Balão da Informática"} • {a.published_at ? new Date(a.published_at).toLocaleDateString("pt-BR") : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="link" onClick={() => navigate(`/blog/${a.slug || a.id}`)}>Ler mais</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <CardContent className="flex items-center gap-4">
                  {a.cover_image_url && (
                    <img
                      src={a.cover_image_url}
                      alt={a.title}
                      className="w-24 h-24 object-cover rounded"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{a.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {a.author ? `Por ${a.author}` : "Balão da Informática"} • {a.published_at ? new Date(a.published_at).toLocaleDateString("pt-BR") : ""}
                    </div>
                    <Button variant="link" onClick={() => navigate(`/blog/${a.slug || a.id}`)}>Ler mais</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  return (
                    <PaginationItem key={n}>
                      <PaginationLink href="#" isActive={n === page} onClick={(e) => { e.preventDefault(); goToPage(n); }}>
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
}
