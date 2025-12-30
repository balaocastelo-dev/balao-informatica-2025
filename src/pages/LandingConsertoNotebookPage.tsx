import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, Laptop, MapPin, MessageCircle, Phone, ShieldCheck, Timer, Wrench } from "lucide-react";

export default function LandingConsertoNotebookPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Preciso de conserto de notebook. Vou informar marca/modelo e o defeito (posso mandar foto).",
  )}`;

  const title = "Conserto de Notebook em Campinas | Diagnóstico Rápido e Garantia | Balão da Informática";
  const description =
    "Conserto de notebook em Campinas (Cambuí): não liga, não carrega, tela sem imagem, teclado, SSD/HD, memória, superaquecimento e limpeza. Diagnóstico rápido e garantia. Atendimento Campinas e região.";
  const keywords =
    "conserto notebook campinas, assistência notebook campinas, notebook nao liga, notebook nao carrega, conserto placa notebook campinas, troca tela notebook campinas, troca teclado notebook campinas, troca bateria notebook campinas, conserto conector de carga notebook, upgrade ssd notebook campinas, upgrade memoria ram notebook campinas, limpeza interna notebook campinas, notebook superaquecendo, notebook desligando sozinho, formatação notebook campinas, instalação windows notebook, recuperação de dados notebook, campinas cambui av anchieta 789, valinhos vinhedo paulinia sumare hortolandia indaiatuba";
  const url = "https://www.balao.info/conserto-de-notebook";

  const { products } = useProducts();

  const repairs = [
    "Notebook não liga / não dá vídeo",
    "Notebook não carrega / conector de carga com folga",
    "Troca de tela (LCD/LED) e flat",
    "Troca de teclado e touchpad",
    "Troca de bateria (quando disponível)",
    "Limpeza interna + pasta térmica",
    "Superaquecimento e throttling",
    "Upgrade SSD / NVMe e migração do sistema",
    "Upgrade de memória RAM e compatibilidade",
    "Troca de HD/SSD com backup",
    "Formatação e instalação do Windows",
    "Remoção de vírus e otimização",
    "Reparo de portas (USB, HDMI, P2)",
    "Reparo de carcaça e dobradiças",
    "Problemas de Wi‑Fi / Bluetooth",
    "Recuperação de dados (análise)",
    "Orçamento no WhatsApp com foto da etiqueta/modelo",
  ];

  const relatedProducts = useMemo(() => {
    const primary = filterProductsByQuery(products || [], "notebook");
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "ssd"),
      filterProductsByQuery(products || [], "memoria"),
      filterProductsByQuery(products || [], "memória"),
      filterProductsByQuery(products || [], "fonte notebook"),
      filterProductsByQuery(products || [], "carregador"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Conserto de Notebook", url }]} />

      <div className="bg-white min-h-screen font-sans">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">SE PAROU HOJE, A GENTE CORRE PRA RESOLVER</span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Orçar agora</span>
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
                Conserto de Notebook
                <span className="text-yellow-400"> com diagnóstico rápido</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">
                Traga seu notebook ou envie foto do modelo e do problema no WhatsApp. A gente orienta e agiliza o orçamento.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-lg font-bold rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
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
                  <Laptop className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Todas as marcas</p>
                  <p className="text-sm text-zinc-300">Dell, Acer, Lenovo, HP, Asus…</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Wrench className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Reparo e upgrade</p>
                  <p className="text-sm text-zinc-300">SSD, RAM, manutenção e mais.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <ShieldCheck className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Garantia</p>
                  <p className="text-sm text-zinc-300">Serviço com garantia.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-zinc-900 border border-zinc-200">
              <h2 className="text-2xl font-black mb-2">Para agilizar</h2>
              <p className="text-zinc-600 mb-6">Foto do modelo/etiqueta e descrição do defeito.</p>
              <div className="space-y-3">
                {["Marca e modelo", "O que acontece (não liga, sem imagem, não carrega…)", "Caiu/molhou? começou quando?", "Pode mandar foto/vídeo?"].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-zinc-700">{t}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 bg-[#E30613] hover:bg-[#c00510] text-white font-black rounded-xl">
                    Pedir orçamento
                  </Button>
                </a>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Atendemos Campinas e região.</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">Dezenas de serviços</h2>
                <p className="text-zinc-600 mt-2">Conserto, manutenção e upgrade.</p>
              </div>
              <Link to="/manutencao" className="text-[#E30613] font-semibold hover:underline">
                Ver assistência técnica
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repairs.map((item) => (
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
                <h2 className="text-3xl font-bold text-zinc-900">Peças e upgrades</h2>
                <p className="text-zinc-600 mt-2">Grid filtrado para notebook/SSD/RAM/fonte notebook.</p>
              </div>
              <Link to="/busca?q=notebook" className="text-[#E30613] font-semibold hover:underline">
                Ver busca
              </Link>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>
      </div>
    </Layout>
  );
}

