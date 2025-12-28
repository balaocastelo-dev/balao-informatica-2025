import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BatteryCharging,
  Truck,
  ShieldCheck,
  Phone,
  Search,
  CheckCircle2,
  Zap,
  HelpCircle,
  ArrowRight,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function LandingCarregadorNotebookPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const title = "Carregador de Notebook Original e Compatível | Entrega Imediata - Balão da Informática";
  const description = "Seu notebook parou? Encontre carregadores para Dell, Acer, HP, Lenovo, Samsung e Apple. Entrega rápida em todo Brasil ou retire em Campinas.";
  const keywords = "carregador notebook, fonte dell, fonte acer, fonte hp, carregador samsung, carregador lenovo, fonte universal, carregador usb-c, campinas";
  const url = "https://www.balao.info/carregador-de-notebook";

  const popularBrands = [
    { name: "Dell", query: "carregador notebook dell" },
    { name: "Acer", query: "carregador notebook acer" },
    { name: "HP", query: "carregador notebook hp" },
    { name: "Lenovo", query: "carregador notebook lenovo" },
    { name: "Samsung", query: "carregador notebook samsung" },
    { name: "Asus", query: "carregador notebook asus" },
    { name: "Apple", query: "carregador macbook" },
    { name: "Positivo", query: "carregador notebook positivo" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      window.location.href = `/busca?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="product" />
      <BreadcrumbSchema
        items={[
          { name: "Início", url: "https://www.balao.info" },
          { name: "Peças e Acessórios", url: "https://www.balao.info/categorias/acessorios" },
          { name: "Carregadores e Fontes", url },
        ]}
      />

      {/* --- HERO SECTION: Foco em Resolução de Problema --- */}
      <div className="bg-[#E30613] text-white">
        <div className="container-balao py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-800/30 px-3 py-1 rounded-full text-sm font-medium border border-red-400/20">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>Envio em até 24h ou Retirada Imediata</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Seu Notebook Parou? <br />
                <span className="text-red-100">Nós temos a energia que falta.</span>
              </h1>
              
              <p className="text-lg text-red-50 max-w-xl">
                Fontes originais e compatíveis Premium para todas as marcas. 
                Garantia total, Nota Fiscal e o suporte técnico que você confia.
              </p>

              {/* Barra de Busca Principal */}
              <form onSubmit={handleSearch} className="relative max-w-lg">
                <Input 
                  type="text" 
                  placeholder="Digite o modelo do seu notebook (ex: Dell Inspiron 15)"
                  className="h-14 pl-12 pr-4 text-zinc-900 bg-white shadow-xl rounded-xl border-0 ring-offset-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-4 text-zinc-400 w-6 h-6" />
                <Button 
                  type="submit"
                  className="absolute right-2 top-2 h-10 bg-[#E30613] hover:bg-red-700 text-white font-bold rounded-lg px-6"
                >
                  Buscar
                </Button>
              </form>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium pt-2">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-300" /> Compatibilidade Garantida</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-300" /> Proteção contra Curto</span>
              </div>
            </div>

            {/* Visual de "Produto" Abstrato ou Ilustração */}
            <div className="hidden md:flex justify-center relative">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-2xl relative z-10">
                <BatteryCharging className="w-32 h-32 text-white mx-auto mb-4 opacity-90" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Dúvida no modelo?</h3>
                  <p className="text-red-100 text-sm mb-4">Envie uma foto da etiqueta da sua fonte antiga.</p>
                  <Button variant="secondary" className="w-full gap-2 font-bold text-[#E30613]">
                    <Phone className="w-4 h-4" />
                    Falar com Especialista
                  </Button>
                </div>
              </div>
              {/* Elementos decorativos de fundo */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 min-h-screen">
        
        {/* --- BRAND SELECTOR: Atalho Mental --- */}
        <div className="container-balao -mt-8 relative z-20">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-4">Escolha pela marca</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {popularBrands.map((brand) => (
                <Link key={brand.name} to={`/busca?q=${encodeURIComponent(brand.query)}`}>
                  <div className="group flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-100 hover:border-[#E30613] hover:shadow-md transition-all cursor-pointer bg-zinc-50 hover:bg-white h-full">
                    <span className="font-semibold text-zinc-700 group-hover:text-[#E30613]">{brand.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- TRUST BAR --- */}
        <div className="container-balao py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Garantia Total</h3>
                  <p className="text-sm text-zinc-600 mt-1">Todos os carregadores acompanham Nota Fiscal e garantia de troca imediata em caso de defeito.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-green-50/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Entrega Expressa</h3>
                  <p className="text-sm text-zinc-600 mt-1">Despacho em 24h para todo Brasil. Em Campinas e região, consulte entrega no mesmo dia.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-purple-50/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Não erre na compra</h3>
                  <p className="text-sm text-zinc-600 mt-1">Nossa equipe técnica verifica a compatibilidade antes do envio se você tiver dúvidas.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- EDUCATIONAL: Como Comprar (Reduz Medo) --- */}
        <div className="bg-white py-12 border-y">
          <div className="container-balao">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Como escolher a fonte correta?</h2>
              <p className="text-zinc-500 mt-2">Verifique apenas 3 informações na etiqueta da sua fonte antiga</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Linha conectora (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-zinc-200 -z-10"></div>

              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-12 h-12 bg-[#E30613] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg border-4 border-white">1</div>
                <h3 className="font-bold text-lg mb-2">Voltagem (V)</h3>
                <p className="text-sm text-zinc-600">A Voltagem deve ser <strong>exatamente igual</strong>. <br/>Ex: 19V, 19.5V, 20V.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-12 h-12 bg-[#E30613] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg border-4 border-white">2</div>
                <h3 className="font-bold text-lg mb-2">Amperagem (A)</h3>
                <p className="text-sm text-zinc-600">A Amperagem deve ser <strong>igual ou maior</strong>. <br/>Nunca menor que a original.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-12 h-12 bg-[#E30613] text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg border-4 border-white">3</div>
                <h3 className="font-bold text-lg mb-2">Pino Conector</h3>
                <p className="text-sm text-zinc-600">Verifique o formato da ponta. <br/>(Ponta fina, grossa, USB-C ou retangular).</p>
              </div>
            </div>

            <div className="mt-10 text-center">
               <Link to="/busca?q=carregador%20universal">
                 <Button variant="outline" className="gap-2 border-zinc-300">
                    Ainda com dúvida? Ver Carregadores Universais <ArrowRight className="w-4 h-4"/>
                 </Button>
               </Link>
            </div>
          </div>
        </div>

        {/* --- CATEGORIAS ESPECÍFICAS --- */}
        <div className="container-balao py-12">
            <h2 className="text-2xl font-bold mb-6">Categorias Populares</h2>
            <div className="grid md:grid-cols-4 gap-4">
                <Link to="/busca?q=carregador%20usb-c" className="group">
                    <Card className="h-full hover:border-[#E30613] transition-colors cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Zap className="w-10 h-10 text-zinc-400 group-hover:text-[#E30613] mb-4" />
                            <h3 className="font-bold">USB-C Power Delivery</h3>
                            <p className="text-xs text-zinc-500 mt-2">Para MacBooks e Ultrabooks modernos (45W a 100W)</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/busca?q=carregador%20gamer" className="group">
                    <Card className="h-full hover:border-[#E30613] transition-colors cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <BatteryCharging className="w-10 h-10 text-zinc-400 group-hover:text-[#E30613] mb-4" />
                            <h3 className="font-bold">Linha Gamer</h3>
                            <p className="text-xs text-zinc-500 mt-2">Dell G15, Acer Nitro, Lenovo Legion (130W+)</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/busca?q=fonte%20monitor" className="group">
                    <Card className="h-full hover:border-[#E30613] transition-colors cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-md border-2 border-zinc-300 group-hover:border-[#E30613] mb-4 flex items-center justify-center text-zinc-400 group-hover:text-[#E30613] font-bold text-xs">LG/SA</div>
                            <h3 className="font-bold">Fontes de Monitor</h3>
                            <p className="text-xs text-zinc-500 mt-2">LG, Samsung e AOC (12V, 14V e 19V)</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/busca?q=cabo%20de%20forca" className="group">
                    <Card className="h-full hover:border-[#E30613] transition-colors cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 flex items-center justify-center text-zinc-400 group-hover:text-[#E30613]">
                                <span className="text-2xl font-bold">~</span>
                            </div>
                            <h3 className="font-bold">Cabos de Força</h3>
                            <p className="text-xs text-zinc-500 mt-2">Padrão Novo BR, Tripolar e Bipolar</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>

        {/* --- SEO FOOTER & LOCATION --- */}
        <div className="bg-white py-12 border-t">
            <div className="container-balao">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-zinc-50 p-6 rounded-xl border border-dashed border-zinc-300">
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-lg text-zinc-800 mb-2">
                            <MapPin className="text-[#E30613]" /> Retirada em Campinas - SP
                        </h3>
                        <p className="text-sm text-zinc-600 max-w-md">
                            Precisando com urgência? Compre pelo site e retire em nossa loja física. 
                            Estamos localizados estrategicamente para atender Campinas e região (Sumaré, Hortolândia, Valinhos, Paulínia).
                        </p>
                    </div>
                    <div className="text-right">
                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Phone className="w-4 h-4" />
                            (19) WhatsApp Vendas
                        </Button>
                    </div>
                </div>

                <div className="mt-8 text-xs text-zinc-400 text-justify leading-relaxed">
                    <p>
                        <strong>Termos relacionados:</strong> Carregador notebook original, Fonte Dell Inspiron 15 3000, Carregador Acer Aspire 3, Fonte Lenovo IdeaPad s145, 
                        Carregador Samsung Book, Fonte HP 240 G6, Carregador USB-C Apple MacBook Air, Fonte Universal Notebook, Carregador Asus VivoBook 15. 
                        Especificações: 19V 3.42A, 19.5V 4.62A, 20V 3.25A, 65W, 45W, 90W. Modelos: PA-10, PA-12, ADP-65JH, HA65NS5-00.
                        Atendemos todo o Brasil com envio rápido via Correios e Transportadoras.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
