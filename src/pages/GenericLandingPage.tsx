import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import { useLandingPageConfigs } from "@/contexts/LandingPageConfigContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Phone, Truck, ShieldCheck, Timer, Star, CheckCircle2 } from "lucide-react";

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
  const keywords = [
    meta.label.toLowerCase(),
    "campinas",
    "cambuí",
    "av anchieta 789",
    "balão da informática",
    config.gridQuery || "",
    ...(config.fallbackQueries || []),
    "loja de informática campinas",
    "suporte técnico campinas",
    "entrega rápida campinas",
    "garantia",
    "atendimento whatsapp",
  ]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
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
              <div className="px-4 py-3 bg-zinc-100 rounded-lg text-zinc-800 inline-flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Melhor custo‑benefício
              </div>
              <div className="px-4 py-3 bg-zinc-100 rounded-lg text-zinc-800 inline-flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Pronta entrega
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-5 border rounded-xl">
                <p className="font-bold mb-2">Escolha rápida</p>
                <p className="text-sm text-zinc-600">Mande no WhatsApp o que precisa e indicamos a opção certa.</p>
              </div>
              <div className="p-5 border rounded-xl">
                <p className="font-bold mb-2">Atendimento local</p>
                <p className="text-sm text-zinc-600">Cambuí, Campinas. Retirada imediata ou envio expresso.</p>
              </div>
              <div className="p-5 border rounded-xl">
                <p className="font-bold mb-2">Suporte pós‑compra</p>
                <p className="text-sm text-zinc-600">Garantia e orientação para instalação e uso.</p>
              </div>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>
        <section className="py-0 relative border-t border-zinc-200">
          <div className="grid md:grid-cols-2 min-h-[520px]">
            <div className="bg-neutral-900 text-white p-10 md:p-20 flex flex-col justify-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-8 text-white">Retire na loja em Campinas</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="bg-[#E30613] w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Endereço</h4>
                      <p className="text-neutral-300">Av. Anchieta, 789<br />Cambuí - Campinas, SP</p>
                      <p className="text-sm text-neutral-500 mt-2">Próximo à Prefeitura</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-neutral-800 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="text-green-400 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Contato</h4>
                      <p className="text-neutral-300">WhatsApp: (19) 98751-0267</p>
                      <p className="text-neutral-300">Fixo: (19) 3255-1661</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-neutral-800">
                  <Button asChild className="w-full bg-[#E30613] hover:bg-[#c00510] text-white font-bold py-6 rounded-xl">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=Av.+Anchieta,+789+-+Cambuí,+Campinas+-+SP" target="_blank" rel="noopener noreferrer">
                      Traçar rota no Maps
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="h-full min-h-[400px] w-full bg-neutral-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.356779435064!2d-47.05686002380766!3d-22.90020497925974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8cf4f3f3f3f3f%3A0x1234567890abcdef!2sAv.%20Anchieta%2C%20789%20-%20Cambu%C3%AD%2C%20Campinas%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "100%" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa Balão da Informática"
                className="grayscale hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
          </div>
        </section>
        <section className="container-balao py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-black">Como funciona</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-zinc-700">Envie no WhatsApp o que precisa ou o problema.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-zinc-700">Indicamos a solução com preço e prazo.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-zinc-700">Retire no balcão ou receba em Campinas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 px-6 bg-[#25D366] hover:bg-[#1EB954] text-white font-bold rounded-xl">Falar no WhatsApp</Button>
                </a>
                <a href="tel:+551932551661">
                  <Button variant="outline" className="h-12 px-6">Ligar</Button>
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black">Por que {meta.label} com a Balão?</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Agilidade e transparência", "Preço justo de Campinas", "Garantia oficial", "Suporte real pós‑venda"].map((t) => (
                  <div key={t} className="p-4 border rounded-xl">
                    <p className="text-sm font-semibold text-zinc-800">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="bg-zinc-50 py-12 border-t">
          <div className="container-balao">
            <h3 className="text-2xl font-black mb-6">Perguntas frequentes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Posso retirar hoje no Cambuí?",
                "Vocês enviam para bairros de Campinas?",
                "Tem garantia oficial dos produtos e serviços?",
                "Como confirmar compatibilidade?",
              ].map((q) => (
                <div key={q} className="p-5 bg-white border rounded-xl">
                  <p className="font-semibold text-zinc-800">{q}</p>
                  <p className="text-sm text-zinc-600 mt-2">Chame no WhatsApp e respondemos em minutos.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
