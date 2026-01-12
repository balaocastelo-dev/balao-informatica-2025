import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { LocalBusinessSchema, SEOHead } from "@/components/SEOHead";
import { useProducts } from "@/contexts/ProductContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  CreditCard,
  SearchX,
  MapPin,
  CheckCircle2,
} from "lucide-react";

import { bannerImageMap } from "@/config/banners";
import { DEPARTMENTS } from "@/config/departments";
import { useLandingPageConfigs } from "@/contexts/LandingPageConfigContext";
import { useMenuItems } from "@/contexts/MenuItemsContext";
import { Phone } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  image_mobile_url?: string | null;
  title: string | null;
  link: string | null;
  position: string;
  active: boolean;
  order_index: number;
}

const Index = () => {
  const { products, getProductsByCategory } = useProducts();
  const { blocks, loading } = usePageBlocks();
  const { pages } = useLandingPageConfigs();
  const { items } = useMenuItems();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").eq("active", true).order("order_index");
    setBanners(data || []);
  };

  const activeBlocks = useMemo(() => {
    return blocks.filter((b) => b.active).sort((a, b) => a.order_index - b.order_index);
  }, [blocks]);

  const getCategoryProducts = (slug: string) => {
    // Special handling for Apple block to include all Apple subcategories
    if (slug === 'apple') {
      const appleTerms = ['iphone', 'ipad', 'macbook', 'imac', 'apple', 'airpods', 'watch'];
      const prods = products.filter(p => 
        appleTerms.some(term => p.category.toLowerCase().includes(term)) || 
        p.name.toLowerCase().includes('apple')
      );
      return [...prods].slice(0, 12);
    }

    const prods = getProductsByCategory(slug);
    return [...prods].slice(0, 12);
  };

  const getBannersByPosition = (position: string) => {
    return banners.filter((b) => b.position === position);
  };

  const getResolvedImageUrl = (imageUrl: string) => {
    return bannerImageMap[imageUrl] || imageUrl;
  };

  const getLandingImage = (label: string, pageKey: string) => {
    const slug = `lp-${pageKey}`;
    const override = items.find(i => i.slug === slug)?.image_url;
    if (override) return override;
    const localImages: Record<string, string> = {
      "assistencia-tecnica": "/landing/assistencia-tecnica.jpg",
      "conserto-apple": "/landing/conserto-apple.jpg",
      "conserto-console": "/landing/conserto-console.jpg",
    };
    if (localImages[pageKey]) {
      return localImages[pageKey];
    }
    return getLandingFallbackImage(label, pageKey);
  };

  const getLandingFallbackImage = (label: string, pageKey: string) => {
    const overrides: Record<string, { prompt: string; seed: number }> = {
      "assistencia-tecnica": {
        prompt:
          "Assistência técnica de informática em Campinas, bancada com notebook aberto, ferramentas profissionais, ambiente limpo, luz suave, foto realista",
        seed: 20260101,
      },
      "conserto-apple": {
        prompt:
          "Conserto Apple premium, iPhone e MacBook em bancada técnica, peças organizadas, técnico com luvas, estética minimalista, luz branca, foto realista",
        seed: 20260102,
      },
      "conserto-console": {
        prompt:
          "Conserto de console, PlayStation e Xbox em mesa de manutenção, controle, placa exposta, espaço gamer técnico, luz fria, foto realista",
        seed: 20260103,
      },
    };
    const cfg = overrides[pageKey];
    const usedPrompt =
      cfg?.prompt ||
      `${label} realistic photo, technology store in Brazil, professional lighting, high detail`;
    const seed = cfg?.seed ?? 20250101;
    const prompt = encodeURIComponent(usedPrompt);
    return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${seed}`;
  };

  const betweenCategoryBanners = getBannersByPosition("between_categories");
  const footerTopBanners = getBannersByPosition("footer_top");

  if (loading) {
    return (
      <Layout>
        <div className="container-balao py-8 space-y-12">
          <div className="h-[400px] bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // --- RESULTADOS DE BUSCA ---
  if (searchQuery) {
    const searchResults = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <Layout>
        <SEOHead
          title={`Busca por "${searchQuery}" | Balão da Informática`}
          description={`Encontre ${searchQuery} com o melhor preço de Campinas no Balão da Informática.`}
        />
        <div className="container-balao py-8 min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Resultados para: <span className="text-[#E30613]">"{searchQuery}"</span>
          </h1>

          {searchResults.length > 0 ? (
            <ProductGrid products={searchResults} title="" />
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-zinc-100">
              <SearchX className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-700">Nenhum produto encontrado</h2>
              <p className="text-zinc-500 mt-2">
                Tente buscar por termos mais genéricos como "Gamer", "Intel" ou "SSD".
              </p>
              <Button asChild className="mt-6 btn-primary">
                <Link to="/">Voltar para Home</Link>
              </Button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  let categoryIndex = 0;

  // --- PÁGINA INICIAL ---
  return (
    <Layout>
      {/* SEO AGRESSIVO: Título e Keywords focadas em roubar tráfego local e de concorrentes */}
      <SEOHead
        title="Balão da Informática Campinas | PC Gamer e Hardware no Cambuí | www.balao.info"
        description="A melhor Loja de Informática de Campinas. Procurando InBrasil, Kalunga ou Hazap? Venha para o Balão! PC Gamer e Assistência na Av. Anchieta, 789."
        keywords="loja de informática campinas, balão da informática castelo, inbrasil campinas, kalunga campinas, hazap informática, ltech, mattoso informática, pc gamer taquaral, informática barão geraldo, centro campinas, assistência técnica notebook"
        url="https://www.balao.info"
      />

      {/* Injeção de Dados Estruturados */}
      <LocalBusinessSchema />

      <div className="pb-12 bg-zinc-50/50">
        {activeBlocks.map((block) => {
          // --- HERO BANNER ---
          if (block.block_type === "banner") {
            return (
              <div key={block.id} className="relative">
                <HeroBanner />

                {/* BARRA DE BENEFÍCIOS OTIMIZADA */}
                <div className="bg-white border-b border-zinc-100 py-6 shadow-sm relative z-10">
                  <div className="container-balao">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-center sm:justify-start gap-3 group">
                        <div className="p-2 bg-red-50 rounded-full text-[#E30613] group-hover:bg-[#E30613] group-hover:text-white transition-colors">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-800">Entrega Rápida</p>
                          <p className="text-xs text-zinc-500">Campinas e RMC</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 group">
                        <div className="p-2 bg-red-50 rounded-full text-[#E30613] group-hover:bg-[#E30613] group-hover:text-white transition-colors">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-800">Garantia Oficial</p>
                          <p className="text-xs text-zinc-500">Produtos Originais c/ NF</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 group">
                        <div className="p-2 bg-red-50 rounded-full text-[#E30613] group-hover:bg-[#E30613] group-hover:text-white transition-colors">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-800">Parcele Fácil</p>
                          <p className="text-xs text-zinc-500">Até 12x no Cartão</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 group">
                        <div className="p-2 bg-red-50 rounded-full text-[#E30613] group-hover:bg-[#E30613] group-hover:text-white transition-colors">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-800">Loja Física</p>
                          <p className="text-xs text-zinc-500">Av. Anchieta, 789 - Cambuí</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- ÁREA DE DEPARTAMENTOS --- */}
                {/* Espaçamento ajustado para não ficar cortado */}
                <div className="container-balao mt-8 relative z-20">
                  <h3 className="text-lg font-bold text-zinc-800 mb-6">Navegue por Departamento</h3>
                  <div className="flex gap-4 overflow-x-auto p-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-4">
                    {DEPARTMENTS.map((dept) => (
                      <Link
                        key={dept.slug}
                        to={`/categoria/${dept.slug}`}
                        className="flex flex-col items-center gap-3 min-w-[100px] group cursor-pointer"
                      >
                        <div className="w-20 h-20 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-[#E30613] group-hover:shadow-md transition-all group-hover:-translate-y-1">
                          <dept.icon className="w-8 h-8 text-zinc-600 group-hover:text-[#E30613] transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 group-hover:text-[#E30613] text-center">
                          {dept.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          if (block.block_type === "banner_single") {
            return (
              <div key={block.id} className="mt-8 container-balao">
                <HeroBanner singleBanner />
              </div>
            );
          }

          if (block.block_type === "separator") {
            return (
              <div key={block.id} className="container-balao py-6">
                <hr className="border-zinc-200" />
              </div>
            );
          }

          if (block.block_type === "category" && block.category_slug) {
            const products = getCategoryProducts(block.category_slug);
            if (products.length === 0) return null;

            categoryIndex++;
            const showBannerAfter = categoryIndex % 2 === 0;
            const bannerIndex = Math.floor((categoryIndex - 1) / 2);
            const betweenBanner = betweenCategoryBanners[bannerIndex];

            return (
              <div key={block.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <section className="container-balao mt-12">
                  <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-4">
                    <div className="w-1.5 h-8 bg-[#E30613] rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-black text-zinc-800 uppercase">
                      {block.title || block.category_slug.replace("-", " ")}
                    </h2>
                  </div>

                  <ProductGrid products={products} title="" />

                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      asChild
                      className="border-zinc-300 text-zinc-600 hover:text-[#E30613] hover:border-[#E30613] px-8 h-12 text-base"
                    >
                      <Link to={`/categoria/${block.category_slug}`}>
                        Ver todos em {block.title || "Ofertas"} <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </section>

                {showBannerAfter && betweenBanner && (
                  <div className="container-balao mt-16 mb-8">
                    {betweenBanner.link ? (
                      <Link
                        to={betweenBanner.link}
                        className="block overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                      >
                        <img
                          src={getResolvedImageUrl(betweenBanner.image_mobile_url || betweenBanner.image_url)}
                          alt={betweenBanner.title || "Oferta Especial"}
                          className="block md:hidden w-full h-32 sm:h-40 object-cover"
                          loading="lazy"
                        />
                        <img
                          src={getResolvedImageUrl(betweenBanner.image_url)}
                          alt={betweenBanner.title || "Oferta Especial"}
                          className="hidden md:block w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </Link>
                    ) : (
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <img
                          src={getResolvedImageUrl(betweenBanner.image_url)}
                          alt={betweenBanner.title || "Oferta"}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

        {activeBlocks.length === 0 && (
          <div className="container-balao py-32 text-center">
            <p className="text-zinc-400 text-lg">Carregando vitrine...</p>
          </div>
        )}



        {/* --- SEÇÃO DE CONTEÚDO SEO ESTRATÉGICO --- */}
        {/* Esta seção é vital para rankear em buscas locais e de concorrentes sem spam */}
        <section className="bg-white border-t border-zinc-200 mt-16 py-12">
          <div className="container-balao">
            <div className="grid md:grid-cols-2 gap-12 text-sm text-zinc-500">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-zinc-800 mb-2">
                  Loja de Informática em Campinas: Por que escolher o Balão?
                </h2>
                <p>
                  O <strong>Balão da Informática Castelo</strong> é a referência definitiva em tecnologia e hardware de
                  alta performance na região. Localizados estrategicamente no coração do{" "}
                  <strong>Cambuí (Av. Anchieta, 789)</strong>, oferecemos a combinação perfeita entre loja física e
                  e-commerce.
                </p>
                <p>
                  Ao contrário de grandes redes generalistas como <em>Kalunga</em> ou lojas focadas apenas em reparo
                  como <em>InBrasil</em>, nossa especialidade é o universo <strong>PC Gamer e Hardware High-End</strong>
                  . Se você procura montar um setup dos sonhos em Campinas, com consultoria especializada que vai além
                  da venda, aqui é o seu lugar.
                </p>
                <p>
                  Nossa localização central permite atender com agilidade clientes do{" "}
                  <strong>Centro, Taquaral, Guanabara, Barão Geraldo, Castelo</strong> e também cidades vizinhas como{" "}
                  <strong>Valinhos, Vinhedo e Indaiatuba</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-800 mb-2">Assistência Técnica e Cobertura de Ofertas</h3>
                <p>
                  Sabemos que você pesquisa preços. Por isso, cobrimos ofertas de outras lojas físicas da região (como{" "}
                  <em>Hazap</em>, <em>LTech</em> ou <em>Mattoso</em>) mediante análise na hora. Além de vender,
                  oferecemos assistência técnica completa para notebooks e computadores.
                </p>
                <p>
                  <strong>Diferenciais do Balão:</strong>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Estoque real de placas de vídeo NVIDIA RTX e
                    Processadores Ryzen.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Montagem profissional de PC Gamer com cable
                    management.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Atendimento direto via WhatsApp:{" "}
                    <a href="https://wa.me/5519987510267" className="text-[#E30613] font-bold hover:underline">
                      (19) 98751-0267
                    </a>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
