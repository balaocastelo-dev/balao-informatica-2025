import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, MapPin, MessageCircle, Phone, ShieldCheck, Star, Timer, Truck } from "lucide-react";

export default function LandingNotebookSeminovoBaratoPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Quero um notebook seminovo barato. Vou informar orçamento, uso (estudo/trabalho) e preferência de tela/memória.",
  )}`;

  const title = "Notebook Seminovo Barato em Campinas | Revisado, com Garantia | Balão da Informática";
  const description =
    "Notebook seminovo barato em Campinas com revisão, testes e garantia. Opções para estudo, trabalho e home office. Retire na Av. Anchieta (Cambuí) ou receba rápido. Atendemos Campinas e região e enviamos para o Brasil todo.";
  const keywords =
    "notebook seminovo barato campinas, notebook usado campinas, notebook recondicionado campinas, notebook custo beneficio campinas, notebook para estudo campinas, notebook para trabalho campinas, notebook para home office campinas, notebook i5 barato, notebook i7 barato, notebook ryzen barato, notebook com ssd barato, notebook com 8gb ram barato, notebook com 16gb ram barato, notebook tela 15 polegadas barato, notebook tela 14 polegadas barato, notebook com garantia campinas, comprar notebook seminovo campinas, loja de notebook campinas cambui, av anchieta 789 campinas, envio notebook brasil, notebook seminovo sao paulo, notebook barato sp, campinas e região, valinhos, vinhedo, paulínia, sumaré, hortolândia, indaiatuba";
  const url = "https://www.balao.info/notebook-seminovo-barato";

  const { products } = useProducts();

  const highlights = [
    { title: "Revisado e testado", text: "Checklist de funcionamento: bateria, teclado, portas, tela e desempenho." },
    { title: "Garantia e suporte", text: "Compra com segurança e atendimento no pós-venda." },
    { title: "Custo-benefício real", text: "Opções com SSD e memória para rodar liso no dia a dia." },
    { title: "Retirada/entrega", text: "Retire na loja em Campinas ou receba rápido (consulte). " },
  ];

  const useCases = [
    "Notebook para estudo (Google Classroom, Meet, Office, PDF)",
    "Notebook para trabalho e home office (Teams, Excel, CRM)",
    "Notebook para faculdade (programação leve, pesquisas)",
    "Notebook para design leve (Canva, edição básica)",
    "Notebook para empresas (padronização e suporte)",
    "Notebook para viagens (portátil e confiável)",
    "Notebook para uso doméstico (internet, streaming, banco)",
    "Notebook para atendimento e vendas (PDV, sistemas web)",
    "Upgrade de notebook antigo (SSD + RAM)",
    "Configuração e instalação de programas",
    "Migração de dados do notebook antigo",
    "Antivírus, limpeza e otimização",
  ];

  const relatedProducts = useMemo(() => {
    const primary = filterProductsByQuery(products || [], "seminovo");
    if (primary.length >= 12) return primary.slice(0, 36);
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "notebook"),
      filterProductsByQuery(products || [], "laptop"),
      filterProductsByQuery(products || [], "ssd"),
      filterProductsByQuery(products || [], "memoria"),
      filterProductsByQuery(products || [], "memória"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="product" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Notebook Seminovo Barato", url }]} />

      <div className="bg-white min-h-screen font-sans">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">OPÇÕES REVISADAS + GARANTIA: ESCOLHA SEM MEDO</span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Quero um notebook</span>
        </a>

        <section className="relative bg-zinc-950 text-white overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E30613]/20 via-transparent to-transparent" />
          <div className="container-balao relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-yellow-400" />
                Campinas • Cambuí
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Notebook seminovo barato
                <span className="text-yellow-400"> com garantia</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">
                Para estudo, trabalho e home office. Envie seu orçamento e objetivo no WhatsApp e indicamos as melhores opções.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-lg font-bold rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Pedir indicação
                  </Button>
                </a>
                <a href="tel:+551932551661" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Ligar
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <ShieldCheck className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Revisão e garantia</p>
                  <p className="text-sm text-zinc-300">Compra com segurança e suporte.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Star className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Melhor custo-benefício</p>
                  <p className="text-sm text-zinc-300">SSD + RAM para rodar liso.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-zinc-900 border border-zinc-200">
              <h2 className="text-2xl font-black mb-2">Me diga 3 coisas</h2>
              <p className="text-zinc-600 mb-6">E eu te passo as melhores opções.</p>
              <div className="space-y-3">
                {["Orçamento aproximado (R$)", "Uso principal (estudo, trabalho, design, etc.)", "Preferência de tamanho (14/15) e se precisa de bateria forte"].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-zinc-700">{t}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 bg-[#E30613] hover:bg-[#c00510] text-white font-black rounded-xl">
                    Chamar no WhatsApp
                  </Button>
                </a>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Retire em Campinas ou receba rápido (consulte).</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <h2 className="text-3xl font-bold text-zinc-900 mb-2">Para quem é?</h2>
            <p className="text-zinc-600 mb-8">Cenários mais comuns (e como a gente ajuda).</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map((item) => (
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
                <h2 className="text-3xl font-bold text-zinc-900">Notebooks e itens relacionados</h2>
                <p className="text-zinc-600 mt-2">Grid filtrado por “seminovo/notebook”.</p>
              </div>
              <Link to="/busca?q=notebook" className="text-[#E30613] font-semibold hover:underline">
                Ver tudo em busca
              </Link>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">Por que comprar com a Balão?</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {highlights.map((h) => (
                <Card key={h.title} className="border-zinc-200">
                  <CardContent className="p-6">
                    <p className="font-black text-zinc-900">{h.title}</p>
                    <p className="text-sm text-zinc-600 mt-2">{h.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full h-12 bg-[#25D366] hover:bg-[#1EB954] text-white font-black rounded-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Quero recomendação
                </Button>
              </a>
              <Link to="/categoria/notebooks" className="flex-1">
                <Button variant="outline" className="w-full h-12 rounded-xl">
                  Ver categoria Notebooks
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-0 relative border-t border-zinc-200">
          <div className="grid md:grid-cols-2 min-h-[520px]">
            <div className="bg-neutral-900 text-white p-10 md:p-20 flex flex-col justify-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-8 text-white">Retire na loja ou peça envio</h2>
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
                      <h4 className="font-bold text-lg mb-1">Entrega</h4>
                      <p className="text-neutral-300">Campinas e região: rápido</p>
                      <p className="text-neutral-300">Brasil: envio sob consulta</p>
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

