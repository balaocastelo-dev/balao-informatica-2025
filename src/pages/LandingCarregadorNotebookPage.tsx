import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import {
  BatteryCharging,
  Truck,
  ShieldCheck,
  Phone,
  Zap,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Timer,
  Camera,
  ArrowRight
} from "lucide-react";

export default function LandingCarregadorZapPage() {
  
  // --- CONFIGURAÇÃO CENTRAL DO WHATSAPP ---
  const WHATSAPP_NUMBER = "5519987510267";
  
  // Gera o link dinâmico
  const openZap = (msg: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    return url;
  };
  const { products, loading, searchProducts } = useProducts();
  const fonteNotebookProducts = useMemo(() => {
    if (loading) return [];
    const list = searchProducts ? searchProducts("fonte notebook") : products.filter(p => {
      const n = p.name.toLowerCase();
      return /fonte|carregador|notebook|usb.?c|type.?c|macbook|dell|acer|hp|lenovo|samsung|asus|apple/.test(n);
    });
    return list;
  }, [products, loading, searchProducts]);
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const title = "Carregador de Notebook em Campinas | Entrega Imediata via Motoboy";
  const description = "Notebook parou? Entrega em 30 minutos em Campinas. Fontes Dell, Acer, Samsung, Lenovo e Apple. Mande uma foto no WhatsApp e receba agora.";
  const keywords = "carregador notebook campinas, fonte dell, fonte acer, entrega motoboy informatica, sos carregadores";
  const url = "https://www.balao.info/carregador-express";

  // Marcas agora são botões de atalho para o chat
  const brands = [
    "Dell", "Acer", "Samsung", "Lenovo", "HP", "Asus", "Apple (Macbook)", "Positivo/Vaio"
  ];

  // Produtos "Fake" para vitrine (Clicou = WhatsApp)
  const commonModels = [
    { name: "Fonte Dell Pino Fino 45W/65W", tag: "Mais Vendido" },
    { name: "Fonte Acer Aspire (Pino Azul/Amarelo)", tag: "Promoção" },
    { name: "Carregador Samsung Original", tag: "Oferta" },
    { name: "Fonte Lenovo Quadrada (Yoga/Thinkpad)", tag: "Disponível" },
    { name: "Carregador Universal USB-C (Type-C)", tag: "Moderno" },
    { name: "Fonte MacBook Magsafe 1 e 2", tag: "Apple" },
    { name: "Fonte Asus Vivobook / Zenbook", tag: "Disponível" },
    { name: "Carregador Sony / Toshiba / Multilaser", tag: "Universal" },
  ];

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="product" />
      
      {/* --- BOTÃO FLUTUANTE STICKY (O MAIS IMPORTANTE) --- */}
      <a 
        href={openZap("Olá! Estou no site e preciso de um carregador com urgência.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.6)] transition-all hover:scale-110 animate-pulse"
      >
        <MessageCircle className="w-8 h-8 fill-white text-[#25D366]" />
        <div className="flex flex-col text-left leading-none">
          <span className="text-xs font-bold text-green-100">Precisa agora?</span>
          <span className="text-lg font-extrabold">Chamar no Zap</span>
        </div>
      </a>

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
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">Não sabe o modelo da sua fonte?</h2>
                <p className="text-zinc-500">Não arrisque comprar errado. Deixe com nossos técnicos.</p>
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

      {/* --- VITRINE SIMULADA (TUDO LEVA AO ZAP) --- */}
      <div className="py-16 container-balao">
        <div className="flex items-center justify-center mb-10 gap-2">
            <Zap className="text-[#E30613] w-6 h-6 fill-current" />
            <h2 className="text-3xl font-bold text-zinc-900">Modelos Disponíveis Agora</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {commonModels.map((item, idx) => (
                <a 
                    key={idx}
                    href={openZap(`Tenho interesse no ${item.name}`)}
                    target="_blank"
                    className="group"
                >
                    <Card className="overflow-hidden hover:shadow-xl transition-all border-zinc-200 hover:border-green-400 relative">
                        {item.tag && (
                            <Badge className="absolute top-2 right-2 bg-[#E30613] hover:bg-red-700">
                                {item.tag}
                            </Badge>
                        )}
                        <CardContent className="p-6 text-center">
                            <div className="w-full aspect-video bg-zinc-100 rounded-lg mb-4 flex items-center justify-center text-zinc-300">
                                <BatteryCharging className="w-16 h-16 group-hover:text-zinc-400 transition-colors" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-1 group-hover:text-[#E30613] transition-colors">{item.name}</h3>
                            <p className="text-xs text-zinc-500 mb-4">Garantia Balão + Nota Fiscal</p>
                            
                            <Button className="w-full bg-green-500 hover:bg-green-600 font-bold gap-2">
                                <MessageCircle className="w-4 h-4" /> Consultar Preço
                            </Button>
                        </CardContent>
                    </Card>
                </a>
            ))}
        </div>
        
        <div className="mt-10 text-center">
             <a href={openZap("Não achei meu modelo na lista, pode me ajudar?")} target="_blank">
                <span className="text-zinc-500 hover:text-[#E30613] underline cursor-pointer text-sm">
                    Não encontrou seu modelo? Clique aqui que nós temos no estoque.
                </span>
             </a>
        </div>
      </div>

      <div className="py-6 container-balao">
        <div className="flex items-center justify-center mb-6 gap-2">
          <Zap className="text-[#E30613] w-6 h-6 fill-current" />
          <h2 className="text-2xl font-bold text-zinc-900">Produtos da busca: fonte notebook</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {fonteNotebookProducts.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-xl transition-all border-zinc-200">
              <CardContent className="p-4">
                <div className="w-full aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-zinc-900 mb-1 line-clamp-2">{p.name}</h3>
                <p className="text-primary font-extrabold mb-3">{formatPrice(p.price)}</p>
                <a
                  href={openZap(`Tenho interesse em '${p.name}' por ${formatPrice(p.price)}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-[#25D366] hover:bg-[#1EB954] font-bold gap-2">
                    <MessageCircle className="w-4 h-4" /> Chamar no WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
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
