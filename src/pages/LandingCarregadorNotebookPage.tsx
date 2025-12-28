import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Assumindo que você tem este componente, senão pode usar div estilizada
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
  MapPin,
  ShoppingCart,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function LandingCarregadorNotebookPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const title = "Carregador de Notebook Original e Compatível | Entrega Imediata - Balão da Informática";
  const description = "Seu notebook parou? Encontre carregadores para Dell, Acer, HP, Lenovo, Samsung e Apple. Entrega rápida em todo Brasil ou retire em Campinas.";
  const keywords = "carregador notebook, fonte dell, fonte acer, fonte hp, carregador samsung, carregador lenovo, fonte universal, carregador usb-c, campinas";
  const url = "https://www.balao.info/carregador-de-notebook";

  // Dados simulados baseados na busca "FONTE NOTEBOOK"
  const featuredProducts = [
    {
      id: 1,
      title: "Fonte Carregador Notebook Dell 19.5V 3.34A 65W (Ponta Azul)",
      price: 149.90,
      oldPrice: 199.90,
      installments: "3x de R$ 49,96 sem juros",
      image: "https://m.media-amazon.com/images/I/51p+y-C4LlL._AC_SX679_.jpg", // Exemplo visual
      tag: "Mais Vendido"
    },
    {
      id: 2,
      title: "Fonte Carregador Notebook Acer 19V 3.42A 65W (Ponta Fina)",
      price: 99.90,
      oldPrice: 159.90,
      installments: "2x de R$ 49,95 sem juros",
      image: "https://m.media-amazon.com/images/I/61SdwjqvBKL._AC_SX679_.jpg",
      tag: "Oferta"
    },
    {
      id: 3,
      title: "Fonte Carregador Universal Notebook 120W com 10 Conectores",
      price: 189.90,
      oldPrice: 249.90,
      installments: "4x de R$ 47,47 sem juros",
      image: "https://m.media-amazon.com/images/I/71wE7-k7z+L._AC_SX679_.jpg",
      tag: "Compatível com Tudo"
    },
    {
      id: 4,
      title: "Fonte Carregador Samsung 19V 3.16A / 2.1A (Ponta Agulha)",
      price: 119.90,
      oldPrice: 169.00,
      installments: "3x de R$ 39,96 sem juros",
      image: "https://m.media-amazon.com/images/I/51wXkY7f+JL._AC_SX679_.jpg",
      tag: null
    },
    {
      id: 5,
      title: "Fonte Carregador Lenovo USB-C 65W (Power Delivery)",
      price: 229.90,
      oldPrice: 359.90,
      installments: "5x de R$ 45,98 sem juros",
      image: "https://m.media-amazon.com/images/I/51eM8y+yG+L._AC_SX679_.jpg",
      tag: "Original"
    },
    {
      id: 6,
      title: "Fonte Carregador Notebook HP 18.5V 3.5A 65W (Ponta Grossa)",
      price: 109.90,
      oldPrice: 149.90,
      installments: "2x de R$ 54,95 sem juros",
      image: "https://m.media-amazon.com/images/I/61+2z3QJ+dL._AC_SX679_.jpg",
      tag: null
    },
    {
        id: 7,
        title: "Fonte Carregador Asus 19V 3.42A ou 2.37A (Ponta Fina)",
        price: 129.90,
        oldPrice: 189.90,
        installments: "3x de R$ 43,30 sem juros",
        image: "https://m.media-amazon.com/images/I/61kCg+y5HLL._AC_SX679_.jpg",
        tag: null
    },
    {
        id: 8,
        title: "Cabo de Força Tripolar Novo Padrão BR 1.5 Metros",
        price: 19.90,
        oldPrice: 35.00,
        installments: "À vista no PIX",
        image: "https://m.media-amazon.com/images/I/41s7t+G+wRL._AC_SX679_.jpg",
        tag: "Essencial"
    }
  ];

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

      {/* --- HERO SECTION --- */}
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

              <form onSubmit={handleSearch} className="relative max-w-lg">
                <Input 
                  type="text" 
                  placeholder="Digite o modelo do notebook (ex: Dell Inspiron 15)"
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
            </div>

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
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 min-h-screen">
        
        {/* --- BRAND SELECTOR --- */}
        <div className="container-balao -mt-8 relative z-20 mb-12">
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

        {/* --- SECTION: PRODUTOS EM DESTAQUE (VITRINE) --- */}
        <div className="container-balao pb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    Destaques e Mais Vendidos
                </h2>
                <Link to="/busca?q=carregador+notebook" className="text-[#E30613] font-semibold hover:underline text-sm md:text-base">
                    Ver todos
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-zinc-200">
                        <CardContent className="p-4 flex flex-col h-full">
                            {/* Imagem */}
                            <div className="relative aspect-square mb-4 bg-white rounded-lg flex items-center justify-center p-2">
                                {product.tag && (
                                    <span className="absolute top-0 left-0 bg-[#E30613] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10 uppercase">
                                        {product.tag}
                                    </span>
                                )}
                                {/* Placeholder visual elegante se a imagem falhar ou apenas para layout */}
                                <div className="w-full h-full flex items-center justify-center">
                                    <img 
                                      src={product.image} 
                                      alt={product.title}
                                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        // Fallback se a imagem externa não carregar
                                        e.currentTarget.src = "https://placehold.co/200x200?text=Fonte+Notebook"; 
                                      }}
                                    />
                                </div>
                            </div>

                            {/* Info Produto */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-medium text-zinc-800 text-sm line-clamp-2 mb-2 h-10 leading-snug group-hover:text-[#E30613] transition-colors">
                                    {product.title}
                                </h3>
                                
                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-zinc-400 line-through">R$ {product.oldPrice.toFixed(2).replace('.', ',')}</span>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-1 rounded">-25%</span>
                                    </div>
                                    <div className="text-2xl font-bold text-[#E30613]">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-3">{product.installments}</p>
                                    
                                    <Button className="w-full bg-[#E30613] hover:bg-red-700 font-bold gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Comprar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                <Link to="/busca?q=fonte+notebook">
                     <Button variant="outline" size="lg" className="border-zinc-300 text-zinc-700 hover:text-[#E30613] hover:border-[#E30613]">
                        Carregar mais produtos
                     </Button>
                </Link>
            </div>
        </div>
        
        {/* --- TRUST BAR --- */}
        <div className="bg-white border-y border-zinc-200 py-10">
          <div className="container-balao grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Garantia Balão</h3>
                  <p className="text-sm text-zinc-600 mt-1">Garantia estendida e troca imediata. Compre sem medo.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="bg-green-50 p-3 rounded-full text-green-600 shrink-0">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Entrega Ninja</h3>
                  <p className="text-sm text-zinc-600 mt-1">Envio imediato para todo Brasil. Logística própria.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600 shrink-0">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Ajuda Técnica</h3>
                  <p className="text-sm text-zinc-600 mt-1">Não sabe qual comprar? Nosso time te ajuda agora.</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- EDUCATIONAL --- */}
        <div className="bg-zinc-50 py-12">
          <div className="container-balao">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-zinc-900">Como identificar sua fonte?</h2>
              <p className="text-zinc-500">3 passos simples para não errar na compra</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-md">
                  <CardContent className="p-6 text-center">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold mx-auto mb-4 text-zinc-600">1</div>
                      <h3 className="font-bold mb-2">Voltagem (V)</h3>
                      <p className="text-sm text-zinc-500">Deve ser <span className="text-green-600 font-bold">IGUAL</span> à da sua fonte antiga.</p>
                  </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                  <CardContent className="p-6 text-center">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold mx-auto mb-4 text-zinc-600">2</div>
                      <h3 className="font-bold mb-2">Amperagem (A)</h3>
                      <p className="text-sm text-zinc-500">Deve ser <span className="text-green-600 font-bold">IGUAL ou MAIOR</span>.</p>
                  </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                  <CardContent className="p-6 text-center">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold mx-auto mb-4 text-zinc-600">3</div>
                      <h3 className="font-bold mb-2">Pino Conector</h3>
                      <p className="text-sm text-zinc-500">Compare visualmente a ponta (fina, grossa ou USB-C).</p>
                  </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* --- FOOTER LOCATION --- */}
        <div className="bg-white py-8 border-t">
            <div className="container-balao">
                <div className="flex items-center gap-2 text-sm text-zinc-500 justify-center">
                    <MapPin className="w-4 h-4" />
                    <span>Disponível para retirada imediata em Campinas - SP</span>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}