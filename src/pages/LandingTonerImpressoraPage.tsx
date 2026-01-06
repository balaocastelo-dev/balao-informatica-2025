import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { 
  Printer, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Package, 
  Star, 
  ArrowRight, 
  MapPin, 
  Zap,
  MessageCircle,
  Timer,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingTonerImpressoraPage() {
  // SEO Otimizado
  const title = "Toner Premium: Original e Compatível | Até 70% de Economia | Balão da Informática";
  const description = "Compre Toner HP, Brother, Samsung e Canon com qualidade profissional. Pronta entrega, garantia total e envio rápido para todo o Brasil.";
  const keywords = "toner premium, toner barato, toner hp laserjet, toner brother tn, toner samsung, suprimentos de impressão, balão da informática";
  const url = "https://www.balao.info/toner-para-impressora";
  const { products } = useProducts();
  const whatsappLink = `https://wa.me/5519987510267?text=${encodeURIComponent("Olá! Preciso de toner para minha impressora. Vou informar modelo e cartucho.")}`;

  // Dados para renderização dinâmica (mais limpo)
  const features = [
    { icon: ShieldCheck, title: "Garantia Total", text: "Cobertura completa contra defeitos e troca imediata." },
    { icon: Zap, title: "Envio Expresso", text: "Despacho em até 24h para capitais e regiões metropolitanas." },
    { icon: Star, title: "Qualidade Premium", text: "Toners com densidade de preto e rendimento padrão ISO." },
    { icon: CheckCircle2, title: "Custo-Benefício", text: "Economize até 70% comparado aos cartuchos de loja física." },
  ];

  const brands = [
    { name: "HP", query: "toner hp", models: "12A, 85A, 78A, 83A" },
    { name: "Brother", query: "toner brother", models: "TN-360, TN-450, TN-660" },
    { name: "Samsung", query: "toner samsung", models: "D101, D111, D104" },
    { name: "Canon", query: "toner canon", models: "128, 137, 045" },
  ];

  const relatedProducts = useMemo(() => {
    const primary = filterProductsByQuery(products || [], "toner");
    if (primary.length >= 12) return primary.slice(0, 36);
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "cartucho"),
      filterProductsByQuery(products || [], "laserjet"),
      filterProductsByQuery(products || [], "brother"),
      filterProductsByQuery(products || [], "hp"),
      filterProductsByQuery(products || [], "samsung"),
      filterProductsByQuery(products || [], "canon"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="product" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Toner para Impressora", url },
        ]}
      />

      <div className="bg-white min-h-screen font-sans">

        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">
            PRONTA ENTREGA + ENVIO RÁPIDO: NÃO FIQUE SEM IMPRIMIR
          </span>
        </div>
        
        {/* --- HERO SECTION: Inspirado em Ghost White Toner (Fundo escuro, alto contraste) --- */}
        <section className="relative bg-zinc-950 text-white overflow-hidden py-16 md:py-24">
          {/* Efeito de fundo sutil */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-zinc-900 to-transparent opacity-50 pointer-events-none" />
          
          <div className="container-balao relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#E30613]/10 border border-[#E30613] text-[#E30613] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white">
                <Star className="w-3 h-3 fill-current" />
                Mais vendido no Brasil
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Impressão perfeita.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E30613] to-red-500">
                  Preço justo.
                </span>
              </h1>
              
              <p className="text-zinc-300 text-lg md:text-xl max-w-lg leading-relaxed">
                Toners Compatíveis Premium e Originais. Obtenha a mesma nitidez e rendimento das grandes marcas, pagando uma fração do preço.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/busca?q=toner">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#E30613] hover:bg-[#c30511] text-white text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(227,6,19,0.4)]">
                    Ver Catálogo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-zinc-700 text-white hover:bg-zinc-800 rounded-full">
                    Cotar no WhatsApp
                  </Button>
                </a>
              </div>
              
              <div className="pt-4 flex items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Pronta Entrega</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Nota Fiscal</span>
              </div>
            </div>

            {/* Simulação de Imagem de Produto Hero (Substitua por uma imagem real depois) */}
            <div className="relative hidden md:block group">
              <div className="absolute inset-0 bg-[#E30613] blur-[100px] opacity-20 rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl transform transition-transform group-hover:-translate-y-2">
                 <div className="flex justify-between items-start mb-8">
                    <Printer className="w-12 h-12 text-zinc-500" />
                    <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">EM ESTOQUE</span>
                 </div>
                 <div className="h-40 flex items-center justify-center text-zinc-500 font-mono text-sm border-2 border-dashed border-zinc-700 rounded">
                    [Imagem do Toner Aqui]
                 </div>
                 <div className="mt-8 space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">Toners e suprimentos em destaque</h2>
                <p className="text-zinc-600 mt-2">Seleção de produtos relacionados. Se preferir, peça ajuda pelo WhatsApp.</p>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="h-12 px-6 bg-[#25D366] hover:bg-[#1EB954] text-white font-bold rounded-xl shadow-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ajuda para escolher
                </Button>
              </a>
            </div>

            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>

        {/* --- VALUE PROPS: Clean e Direto --- */}
        <section className="py-12 bg-zinc-50 border-b">
          <div className="container-balao grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-start space-y-3 p-4 rounded-xl hover:bg-white transition-colors duration-300">
                <div className="p-3 bg-white border shadow-sm rounded-lg text-[#E30613]">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- SELEÇÃO DE MARCAS: Visual Navigation --- */}
        <section className="py-16 md:py-24 container-balao">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Escolha sua Marca</h2>
            <p className="text-zinc-600">Trabalhamos com suprimentos para as principais fabricantes do mercado mundial.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link to={`/busca?q=${brand.query}`} key={brand.name} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-zinc-200 group-hover:border-[#E30613]/30 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center min-h-[200px] bg-gradient-to-b from-white to-zinc-50">
                    <div className="mb-4 w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border group-hover:scale-110 transition-transform">
                      <Printer className="w-8 h-8 text-zinc-400 group-hover:text-[#E30613]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#E30613] transition-colors">{brand.name}</h3>
                    <p className="text-xs text-zinc-500 mb-4">Modelos populares:</p>
                    <p className="text-sm font-medium text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full">
                      {brand.models}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/busca?q=toner">
               <Button variant="link" className="text-[#E30613] font-semibold text-lg">
                 Ver todas as marcas e modelos &rarr;
               </Button>
            </Link>
          </div>
        </section>

        <section className="py-0 relative border-t border-zinc-200">
          <div className="grid md:grid-cols-2 min-h-[520px]">
            <div className="bg-neutral-900 text-white p-10 md:p-20 flex flex-col justify-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-8 text-white">Retire na loja ou receba rápido</h2>

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
                      <Truck className="text-green-400 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Envio</h4>
                      <p className="text-neutral-300">Despacho rápido para todo o Brasil</p>
                      <p className="text-neutral-300">Campinas: retirada imediata</p>
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

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">WhatsApp</span>
        </a>

        {/* --- SEO & INFO AREA: Mantendo a utilidade do original, mas com design melhor --- */}
        <section className="bg-zinc-100 py-16">
          <div className="container-balao">
            <div className="grid md:grid-cols-2 gap-12">
              
              {/* Cobertura */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white"><Truck className="w-5 h-5"/></div>
                    <h2 className="text-2xl font-bold text-zinc-900">Entrega Nacional</h2>
                </div>
                <p className="text-zinc-600">
                  Nossa logística abrange todo o território brasileiro. Utilizamos embalagens reforçadas (Airbag protection) para garantir que seu toner chegue intacto.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div className="bg-white p-3 rounded border">
                    <strong className="block text-zinc-900 mb-1">Sudeste & Sul</strong>
                    <span className="text-zinc-500">SP, RJ, MG, PR, SC, RS (Capital e Interior)</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <strong className="block text-zinc-900 mb-1">Norte & Nordeste</strong>
                    <span className="text-zinc-500">BA, PE, CE, AM, PA e demais estados.</span>
                  </div>
                </div>
              </div>

              {/* Informação Técnica */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-lg text-white"><Package className="w-5 h-5"/></div>
                    <h2 className="text-2xl font-bold text-zinc-900">Especificações</h2>
                </div>
                <div className="prose prose-sm text-zinc-600">
                  <p>
                    Nossos cartuchos compatíveis seguem rigorosos padrões de engenharia. Diferente de cartuchos remanufaturados, o <strong>toner compatível é 100% novo</strong>.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 list-none pl-0">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Pó de toner gráfico de alta fusão</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Cilindro fotorreceptor novo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Chip atualizado pronto para uso</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Lacres de segurança de fábrica</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Keyword block discreto no final */}
            <div className="mt-16 pt-8 border-t border-zinc-200 text-xs text-zinc-400 text-center max-w-4xl mx-auto">
              <p>Termos relacionados: Toner HP 85A CE285A, Brother TN-450, Samsung D111, Toner 1052, Lexmark MX310. Atendemos empresas, revendas e consumidor final. Campinas, São Paulo e todo Brasil.</p>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL: Persuasão --- */}
        <section className="bg-[#E30613] py-12 text-white text-center">
            <div className="container-balao max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">Sua impressora parou?</h2>
                <p className="text-white/90 text-lg mb-8">Não perca produtividade. Peça agora e receba com prioridade máxima de envio.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/busca?q=toner">
                        <Button className="bg-white text-[#E30613] hover:bg-zinc-100 font-bold px-8 h-12 rounded-full">
                            Comprar Agora
                        </Button>
                    </Link>
                </div>
            </div>
        </section>

      </div>
    </Layout>
  );
}
