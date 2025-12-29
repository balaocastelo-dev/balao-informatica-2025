import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, LocalBusinessSchema, BreadcrumbSchema } from "@/components/SEOHead";
import {
  MapPin,
  Phone,
  Clock,
  Shield,
  Truck,
  Wrench,
  Award,
  Cpu,
  MonitorPlay,
  Star,
  Users,
  Laptop,
  Gamepad2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- COMPONENTE DE ACCORDION SIMPLIFICADO (Para evitar erro de importação) ---
const SimpleAccordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left font-bold text-lg text-zinc-800 hover:text-[#E30613] transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#E30613]" /> {title}
        </span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
      </button>
      {isOpen && (
        <div className="pb-4 text-zinc-600 text-base leading-relaxed animate-in slide-in-from-top-2">{children}</div>
      )}
    </div>
  );
};

export default function SobreNosPage() {
  // URL da imagem fornecida (garantindo HTTPS para evitar bloqueios de segurança)
  const STORE_IMAGE_URL = "https://lh3.googleusercontent.com/profile/picture/3";

  return (
    <Layout>
      <SEOHead
        title="Sobre o Balão da Informática Campinas | Desde 2010 Sua Loja de Tecnologia"
        description="Conheça a história do Balão da Informática em Campinas. Referência no Cambuí e Castelo em PC Gamer de alta performance, notebooks, hardware e assistência técnica especializada."
        keywords="balão da informática história, loja de informática cambuí campinas, loja de informática castelo campinas, especialistas em pc gamer campinas, onde comprar hardware em campinas, assistência técnica de confiança campinas, balão da informática é confiável"
        url="https://www.balao.info/sobre"
      />
      <LocalBusinessSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.balao.info" },
          { name: "Quem Somos", url: "https://www.balao.info/sobre" },
        ]}
      />

      <div className="bg-zinc-50 min-h-screen font-sans">
        {/* --- HERO SECTION --- */}
        <div className="bg-zinc-900 text-white py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E30613] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-[#E30613] text-white font-bold text-sm uppercase tracking-wider mb-6">
              Tradição e Confiança em Campinas
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              NÓS SOMOS O <br />
              <span className="text-[#E30613]">BALÃO DA INFORMÁTICA</span>
            </h1>
            <p className="text-xl md:text-3xl text-zinc-300 max-w-4xl mx-auto font-light leading-relaxed">
              Há mais de uma década conectando <strong>Campinas e RMC</strong> ao que há de mais avançado em tecnologia,
              hardware de ponta e o universo PC Gamer.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 -mt-16 relative z-20">
          {/* --- BLOCO HISTÓRIA + FOTO --- */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16 border border-zinc-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Texto */}
              <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
                  Mais que uma loja, um ponto de encontro tecnológico no{" "}
                  <span className="text-[#E30613]">Cambuí e Castelo</span>.
                </h2>
                <p>
                  Fundado com a missão de trazer preços justos e atendimento técnico de verdade para{" "}
                  <strong>Campinas</strong>, o <strong>Balão da Informática</strong> evoluiu. Deixamos de ser apenas um
                  comércio de peças para nos tornarmos um hub de soluções tecnológicas.
                </p>
                <p>
                  Nossa loja física é um espaço seguro onde entusiastas, profissionais e gamers encontram desde um
                  simples cabo até <strong>Workstations</strong> complexas ou o <strong>PC Gamer dos sonhos</strong>,
                  com a certeza de produtos originais e garantia nacional.
                </p>

                <div className="flex flex-wrap gap-4 pt-6">
                  <div className="flex items-center gap-2 bg-red-50 text-[#E30613] px-5 py-2 rounded-full font-bold text-sm border border-red-100">
                    <MapPin className="w-4 h-4" /> Loja Física em Campinas
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 text-[#E30613] px-5 py-2 rounded-full font-bold text-sm border border-red-100">
                    <Shield className="w-4 h-4" /> Estoque Próprio
                  </div>
                </div>
              </div>

              {/* Foto */}
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-zinc-200 group">
                <img
                  src={STORE_IMAGE_URL}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Fallback se a foto falhar
                  }}
                  alt="Fachada Balão da Informática Campinas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-bold text-lg flex items-center gap-2">
                    <MapPin className="text-[#E30613] w-5 h-5" /> Venha nos visitar!
                  </p>
                  <p className="text-zinc-300 text-sm">Av. Anchieta, 789 - Cambuí</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- NOSSOS PILARES --- */}
          <section className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4">Nossa Expertise em Campinas</h2>
              <p className="text-xl text-zinc-500">
                Somos especialistas focados em três pilares principais para atender desde o usuário doméstico até o
                entusiasta extremo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Gamer */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-[#E30613] transition-all group">
                <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E30613] transition-colors">
                  <Gamepad2 className="w-8 h-8 text-[#E30613] group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Universo Gamer & High-End</h3>
                <p className="text-zinc-600 mb-4">
                  Referência em Campinas para performance extrema. Placas de vídeo RTX, processadores Ryzen e Intel Core
                  i9.
                </p>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Montagem Profissional
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Periféricos Gamer
                  </li>
                </ul>
              </div>

              {/* Corporativo */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-[#E30613] transition-all group">
                <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E30613] transition-colors">
                  <Laptop className="w-8 h-8 text-[#E30613] group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Soluções Corporativas</h3>
                <p className="text-zinc-600 mb-4">
                  Atendemos empresas e profissionais de Campinas que precisam de máquinas confiáveis para produtividade.
                </p>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Notebooks Performance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Workstations para Render
                  </li>
                </ul>
              </div>

              {/* Assistência */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:border-[#E30613] transition-all group">
                <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E30613] transition-colors">
                  <Wrench className="w-8 h-8 text-[#E30613] group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Assistência Técnica</h3>
                <p className="text-zinc-600 mb-4">
                  Seu equipamento está lento? Nossa assistência no Cambuí avalia e resolve com upgrades inteligentes.
                </p>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Instalação de SSD/RAM
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E30613]" /> Limpeza e Manutenção
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* --- DEPOIMENTOS --- */}
          <section className="mb-20 py-12 bg-zinc-100 -mx-4 px-4 md:-mx-0 md:px-0 md:rounded-3xl md:bg-white md:border md:p-12">
            <h2 className="text-3xl font-bold text-center mb-10">O que Campinas diz sobre nós</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white md:bg-zinc-50 p-6 rounded-xl shadow-sm border border-zinc-100">
                <div className="flex gap-1 text-yellow-400 mb-3">
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                </div>
                <p className="text-zinc-700 italic mb-4">
                  "Melhor loja de informática de Campinas. Ajudaram a escolher as peças sem empurrar o mais caro. A
                  montagem ficou impecável."
                </p>
                <p className="font-bold text-sm">- Ricardo S., Castelo</p>
              </div>
              <div className="bg-white md:bg-zinc-50 p-6 rounded-xl shadow-sm border border-zinc-100">
                <div className="flex gap-1 text-yellow-400 mb-3">
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                </div>
                <p className="text-zinc-700 italic mb-4">
                  "Levei meu notebook na loja do Cambuí e em poucas horas já estava com SSD novo voando. Preço justo."
                </p>
                <p className="font-bold text-sm">- Mariana L., Centro</p>
              </div>
              <div className="bg-white md:bg-zinc-50 p-6 rounded-xl shadow-sm border border-zinc-100">
                <div className="flex gap-1 text-yellow-400 mb-3">
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                  <Star fill="currentColor" className="w-4 h-4" />
                </div>
                <p className="text-zinc-700 italic mb-4">
                  "Única loja da RMC que confio que tem estoque real e garantia que funciona. O time entende muito."
                </p>
                <p className="font-bold text-sm">- Pedro H., Valinhos</p>
              </div>
            </div>
          </section>

          {/* --- FAQ SEO --- */}
          <section className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2 text-zinc-900">Dúvidas Frequentes</h2>
              <p className="text-xl text-zinc-500">Perguntas que recebemos diariamente de clientes em Campinas.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-6 py-4">
              <SimpleAccordion title="Onde fica a loja física do Balão da Informática em Campinas?">
                Estamos localizados em um ponto estratégico e de fácil acesso no bairro <strong>Cambuí</strong>, na Av.
                Anchieta, 789. Nossa loja conta com estacionamento próximo.
              </SimpleAccordion>

              <SimpleAccordion title="Vocês cobrem orçamentos de outras lojas da região?">
                Nós nos esforçamos para oferecer o melhor preço de Campinas. Traga seu orçamento formalizado e faremos o
                possível para cobrir ou oferecer uma contraproposta vantajosa.
              </SimpleAccordion>

              <SimpleAccordion title="Como funciona a garantia dos produtos?">
                Comprando no <strong>Balão da Informática Campinas</strong> você tem garantia legal no Brasil e garantia
                direta com os fabricantes (Intel, AMD, NVIDIA, etc), com nosso suporte inicial.
              </SimpleAccordion>

              <SimpleAccordion title="A loja realiza entregas em cidades vizinhas?">
                Sim! Atendemos toda a RMC (Região Metropolitana de Campinas). Entregamos em Valinhos, Vinhedo, Sumaré,
                Hortolândia e Paulínia com agilidade.
              </SimpleAccordion>
            </div>
          </section>

          {/* --- FOOTER CTA --- */}
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 md:p-16 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E30613] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

            <div className="grid md:grid-cols-2 gap-12 relative z-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                  Venha conhecer a loja mais completa da cidade.
                </h2>
                <div className="space-y-8 font-medium text-lg">
                  <div className="flex items-start gap-5">
                    <div className="bg-[#E30613]/20 p-4 rounded-2xl border border-[#E30613]/30">
                      <MapPin className="text-[#E30613] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">Endereço</h4>
                      <p className="text-zinc-300">
                        Av. Anchieta, 789
                        <br />
                        Cambuí - Campinas/SP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="bg-[#E30613]/20 p-4 rounded-2xl border border-[#E30613]/30">
                      <Clock className="text-[#E30613] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">Horário</h4>
                      <p className="text-zinc-300">Seg-Sex: 09h-18h | Sáb: 09h-13h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center text-center bg-white/10 rounded-3xl p-10 border border-white/20 backdrop-blur-sm">
                <Users className="w-16 h-16 text-[#E30613] mb-6" />
                <h3 className="text-3xl font-bold mb-4">Fale com um Especialista</h3>
                <p className="text-zinc-300 mb-8 text-lg">
                  Nossa equipe técnica está pronta no WhatsApp para te ajudar.
                </p>
                <Button
                  asChild
                  className="w-full h-16 text-xl font-black bg-[#E30613] hover:bg-red-600 shadow-[0_10px_40px_-10px_rgba(227,6,19,0.5)] transition-all hover:scale-105 rounded-2xl"
                >
                  <a
                    href="https://wa.me/5519987510267?text=Olá! Vim pela página 'Sobre Nós' do site e gostaria de atendimento."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    CHAMAR NO WHATSAPP
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
