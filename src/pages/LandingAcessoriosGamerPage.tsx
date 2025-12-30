import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLandingPageConfig } from "@/contexts/LandingPageConfigContext";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, Gamepad2, MapPin, MessageCircle, Monitor, MousePointer, Phone, ShieldCheck, Timer } from "lucide-react";

export default function LandingAcessoriosGamerPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Quero acessórios gamer. Vou informar objetivos e orçamento (mouse, teclado, headset, monitor).",
  )}`;

  const title = "Acessórios Gamer | Mouse, Teclado, Headset, Monitor | Balão da Informática Campinas";
  const description =
    "Acessórios gamer em Campinas: mouse, teclado, headset, mousepad e monitores. Indicação por objetivo, ergonomia e orçamento. Retire no Cambuí ou receba.";
  const keywords =
    "acessorios gamer campinas, mouse gamer campinas, teclado gamer campinas, headset gamer campinas, mousepad gamer campinas, monitor gamer campinas, ergonomia gamer campinas, custo beneficio acessorios gamer, cambui av anchieta 789, campinas valinhos vinhedo paulinia sumare hortolandia indaiatuba";
  const url = "https://www.balao.info/lp/acessorios-gamer";

  const { products } = useProducts();
  const { config } = useLandingPageConfig("acessorios-gamer", {
    pageKey: "acessorios-gamer",
    gridQuery: "gamer",
    fallbackQueries: ["mouse gamer", "teclado gamer", "headset", "monitor", "mousepad"],
  });

  const tips = [
    "Mouse: peso, sensor e pegada",
    "Teclado: switch, layout e construção",
    "Headset: conforto e posicionamento",
    "Monitor: tamanho, taxa e painel",
    "Mousepad: controle x velocidade",
    "Ergonomia geral do setup",
    "Indicação por orçamento/objetivo",
    "Atendimento imediato via WhatsApp",
  ];

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

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Acessórios Gamer", url }]} />

      <div className="bg-white min-h-screen font-sans">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">ACESSÓRIOS CERTOS • CONFORTO, PRECISÃO E DESEMPENHO</span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Pedir indicação</span>
        </a>

        <section className="relative bg-zinc-950 text-white overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E30613]/20 via-transparent to-transparent" />
          <div className="container-balao relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-yellow-400" />
                Campinas • Cambuí • Av. Anchieta, 789
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Acessórios gamer com
                <span className="text-yellow-400"> indicação certeira</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">
                Mouse, teclado, headset, mousepad e monitor. Indicamos por objetivo e ergonomia, com pronta entrega ou envio expresso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-lg font-bold rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar no WhatsApp
                  </Button>
                </a>
                <a href="tel:+551932551661" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Ligar (19) 3255-1661
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <MousePointer className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Precisão</p>
                  <p className="text-sm text-zinc-300">Sensor e pegada ideais.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Gamepad2 className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Conforto</p>
                  <p className="text-sm text-zinc-300">Ergonomia do setup.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Monitor className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Visual</p>
                  <p className="text-sm text-zinc-300">Tela e taxa ideais.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-zinc-900 border border-zinc-200">
              <h2 className="text-2xl font-black mb-2">Perfil de uso</h2>
              <p className="text-zinc-600 mb-6">Objetivo, preferências e orçamento para indicação.</p>
              <div className="space-y-3">
                {[
                  "Objetivo principal? (ex: FPS competitivo, RPG, simuladores)",
                  "Preferências de pegada/tecla/áudio?",
                  "Orçamento por item? (ex: mouse R$ 150, headset R$ 250)",
                  "Tamanho e taxa do monitor desejados?",
                ].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-zinc-700">{t}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 bg-[#E30613] hover:bg-[#c00510] text-white font-black rounded-xl">
                    Pedir indicação agora
                  </Button>
                </a>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Atendemos Campinas e região com retirada/envio rápido.</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">Dicas de escolha</h2>
                <p className="text-zinc-600 mt-2">Critérios práticos para acertar.</p>
              </div>
              <Link to="/categoria/todos" className="text-[#E30613] font-semibold hover:underline">
                Ver categorias
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tips.map((item) => (
                <Card key={item} className="border-zinc-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-3">
                    <BadgeCheck className="w-5 h-5 text-[#E30613] mt-0.5" />
                    <p className="text-sm text-zinc-800 leading-relaxed">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">Acessórios em destaque</h2>
                <p className="text-zinc-600 mt-2">Grid filtrado para termos gamer/acessórios.</p>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="h-12 px-6 bg-[#25D366] hover:bg-[#1EB954] text-white font-bold rounded-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Pedir indicação
                </Button>
              </a>
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
      </div>
    </Layout>
  );
}

