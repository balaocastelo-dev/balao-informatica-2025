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
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManutencaoPage() {
  return (
    <Layout>
      <SEOHead
        title="Assistência Técnica e Manutenção | Balão da Informática Campinas"
        description="Assistência técnica especializada em PCs, Notebooks e Hardware em Campinas. Formatação, limpeza, upgrade e reparos com garantia. Agende sua manutenção!"
        keywords="manutenção pc campinas, conserto notebook campinas, formatação, limpeza pc gamer, troca de pasta térmica, upgrade hardware, assistência técnica balão da informática"
        url="https://www.balaodainformatica.com.br/manutencao"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.balaodainformatica.com.br" },
          { name: "Manutenção", url: "https://www.balaodainformatica.com.br/manutencao" },
        ]}
      />

      <div className="bg-zinc-50 min-h-screen pb-16">
        {/* --- HERO SECTION --- */}
        <div className="bg-zinc-900 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E30613] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-[#E30613] text-white font-bold text-sm uppercase tracking-wider mb-6">
              Assistência Técnica Especializada
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
              Seu PC Novo de Novo
            </h1>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Diagnóstico preciso, peças de qualidade e técnicos experientes. 
              Traga seu computador para quem entende de hardware de verdade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold gap-2 h-12 px-8">
                <Phone className="w-5 h-5" />
                Agendar pelo WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
          <div className="grid md:grid-cols-3 gap-6">
            <ServiceCard 
              icon={<Cpu className="w-8 h-8 text-[#E30613]" />}
              title="Montagem e Upgrade"
              description="Montagem profissional de PCs Gamer e Workstations, cable management impecável e upgrade de componentes."
            />
            <ServiceCard 
              icon={<Fan className="w-8 h-8 text-[#E30613]" />}
              title="Limpeza e Refrigeração"
              description="Limpeza completa, troca de pasta térmica de alta condutividade e otimização do fluxo de ar."
            />
            <ServiceCard 
              icon={<ShieldCheck className="w-8 h-8 text-[#E30613]" />}
              title="Formatação e Sistema"
              description="Instalação de Windows/Linux, backup de dados, remoção de vírus e otimização de sistema."
            />
          </div>
        </div>

        {/* --- DETALHES DOS SERVIÇOS --- */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                Por que fazer manutenção no Balão?
              </h2>
              <div className="space-y-6">
                <FeatureItem 
                  title="Técnicos Especialistas" 
                  description="Nossa equipe vive hardware e está sempre atualizada com as novidades do mercado."
                />
                <FeatureItem 
                  title="Laboratório Próprio" 
                  description="Estrutura completa com ferramentas de precisão e área protegida contra estática (ESD)."
                />
                <FeatureItem 
                  title="Garantia nos Serviços" 
                  description="Todos os nossos serviços possuem garantia de 90 dias para sua tranquilidade."
                />
                <FeatureItem 
                  title="Peças em Estoque" 
                  description="Agilidade no reparo com nosso amplo estoque de componentes originais."
                />
              </div>
            </div>
            
            <Card className="border-zinc-200 shadow-lg">
              <CardHeader className="bg-zinc-100 border-b border-zinc-200">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Sinais que seu PC precisa de ajuda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <SymptomItem text="Lentidão excessiva ao ligar ou abrir programas" />
                <SymptomItem text="Aquecimento anormal e ventoinhas barulhentas" />
                <SymptomItem text="Tela azul (BSOD) ou reinicializações aleatórias" />
                <SymptomItem text="Jogos travando ou com queda de FPS" />
                <SymptomItem text="Barulhos estranhos vindo do gabinete" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- LOCALIZAÇÃO --- */}
        <div className="bg-white py-16 border-t border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-12">Onde nos encontrar</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <LocationCard 
                title="Unidade Cambuí"
                address="Rua Dr. Emílio Ribas, 470 - Cambuí, Campinas - SP"
                hours="Seg a Sex: 09h às 18h | Sáb: 09h às 13h"
                phone="(19) 3254-4444"
              />
              <LocationCard 
                title="Unidade Castelo"
                address="Av. Andrade Neves, 2150 - Castelo, Campinas - SP"
                hours="Seg a Sex: 09h às 18h | Sáb: 09h às 13h"
                phone="(19) 3243-3333"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ServiceCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-zinc-100 hover:border-[#E30613]/30 transition-all hover:-translate-y-1">
      <div className="mb-4 bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-zinc-800">{title}</h3>
      <p className="text-zinc-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <CheckCircle2 className="w-6 h-6 text-[#25D366]" />
      </div>
      <div>
        <h4 className="font-bold text-lg text-zinc-800">{title}</h4>
        <p className="text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

function SymptomItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-900 rounded-lg border border-amber-100">
      <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function LocationCard({ title, address, hours, phone }: { title: string; address: string; hours: string; phone: string }) {
  return (
    <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 text-left">
      <h3 className="text-2xl font-bold text-[#E30613] mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-zinc-400 mt-1" />
          <p className="text-zinc-700">{address}</p>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-zinc-400 mt-1" />
          <p className="text-zinc-700">{hours}</p>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-zinc-400 mt-1" />
          <p className="text-zinc-700 font-bold">{phone}</p>
        </div>
      </div>
      <Button variant="outline" className="w-full mt-6 border-zinc-300 hover:bg-white">
        Ver no Mapa
      </Button>
    </div>
  );
}
