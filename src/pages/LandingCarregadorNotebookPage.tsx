import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import {
  Truck,
  ShieldCheck,
  Phone,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Timer,
  Camera,
  ArrowRight
} from "lucide-react";

export default function LandingFonteNotebookPage() {
  
  // --- CONFIGURAÇÃO CENTRAL DO WHATSAPP ---
  const WHATSAPP_NUMBER = "5519987510267";
  const { products } = useProducts();
  
  // Gera o link dinâmico
  const openZap = (msg: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    return url;
  };

  const title = "Fonte de Notebook em Campinas | Entrega Rápida e Pronta Entrega | Balão da Informática";
  const description =
    "Fonte de notebook em Campinas com pronta entrega e entrega rápida. Envie a foto da etiqueta no WhatsApp e confirmamos a fonte correta. Atendemos Campinas e região e também enviamos para o Brasil todo.";
  const keywords =
    "fonte notebook campinas, fonte de notebook campinas, carregador notebook campinas, fonte original notebook campinas, fonte compatível notebook, fonte notebook dell, fonte notebook acer, fonte notebook lenovo, fonte notebook hp, fonte notebook asus, fonte macbook magsafe, fonte usb-c notebook, fonte type-c notebook, fonte notebook 19v, fonte notebook 20v, fonte notebook 45w, fonte notebook 65w, fonte notebook 90w, fonte notebook 120w, entrega rápida campinas, motoboy campinas fonte notebook, pronta entrega campinas, loja de informática campinas cambui, av anchieta 789 campinas, fonte notebook são paulo, fonte notebook brasil, envio fonte notebook correios, valinhos, vinhedo, paulínia, sumaré, hortolândia, indaiatuba";
  const url = "https://www.balao.info/fonte-de-notebook";

  // Marcas agora são botões de atalho para o chat
  const brands = [
    "Dell", "Acer", "Samsung", "Lenovo", "HP", "Asus", "Apple (Macbook)", "Positivo/Vaio"
  ];

  const relatedProducts = useMemo(() => {
    const primary = filterProductsByQuery(products || [], "fonte notebook");
    if (primary.length >= 12) return primary.slice(0, 36);
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "carregador"),
      filterProductsByQuery(products || [], "usb-c"),
      filterProductsByQuery(products || [], "magsafe"),
      filterProductsByQuery(products || [], "notebook"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="product" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Fonte de Notebook", url },
        ]}
      />

      {/* --- FAIXA DE URGÊNCIA --- */}
      <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
        <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
        <span className="text-sm md:text-base uppercase tracking-wide">
          CAMPINAS E REGIÃO: PEDIU, CHEGOU EM 30 MINUTOS! 🏍️
        </span>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="bg-[#E30613] text-white pb-16 pt-10 px-4 md:px-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        <div className="container-balao relative z-10 max-w-4xl mx-auto text-center">
            
            <div className="inline-block bg-black/30 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6">
                <span className="text-yellow-400 font-bold flex items-center gap-2 text-sm md:text-base">
                    <MapPin className="w-4 h-4" /> Atendimento Exclusivo Campinas
                </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 drop-shadow-lg">
                Seu Notebook Parou? <br/>
                <span className="text-yellow-400">Nós salvamos seu dia.</span>
            </h1>

            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Não perca tempo procurando modelo. Nós temos fontes para <strong>todas as marcas</strong> com entrega expressa ou retirada no balcão agora mesmo.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full">
                <a 
                    href={openZap("Oi, meu notebook parou e preciso de uma fonte urgente!")}
                    target="_blank"
                    className="w-full md:w-auto"
                >
                    <Button className="w-full md:w-auto h-16 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-xl font-bold rounded-xl shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-1 transition-all">
                        <MessageCircle className="w-8 h-8" />
                        PEDIR PELO WHATSAPP
                    </Button>
                </a>
                
                <a 
                    href={openZap("Quero saber onde fica a loja para retirar a fonte.")}
                    target="_blank"
                    className="w-full md:w-auto"
                >
                    <Button variant="outline" className="w-full md:w-auto h-16 px-8 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#E30613] text-lg font-bold rounded-xl gap-2">
                        <MapPin className="w-5 h-5" />
                        Prefiro Retirar na Loja
                    </Button>
                </a>
            </div>

            <p className="mt-6 text-sm opacity-80 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Atendentes online agora respondendo em segundos
            </p>
        </div>
      </div>

      {/* --- SEÇÃO "COMO COMPRAR" (FOTO NO ZAP) --- */}
      <div className="bg-white py-12 -mt-8 relative z-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="container-balao">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">Fonte de Notebook em Campinas: envie foto no WhatsApp</h2>
                <p className="text-zinc-500">Não arrisque comprar errado. Nossos técnicos identificam a fonte correta e entregam em Campinas hoje.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Passo 1 */}
                <a href={openZap("Vou mandar a foto da etiqueta...")} target="_blank" className="block group">
                    <Card className="border-2 border-dashed border-zinc-200 group-hover:border-[#E30613] transition-colors cursor-pointer bg-zinc-50 h-full">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">1. Tire uma foto</h3>
                            <p className="text-zinc-600">Fotografe a etiqueta da sua fonte antiga ou o modelo do notebook.</p>
                        </CardContent>
                    </Card>
                </a>

                {/* Passo 2 */}
                <a href={openZap("Já mandei a foto, aguardando verificação...")} target="_blank" className="block group">
                    <Card className="border-2 border-dashed border-zinc-200 group-hover:border-[#E30613] transition-colors cursor-pointer bg-zinc-50 h-full">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">2. Envie no WhatsApp</h3>
                            <p className="text-zinc-600">Clique aqui, mande a foto e nosso sistema identifica o modelo compatível.</p>
                        </CardContent>
                    </Card>
                </a>

                {/* Passo 3 */}
                <div className="block group">
                    <Card className="border-2 border-transparent bg-zinc-50 h-full">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">3. Receba em casa</h3>
                            <p className="text-zinc-600">Pague somente na entrega (Pix, Cartão ou Dinheiro). Simples assim.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </div>

      {/* --- MARCAS (ATALHOS) --- */}
      <div className="bg-zinc-50 py-12 border-t border-zinc-200">
        <div className="container-balao max-w-4xl">
            <h3 className="text-center font-bold text-zinc-500 uppercase tracking-widest mb-8 text-sm">
                Selecione a marca para falar com consultor
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brands.map((brand) => (
                    <a 
                        key={brand}
                        href={openZap(`Olá, preciso de uma fonte para notebook da marca ${brand}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 text-center font-bold text-zinc-700 hover:border-[#E30613] hover:text-[#E30613] hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        {brand} <ArrowRight className="w-4 h-4 opacity-30" />
                    </a>
                ))}
            </div>
        </div>
      </div>

      <section className="bg-white py-16 border-t border-zinc-200">
        <div className="container-balao">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Fontes em estoque</h2>
              <p className="text-zinc-600 mt-2">
                Produtos relacionados a fonte/carregador de notebook. Se tiver dúvida, envie a foto no WhatsApp e confirmamos compatibilidade.
              </p>
            </div>
            <a href={openZap("Vou mandar a foto da etiqueta da fonte / modelo do notebook para confirmar compatibilidade.")} target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-6 bg-[#25D366] hover:bg-[#1EB954] text-white font-bold rounded-xl shadow-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Confirmar no WhatsApp
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
              <h2 className="text-3xl font-bold mb-8 text-white">Retire na loja ou peça motoboy</h2>

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
                    <Timer className="text-yellow-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Entrega rápida</h4>
                    <p className="text-neutral-300">Motoboy em Campinas e região</p>
                    <p className="text-neutral-300">Retirada no balcão imediata</p>
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

      <div className="fixed bottom-6 left-6 z-50">
        <a
          href={openZap("Oi! Preciso de um carregador/fonte para notebook. Vou mandar foto do modelo/etiqueta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white py-3 px-5 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-colors font-bold text-lg"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden md:inline">WhatsApp</span>
        </a>
      </div>
      

      {/* --- FOOTER SIMPLIFICADO --- */}
      <div className="bg-[#111] text-zinc-400 py-8 border-t border-zinc-800">
         <div className="container-balao text-center space-y-4">
             <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
                 <ShieldCheck className="text-green-500" />
                 Balão da Informática Campinas
             </div>
             <p className="max-w-md mx-auto text-sm">
                 Somos especialistas em energia para portáteis. Loja física com técnicos reais.
                 Recuse imitações baratas que queimam seu equipamento.
             </p>
             <div className="pt-4 border-t border-zinc-800 flex justify-center gap-6 text-sm font-medium">
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> CNPJ Ativo</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Loja Física</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Desde 2005</span>
             </div>
         </div>
      </div>

    </Layout>
  );
}
