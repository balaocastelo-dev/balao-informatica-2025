import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Cpu, 
  CircuitBoard, 
  Fan, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Monitor, 
  Box, 
  Mouse, 
  Key, 
  ShoppingCart, 
  MessageCircle, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Plus,
  AlertTriangle,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/contexts/ProductContext";
import type { Product } from "@/types/product";

// --- 1. CONFIGURAÇÃO DOS PASSOS ---
const STEPS = [
  { id: "cpu", label: "Processador", icon: <Cpu />, multi: false },
  { id: "mobo", label: "Placa Mãe", icon: <CircuitBoard />, multi: false },
  { id: "cooler_cpu", label: "Cooler CPU", icon: <Fan />, multi: false },
  { id: "ram", label: "Memória RAM", icon: <MemoryStick />, multi: true },
  { id: "ssd", label: "Armazenamento", icon: <HardDrive />, multi: true },
  { id: "psu", label: "Fonte (PSU)", icon: <Zap />, multi: false },
  { id: "gpu", label: "Placa de Vídeo", icon: <Monitor />, multi: false },
  { id: "case", label: "Gabinete", icon: <Box />, multi: false },
  { id: "cooler_case", label: "Fans Gabinete", icon: <Fan className="text-blue-500" />, multi: true },
  { id: "os", label: "Licenças", icon: <Key />, multi: true },
  { id: "perif", label: "Acessórios", icon: <Mouse />, multi: true },
  { id: "review", label: "Resumo & Compra", icon: <ShoppingCart />, multi: false },
];

// Mapeamento de categorias/keywords para filtrar produtos do Supabase
const STEP_CATEGORY_MAP: Record<string, string[]> = {
  cpu: ["cpu", "processadores", "hardware"],
  mobo: ["placa-mae", "motherboard", "hardware", "mobo"],
  cooler_cpu: ["cooler", "refrigeracao", "hardware"],
  ram: ["memoria", "ram", "hardware"],
  ssd: ["armazenamento", "ssd", "hdd", "hardware", "disco"],
  psu: ["fonte", "psu", "hardware", "energia"],
  gpu: ["placa-de-video", "gpu", "hardware", "video"],
  case: ["gabinete", "case", "hardware"],
  cooler_case: ["cooler", "fan", "ventoinha", "hardware"],
  os: ["licencas", "software", "sistemas"],
  perif: ["perifericos", "acessorios", "mouse", "teclado", "monitor", "audio"],
};

const STEP_KEYWORDS: Record<string, string[]> = {
  cpu: ["intel", "ryzen", "cpu", "processador"],
  mobo: ["placa mãe", "placa-mae", "motherboard", "b760", "z790", "x670"],
  cooler_cpu: ["cooler", "aio", "water", "air"],
  ram: ["ram", "ddr4", "ddr5", "memória", "memoria"],
  ssd: ["ssd", "nvme", "sata", "hd", "hdd", "armazenamento"],
  psu: ["fonte", "psu", "80 plus", "600w", "750w", "850w"],
  gpu: ["rtx", "gtx", "rx", "placa de vídeo", "placa-de-video", "gpu"],
  case: ["gabinete", "case", "mid tower", "atx", "m-atx"],
  cooler_case: ["fan", "ventoinha", "cooler de gabinete", "cooler"],
  os: ["windows", "office", "licença", "licenca", "license"],
  perif: ["mouse", "teclado", "monitor", "headset", "webcam", "periférico", "periferico"],
};

