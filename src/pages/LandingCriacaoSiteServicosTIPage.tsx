import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductContext";
import { filterProductsByQuery, mergeUniqueProductsById } from "@/lib/productFilter";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, Globe, MapPin, MessageCircle, Phone, ShieldCheck, Timer, Wrench } from "lucide-react";

export default function LandingCriacaoSiteServicosTIPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Quero criação de site e serviços de TI. Vou explicar meu negócio e o que preciso.",
  )}`;

  const title = "Criação de Site e Serviços de T.I. em Campinas | Suporte, Redes e Segurança | Balão da Informática";
  const description =
    "Criação de site e serviços de T.I. em Campinas: sites rápidos e responsivos, suporte, redes, Microsoft, segurança, backup e consultoria. Atendimento em Campinas e região e projetos para todo o Brasil.";
  const keywords =
    "criacao de site campinas, desenvolvimento de site campinas, site institucional campinas, loja virtual campinas, landing page campinas, seo campinas, servicos de ti campinas, suporte ti campinas, consultoria ti campinas, redes campinas, cabeamento estruturado campinas, firewall campinas, backup empresa campinas, microsoft 365 campinas, windows server campinas, licencas microsoft campinas, segurança da informação campinas, manutenção computadores campinas, monitoramento ti campinas, helpdesk campinas, cambui campinas av anchieta 789, projetos ti brasil, atendimento remoto ti, valinhos vinhedo paulinia sumare hortolandia indaiatuba";
  const url = "https://www.balao.info/criacao-de-site-e-servicos-ti";

  const { products } = useProducts();

  const services = [
    "Criação de site institucional (rápido, responsivo e seguro)",
    "Landing pages de alta conversão",
    "E-commerce e integrações (consultar)",
    "SEO on-page: titles, metas, performance e estrutura",
    "Hospedagem, domínio e e-mails profissionais (consultar)",
    "Suporte de TI para empresas e home office",
    "Redes: Wi‑Fi, roteadores, switches e organização",
    "Backup, políticas e recuperação de dados (consultar)",
    "Segurança: antivírus, hardening e boas práticas",
    "Microsoft: Windows, Office, Microsoft 365 e licenças",
    "Servidor e infraestrutura (consultar)",
    "Manutenção preventiva e otimização",
    "Implantação e padronização de máquinas",
    "Atendimento remoto e presencial em Campinas",
    "Projeto sob demanda para todo o Brasil",
  ];

  const relatedProducts = useMemo(() => {
    const primary = mergeUniqueProductsById([
      filterProductsByQuery(products || [], "microsoft"),
      filterProductsByQuery(products || [], "office"),
      filterProductsByQuery(products || [], "windows"),
    ]);
    const extra = mergeUniqueProductsById([
      primary,
      filterProductsByQuery(products || [], "roteador"),
      filterProductsByQuery(products || [], "switch"),
      filterProductsByQuery(products || [], "wifi"),
      filterProductsByQuery(products || [], "cabo"),
      filterProductsByQuery(products || [], "notebook"),
      filterProductsByQuery(products || [], "ssd"),
      filterProductsByQuery(products || [], "memoria"),
    ]);
    return extra.slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Criação de Site e Serviços de T.I.", url }]} />

      <div className="bg-white min-h-screen font-sans">
        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">SITE + TI: MAIS VENDAS, MENOS PROBLEMAS</span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1EB954] text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Falar com TI</span>
        </a>

        <section className="relative bg-zinc-950 text-white overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E30613]/20 via-transparent to-transparent" />
          <div className="container-balao relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-yellow-400" />
                Campinas • Cambuí • Projetos Brasil
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Criação de Site e Serviços de T.I.
                <span className="text-yellow-400"> para empresas</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">
                Site rápido e bem feito + suporte de TI. Um parceiro para resolver o que dá lucro e o que dá dor de cabeça.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#25D366] hover:bg-[#1EB954] text-white text-lg font-bold rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Pedir proposta
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
                  <Globe className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Site rápido</p>
                  <p className="text-sm text-zinc-300">Performance e SEO.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Wrench className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">TI prática</p>
                  <p className="text-sm text-zinc-300">Suporte e redes.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <ShieldCheck className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-bold">Segurança</p>
                  <p className="text-sm text-zinc-300">Boas práticas e licenças.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl text-zinc-900 border border-zinc-200">
              <h2 className="text-2xl font-black mb-2">Para uma proposta rápida</h2>
              <p className="text-zinc-600 mb-6">Me diga o objetivo do site e do suporte.</p>
              <div className="space-y-3">
                {["Qual seu negócio e qual meta (leads, vendas, autoridade)?", "Você já tem domínio/hospedagem? (se não, resolvemos)", "Precisa de TI: redes, licenças, PCs, backup?"].map((t) => (
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
              <p className="text-xs text-zinc-500 mt-3">Atendimento em Campinas e projetos para todo o Brasil.</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-b">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900">O que entregamos</h2>
                <p className="text-zinc-600 mt-2">Blocos de serviço para site e TI.</p>
              </div>
              <Link to="/licencas-microsoft" className="text-[#E30613] font-semibold hover:underline">
                Ver licenças Microsoft
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((item) => (
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
                <h2 className="text-3xl font-bold text-zinc-900">Produtos e soluções relacionadas</h2>
                <p className="text-zinc-600 mt-2">Grid filtrado por Microsoft/Office/Windows e rede.</p>
              </div>
              <Link to="/busca?q=microsoft" className="text-[#E30613] font-semibold hover:underline">
                Ver busca Microsoft
              </Link>
            </div>
            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>
      </div>
    </Layout>
  );
}

