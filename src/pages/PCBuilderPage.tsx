import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Monitor,
  Fan,
  Zap,
  Box,
  FileText,
  Wrench,
  Check,
  ChevronRight,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Search,
  Minus,
  MousePointer2,
  Keyboard,
  Wifi,
  Lock,
  Info,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- CONFIGURAÇÃO DAS ETAPAS ---
interface BuildStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  categorySlugs: string[];
  required: boolean;
  description: string;
  allowMultiple: boolean;
  maxQuantity?: number;
}

const BUILD_STEPS: BuildStep[] = [
  {
    id: "processador",
    name: "Processador",
    icon: <Cpu className="w-4 h-4" />,
    categorySlugs: ["processadores"],
    required: true,
    allowMultiple: false,
    description: "Plataforma.",
  },
  {
    id: "placa-mae",
    name: "Placa Mãe",
    icon: <CircuitBoard className="w-4 h-4" />,
    categorySlugs: ["placas-mae"],
    required: true,
    allowMultiple: false,
    description: "Base.",
  },
  {
    id: "memoria",
    name: "Memória RAM",
    icon: <MemoryStick className="w-4 h-4" />,
    categorySlugs: ["memoria-ram"],
    required: true,
    allowMultiple: true,
    maxQuantity: 4,
    description: "Velocidade.",
  },
  {
    id: "gpu",
    name: "Placa de Vídeo",
    icon: <Monitor className="w-4 h-4" />,
    categorySlugs: ["placa-de-video"],
    required: false,
    allowMultiple: false,
    description: "Gráficos.",
  },
  {
    id: "ssd",
    name: "Armazenamento",
    icon: <HardDrive className="w-4 h-4" />,
    categorySlugs: ["ssd-hd", "ssd"],
    required: true,
    allowMultiple: true,
    maxQuantity: 4,
    description: "Dados.",
  },
  {
    id: "fonte",
    name: "Fonte",
    icon: <Zap className="w-4 h-4" />,
    categorySlugs: ["fontes"],
    required: true,
    allowMultiple: false,
    description: "Energia.",
  },
  {
    id: "gabinete",
    name: "Gabinete",
    icon: <Box className="w-4 h-4" />,
    categorySlugs: ["gabinetes"],
    required: true,
    allowMultiple: false,
    description: "Visual.",
  },
  {
    id: "cooler",
    name: "Cooler",
    icon: <Fan className="w-4 h-4" />,
    categorySlugs: ["coolers"],
    required: false,
    allowMultiple: false,
    description: "Refrigeração.",
  },
  {
    id: "wifi",
    name: "Wi-Fi",
    icon: <Wifi className="w-4 h-4" />,
    categorySlugs: ["rede", "adaptador", "wifi", "wireless"],
    required: false,
    allowMultiple: false,
    description: "Conexão.",
  },
  {
    id: "monitor",
    name: "Monitores",
    icon: <Monitor className="w-4 h-4" />,
    categorySlugs: ["monitores"],
    required: false,
    allowMultiple: true,
    maxQuantity: 3,
    description: "Telas.",
  },
  {
    id: "teclado",
    name: "Teclado",
    icon: <Keyboard className="w-4 h-4" />,
    categorySlugs: ["teclado"],
    required: false,
    allowMultiple: false,
    description: "Periféricos.",
  },
  {
    id: "mouse",
    name: "Mouse",
    icon: <MousePointer2 className="w-4 h-4" />,
    categorySlugs: ["mouse"],
    required: false,
    allowMultiple: false,
    description: "Periféricos.",
  },
  {
    id: "licenca",
    name: "Softwares",
    icon: <FileText className="w-4 h-4" />,
    categorySlugs: ["licencas", "software"],
    required: false,
    allowMultiple: true,
    description: "Sistema.",
  },
];

const parseProductSpecs = (name: string, description: string = "") => {
  const text = (name + " " + description).toLowerCase();

  const isNotebook =
    text.includes("sodimm") || text.includes("so-dimm") || text.includes("notebook") || text.includes("laptop");
  const isDDR4 = text.includes("ddr4") || text.includes("d4");
  const isDDR5 = text.includes("ddr5") || text.includes("d5");

  const isAMD = text.includes("amd") || text.includes("ryzen") || text.includes("am4") || text.includes("am5");
  const isIntel = text.includes("intel") || text.includes("core i") || text.includes("lga");

  let socket = "unknown";
  if (text.includes("lga1700")) socket = "lga1700";
  else if (text.includes("lga1200")) socket = "lga1200";
  else if (text.includes("am5")) socket = "am5";
  else if (text.includes("am4")) socket = "am4";

  if (socket === "unknown") {
    if (text.includes("h610") || text.includes("b660") || text.includes("b760") || text.includes("z790"))
      socket = "lga1700";
    if (text.includes("b650") || text.includes("x670") || text.includes("a620")) socket = "am5";
    if (text.includes("b550") || text.includes("b450") || text.includes("a520")) socket = "am4";
  }

  return { isDDR4, isDDR5, socket, isAMD, isIntel, isNotebook };
};

