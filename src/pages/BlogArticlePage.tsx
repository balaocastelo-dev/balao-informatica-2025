import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { getBySlugOrId, type BlogArticle } from "@/lib/blogStorage";

type Article = BlogArticle;

export default function BlogArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const key = params.slug || "";
    const found = key ? getBySlugOrId(key) : null;
    setArticle(found);
    setLoading(false);
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
