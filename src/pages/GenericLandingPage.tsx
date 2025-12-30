import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import { useLandingPageConfigs } from "@/contexts/LandingPageConfigContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Phone, Truck, ShieldCheck, Timer } from "lucide-react";

export default function GenericLandingPage() {
  const { pageKey } = useParams();
  const { pages, configs } = useLandingPageConfigs();
  const { products } = useProducts();
  const meta = pages.find((p) => p.pageKey === pageKey);
  const config = configs[pageKey || ""] || { pageKey: pageKey || "", gridQuery: "", fallbackQueries: [] };

  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Preciso de ajuda com " + (meta?.label || "uma landing"))}`;

  const relatedProducts = useMemo(() => {
    const base = products || [];
    const primary = filterProductsByQuery(base, config.gridQuery || "");
    if (primary.length >= 12) return primary.slice(0, 36);
    const extra = mergeUniqueProductsById([
      primary,
      ...(config.fallbackQueries || []).map((q) => filterProductsByQuery(base, q)),
    ]);
    return extra.slice(0, 36);
  }, [products, config.gridQuery, config.fallbackQueries]);

  if (!meta) {
    return (
      <Layout>
        <div className="container-balao py-16">
          <h1 className="text-2xl font-bold mb-4">Landing não encontrada</h1>
          <p className="text-zinc-600 mb-6">Verifique a rota ou crie a landing na aba Landing Pages do Admin.</p>
          <Button asChild>
            <Link to="/">Voltar para Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const title = `${meta.label} | Balão da Informática Campinas`;
  const description = `${meta.label} com atendimento em Campinas. Clique e fale no WhatsApp para agilidade.`;
  const url = `https://www.balao.info${meta.route}`;

  return (
    <Layout>
      <SEOHead title={title} description={description} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: meta.label, url }]} />
      <div className="bg-white min-h-screen">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2">
          <Timer className="w-6 h-6 text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">Fale no WhatsApp e resolvemos hoje em Campinas</span>
        </div>
        <section className="container-balao py-10">
          <div className="grid md:grid-cols-3 gap-4">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 justify-center h-12">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <a href="tel:+551932551661" className="btn-secondary inline-flex items-center gap-2 justify-center h-12">
              <Phone className="w-5 h-5" />
              (19) 3255-1661
            </a>
            <span className="inline-flex items-center justify-center gap-2 h-12 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700">
              <MapPin className="w-5 h-5" />
              Av. Anchieta, 789 – Cambuí
            </span>
          </div>
        </section>
        <section className="bg-white py-10 border-y">
          <div className="container-balao">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-[#E30613] rounded-full" />
              <h2 className="text-2xl md:text-3xl font-black text-zinc-800">{meta.label}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="px-4 py-3 bg-red-50 rounded-lg text-[#E30613] inline-flex items-center gap-2">
                <Truck className="w-5 h-5" /> Entrega rápida
              </div>
              <div className="px-4 py-3 bg-zinc-100 rounded-lg text-zinc-800 inline-flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Garantia Oficial
              </div>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
