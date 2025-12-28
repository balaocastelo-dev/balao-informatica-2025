import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Gamepad2,
  Zap,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  MapPin,
  AlertTriangle,
  XCircle,
  Store,
  Instagram,
  Timer,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";

// --- CONFIGURAÇÕES E LINKS ---
const WHATSAPP_NUMBER = "5519987510267";
const WHATSAPP_API = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;
const INSTAGRAM_LINK = "https://www.instagram.com/balaodainformatica_castelo/";
// Link real de busca do Google Maps
const MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=Av.+Anchieta,+789+-+Cambuí,+Campinas+-+SP";

// Mensagens personalizadas
const LINK_AVALIAR = `${WHATSAPP_API}&text=Ol%C3%A1%2C%20vi%20o%20site%20e%20quero%20avaliar%20meu%20usado%20para%20o%20Ano%20Novo.`;
const LINK_URGENTE = `${WHATSAPP_API}&text=Tenho%20urg%C3%AAncia%20em%20vender%20antes%20da%20virada%20do%20ano.`;

// --- COMPONENTE DE CONTADOR REGRESSIVO ---
const NewYearCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    // Define a meta para 1 de Janeiro do próximo ano
    const targetDate = new Date(`Jan 1, ${new Date().getFullYear() + 1} 00:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 md:gap-4 text-center justify-center font-mono text-yellow-400">
      <div className="flex flex-col bg-black/50 p-2 rounded-lg min-w-[60px]">
        <span className="text-2xl md:text-4xl font-black">{timeLeft.days}</span>
        <span className="text-xs text-white uppercase">Dias</span>
      </div>
      <div className="flex flex-col bg-black/50 p-2 rounded-lg min-w-[60px]">
        <span className="text-2xl md:text-4xl font-black">{timeLeft.hours}</span>
        <span className="text-xs text-white uppercase">Horas</span>
      </div>
      <div className="flex flex-col bg-black/50 p-2 rounded-lg min-w-[60px]">
        <span className="text-2xl md:text-4xl font-black">{timeLeft.minutes}</span>
        <span className="text-xs text-white uppercase">Min</span>
      </div>
    </div>
  );
};

export default function ConsignacaoPage() {
  return (
    <Layout>
      <SEOHead
        title="Dinheiro Extra para o Ano Novo? Venda seu Usado | Balão Castelo"
        description="Não passe a virada sem dinheiro. Venda seu iPhone, PC ou Game usado ainda este ano na Av. Anchieta, Campinas."
      />

      {/* --- HERO SECTION: URGÊNCIA DE ANO NOVO --- */}
      <section className="relative bg-zinc-950 pt-16 pb-32 overflow-hidden">
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#E30613] to-purple-900 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* FAIXA DE CONTAGEM REGRESSIVA */}
          <div className="mb-10 animate-in fade-in zoom-in duration-1000">
            <Badge className="mb-4 bg-yellow-500 text-black hover:bg-yellow-400 text-sm font-bold px-4 py-1">
              <Timer className="w-4 h-4 mr-2" /> META: FAZER DINHEIRO AINDA ESTE ANO
            </Badge>
            <p className="text-white text-lg mb-4 font-medium">
              Tempo restante para começar o ano novo com o bolso cheio:
            </p>
            <NewYearCountdown />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
            VIRE O ANO COM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E30613] to-yellow-500">
              DINHEIRO NA MÃO.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Aquele <strong>iPhone, iPad ou PC Gamer</strong> parado na gaveta paga a sua festa de Réveillon.
            <br />
            <span className="text-[#E30613] font-bold">Avaliamos e vendemos rápido em Campinas.</span>
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              className="bg-[#E30613] hover:bg-red-700 text-white font-black text-xl px-12 py-10 rounded-full shadow-[0_0_40px_rgba(227,6,19,0.5)] hover:shadow-[0_0_60px_rgba(227,6,19,0.7)] hover:scale-105 transition-all w-full md:w-auto ring-4 ring-white/10"
            >
              <a href={LINK_URGENTE} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-4">
                  <MessageCircle className="w-10 h-10" />
                  <span className="flex flex-col items-start leading-none gap-1">
                    <span className="text-sm font-bold opacity-90 text-yellow-300 uppercase tracking-widest animate-pulse">
                      Urgente
                    </span>
                    <span>VENDER AGORA</span>
                  </span>
                </div>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-zinc-700 bg-black/40 text-white hover:bg-white hover:text-black font-bold text-xl px-10 py-10 rounded-full w-full md:w-auto backdrop-blur-sm"
            >
              <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-8 h-8 mr-3 text-pink-500" />
                Ver Estoque no Insta
              </a>
            </Button>
          </div>

          <p className="mt-6 text-zinc-500 text-sm">
            <MapPin className="inline w-4 h-4 mr-1 text-[#E30613]" />
            Loja Física: Av. Anchieta, 789 - Cambuí (Aberto até o fim do ano!)
          </p>
        </div>
      </section>

      {/* --- O QUE NÓS COMPRAMOS (Grid com Tablet Apple) --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4 uppercase italic">
              O que vira <span className="text-[#E30613]">Dinheiro?</span>
            </h2>
            <p className="text-zinc-500 text-lg">Traga um destes itens e saia com o orçamento feito.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {/* CARD 1: TABLET / APPLE */}
            <Card className="group p-6 border-2 border-zinc-100 hover:border-[#E30613] transition-all hover:-translate-y-2 cursor-pointer bg-zinc-50 hover:bg-white hover:shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 text-zinc-400 group-hover:text-[#E30613] group-hover:bg-red-50 transition-colors shadow-sm">
                {/* Ícone de Tablet usado para representar Apple iPad/iPhone Plus */}
                <Tablet className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl text-zinc-800 group-hover:text-[#E30613]">Apple iPhone & iPad</h3>
              <Badge className="mt-2 bg-black text-white group-hover:bg-[#E30613]">Alta Procura</Badge>
              <p className="text-sm text-zinc-500 mt-3">
                iPhone 11 ao 15 Pro Max <br /> iPads Pro e Air
              </p>
            </Card>

            {/* CARD 2: NOTEBOOKS */}
            <Card className="group p-6 border-2 border-zinc-100 hover:border-[#E30613] transition-all hover:-translate-y-2 cursor-pointer bg-zinc-50 hover:bg-white hover:shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 text-zinc-400 group-hover:text-[#E30613] group-hover:bg-red-50 transition-colors shadow-sm">
                <Laptop className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl text-zinc-800 group-hover:text-[#E30613]">Notebooks & Mac</h3>
              <p className="text-sm text-zinc-500 mt-3">
                Dell, Lenovo, Acer <br /> Macbooks M1/M2
              </p>
            </Card>

            {/* CARD 3: PC GAMER */}
            <Card className="group p-6 border-2 border-zinc-100 hover:border-[#E30613] transition-all hover:-translate-y-2 cursor-pointer bg-zinc-50 hover:bg-white hover:shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 text-zinc-400 group-hover:text-[#E30613] group-hover:bg-red-50 transition-colors shadow-sm">
                <Monitor className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl text-zinc-800 group-hover:text-[#E30613]">PC Gamer & Placas</h3>
              <p className="text-sm text-zinc-500 mt-3">
                RTX 3060/4060 pra cima <br /> Computadores Completos
              </p>
            </Card>

            {/* CARD 4: CONSOLES */}
            <Card className="group p-6 border-2 border-zinc-100 hover:border-[#E30613] transition-all hover:-translate-y-2 cursor-pointer bg-zinc-50 hover:bg-white hover:shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 text-zinc-400 group-hover:text-[#E30613] group-hover:bg-red-50 transition-colors shadow-sm">
                <Gamepad2 className="w-10 h-10" />
              </div>
              <h3 className="font-black text-xl text-zinc-800 group-hover:text-[#E30613]">Consoles Next-Gen</h3>
              <p className="text-sm text-zinc-500 mt-3">
                PlayStation 5, Xbox Series <br /> Nintendo Switch
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* --- VS SECTION --- */}
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="p-8 md:p-12 bg-red-950/20 border border-red-900/50 rounded-3xl grayscale hover:grayscale-0 transition-all duration-500">
              <h3 className="text-2xl font-bold uppercase tracking-widest text-red-500 mb-6 flex items-center gap-3">
                <AlertTriangle /> Vender Sozinho
              </h3>
              <ul className="space-y-4 text-zinc-400">
                <li className="flex gap-3">
                  <XCircle className="text-red-600 shrink-0" /> Risco de golpes no fim de ano.
                </li>
                <li className="flex gap-3">
                  <XCircle className="text-red-600 shrink-0" /> Marcar encontros perigosos.
                </li>
                <li className="flex gap-3">
                  <XCircle className="text-red-600 shrink-0" /> Demora semanas (você perde o Ano Novo).
                </li>
              </ul>
            </div>

            <div className="p-8 md:p-12 bg-gradient-to-br from-zinc-800 to-black border border-green-500/30 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.1)]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-green-500 flex items-center gap-3">
                  <Store /> Na Balão
                </h3>
                <Badge className="bg-green-600">Recomendado</Badge>
              </div>

              <ul className="space-y-4 text-white font-medium">
                <li className="flex gap-3">
                  <CheckCircle className="text-green-500 shrink-0" /> Loja física e segura no Cambuí.
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-green-500 shrink-0" /> Avaliação técnica justa.
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-green-500 shrink-0" /> Dinheiro rápido na sua conta.
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-zinc-700">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl">
                  <a href={LINK_AVALIAR} target="_blank">
                    GARANTIR MINHA VENDA
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOCATION SECTION (MAPA FUNCIONAL) --- */}
      <section className="py-20 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden text-center shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                Estamos no <span className="text-[#E30613]">Coração do Cambuí</span>
              </h2>
              <p className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto">
                Não arrisque. Venha na nossa loja física. Temos estacionamento e segurança para você trazer seu
                equipamento.
              </p>

              <div className="inline-block bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-10 min-w-[300px]">
                <p className="text-white text-2xl font-bold mb-1">Av. Anchieta, 789</p>
                <p className="text-zinc-500 uppercase tracking-widest text-sm">Campinas - SP</p>
                <div className="my-6 h-px bg-zinc-800 w-full"></div>
                <div className="flex flex-col gap-2 text-zinc-400">
                  <div className="flex justify-between">
                    <span>Seg-Sex:</span> <span className="text-white">09h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados:</span> <span className="text-white">09h às 13h</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  asChild
                  className="bg-white text-black hover:bg-zinc-200 font-bold text-lg h-14 px-8 rounded-full border-4 border-transparent hover:border-zinc-300"
                >
                  <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 w-5 h-5" /> ABRIR GPS AGORA
                  </a>
                </Button>
                <Button
                  asChild
                  className="bg-[#E30613] hover:bg-red-700 text-white font-bold text-lg h-14 px-8 rounded-full"
                >
                  <a href={LINK_URGENTE} target="_blank">
                    <MessageCircle className="mr-2 w-5 h-5" /> AVISAR CHEGADA
                  </a>
                </Button>
              </div>
            </div>

            {/* Decorativo */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#E30613] rounded-full blur-[100px] opacity-20"></div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 bg-zinc-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">Dúvidas Rápidas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="bg-white px-6 rounded-xl border border-zinc-200">
              <AccordionTrigger className="font-bold text-zinc-800">Consigo vender ainda hoje?</AccordionTrigger>
              <AccordionContent className="text-zinc-600">
                Se você optar pela **Compra Direta** e o produto estiver em bom estado, sim! Avaliamos e pagamos na hora
                (sujeito a interesse de estoque). Na consignação, costuma levar alguns dias.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-white px-6 rounded-xl border border-zinc-200">
              <AccordionTrigger className="font-bold text-zinc-800">Onde vocês ficam?</AccordionTrigger>
              <AccordionContent className="text-zinc-600">
                Av. Anchieta, 789, no Cambuí. Quase esquina com a Prefeitura. Fácil acesso e seguro.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* --- BOTÃO FLUTUANTE (MOBILE) --- */}
      <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-20 duration-1000">
        <Button
          asChild
          className="w-full h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl border-4 border-white/20 flex items-center justify-between px-6"
        >
          <a href={LINK_URGENTE} target="_blank">
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-xl italic">VENDER AGORA</span>
              <span className="text-xs opacity-90">Atendimento Imediato</span>
            </div>
            <MessageCircle className="w-8 h-8 fill-current" />
          </a>
        </Button>
      </div>
    </Layout>
  );
}
