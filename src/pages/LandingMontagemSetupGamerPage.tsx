import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, Cpu, MapPin, MessageCircle, Phone, ShieldCheck, Timer, Wrench } from "lucide-react";

export default function LandingMontagemSetupGamerPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Quero montar um setup gamer. Vou informar orçamento, jogos e se já tenho alguma peça.",
  )}`;

  const title = "Montagem de Setup Gamer em Campinas | PC Gamer, Upgrade e Otimização | Balão da Informática";
  const description =
    "Montagem de setup gamer em Campinas: PC Gamer sob medida, cable management, atualização de BIOS, instalação, testes e otimização. Traga suas peças ou compre com a gente. Atendimento em Campinas e região.";
  const keywords =
    "montagem pc gamer campinas, montar pc gamer campinas, setup gamer campinas, pc gamer sob medida campinas, upgrade pc gamer campinas, montagem computador campinas, montagem com cable management, instalação windows pc gamer, otimização pc gamer, testes stress pc, atualização bios campinas, water cooler instalação campinas, fonte para pc gamer campinas, placa de video instalação campinas, processador instalação campinas, memoria ram pc gamer campinas, ssd nvme instalação, gabinete airflow campinas, campinas cambui av anchieta 789, loja pc gamer campinas, valinhos vinhedo paulinia sumare hortolandia indaiatuba";
  const url = "https://www.balao.info/montagem-setup-gamer";

  const { products } = useProducts();

  const blocks = [
    "Montagem completa e organização de cabos",
    "Escolha de peças por objetivo (FPS, AAA, streaming)",
    "Atualização de BIOS e drivers",
    "Instalação do Windows e softwares essenciais",
    "Perfil XMP/EXPO e estabilidade",
    "Testes de stress (CPU/GPU/RAM) e temperatura",
    "Ajustes de airflow e fan curve",
    "Montagem com water cooler / air cooler",
    "Troca de pasta térmica premium",
    "Upgrade de SSD / RAM / GPU",
    "Limpeza e manutenção preventiva",
    "Diagnóstico de travamentos e tela azul",
    "Configuração de periféricos e monitores",
    "Consultoria de compra e custo-benefício",
    "Montagem para empresas e creators",
    "Atendimento via WhatsApp",
  ];

  const relatedProducts = useMemo(() => {
    const primary = mergeUniqueProductsById([
      filterProductsByQuery(products || [], "pc gamer"),
      filterProductsByQuery(products || [], "setup gamer"),
    ]);
    if (primary.length >= 12) return primary.slice(0, 36);
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "placa de vídeo"),
      filterProductsByQuery(products || [], "placa de video"),
      filterProductsByQuery(products || [], "rtx"),
      filterProductsByQuery(products || [], "geforce"),
      filterProductsByQuery(products || [], "radeon"),
      filterProductsByQuery(products || [], "processador"),
      filterProductsByQuery(products || [], "ryzen"),
      filterProductsByQuery(products || [], "intel"),
      filterProductsByQuery(products || [], "memoria"),
      filterProductsByQuery(products || [], "ssd"),
      filterProductsByQuery(products || [], "fonte"),
      filterProductsByQuery(products || [], "gabinete"),
      filterProductsByQuery(products || [], "monitor"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Montagem Setup Gamer", url }]} />

      <div className="bg-white min-h-screen font-sans">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">PC GAMER SOB MEDIDA: MAIS FPS, MENOS DOR DE CABEÇA</span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Montar meu PC</span>
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
                Montagem de Setup Gamer
                <span className="text-yellow-400"> completa</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">
                A gente monta, testa e entrega pronto para jogar. Se você já tem peças, a gente integra e otimiza.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-lg font-bold rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Orçar no WhatsApp
                  </Button>
                </a>
                <a href="tel:+551932551661" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Ligar
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Cpu className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Sob medida</p>
                  <p className="text-sm text-zinc-300">Para jogos e orçamento.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Wrench className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Montado e testado</p>
                  <p className="text-sm text-zinc-300">Estabilidade e temperaturas.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <ShieldCheck className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Garantia</p>
                  <p className="text-sm text-zinc-300">Suporte e transparência.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-zinc-900 border border-zinc-200">
              <h2 className="text-2xl font-black mb-2">Para montar com precisão</h2>
              <p className="text-zinc-600 mb-6">Me diga o objetivo e orçamento.</p>
              <div className="space-y-3">
                {["Orçamento (R$) e se quer parcelar", "Quais jogos e em qual resolução (1080p/1440p/4K)", "Você já tem alguma peça? (GPU, gabinete, fonte…)"].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-zinc-700">{t}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 bg-[#E30613] hover:bg-[#c00510] text-white font-black rounded-xl">
                    Começar orçamento
                  </Button>
                </a>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Atendimento em Campinas e região. Montagens sob demanda.</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">O que está incluso</h2>
                <p className="text-zinc-600 mt-2">Vários blocos de serviço e gatilhos de confiança.</p>
              </div>
              <Link to="/montar-pc" className="text-[#E30613] font-semibold hover:underline">
                Usar montador de PC
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((item) => (
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
                <h2 className="text-3xl font-bold text-zinc-900">Peças e componentes relacionados</h2>
                <p className="text-zinc-600 mt-2">Grid filtrado por termos gamer/hardware.</p>
              </div>
              <Link to="/categoria/todos" className="text-[#E30613] font-semibold hover:underline">
                Ver todas as categorias
              </Link>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>
      </div>
    </Layout>
  );
}

