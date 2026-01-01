import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { getBySlugOrId } from "@/lib/blogStorage";

type Article = {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  status: string;
  published_at: string | null;
};

export default function BlogArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const key = params.slug || "";
      try {
        let query = supabase.from("blog_articles").select("*").eq("status", "published").limit(1);
        if (key.match(/^[0-9a-f-]{36}$/i)) {
          query = query.eq("id", key);
        } else {
          query = query.eq("slug", key);
        }
        const { data } = await query;
        setArticle((data && data[0]) ? data[0] as any : null);
      } catch {
        const fb = getBySlugOrId(key);
        setArticle(fb as any);
      }
      setLoading(false);
    };
    run();
  }, [params.slug]);

  const title = article ? `${article.title} | Balão da Informática` : "Artigo | Balão da Informática";
  const description = article ? (article.content || "").slice(0, 160) : "Artigo do Blog do Balão da Informática.";
  const url = `https://www.balao.info/blog/${params.slug || ""}`;

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords="blog, computadores, hardware" url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Blog", url: "https://www.balao.info/blog" }, { name: article?.title || "Artigo", url }]} />
      <div className="container-balao py-10">
        {loading ? (
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
        ) : !article ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
            <p className="text-muted-foreground mt-2">Verifique o link ou abra a lista do blog.</p>
          </div>
        ) : (
          <article className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden">
            {article.cover_image_url && (
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-64 object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold">{article.title}</h1>
              <div className="text-sm text-muted-foreground mt-2">
                {article.author ? `Por ${article.author}` : "Balão da Informática"} • {article.published_at ? new Date(article.published_at).toLocaleDateString("pt-BR") : ""}
              </div>
              <div className="prose prose-zinc max-w-none mt-6 whitespace-pre-line">
                {article.content}
              </div>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
}
