import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/contexts/ProductContext";
import {
  Wrench,
  Cpu,
  Smartphone,
  Tablet,
  Printer,
  Gamepad2,
  Laptop,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ManutencaoPage() {
  const whatsappNumber = "5519987510267";
  const defaultMessage = "Olá, vi o site e gostaria de um orçamento para manutenção.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
  const { products } = useProducts();

  const relatedProducts = useMemo(() => {
    const cats = new Set([
      "ssd-hd",
      "memoria-ram",
      "coolers",
      "fontes",
      "gabinetes",
      "processadores",
      "placa-de-video",
      "placas-mae",
      "impressoras",
    ]);
    const list = (products || []).filter((p) => cats.has((p.category || "").toLowerCase())).slice(0, 36);
    return list;
  }, [products]);

  return (
    <Layout>
      <SEOHead
        title="Assistência Técnica Especializada | Balão da Informática Campinas"
        description="Conserto de iPhone, Notebook, PC Gamer, Videogames e Impressoras em Campinas. Laboratório próprio na Av. Anchieta. Orçamento rápido."
        keywords="manutenção iphone campinas, conserto notebook, balão da informática, pc gamer, impressora epson, ps5, xbox, av anchieta"
        url="https://www.balao.info/manutencao"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.balao.info" },
          { name: "Assistência Técnica", url: "https://www.balao.info/manutencao" },
        ]}
      />

      <div className="bg-white min-h-screen font-sans selection:bg-red-100 selection:text-red-900">
        
        {/* --- 1. TOP BAR (Info Rápida) --- */}
        <div className="bg-neutral-900 text-white py-2 px-4 text-xs md:text-sm font-medium">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            <span className="flex items-center gap-2 opacity-90">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-red-500" /> Av. Anchieta, 789 - Cambuí, Campinas
            </span>
            <div className="flex gap-4 md:gap-6">
              <span className="flex items-center gap-2 opacity-90">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-red-500" /> Seg-Sex: 08:00 às 18:00
              </span>
              <span className="flex items-center gap-2 opacity-90">
                <Phone className="w-3 h-3 md:w-4 md:h-4 text-red-500" /> (19) 3255-1661
              </span>
            </div>
          </div>
        </div>

        {/* --- 2. HERO SECTION (Impacto & Conversão) --- */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-neutral-50">
          {/* Background Decorativo */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-bl from-red-50 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider border border-red-200">
                  <Star className="w-3.5 h-3.5 fill-red-700" />
                  Referência em Campinas há 20 anos
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 leading-[1.1] tracking-tight">
                  Seu equipamento parou? <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                    Nós trazemos a vida de volta.
                  </span>
                </h1>
                
                <p className="text-lg text-neutral-600 leading-relaxed max-w-xl">
                  Assistência técnica multimarcas com laboratório próprio. Do <strong>iPhone</strong> ao <strong>PC Gamer High-End</strong>, das impressoras empresariais aos consoles de última geração.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold h-14 px-8 text-lg rounded-xl shadow-lg hover:shadow-green-200/50 transition-all w-full sm:w-auto">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Orçamento via WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-neutral-300 text-neutral-700 hover:bg-white hover:text-red-600 hover:border-red-200 rounded-xl w-full sm:w-auto">
                    <a href="#nossos-servicos">
                      Ver o que consertamos
                    </a>
                  </Button>
                </div>
                
                <div className="pt-4 flex items-center gap-6 text-sm text-neutral-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-red-600" /> Garantia Estendida
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-5 h-5 text-red-600" /> Peças Premium
                  </div>
                </div>
              </div>

              {/* Imagem/Card Hero */}
              <div className="relative hidden lg:block">
                 <div className="bg-white rounded-3xl p-8 shadow-2xl border border-neutral-100 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <HeroServiceItem icon={<Smartphone />} label="Apple & Android" />
                        <HeroServiceItem icon={<Laptop />} label="Notebooks" />
                        <HeroServiceItem icon={<Cpu />} label="PC Gamer" />
                        <HeroServiceItem icon={<Printer />} label="Epson & HP" />
                    </div>
                    <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-neutral-900 font-bold text-xl mb-1">Laboratório Avançado</p>
                        <p className="text-neutral-500">Ferramentas de precisão e técnicos certificados.</p>
                    </div>
                 </div>
                 {/* Elemento gráfico atrás */}
                 <div className="absolute -inset-4 bg-red-600/10 rounded-[2.5rem] -z-10 rotate-3"></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. CATEGORIAS DE SERVIÇO (O CORE DA PÁGINA) --- */}
        <section id="nossos-servicos" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Especialistas em Tudo o que Você Usa</h2>
              <p className="text-lg text-neutral-500">
                Não somos aventureiros. Temos bancadas dedicadas e especialistas para cada tipo de dispositivo. Selecione o seu problema:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Celulares */}
              <ServiceCategoryCard 
                icon={<Smartphone className="w-8 h-8 text-white" />}
                title="iPhone & Smartphones"
                bgHeader="bg-neutral-900"
                items={[
                  "Troca de Telas e Vidros (Originais/Premium)",
                  "Troca de Bateria (Saúde 100%)",
                  "Reparo de Face ID e Câmeras",
                  "Recuperação de Aparelhos Molhados"
                ]}
              />

              {/* Card 2: Notebooks */}
              <ServiceCategoryCard 
                icon={<Laptop className="w-8 h-8 text-white" />}
                title="Notebooks & MacBooks"
                bgHeader="bg-red-600"
                items={[
                  "Reparo de Placa Mãe (Curto, não liga)",
                  "Troca de Teclado e Bateria",
                  "Upgrade de SSD NVMe e Memória RAM",
                  "Reparo de Dobradiças e Carcaça"
                ]}
              />

              {/* Card 3: PC Gamer */}
              <ServiceCategoryCard 
                icon={<Cpu className="w-8 h-8 text-white" />}
                title="PC Gamer & Workstation"
                bgHeader="bg-neutral-900"
                items={[
                  "Montagem Profissional (Cable Management)",
                  "Limpeza Completa e Troca de Pasta Térmica",
                  "Diagnóstico de Gargalos (Bottleneck)",
                  "Instalação de Water Cooler e Fans"
                ]}
              />

              {/* Card 4: Tablets */}
              <ServiceCategoryCard 
                icon={<Tablet className="w-8 h-8 text-white" />}
                title="iPads & Tablets"
                bgHeader="bg-red-600"
                items={[
                  "Troca de Touch e Display LCD",
                  "Reparo de Conector de Carga",
                  "Desempenamento de Carcaça",
                  "Atualização de Software"
                ]}
              />

              {/* Card 5: Games */}
              <ServiceCategoryCard 
                icon={<Gamepad2 className="w-8 h-8 text-white" />}
                title="Consoles & Videogames"
                bgHeader="bg-neutral-900"
                items={[
                  "Limpeza e Troca de Pasta Térmica (PS5/Xbox)",
                  "Reparo de Drift em Controles",
                  "Reparo de Fonte e HDMI",
                  "Manutenção de Nintendo Switch"
                ]}
              />

              {/* Card 6: Impressoras */}
              <ServiceCategoryCard 
                icon={<Printer className="w-8 h-8 text-white" />}
                title="Impressoras Epson & HP"
                bgHeader="bg-red-600"
                items={[
                  "Desentupimento de Cabeça de Impressão",
                  "Instalação e Manutenção de Bulk Ink",
                  "Troca de Almofadas (Reset)",
                  "Reparo de Atolamento de Papel"
                ]}
              />
            </div>
          </div>
        </section>

        {/* --- 4. CTA STRIP --- */}
        <section className="bg-red-600 py-12">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Não encontrou o que precisa?</h3>
                    <p className="text-red-100">Fale diretamente com um técnico. Provavelmente consertamos!</p>
                </div>
                <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-50 font-bold border-0 text-lg px-8 py-6 rounded-full shadow-xl">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                       Falar com Técnico Agora
                    </a>
                </Button>
            </div>
        </section>

        <section className="bg-white py-16 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">Peças e upgrades mais procurados</h2>
                <p className="text-neutral-600 mt-2">Produtos relacionados a manutenção, upgrade e performance.</p>
              </div>
              <Button asChild className="bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold h-12 px-6 rounded-xl shadow-lg">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Pedir indicação
                </a>
              </Button>
            </div>

            <ProductGrid products={relatedProducts} initialLimit={18} loadMoreCount={18} showViewToggle={false} />
          </div>
        </section>

        {/* --- 5. FAQ (PERGUNTAS FREQUENTES) --- */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">Dúvidas Frequentes</h2>
            
            <div className="space-y-4">
                <FAQItem 
                    question="Vocês cobram pelo orçamento?" 
                    answer="Para a maioria dos equipamentos, o orçamento é gratuito e sem compromisso. Em casos específicos onde é necessário desmontagem complexa ou uso de insumos para diagnóstico, avisamos previamente se houver algum custo." 
                />
                <FAQItem 
                    question="Quanto tempo demora o conserto?" 
                    answer="Serviços simples (como formatação ou troca de bateria de iPhone) muitas vezes ficam prontos no mesmo dia. Reparos de placa ou diagnósticos complexos levam em média de 3 a 5 dias úteis." 
                />
                <FAQItem 
                    question="Os serviços têm garantia?" 
                    answer="Sim! Oferecemos garantia legal de 90 dias para todos os serviços. Para peças específicas, a garantia pode chegar a até 1 ano, dependendo do fabricante do componente utilizado." 
                />
                <FAQItem 
                    question="Vocês buscam o equipamento em casa?" 
                    answer="Sim, trabalhamos com serviço de motoboy terceirizado de confiança para coleta e entrega em Campinas e região. Consulte as taxas via WhatsApp." 
                />
                 <FAQItem 
                    question="Quais marcas de impressora vocês atendem?" 
                    answer="Somos especializados em Jato de Tinta (Epson Ecotank e HP Ink Tank) e Laser (HP e Brother). Para plotters ou impressoras industriais, consulte disponibilidade." 
                />
            </div>
          </div>
        </section>

        {/* --- 6. LOCALIZAÇÃO E MAPA --- */}
        <section className="py-0 relative">
            <div className="grid md:grid-cols-2 min-h-[500px]">
                {/* Lado Esquerdo: Info */}
                <div className="bg-neutral-900 text-white p-10 md:p-20 flex flex-col justify-center">
                    <div className="max-w-md">
                        <h2 className="text-3xl font-bold mb-8 text-white">Venha nos visitar</h2>
                        
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Endereço</h4>
                                    <p className="text-neutral-300">Av. Anchieta, 789<br/>Cambuí - Campinas, SP</p>
                                    <p className="text-sm text-neutral-500 mt-2">Próximo à Prefeitura</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-neutral-800 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="text-red-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Horário de Funcionamento</h4>
                                    <p className="text-neutral-300">Segunda a Sexta: <span className="text-white font-semibold">08:00 às 18:00</span></p>
                                    <p className="text-neutral-300">Sábado: 09:00 às 13:00</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-neutral-800 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                                    <Phone className="text-red-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Contato</h4>
                                    <p className="text-neutral-300">WhatsApp: (19) 98751-0267</p>
                                    <p className="text-neutral-300">Fixo: (19) 3255-1661</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-neutral-800">
                             <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl">
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=Av.+Anchieta,+789+-+Cambuí,+Campinas+-+SP`} target="_blank" rel="noopener noreferrer">
                                    Traçar Rota no Waze/Maps
                                </a>
                             </Button>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Mapa */}
                <div className="h-full min-h-[400px] w-full bg-neutral-200">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.356779435064!2d-47.05686002380766!3d-22.90020497925974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8cf4f3f3f3f3f%3A0x1234567890abcdef!2sAv.%20Anchieta%2C%20789%20-%20Cambu%C3%AD%2C%20Campinas%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0, minHeight: '100%' }} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa Balão da Informática"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                    ></iframe>
                </div>
            </div>
        </section>

        {/* --- FLOAT BUTTON (Conversão Móvel) --- */}
        <div className="fixed bottom-6 left-6 z-50 animate-bounce-slow">
            <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white py-3 px-5 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-colors font-bold text-lg"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="hidden md:inline">Orçamento Rápido</span>
            </a>
        </div>

      </div>
    </Layout>
  );
}

// --- SUBCOMPONENTES ---

function HeroServiceItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors cursor-default border border-transparent hover:border-red-100 group">
            <div className="text-neutral-400 group-hover:text-red-600 mb-2 transition-colors [&>svg]:w-8 [&>svg]:h-8">
                {icon}
            </div>
            <span className="font-semibold text-sm text-neutral-700 group-hover:text-red-700">{label}</span>
        </div>
    );
}

function ServiceCategoryCard({ icon, title, items, bgHeader }: { icon: React.ReactNode, title: string, items: string[], bgHeader: string }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`${bgHeader} p-6 flex items-center gap-4`}>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <div className="p-6">
                <ul className="space-y-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-neutral-600 group-hover:text-neutral-900">
                            <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-neutral-100">
                     <span className="text-red-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Solicitar este reparo <ArrowRight className="w-4 h-4" />
                     </span>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-neutral-50 transition-colors"
            >
                <span className="font-bold text-neutral-800">{question}</span>
                {isOpen ? <ChevronUp className="text-red-600" /> : <ChevronDown className="text-neutral-400" />}
            </button>
            {isOpen && (
                <div className="p-5 pt-0 text-neutral-600 bg-white leading-relaxed border-t border-neutral-100">
                    {answer}
                </div>
            )}
        </div>
    );
}