export default function PCBuilderPage() {
  const { products, loading } = useProducts();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Product[]>>({});
  const [userEmail, setUserEmail] = useState("");

  const currentStep = STEPS[currentStepIndex];
  const isReview = currentStep.id === "review";

  // --- LÓGICA DE SELEÇÃO ---
  const handleSelect = (product: Product) => {
    setSelections((prev) => {
      const currentList = prev[currentStep.id] || [];
      
      // Se for multi-select, adiciona ao array
      if (currentStep.multi) {
        return { ...prev, [currentStep.id]: [...currentList, product] };
      }
      
      // Se for single-select, substitui
      return { ...prev, [currentStep.id]: [product] };
    });

    // Se for single-select, avança automaticamente para ficar fluido
    if (!currentStep.multi) {
      setTimeout(() => nextStep(), 300);
    }
  };

  const removeSelection = (stepId: string, indexToRemove: number) => {
    setSelections((prev) => {
      const newList = prev[stepId].filter((_, idx) => idx !== indexToRemove);
      return { ...prev, [stepId]: newList };
    });
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => setCurrentStepIndex(index);

  // --- CÁLCULOS ---
  const totalValue = Object.values(selections).flat().reduce((acc, item) => acc + (item.price || 0), 0);

  // --- GERADOR DE TEXTO INTELIGENTE ---
  const generateBuildAnalysis = () => {
    const allParts = Object.values(selections).flat();
    const gpu = allParts.find(p => p.name.includes("RTX") || p.name.includes("RX"));
    const cpu = allParts.find(p => p.name.includes("Core") || p.name.includes("Ryzen"));
    const ramTotal = (selections['ram'] || []).length * 16; // Assumindo 16GB por pente pra simplificar estimativa

    let analysis = "🚀 *Análise da sua Configuração Balão:*\n\n";
    const capabilities: string[] = [];

    if (gpu?.score > 80) capabilities.push("✅ Roda Cyberpunk 2077 e Alan Wake 2 no Ultra/4K");
    else if (gpu?.score > 50) capabilities.push("✅ Roda Warzone, GTA V e Fortnite com alto FPS");
    else capabilities.push("✅ Ótimo para jogos leves (LoL, Valorant) e uso Office");

    if (cpu?.name.includes("i9") || cpu?.name.includes("Ryzen 9")) capabilities.push("✅ Processamento Monstruoso para Render e 3D");
    if (ramTotal >= 32) capabilities.push("✅ Perfeito para multitarefa pesada e Edição de Vídeo");

    analysis += capabilities.join("\n") + "\n\n";
    analysis += "*Pontos Fortes:*\nEsta máquina foi montada com componentes de alta durabilidade. O sistema de refrigeração escolhido garante longevidade.";
    
    return analysis;
  };

  const getProductsForStep = (stepId: string): Product[] => {
    const cats = (STEP_CATEGORY_MAP[stepId] || []).map(c => c.toLowerCase());
    const kws = (STEP_KEYWORDS[stepId] || []).map(k => k.toLowerCase());
    const filtered = products.filter(p => {
      const cat = (p.category || "").toLowerCase();
      const name = p.name.toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const inCat = cats.some(c => cat.includes(c));
      const hasKw = kws.some(k => name.includes(k) || desc.includes(k));
      return inCat || hasKw;
    });
    return filtered.sort((a, b) => a.price - b.price);
  };

  const handleWhatsApp = () => {
    const analysis = generateBuildAnalysis();
    let message = `Olá Balão! Montei este PC no site:\n\n`;
    
    STEPS.forEach(step => {
      if (step.id === 'review') return;
      const items = selections[step.id];
      if (items && items.length > 0) {
        message += `*${step.label}:* ${items.map(i => i.name).join(" + ")}\n`;
      }
    });

    message += `\n💰 *Valor Estimado:* R$ ${totalValue.toLocaleString('pt-BR')}\n\n`;
    message += analysis;
    message += `\n----------------\nMeu email para contato: ${userEmail}`;

    window.open(`https://wa.me/5519987510267?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER SIMPLES */}
      <header className="bg-neutral-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-red-600 text-2xl">Balão</span>Config
          </div>
          <div className="text-sm font-medium">
            Total: <span className="text-red-500 font-bold text-lg">R$ {totalValue.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 p-4 lg:p-8">
        
        {/* --- COLUNA 1: PROGRESSO (SIDEBAR) --- */}
        <aside className="hidden lg:block space-y-2 sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
          {STEPS.map((step, idx) => {
            const hasSelection = selections[step.id]?.length > 0;
            const isCurrent = idx === currentStepIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                disabled={idx > currentStepIndex && !selections[STEPS[idx-1]?.id]} // Só pode pular se completou anterior
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all border
                  ${isCurrent 
                    ? "bg-red-600 text-white border-red-700 shadow-lg" 
                    : hasSelection 
                      ? "bg-white text-slate-700 border-green-200 hover:border-red-300" 
                      : "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed"
                  }
                `}
              >
                <div className={`p-1.5 rounded-md ${isCurrent ? "bg-white/20" : "bg-slate-200"}`}>
                  {hasSelection && !isCurrent ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : step.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold">{step.label}</p>
                  {hasSelection && <p className="text-xs opacity-80 truncate w-32">{selections[step.id][0].name}</p>}
                </div>
              </button>
            );
          })}
        </aside>

        {/* --- COLUNA 2: ÁREA PRINCIPAL (VITRINE) --- */}
        <main className="min-h-[600px]">
          
          {/* BARRA DE PROGRESSO MOBILE */}
          <div className="lg:hidden mb-6 overflow-x-auto whitespace-nowrap pb-2 flex gap-2 no-scrollbar">
            {STEPS.map((step, idx) => (
              <button 
                key={step.id}
                onClick={() => goToStep(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                  idx === currentStepIndex ? "bg-red-600 text-white border-red-600" : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              {currentStep.icon} {currentStep.label}
            </h1>
            <p className="text-slate-500">
              {currentStep.multi ? "Você pode selecionar múltiplos itens nesta etapa." : "Escolha o componente ideal para sua máquina."}
            </p>
          </div>

          {!isReview ? (
            <>
              {/* GRID DE PRODUTOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    Carregando produtos...
                  </div>
                ) : getProductsForStep(currentStep.id).map((product) => {
                  const isSelected = selections[currentStep.id]?.find(p => p.id === product.id);
                  return (
                    <Card key={product.id} className={`p-0 overflow-hidden group hover:shadow-xl transition-all border-2 ${isSelected ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent hover:border-red-100'}`}>
                      <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                         {/* Placeholder Imagem */}
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300">
                           {currentStep.icon}
                         </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 h-12 line-clamp-2">{product.name}</h3>
                        <div className="flex justify-between items-end">
                          <span className="text-red-600 font-black text-xl">
                            R$ {product.price.toLocaleString('pt-BR')}
                          </span>
                          <Button 
                            onClick={() => handleSelect(product)}
                            variant={isSelected ? "secondary" : "default"}
                            className={isSelected ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-neutral-900 hover:bg-red-600"}
                          >
                            {isSelected ? "Selecionado" : "Adicionar"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
              
              {/* BOTÕES DE NAVEGAÇÃO DA ETAPA */}
              <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <Button variant="ghost" onClick={prevStep} disabled={currentStepIndex === 0} className="text-slate-500">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                
                {currentStep.multi && (
                   <div className="text-sm text-slate-500">
                      {selections[currentStep.id]?.length || 0} itens selecionados
                   </div>
                )}

                <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700 text-white px-8">
                  {currentStep.multi ? "Continuar / Próximo" : "Pular Etapa"} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            // --- TELA DE RESUMO E ANÁLISE (IA SIMULADA) ---
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-neutral-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                      <Trophy className="text-yellow-400" /> O Veredito da Balão
                    </h2>
                    <div className="whitespace-pre-line leading-relaxed text-slate-200">
                      {generateBuildAnalysis()}
                    </div>
                  </div>
                  {/* Decorativo */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 blur-[100px] opacity-20 pointer-events-none"></div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-lg mb-4">Finalizar Orçamento</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                   <Input 
                      placeholder="Seu melhor e-mail" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="h-12"
                   />
                   <Button onClick={handleWhatsApp} className="h-12 bg-[#25D366] hover:bg-[#1ebd56] text-white font-bold text-lg w-full">
                      <MessageCircle className="mr-2" /> Enviar pro WhatsApp
                   </Button>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 text-center">
                   Ao enviar, um de nossos especialistas revisará a compatibilidade e retornará com o link de pagamento ou ajustes necessários.
                 </p>
               </div>
            </div>
          )}
        </main>

        {/* --- COLUNA 3: RESUMO LATERAL (STICKY) --- */}
        <aside className="space-y-6">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Box className="w-4 h-4" /> Meu Setup
              </h3>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
              {Object.keys(selections).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Box className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  Seu carrinho está vazio.<br/>Comece escolhendo o processador.
                </div>
              )}

              {STEPS.map(step => {
                const items = selections[step.id];
                if (!items || items.length === 0) return null;

                return (
                  <div key={step.id} className="border-b border-slate-100 pb-2 last:border-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{step.label}</p>
                    {items.map((item, idx) => (
                      <div key={`${step.id}-${idx}`} className="flex justify-between items-start text-sm group">
                        <span className="text-slate-700 line-clamp-1 flex-1 pr-2">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">R${item.price}</span>
                          <button 
                            onClick={() => removeSelection(step.id, idx)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200">
               <div className="flex justify-between items-center text-lg font-black text-slate-900">
                 <span>Total</span>
                 <span>R$ {totalValue.toLocaleString('pt-BR')}</span>
               </div>
               <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                 <span>À vista no PIX</span>
                 <span>ou 12x de R$ {(totalValue * 1.15 / 12).toFixed(2)}</span>
               </div>
               
               {/* Botão de ação mobile/desktop redundante para garantir conversão */}
               {!isReview && (
                 <Button onClick={() => goToStep(STEPS.length - 1)} variant="outline" className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50">
                   Ver Resumo Final
                 </Button>
               )}
            </div>
          </div>
          
          {/* Card de Ajuda */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 text-sm">
             <h4 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Dúvida na peça?</h4>
             <p className="opacity-80 mb-3">Nossos técnicos estão online no WhatsApp para ajudar você a escolher.</p>
             <a href="https://wa.me/5519987510267" target="_blank" className="text-blue-700 font-bold hover:underline">Chamar ajuda &rarr;</a>
          </div>
        </aside>

      </div>
    </div>
  );
}