export default function PCBuilderPage() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"price-asc" | "price-desc">("price-asc");
  const [promptProduct, setPromptProduct] = useState<string | null>(null);

  // Inicialização segura
  const [selectedParts, setSelectedParts] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem("pc-builder-v7");
      const parsed = saved ? JSON.parse(saved) : {};
      if (typeof parsed !== "object" || parsed === null) return {};
      return parsed;
    } catch (e) {
      return {};
    }
  });

  // --- EFEITOS ---
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("pc-builder-v7", JSON.stringify(selectedParts));
      } catch (error) {
        console.error("Erro ao salvar progresso:", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedParts]);

  useEffect(() => {
    // Scroll ajustado para garantir visibilidade
    if (contentRef.current && !showSummary) {
      setTimeout(() => {
        const headerEl = document.querySelector("header");
        const headerOffset = headerEl ? headerEl.getBoundingClientRect().height + 24 : 96;
        const elementPosition = contentRef.current!.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 100);
    }
    setSearchTerm("");
    setPromptProduct(null);
  }, [currentStep, showSummary]);

  // --- FILTRAGEM SEGURA ---
  const { filteredProducts } = useMemo(() => {
    if (showSummary || !products) return { filteredProducts: [] };

    try {
      const step = BUILD_STEPS[currentStep];
      const categoryProducts = products.filter(
        (p) => p.category && step.categorySlugs.some((slug) => p.category.toLowerCase().includes(slug)),
      );

      const cpuList = Array.isArray(selectedParts["processador"]) ? selectedParts["processador"] : [];
      const moboList = Array.isArray(selectedParts["placa-mae"]) ? selectedParts["placa-mae"] : [];

      const cpu = cpuList[0];
      const mobo = moboList[0];

      const cpuSpecs = cpu ? parseProductSpecs(cpu.name, cpu.description) : null;
      const moboSpecs = mobo ? parseProductSpecs(mobo.name, mobo.description) : null;

      const compatible: any[] = [];

      categoryProducts.forEach((product) => {
        if (!product.name) return;

        const prodSpecs = parseProductSpecs(product.name, product.description);
        let isCompatible = true;

        if (step.id === "placa-mae" && cpuSpecs) {
          if (cpuSpecs.isAMD && prodSpecs.isIntel) isCompatible = false;
          if (cpuSpecs.isIntel && prodSpecs.isAMD) isCompatible = false;
          if (cpuSpecs.socket !== "unknown" && prodSpecs.socket !== "unknown" && cpuSpecs.socket !== prodSpecs.socket) {
            isCompatible = false;
          }
        }

        if (step.id === "memoria") {
          if (prodSpecs.isNotebook) isCompatible = false;
          if (moboSpecs) {
            if (moboSpecs.isDDR4 && !prodSpecs.isDDR4) isCompatible = false;
            if (moboSpecs.isDDR5 && !prodSpecs.isDDR5) isCompatible = false;
          }
        }

        if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return;
        if (isCompatible) compatible.push(product);
      });

      const sortFn = (a: any, b: any) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return sortOrder === "price-asc" ? priceA - priceB : priceB - priceA;
      };

      return { filteredProducts: compatible.sort(sortFn) };
    } catch (error) {
      console.error("Erro no filtro:", error);
      return { filteredProducts: [] };
    }
  }, [products, currentStep, selectedParts, searchTerm, sortOrder, showSummary]);

  // --- HANDLERS ---
  const handleCardClick = (product: any) => {
    const step = BUILD_STEPS[currentStep];
    if (step.allowMultiple) {
      addPart(product);
      setPromptProduct(product.id);
    } else {
      addPart(product);
      setTimeout(() => advanceStep(), 300);
    }
  };

  const addPart = (product: any) => {
    const step = BUILD_STEPS[currentStep];
    setSelectedParts((prev) => {
      const currentList = Array.isArray(prev[step.id]) ? prev[step.id] : [];
      if (step.allowMultiple) {
        if (step.maxQuantity && currentList.length >= step.maxQuantity) {
          toast.error(`Máximo de ${step.maxQuantity} itens desta categoria.`);
          return prev;
        }
        return { ...prev, [step.id]: [...currentList, product] };
      }
      return { ...prev, [step.id]: [product] };
    });
  };

  const removeOne = (stepId: string, productId: string) => {
    setSelectedParts((prev) => {
      const list = Array.isArray(prev[stepId]) ? [...prev[stepId]] : [];
      const index = list.findIndex((p) => p.id === productId);
      if (index > -1) list.splice(index, 1);
      return { ...prev, [stepId]: list };
    });
    setPromptProduct(null);
  };

  const advanceStep = () => {
    setPromptProduct(null);
    if (currentStep < BUILD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleGlobalReset = () => {
    if (confirm("Limpar toda a montagem?")) {
      setSelectedParts({});
      setCurrentStep(0);
      setShowSummary(false);
      localStorage.removeItem("pc-builder-v7");
    }
  };

  const calculateTotal = () => {
    const allParts = Object.values(selectedParts).flat().filter(Boolean);
    const partsTotal = allParts.reduce((acc, p) => acc + (p?.price || 0), 0);
    let labor = 0;
    if (partsTotal > 0) {
      const rawLabor = partsTotal * 0.1;
      labor = Math.max(150, Math.min(500, rawLabor));
    }
    return { partsTotal, labor, grandTotal: partsTotal + labor };
  };

  const { partsTotal, labor, grandTotal } = calculateTotal();
  const requiredMet = BUILD_STEPS.filter((s) => s.required).every((s) => (selectedParts[s.id] || []).length > 0);
  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleFinalizeBuild = () => {
    try {
      const allParts = Object.values(selectedParts).flat().filter(Boolean);
      if (allParts.length === 0) {
        toast.error("O PC está vazio!");
        return;
      }
      allParts.forEach((part) => {
        addToCart({
          id: part.id,
          name: part.name,
          price: part.price,
          image: part.image || "",
          category: part.category,
          quantity: 1,
        });
      });
      if (labor > 0) {
        addToCart({
          id: "montagem-setup-pro",
          name: "Serviço de Montagem Profissional & Testes",
          price: labor,
          image: "",
          category: "Serviço",
          quantity: 1,
        });
      }
      toast.success("Adicionado ao carrinho!");
      localStorage.removeItem("pc-builder-v7");
      navigate("/carrinho");
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast.error("Erro ao processar carrinho. Tente novamente.");
    }
  };

  return (
    <Layout>
      <div className="bg-zinc-50 min-h-screen pb-10">
        {/* === HEADER FIXO (TOPO) === */}
        <div className="bg-white border-b sticky top-16 sm:top-20 z-40 shadow-sm">
          <div className="container-balao pt-2 pb-2">
            {/* LINHA 1: Título e Preço */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#E30613] text-white p-1.5 md:p-2 rounded-lg shrink-0">
                  <Wrench className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h1 className="font-bold text-base md:text-lg leading-tight">
                  <span className="md:hidden block">Monte seu PC</span>
                  <span className="hidden md:block">
                    Monte seu PC <span className="text-[#E30613]">Inteligente</span>
                  </span>
                </h1>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Total</p>
                <p className="text-lg md:text-xl font-black text-green-600 leading-none">{formatPrice(grandTotal)}</p>
              </div>
            </div>

            {/* LINHA 2: Botões de Ação */}
            <div className="flex justify-between items-center gap-2 mb-2 bg-zinc-50 p-1.5 rounded-lg border border-zinc-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalReset}
                className="text-red-500 hover:bg-red-50 h-8 px-2 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> <span className="hidden sm:inline">Limpar</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentStep(Math.max(0, currentStep - 1));
                    setShowSummary(false);
                  }}
                  disabled={currentStep === 0 && !showSummary}
                  className="h-8 px-2 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar
                </Button>

                {showSummary ? (
                  <Button
                    size="sm"
                    onClick={handleFinalizeBuild}
                    disabled={!requiredMet}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse h-8 px-3 text-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-2" /> COMPRAR
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={advanceStep}
                    className="bg-zinc-900 text-white hover:bg-black h-8 px-3 text-xs"
                  >
                    {currentStep < BUILD_STEPS.length - 1 ? "Próximo" : "Resumo"}{" "}
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* === LINHA 3: CATEGORIAS (MULTILINHA - VISÍVEL SEM SCROLL) === */}
            {!showSummary && (
              <div className="flex flex-wrap justify-center gap-1.5 pb-1">
                {BUILD_STEPS.map((step, idx) => {
                  const count = (selectedParts[step.id] || []).length;
                  const isCurrent = idx === currentStep;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(idx)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md border transition-all text-center",
                        // Classes responsivas: Menor no mobile, normal no desktop
                        "text-[10px] sm:text-xs font-bold",
                        isCurrent
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : count > 0
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300",
                      )}
                    >
                      {/* Oculta ícone no mobile super pequeno se necessário, mas mantendo por enquanto */}
                      <span className="hidden sm:inline">{count > 0 ? <Check className="w-3 h-3" /> : step.icon}</span>
                      <span>{step.name}</span>
                      {count > 1 && <span className="ml-0.5 text-[9px] bg-white/20 px-1 rounded-full">{count}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* === CONTEÚDO === */}
        {/* Ajuste de scroll-margin para compensar o header maior */}
        <div ref={contentRef} className="container-balao py-6 px-4 scroll-mt-16 sm:scroll-mt-20">
          {showSummary ? (
            <div className="grid md:grid-cols-3 gap-8 animate-in fade-in">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mt-4">
                  <Check className="w-6 h-6 text-green-500" /> Resumo do Setup
                </h2>

                {BUILD_STEPS.map((step) => {
                  const parts = selectedParts[step.id] || [];
                  if (parts.length === 0 && !step.required) return null;

                  return (
                    <Card
                      key={step.id}
                      className={cn(
                        "transition-all",
                        parts.length ? "border-green-200 bg-white" : "border-red-200 bg-red-50",
                      )}
                    >
                      <div className="p-3 flex gap-3 items-start">
                        <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500">{step.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-xs font-bold uppercase text-zinc-400">{step.name}</p>
                            {parts.length === 0 && (
                              <span className="text-xs font-bold text-red-500">Obrigatório - Faltando</span>
                            )}
                          </div>
                          {parts.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {parts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-zinc-50 p-2 rounded">
                                  <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-green-700">{formatPrice(p.price)}</span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-red-400"
                                      onClick={() => removeOne(step.id, p.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="h-fit sticky top-16 sm:top-20 shadow-xl border-green-100">
                <CardHeader className="bg-zinc-900 text-white py-4 rounded-t-xl">
                  <CardTitle>Investimento</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-zinc-600">
                    <span>Peças</span> <span>{formatPrice(partsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span className="flex items-center gap-1">
                      Montagem Pro <Info className="w-3 h-3" />
                    </span>
                    <span>{formatPrice(labor)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-2xl font-black text-green-600">
                    <span>Total</span> <span>{formatPrice(grandTotal)}</span>
                  </div>
                  <Button
                    onClick={handleFinalizeBuild}
                    disabled={!requiredMet}
                    className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg mt-4 shadow-lg shadow-green-200"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" /> Confirmar Compra
                  </Button>
                  {!requiredMet && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-xs text-center border border-red-200 flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Faltam peças obrigatórias!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pt-2">
                <div className="flex items-center gap-3 self-start">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-100 hidden md:block">
                    {BUILD_STEPS[currentStep].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                      <span className="md:hidden">{BUILD_STEPS[currentStep].icon}</span>
                      {BUILD_STEPS[currentStep].name}
                    </h2>
                    <p className="text-sm text-zinc-500">{BUILD_STEPS[currentStep].description}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-9 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                    <SelectTrigger className="w-[110px] bg-white">
                      <SelectValue placeholder="Ordem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Menor $</SelectItem>
                      <SelectItem value="price-desc">Maior $</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((product) => {
                  const stepId = BUILD_STEPS[currentStep].id;
                  const currentList = selectedParts[stepId] || [];
                  const qty = currentList.filter((p: any) => p.id === product.id).length;
                  const isPromptOpen = promptProduct === product.id;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleCardClick(product)}
                      className={cn(
                        "relative group bg-white rounded-xl border transition-all overflow-hidden cursor-pointer",
                        qty > 0 ? "border-green-500 ring-2 ring-green-500/20" : "border-zinc-200 hover:border-zinc-400",
                      )}
                    >
                      {isPromptOpen && (
                        <div
                          className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-green-100 text-green-700 p-2 rounded-full mb-2">
                            <Check className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-zinc-800 text-sm mb-1">Adicionado!</p>
                          <p className="text-xs text-zinc-500 mb-4">Continuar?</p>
                          <div className="flex flex-col gap-2 w-full">
                            <Button
                              size="sm"
                              className="bg-zinc-800 hover:bg-zinc-900 h-8 text-xs font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPromptProduct(null);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> ESCOLHER OUTRO
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={advanceStep}>
                              PRÓXIMA ETAPA <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {qty > 0 && (
                        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          {qty}x
                        </div>
                      )}

                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-green-50 text-green-700 border-green-100 text-[9px] px-1.5 py-0">
                          Compatível
                        </Badge>
                      </div>

                      <div className="aspect-square p-4 flex items-center justify-center bg-white">
                        {product.image ? (
                          <img src={product.image} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-zinc-200">{BUILD_STEPS[currentStep].icon}</div>
                        )}
                      </div>

                      <div className="p-3 border-t border-zinc-50">
                        <h3 className="text-xs font-bold text-zinc-800 line-clamp-2 h-8 mb-1">{product.name}</h3>
                        <p className="text-base font-black text-green-600">{formatPrice(product.price)}</p>
                        {qty > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 w-full h-6 text-[10px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOne(stepId, product.id);
                            }}
                          >
                            <Minus className="w-3 h-3 mr-1" /> Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-zinc-200">
                  <Lock className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm text-zinc-500">Nenhum produto compatível encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
