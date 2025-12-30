import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import { useMemo } from "react";
import { 
  BadgeCheck, ShieldAlert, Phone, CheckCircle2, 
  Server, Lock, FileText, Zap, MessageCircle, 
  ArrowRight, Download, Users, Briefcase, MapPin, Timer
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingLicencasMicrosoftPage() {
  // Configurações de SEO e Contato
  const whatsappNumber = "5519987510267";
  const whatsappMessage = "Olá! Gostaria de cotar licenças Microsoft para minha empresa.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const { products } = useProducts();
  
  const title = "Licenças Microsoft Originais e Corporativas | Regularize sua Empresa | Balão da Informática";
  const description = "Evite multas e auditorias. Compre Windows 11 Pro, Office 2021, Windows Server e SQL Server com Nota Fiscal. Licenciamento CSP, OEM e Open para empresas.";
  
  // Lista massiva de palavras-chave para SEO (Injetada no Meta e no Conteúdo Oculto)
  const keywords = "comprar licença windows 11 pro, windows 10 pro original, office 2021 home business vitalicio, office 2021 professional plus, microsoft 365 business standard, windows server 2022 standard, windows server 2022 datacenter, sql server 2019 standard, licença cal de acesso, rds cal area de trabalho remota, regularização microsoft, auditoria microsoft, compliance de software, revenda autorizada microsoft brasil, comprar licença volume, contrato open value, licença csp perpetua, licença oem vs fpp, chave de ativação genuina, nota fiscal licença software, microsoft partner, balão da informatica, campinas, são paulo";
  
  const url = "https://www.balao.info/licencas-microsoft";

  const relatedProducts = useMemo(() => {
    const byCategory = (products || []).filter((p) => (p.category || "").toLowerCase() === "licencas");
    if (byCategory.length) return byCategory.slice(0, 36);
    const kw = ["microsoft", "windows", "office", "365", "server", "sql", "licen", "chave"];
    return (products || [])
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        if (!name) return false;
        return kw.some((k) => name.includes(k));
      })
      .slice(0, 36);
  }, [products]);

  return (
    <Layout>
      <SEOHead title={title} description={description} keywords={keywords} url={url} type="article" />
      <BreadcrumbSchema items={[{ name: "Início", url: "https://www.balao.info" }, { name: "Licenciamento Microsoft", url }]} />

      <div className="bg-white min-h-screen font-sans selection:bg-[#E30613] selection:text-white">

        <div className="bg-yellow-400 text-zinc-900 font-black text-center py-3 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-700">
          <Timer className="w-6 h-6 animate-pulse text-[#E30613]" />
          <span className="text-sm md:text-base uppercase tracking-wide">
            REGULARIZE HOJE: ENTREGA DIGITAL RÁPIDA + NOTA FISCAL
          </span>
        </div>
        
        {/* === FLOATING WHATSAPP BUTTON (CONVERSÃO MÁXIMA) === */}
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 animate-in slide-in-from-bottom-4 duration-500"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold hidden md:inline">Falar com Consultor</span>
        </a>

        {/* === HERO SECTION: PROMESSA FORTE === */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
          
          <div className="container-balao relative py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E30613]/20 border border-[#E30613] text-[#E30613] font-bold text-sm uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4" />
                Evite Multas de Auditoria
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Sua empresa está <span className="text-[#E30613]">100% Legalizada?</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl">
                Não corra riscos. Fornecemos licenciamento Microsoft Oficial com <strong>Nota Fiscal, Contrato e Garantia Jurídica</strong>. Atendemos PMEs, Grandes Corporações e Setor Público.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto bg-[#E30613] hover:bg-[#c00510] text-lg py-6 px-8 font-bold shadow-[0_0_20px_rgba(227,6,19,0.4)]">
                    <MessageCircle className="mr-2 w-5 h-5" />
                    Cotar no WhatsApp
                  </Button>
                </a>
                <Link to="/busca?q=microsoft">
                  <Button variant="outline" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-lg py-6 px-8">
                    Ver Catálogo Online
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Atendimento imediato em horário comercial
              </p>
            </div>
            {/* Imagem Ilustrativa / Card Flutuante */}
            <div className="hidden md:block relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Certificado de Autenticidade</h3>
                    <p className="text-sm text-slate-300">Garantia Balão da Informática</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> Chaves virgens e exclusivas
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> Emissão de NFe Full
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> Suporte Técnico Especializado
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> Parceiro Microsoft
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === TRUST BAR === */}
        <div className="border-b bg-slate-50">
          <div className="container-balao py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center text-center">
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Nota Fiscal para PJ</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Pagamento Seguro</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Envio Digital Rápido</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-[#E30613]" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Suporte Pós-Venda</span>
              </div>
            </div>
          </div>
        </div>

        {/* === PAIN POINTS (Medo/Problema) === */}
        <section className="py-16 bg-white">
          <div className="container-balao text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que comprar Software Original?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              O barato sai caro. O uso de software irregular pode custar a reputação e a saúde financeira da sua empresa.
            </p>
          </div>
          <div className="container-balao grid md:grid-cols-3 gap-8">
            <Card className="border-red-100 bg-red-50/50 hover:shadow-lg transition-all">
              <CardHeader>
                <ShieldAlert className="w-10 h-10 text-red-600 mb-2" />
                <CardTitle className="text-red-900">Multas Pesadíssimas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Em caso de auditoria da Microsoft, a multa pode chegar a <strong>3.000 vezes</strong> o valor de cada licença irregular encontrada. Não arrisque seu patrimônio.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Server className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Segurança de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  "Cracks" e ativadores abrem portas para <strong>Ransomware</strong>. Proteja os dados dos seus clientes e as contas bancárias da sua empresa com software genuíno.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Zap className="w-10 h-10 text-amber-500 mb-2" />
                <CardTitle>Estabilidade & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Tenha acesso a todas as atualizações de segurança e funcionalidades. Sistemas originais não travam por falhas de integridade causadas por pirataria.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* === PRODUTOS EM DESTAQUE (Grid Vendedor) === */}
        <section className="py-16 bg-slate-50 border-y">
          <div className="container-balao">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Soluções Mais Buscadas</h2>
                <p className="text-slate-500 mt-1">Produtos com entrega imediata e nota fiscal.</p>
              </div>
              <Link to="/busca?q=microsoft" className="text-[#E30613] font-semibold hover:underline flex items-center gap-1">
                Ver todos os produtos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Windows 11 */}
              <div className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all p-6 flex flex-col">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4h-13.05m-10.95 1.451h9.75v9.451L0 20.551m10.949-9.602H24V24L10.95 21.898" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Windows 11 Pro</h3>
                <p className="text-sm text-slate-500 mb-4 flex-grow">
                  Essencial para empresas modernas. Segurança avançada, BitLocker e gerenciamento remoto.
                </p>
                <ul className="text-sm space-y-2 mb-6 text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Licença Vitalícia (ESD/FPP)</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Downgrade p/ Win 10 Pro</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Ideal para Domínio/Rede</li>
                </ul>
                <div className="space-y-3">
                  <Link to="/busca?q=windows%2011%20pro">
                    <Button className="w-full bg-[#0078D4] hover:bg-[#0060aa]">Comprar Agora</Button>
                  </Link>
                  <a href={whatsappLink} className="block text-center text-sm text-slate-500 hover:text-slate-800">
                    Dúvidas? Chamar no Zap
                  </a>
                </div>
              </div>

              {/* Office 2021 */}
              <div className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MAIS VENDIDO
                </div>
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Office 2021 H&B</h3>
                <p className="text-sm text-slate-500 mb-4 flex-grow">
                  Pague uma única vez. Word, Excel, PowerPoint, Outlook para uso comercial.
                </p>
                <ul className="text-sm space-y-2 mb-6 text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Sem mensalidade (Perpétuo)</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Vincula à conta Microsoft</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Transferível (FPP/ESD)</li>
                </ul>
                <div className="space-y-3">
                  <Link to="/busca?q=office%202021">
                    <Button className="w-full bg-[#E30613] hover:bg-[#c00510]">Ver Oferta</Button>
                  </Link>
                  <a href={whatsappLink} className="block text-center text-sm text-slate-500 hover:text-slate-800">
                    Cotação por Volume
                  </a>
                </div>
              </div>

              {/* Server & Cloud */}
              <div className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all p-6 flex flex-col">
                <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">Server & Cloud</h3>
                <p className="text-sm text-slate-500 mb-4 flex-grow">
                  Infraestrutura robusta. Windows Server, SQL Server e Microsoft 365 Business.
                </p>
                <ul className="text-sm space-y-2 mb-6 text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Server 2019/2022 Std</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> CALs de Acesso (RDS/User)</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> CSP Mensal ou Anual</li>
                </ul>
                <div className="space-y-3">
                  <Link to="/busca?q=server">
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50">Ver Soluções</Button>
                  </Link>
                  <a href={whatsappLink} className="block text-center text-sm text-slate-500 hover:text-slate-800">
                    Falar com Especialista
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
              <div className="mt-8 text-center">
                <Link to="/busca?q=microsoft">
                  <Button className="bg-[#E30613] hover:bg-[#c00510] text-white font-bold px-8 h-12 rounded-full">
                    Ver catálogo completo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === CTA FAIXA VERMELHA === */}
        <section className="bg-[#E30613] py-12">
          <div className="container-balao flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Precisa de uma proposta formal?</h3>
              <p className="opacity-90">Montamos orçamentos personalizados para empresas com faturamento e condições especiais.</p>
            </div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-[#E30613] hover:bg-slate-100 font-bold px-8 py-6 rounded-full shadow-lg text-lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Pedir Orçamento (19) 98751-0267
              </Button>
            </a>
          </div>
        </section>

        {/* === SEO CONTENT & FAQ (Otimização Pesada) === */}
        <section className="py-16 bg-white">
          <div className="container-balao max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Perguntas Frequentes sobre Licenciamento</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left font-semibold">Qual a diferença entre Licença OEM, FPP e ESD?</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  <p className="mb-2"><strong>OEM (Original Equipment Manufacturer):</strong> Licença atrelada ao hardware (placa-mãe). Mais barata, ideal para máquinas novas, mas morre com o PC. Não pode ser transferida.</p>
                  <p className="mb-2"><strong>FPP (Full Packaged Product):</strong> É a licença de "caixinha". Pode ser instalada e, se necessário, transferida para outro computador (desde que removida do anterior).</p>
                  <p><strong>ESD (Electronic Software Delivery):</strong> É a entrega digital da licença (chave de 25 dígitos) por e-mail. Geralmente tem as mesmas regras do FPP, mas com entrega imediata e sem custo de frete.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left font-semibold">O que é Licenciamento por Volume (Open/CSP)?</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Para empresas que precisam de 5 ou mais licenças, o licenciamento por volume (Open Value, Open Business ou o moderno <strong>CSP - Cloud Solution Provider</strong>) é o ideal. Ele permite gerenciar todas as chaves em um único portal da Microsoft, facilitando auditorias e reinstalações. Oferecemos consultoria completa para migração para CSP.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left font-semibold">Vocês vendem CALs de Acesso para Windows Server?</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Sim. O Windows Server Standard exige, além da licença do sistema (baseada em núcleos/cores), as <strong>CALs (Client Access Licenses)</strong>. Vendemos tanto User CAL (por usuário) quanto Device CAL (por dispositivo), além de <strong>RDS CALs</strong> para acesso remoto (Terminal Service).
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left font-semibold">A Balão da Informática emite Nota Fiscal?</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Sim, somos uma empresa estabelecida com mais de duas décadas de mercado. Todas as vendas acompanham Nota Fiscal Eletrônica (NFe) válida em todo território nacional, documento essencial para comprovar a legalidade do software em auditorias da Microsoft ou fiscalizações.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* SEO GLOSSARY TEXT BLOCK (Visível mas focado em robôs) */}
            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 text-justify">
              <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider">Glossário de Licenciamento (SEO)</h4>
              <p>
                A <strong>Balão da Informática</strong> é referência na venda de software original no Brasil. Atuamos com venda de chave de ativação para <strong>Windows 11 Pro</strong>, <strong>Windows 10 Pro</strong> e atualizações de segurança. Para produtividade, oferecemos o <strong>Microsoft Office 2021 Home & Business</strong> (ideal para pequenas empresas, sem mensalidade) e o <strong>Office 2021 Professional Plus</strong>. No segmento de nuvem, somos parceiros para implementação do <strong>Microsoft 365 Business Standard</strong>, Basic e Premium, com inclusão do Exchange Online e Teams. 
              </p>
              <p className="mt-2">
                Em infraestrutura de servidores, comercializamos <strong>Windows Server 2022 Standard</strong> (16 e 24 cores) e Datacenter, além de <strong>SQL Server Standard 2019/2022</strong>. Essencial para compliance, regularizamos empresas com passivo de pirataria através de contratos GGWA (Get Genuine Windows Agreement). Atendemos Campinas, São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Porto Alegre e todo o Brasil com envio eletrônico imediato. Não vendemos software pirata, apenas licenças genuínas com garantia de ativação online nos servidores da Microsoft. Proteja seu negócio contra ransomware e fiscalização. Entre em contato pelo WhatsApp (19) 98751-0267.
              </p>
            </div>
          </div>
        </section>

        <section className="py-0 relative border-t border-slate-100">
          <div className="grid md:grid-cols-2 min-h-[520px]">
            <div className="bg-neutral-900 text-white p-10 md:p-20 flex flex-col justify-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-8 text-white">Fale com a equipe e retire na loja</h2>

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

      </div>
    </Layout>
  );
}
