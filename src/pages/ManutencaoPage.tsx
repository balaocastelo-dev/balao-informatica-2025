import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import {
  Wrench,
  Cpu,
  Fan,
  HardDrive,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Award,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManutencaoPage() {
  const whatsappNumber = "5519987510267";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá,%20gostaria%20de%20agendar%20uma%20manutenção.`;

  return (
    <Layout>
      <SEOHead
        title="Assistência Técnica Especializada | Balão da Informática Campinas"
        description="Assistência técnica oficial Balão da Informática em Campinas. Mais de 20 anos de experiência. Reparo de PC Gamer, Notebooks e Hardware High-End na Av. Anchieta."
        keywords="manutenção pc campinas, conserto notebook, balão da informática, pc gamer campinas, formatação, av anchieta informática"
        url="https://www.balao.info/manutencao"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.balao.info" },
          { name: "Assistência Técnica", url: "https://www.balao.info/manutencao" },
        ]}
      />

      <div className="bg-slate-50 min-h-screen font-sans">
        
        {/* --- TOP BAR DE CONTATO RÁPIDO --- */}
        <div className="bg-blue-900 text-blue-100 py-2 px-4 text-sm text-center md:flex md:justify-center md:gap-8 hidden">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Av. Anchieta, 789 - Cambuí, Campinas
          </span>
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> (19) 3255-1661
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> Seg a Sex: 09h às 18h
          </span>
        </div>

        {/* --- HERO SECTION REFORMULADA --- */}
        <div className="relative bg-white overflow-hidden pb-16 pt-12 md:pt-20 lg:pb-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/80 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-blue-700" />
                  Desde 2004 em Campinas
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                  Especialistas em <span className="text-blue-600">Hardware High-End</span> e PC Gamer.
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Não confie seu equipamento a curiosos. O Balão da Informática traz 20 anos de tradição, laboratório próprio na Av. Anchieta e técnicos que vivem hardware de verdade.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1eab52] text-white font-bold h-14 px-8 text-lg shadow-lg hover:shadow-green-200 transition-all rounded-xl">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Falar no WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl">
                    <a href="#onde-estamos">
                      Ver Endereço
                    </a>
                  </Button>
                </div>

                <p className="text-sm text-slate-500 pt-2">
                  Atendimento direto: <strong className="text-slate-700">(19) 98751-0267</strong>
                </p>
              </div>

              {/* CARD FLUTUANTE DE STATUS */}
              <div className="relative hidden lg:block">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl rotate-3 opacity-10"></div>
                 <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 relative">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Laboratório Próprio</h3>
                          <p className="text-sm text-slate-500">Ferramentas de precisão e área ESD</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Peças em Estoque</h3>
                          <p className="text-sm text-slate-500">Placas de vídeo e processadores a pronta entrega</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Garantia Balão</h3>
                          <p className="text-sm text-slate-500">Tradição e confiança de quem é líder</p>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DIFERENCIAIS (GRID) --- */}
        <div className="bg-slate-900 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Por que escolher o Balão?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Diferente de assistências genéricas, somos especializados no ecossistema Gamer e Workstation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="w-10 h-10 text-blue-400" />}
                title="Cobertura de Ofertas"
                description="Cobrimos ofertas de lojas físicas da região (mediante análise) para peças utilizadas no reparo."
              />
              <FeatureCard 
                icon={<Cpu className="w-10 h-10 text-blue-400" />}
                title="Hardware de Ponta"
                description="Trabalhamos com RTX, Ryzen, Core i9 e componentes High-End com conhecimento técnico aprofundado."
              />
              <FeatureCard 
                icon={<Clock className="w-10 h-10 text-blue-400" />}
                title="Agilidade Real"
                description="Diagnóstico rápido e honesto. Não enrolamos com o seu equipamento parado."
              />
            </div>
          </div>
        </div>

        {/* --- SERVIÇOS DETALHADOS --- */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Nossos Serviços</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <ServiceBox 
               title="Montagem PC Gamer" 
               items={["Cable Management profissional", "Otimização de Airflow", "Instalação de Drivers e BIOS", "Testes de Stress"]}
             />
             <ServiceBox 
               title="Manutenção Preventiva" 
               items={["Troca de Pasta Térmica (Prata/Ouro)", "Limpeza interna completa", "Lubrificação de fans", "Revisão de conexões"]}
             />
             <ServiceBox 
               title="Upgrade de Setup" 
               items={["Instalação de SSD NVMe", "Aumento de Memória RAM", "Troca de Placa de Vídeo", "Troca de Gabinete"]}
             />
             <ServiceBox 
               title="Reparo de Notebooks" 
               items={["Troca de Tela e Teclado", "Reparo de Carcaça", "Upgrade de SSD/RAM", "Limpeza de sistema de cooler"]}
             />
             <ServiceBox 
               title="Software e Sistema" 
               items={["Formatação Windows 10/11", "Backup de Arquivos", "Remoção de Vírus", "Otimização de desempenho"]}
             />
             <ServiceBox 
               title="Consultoria" 
               items={["Análise de gargalos (Bottleneck)", "Indicação de peças custo-benefício", "Orçamentos personalizados"]}
             />
          </div>
        </div>

        {/* --- LOCALIZAÇÃO E CONTATO FINAL --- */}
        <div id="onde-estamos" className="bg-blue-50 py-20 border-t border-blue-100">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Visite nossa Loja</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Endereço</h3>
                      <p className="text-slate-600">Av. Anchieta, 789<br/>Cambuí — Campinas — SP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Telefones</h3>
                      <p className="text-slate-600">
                        WhatsApp: <a href={whatsappLink} className="text-blue-600 hover:underline font-medium">(19) 98751-0267</a>
                        <br/>
                        Fixo: (19) 3255-1661
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Horário</h3>
                      <p className="text-slate-600">Seg a Sex: 09h às 18h<br/>Sábados: 09h às 13h</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500">
                  <p>CASTELO DISTRIBUIÇÃO LTDA</p>
                  <p>CNPJ: 34.397.947/0001-08</p>
                  <p>Email: balaocastelo@balaodainformatica.com.br</p>
                </div>
              </div>
              
              <div className="bg-slate-200 md:w-1/2 min-h-[300px] relative">
                {/* Placeholder para Mapa ou Foto da Fachada */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.257648358488!2d-47.0567!3d-22.8991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8c88607629533%3A0x6713916960548177!2sAv.%20Anchieta%2C%20789%20-%20Cambu%C3%AD%2C%20Campinas%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1600000000000!5m2!1spt-BR!2sbr" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors">
      <div className="mb-6 bg-slate-900 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-700">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ServiceBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-blue-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}