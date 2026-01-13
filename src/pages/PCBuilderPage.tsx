import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PriceFilter } from "@/components/PriceFilter";
import { useCategories } from "@/contexts/CategoryContext";
import type { Product } from "@/types/product";
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
  MessageCircle,
  Printer,
  Mail,
  RefreshCw,
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
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [promptProduct, setPromptProduct] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Inicialização segura
  const [selectedParts, setSelectedParts] = useState<Record<string, Product[]>>(() => {
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
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (contentRef.current && !showSummary && !isMobile) {
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

  const { categories } = useCategories();
  const STEP_SYNONYMS: Record<string, string[]> = {
    "processador": ["processadores", "cpu", "processador"],
    "placa-mae": ["placas-mae", "motherboard", "mobo", "placa mae"],
    "memoria": ["memoria-ram", "memoria", "ram"],
    "gpu": ["placa-de-video", "gpu", "video"],
    "ssd": ["ssd", "hd", "armazenamento", "disco"],
    "fonte": ["fontes", "psu", "fonte"],
    "gabinete": ["gabinetes", "gabinete", "case"],
    "cooler": ["coolers", "cooler", "aircooler", "watercooler"],
    "wifi": ["rede", "adaptador", "wifi", "wireless", "pci", "usb"],
    "monitor": ["monitores", "monitor"],
    "teclado": ["teclado", "teclados"],
    "mouse": ["mouse", "mouses"],
    "licenca": ["licencas", "software", "windows", "office"]
  };
  const resolvedStepSlugs: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    BUILD_STEPS.forEach((step) => {
      const syn = (STEP_SYNONYMS[step.id] || []).map((s) => s.toLowerCase());
      const matched = categories
        .filter((c) => {
          const slug = c.slug.toLowerCase();
          const name = c.name.toLowerCase();
          return syn.some((s) => slug.includes(s) || name.includes(s));
        })
        .map((c) => c.slug.toLowerCase());
      map[step.id] = matched.length ? matched : step.categorySlugs.map((s) => s.toLowerCase());
    });
    return map;
  }, [categories, STEP_SYNONYMS]);

  // --- FILTRAGEM SEGURA ---
  const { filteredProducts } = useMemo(() => {
    if (showSummary || !products) return { filteredProducts: [] };

    try {
      const step = BUILD_STEPS[currentStep];
      const slugs = (resolvedStepSlugs[step.id] || step.categorySlugs).map((s) => s.toLowerCase());
      const categoryProducts = products.filter(
        (p) => p.category && slugs.some((slug) => (p.category as string).toLowerCase().includes(slug)),
      );

      const cpuList = Array.isArray(selectedParts["processador"]) ? selectedParts["processador"] : [];
      const moboList = Array.isArray(selectedParts["placa-mae"]) ? selectedParts["placa-mae"] : [];

      const cpu = cpuList[0];
      const mobo = moboList[0];

      const cpuSpecs = cpu ? parseProductSpecs(cpu.name, cpu.description) : null;
      const moboSpecs = mobo ? parseProductSpecs(mobo.name, mobo.description) : null;

      const compatible: Product[] = [];

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
        const price = product.price || 0;
        if (minPrice !== null && price < minPrice) return;
        if (maxPrice !== null && price > maxPrice) return;
        if (isCompatible) compatible.push(product);
      });

      const sortFn = (a: Product, b: Product) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      };

      const sortedCompat = compatible.sort(sortFn);
      if (sortedCompat.length > 0) return { filteredProducts: sortedCompat };
      return { filteredProducts: categoryProducts.sort(sortFn) };
    } catch (error) {
      console.error("Erro no filtro:", error);
      return { filteredProducts: [] };
    }
  }, [products, currentStep, selectedParts, searchTerm, sortOrder, showSummary, minPrice, maxPrice, resolvedStepSlugs]);

  // --- HANDLERS ---
  const handleCardClick = (product: Product) => {
    const step = BUILD_STEPS[currentStep];
    if (step.allowMultiple) {
      addPart(product);
      setPromptProduct(product.id);
    } else {
      addPart(product);
      setTimeout(() => advanceStep(), 300);
    }
  };

  const addPart = (product: Product) => {
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

  const hasStepSelection = (stepId: string) => {
    return (selectedParts[stepId] || []).length > 0;
  };

  const canAccessStepIndex = (targetIndex: number) => {
    if (targetIndex <= currentStep) return true;
    for (let i = 0; i < targetIndex; i++) {
      const step = BUILD_STEPS[i];
      if (step.required && !hasStepSelection(step.id)) {
        return false;
      }
    }
    return true;
  };

  const handleChangeStep = (targetIndex: number) => {
    if (!canAccessStepIndex(targetIndex)) {
      toast.error("Conclua as etapas obrigatórias anteriores antes de avançar.");
      return;
    }
    setPromptProduct(null);
    setCurrentStep(targetIndex);
    setShowSummary(false);
  };

  const advanceStep = () => {
    setPromptProduct(null);
    if (currentStep < BUILD_STEPS.length - 1) {
      const nextIndex = currentStep + 1;
      if (!canAccessStepIndex(nextIndex)) {
        toast.error("Conclua as etapas obrigatórias anteriores antes de avançar.");
        return;
      }
      setCurrentStep(nextIndex);
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

  const buildConfigurationSummary = () => {
    const lines: string[] = [];
    lines.push("Monte seu PC - Balão da Informática");
    lines.push("");
    BUILD_STEPS.forEach((step) => {
      const parts = selectedParts[step.id] || [];
      if (!parts.length) return;
      lines.push(`${step.name}:`);
      parts.forEach((p) => {
        lines.push(`• ${p.name} - ${formatPrice(p.price || 0)}`);
      });
      lines.push("");
    });
    lines.push(`Subtotal (peças): ${formatPrice(partsTotal)}`);
    lines.push(`Montagem: ${formatPrice(labor)}`);
    lines.push(`Total estimado: ${formatPrice(grandTotal)}`);
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 3);
    lines.push(`Orçamento válido até: ${validUntil.toLocaleDateString("pt-BR")}`);
    return lines.join("\n");
  };

  const handleShareWhatsApp = () => {
    const allParts = Object.values(selectedParts).flat().filter(Boolean);
    if (allParts.length === 0) {
      toast.error("Selecione pelo menos uma peça antes de enviar.");
      return;
    }
    const message = `*Monte seu PC - Balão da Informática*\n\n${buildConfigurationSummary()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5519987510267?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareEmail = () => {
    const allParts = Object.values(selectedParts).flat().filter(Boolean);
    if (allParts.length === 0) {
      toast.error("Selecione pelo menos uma peça antes de enviar.");
      return;
    }
    const subject = encodeURIComponent("Orçamento de PC - Balão da Informática");
    const body = encodeURIComponent(buildConfigurationSummary());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handlePrintQuote = () => {
    const allParts = Object.values(selectedParts).flat().filter(Boolean);
    if (allParts.length === 0) {
      toast.error("Selecione pelo menos uma peça antes de gerar o orçamento.");
      return;
    }
    const summary = buildConfigurationSummary();
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 3);
    const formatDate = (d: Date) => d.toLocaleDateString("pt-BR");
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      toast.error("Não foi possível abrir a janela de impressão.");
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>Orçamento - Monte seu PC</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
            p { margin: 4px 0; }
            pre { background: #f3f4f6; padding: 16px; border-radius: 8px; white-space: pre-wrap; }
            .meta { font-size: 12px; color: #6b7280; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>Orçamento - Monte seu PC</h1>
          <p>Balão da Informática</p>
          <div class="meta">
            <p>Data de emissão: ${formatDate(today)}</p>
            <p>Validade: ${formatDate(validUntil)} (3 dias corridos)</p>
          </div>
          <h2>Detalhes da configuração</h2>
          <pre>${summary}</pre>
        </body>
      </html>
    `;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

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

  // --- LAYOUT HELPERS ---

  return (
    <Layout>
      <div className="bg-zinc-50/50 min-h-screen pb-32 md:pb-24">
        {/* === HEADER MOBILE (Steps Scroll) === */}
        <div className="md:hidden bg-white border-b sticky top-16 z-30 overflow-x-auto scrollbar-hide">
          <div className="flex p-2 gap-2 min-w-max">
            {BUILD_STEPS.map((step, idx) => {
              const count = (selectedParts[step.id] || []).length;
              const isCurrent = idx === currentStep;
              const isCompleted = count > 0;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleChangeStep(idx)}
                  className={cn(
                    "flex flex-col items-center justify-center w-20 py-2 rounded-lg transition-all relative",
                    isCurrent ? "bg-zinc-900 text-white shadow-md scale-105" : "bg-white text-zinc-500 border border-zinc-100",
                    !isCurrent && isCompleted && "bg-green-50 text-green-700 border-green-200"
                  )}
                >
                  <div className={cn("mb-1", isCurrent ? "text-white" : isCompleted ? "text-green-600" : "text-zinc-400")}>
                     {isCompleted && !isCurrent ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className="text-[10px] font-bold leading-tight truncate w-full px-1 text-center">
                    {step.name}
                  </span>
                  {count > 1 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="container-balao mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* === SIDEBAR (Desktop Steps) === */}
            <aside className="hidden md:block w-72 shrink-0 space-y-4 sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
               <div className="mb-6 px-2">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-900 leading-none">
                    Monte seu <span className="text-[#E30613]">PC</span>
                  </h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleGlobalReset}
                    className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Reiniciar Montagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Selecione as peças e verifique a compatibilidade automaticamente.
                </p>
              </div>

              <div className="space-y-1.5">
                {BUILD_STEPS.map((step, idx) => {
                  const count = (selectedParts[step.id] || []).length;
                  const isCurrent = idx === currentStep && !showSummary;
                  const isCompleted = count > 0;

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleChangeStep(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group border relative overflow-hidden",
                        isCurrent 
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                          : "bg-white border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600",
                        !isCurrent && isCompleted && "bg-green-50/50 border-green-100 text-green-700"
                      )}
                    >
                      {/* Progress Bar Background for Completed Steps */}
                      {!isCurrent && isCompleted && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl" />
                      )}

                      <div className={cn(
                        "p-2 rounded-lg transition-colors shrink-0",
                        isCurrent ? "bg-white/10 text-white" : isCompleted ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"
                      )}>
                        {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : step.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={cn("text-sm font-bold truncate", isCurrent ? "text-white" : "text-zinc-700")}>
                            {step.name}
                          </p>
                          {step.required && !isCompleted && !isCurrent && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm" title="Obrigatório" />
                          )}
                        </div>
                        <p className={cn("text-[10px] truncate leading-tight", isCurrent ? "text-zinc-400" : "text-zinc-400")}>
                          {count > 0 ? (
                            <span className="font-medium text-green-600 flex items-center gap-1">
                              {count} item(ns) <Check className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            step.description
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-200">
                <button
                  onClick={() => setShowSummary(true)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border-2 border-dashed",
                    showSummary 
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                      : "border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", showSummary ? "bg-white/10" : "bg-zinc-100")}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Resumo do Pedido</p>
                    <p className="text-[10px] opacity-70">Revisar e finalizar</p>
                  </div>
                </button>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={handleGlobalReset}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Reiniciar Montagem
                </Button>
              </div>
            </aside>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 min-w-0">
              {showSummary ? (
                /* === SUMMARY VIEW === */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <Check className="w-6 h-6" />
                      </div>
                      Revisão do Setup
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => setShowSummary(false)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      {BUILD_STEPS.map((step) => {
                        const parts = selectedParts[step.id] || [];
                        if (parts.length === 0 && !step.required) return null;

                        return (
                          <div 
                            key={step.id} 
                            className={cn(
                              "bg-white rounded-xl border p-4 transition-all hover:shadow-md",
                              parts.length === 0 ? "border-red-200 bg-red-50/30" : "border-zinc-100"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-3 rounded-xl shrink-0",
                                parts.length === 0 ? "bg-red-100 text-red-500" : "bg-zinc-50 text-zinc-500"
                              )}>
                                {step.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-bold text-zinc-800">{step.name}</h3>
                                  {parts.length === 0 && (
                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                      OBRIGATÓRIO
                                    </span>
                                  )}
                                </div>
                                
                                {parts.length > 0 ? (
                                  <div className="space-y-3">
                                    {parts.map((p, i) => (
                                      <div key={i} className="flex gap-3 items-center bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                        <div className="h-10 w-10 bg-white rounded-md border border-zinc-100 p-1 shrink-0">
                                          {p.image ? (
                                            <img src={p.image} className="w-full h-full object-contain" />
                                          ) : (
                                            <Box className="w-full h-full text-zinc-300" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-zinc-700 truncate">{p.name}</p>
                                          <p className="text-xs font-bold text-green-600">{formatPrice(p.price)}</p>
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                          onClick={() => removeOne(step.id, p.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-zinc-400 italic">Nenhum item selecionado.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-6 sticky top-24">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" /> Investimento
                        </h3>
                        
                        <div className="space-y-3 text-sm mb-6">
                          <div className="flex justify-between text-zinc-500">
                            <span>Subtotal (Peças)</span>
                            <span>{formatPrice(partsTotal)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span className="flex items-center gap-1">Montagem <Info className="w-3 h-3"/></span>
                            <span>{formatPrice(labor)}</span>
                          </div>
                          <div className="h-px bg-zinc-100 my-2" />
                          <div className="flex justify-between items-end">
                            <span className="font-bold text-zinc-800">Total à vista</span>
                            <span className="text-2xl font-black text-green-600 leading-none">{formatPrice(grandTotal)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 text-right">ou em até 12x no cartão</p>
                        </div>

                        <div className="space-y-3">
                          <Button
                            className="w-full h-12 text-base font-bold bg-[#E30613] hover:bg-[#c90511] shadow-lg shadow-red-100"
                            onClick={handleFinalizeBuild}
                            disabled={!requiredMet}
                          >
                            FINALIZAR PEDIDO
                          </Button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <Button
                              variant="outline"
                              className="w-full text-xs sm:text-sm flex items-center justify-center gap-2"
                              onClick={handleShareWhatsApp}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Enviar por WhatsApp
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-xs sm:text-sm flex items-center justify-center gap-2"
                              onClick={handlePrintQuote}
                            >
                              <Printer className="w-4 h-4" />
                              Imprimir orçamento (PDF)
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-xs sm:text-sm flex items-center justify-center gap-2 sm:col-span-2"
                              onClick={handleShareEmail}
                            >
                              <Mail className="w-4 h-4" />
                              Enviar por email
                            </Button>
                          </div>

                          {!requiredMet && (
                            <p className="text-xs text-red-500 text-center mt-3 bg-red-50 p-2 rounded-lg border border-red-100">
                              Você precisa selecionar todas as peças obrigatórias antes de finalizar.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* === PRODUCT SELECTION VIEW === */
                <div className="animate-in fade-in duration-300">
                  <div className="md:hidden mb-4">
                    <h1 className="text-xl font-black tracking-tight text-zinc-900 leading-none">
                      Monte seu <span className="text-[#E30613]">PC</span>
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">
                      Siga as etapas na ordem para garantir compatibilidade.
                    </p>
                  </div>
                  {/* Step Header */}
                  <div className="bg-gradient-to-br from-white to-zinc-50 rounded-2xl border border-zinc-100 p-6 mb-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 transform rotate-12">
                      {React.cloneElement(BUILD_STEPS[currentStep].icon as React.ReactElement, { className: "w-48 h-48" })}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white/50 backdrop-blur text-zinc-500 border-zinc-200">
                              ETAPA {currentStep + 1} DE {BUILD_STEPS.length}
                            </Badge>
                            {BUILD_STEPS[currentStep].required ? (
                              <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100">
                                OBRIGATÓRIO
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100">
                                OPCIONAL
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                              {BUILD_STEPS[currentStep].name}
                            </h2>
                            <p className="text-zinc-500 text-sm md:text-base max-w-xl mt-1 leading-relaxed">
                              {BUILD_STEPS[currentStep].description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto bg-white/50 p-1 rounded-xl backdrop-blur-sm">
                           <div className="relative flex-1 sm:w-72">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <Input
                                placeholder="Buscar componente..."
                                className="pl-9 bg-white border-zinc-200 focus:border-zinc-300 focus:ring-zinc-100 h-10 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                           </div>
                           <div className="shrink-0">
                             <PriceFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onFilterChange={(min, max) => {
                                  setMinPrice(min);
                                  setMaxPrice(max);
                                }}
                                sortOrder={sortOrder}
                                onSortChange={(order) => setSortOrder(order)}
                             />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="mb-6 border-dashed border-zinc-200 bg-white/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#E30613]" />
                        Sugestão rápida por orçamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="flex-1">
                          <div className="text-[11px] font-medium text-zinc-500 mb-1">
                            Quanto você quer investir nas peças? (R$)
                          </div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Ex: 5000"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-xs md:text-sm whitespace-nowrap"
                            disabled={isSuggesting || !products || products.length === 0}
                            onClick={() => {
                              const raw = budgetInput.replace(/\./g, "").replace(",", ".");
                              const value = Number(raw);
                              if (!value || value <= 0) {
                                toast.error("Informe um orçamento válido em reais.");
                                return;
                              }
                              if (!products || products.length === 0) {
                                toast.error("Aguarde carregar os produtos antes de gerar a sugestão.");
                                return;
                              }
                              setIsSuggesting(true);
                              try {
                                const generateSuggestion = (budget: number) => {
                                  if (!products) return null;
                                  const config: Record<string, Product[]> = {};
                                  const getProductsForStep = (stepId: string) => {
                                    const step = BUILD_STEPS.find((s) => s.id === stepId);
                                    if (!step) return [] as Product[];
                                    const slugs = (resolvedStepSlugs[step.id] || step.categorySlugs).map((s) =>
                                      s.toLowerCase(),
                                    );
                                    const list = products
                                      .filter(
                                        (p) =>
                                          p.category &&
                                          slugs.some((slug) =>
                                            (p.category as string).toLowerCase().includes(slug),
                                          ),
                                      )
                                      .filter((p) => (p.price || 0) > 0)
                                      .sort((a, b) => (a.price || 0) - (b.price || 0));
                                    return list;
                                  };

                                  const essentialSteps = ["processador", "placa-mae", "memoria", "ssd", "fonte", "gabinete"];

                                  for (let attempt = 0; attempt < 60; attempt++) {
                                    let totalParts = 0;
                                    const tempConfig: Record<string, Product[]> = {};

                                    const cpuList = getProductsForStep("processador");
                                    if (!cpuList.length) continue;
                                    const cpu = cpuList[Math.floor(Math.random() * cpuList.length)];
                                    tempConfig["processador"] = [cpu];
                                    totalParts += cpu.price || 0;
                                    const cpuSpecs = parseProductSpecs(cpu.name, cpu.description);

                                    const moboListAll = getProductsForStep("placa-mae");
                                    const moboCandidates = moboListAll.filter((product) => {
                                      const specs = parseProductSpecs(product.name, product.description);
                                      if (cpuSpecs.isAMD && specs.isIntel) return false;
                                      if (cpuSpecs.isIntel && specs.isAMD) return false;
                                      if (
                                        cpuSpecs.socket !== "unknown" &&
                                        specs.socket !== "unknown" &&
                                        cpuSpecs.socket !== specs.socket
                                      ) {
                                        return false;
                                      }
                                      return true;
                                    });
                                    if (!moboCandidates.length) continue;
                                    const mobo = moboCandidates[Math.floor(Math.random() * moboCandidates.length)];
                                    tempConfig["placa-mae"] = [mobo];
                                    totalParts += mobo.price || 0;
                                    const moboSpecs = parseProductSpecs(mobo.name, mobo.description);

                                    const ramListAll = getProductsForStep("memoria");
                                    const ramCandidates = ramListAll.filter((product) => {
                                      const specs = parseProductSpecs(product.name, product.description);
                                      if (specs.isNotebook) return false;
                                      if (moboSpecs.isDDR4 && !specs.isDDR4) return false;
                                      if (moboSpecs.isDDR5 && !specs.isDDR5) return false;
                                      return true;
                                    });
                                    if (!ramCandidates.length) continue;
                                    const ram = ramCandidates[Math.floor(Math.random() * ramCandidates.length)];
                                    tempConfig["memoria"] = [ram];
                                    totalParts += ram.price || 0;

                                    const ssdList = getProductsForStep("ssd");
                                    if (!ssdList.length) continue;
                                    const ssd = ssdList[Math.floor(Math.random() * Math.min(ssdList.length, 6))];
                                    tempConfig["ssd"] = [ssd];
                                    totalParts += ssd.price || 0;

                                    const fonteList = getProductsForStep("fonte");
                                    if (!fonteList.length) continue;
                                    const fonte = fonteList[Math.floor(Math.random() * Math.min(fonteList.length, 6))];
                                    tempConfig["fonte"] = [fonte];
                                    totalParts += fonte.price || 0;

                                    const gabineteList = getProductsForStep("gabinete");
                                    if (!gabineteList.length) continue;
                                    const gabinete =
                                      gabineteList[Math.floor(Math.random() * Math.min(gabineteList.length, 6))];
                                    tempConfig["gabinete"] = [gabinete];
                                    totalParts += gabinete.price || 0;

                                    const gpuList = getProductsForStep("gpu");
                                    if (gpuList.length && totalParts < budget * 0.9) {
                                      const affordableGpus = gpuList.filter((g) => (g.price || 0) + totalParts <= budget);
                                      if (affordableGpus.length) {
                                        const gpu =
                                          affordableGpus[Math.floor(Math.random() * Math.min(affordableGpus.length, 6))];
                                        tempConfig["gpu"] = [gpu];
                                        totalParts += gpu.price || 0;
                                      }
                                    }

                                    const laborEstimate = totalParts > 0 ? Math.max(150, Math.min(500, totalParts * 0.1)) : 0;
                                    const grandEstimate = totalParts + laborEstimate;

                                    const allRequiredPresent = essentialSteps.every(
                                      (id) => (tempConfig[id] || []).length > 0,
                                    );
                                    if (!allRequiredPresent) continue;
                                    if (grandEstimate > budget) continue;

                                    Object.assign(config, tempConfig);
                                    return config;
                                  }

                                  return null;
                                };

                                const suggestion = generateSuggestion(value);
                                if (!suggestion) {
                                  toast.error(
                                    "Não consegui montar uma sugestão dentro desse valor. Tente ajustar o orçamento.",
                                  );
                                  return;
                                }
                                setSelectedParts(suggestion);
                                setCurrentStep(BUILD_STEPS.length - 1);
                                setShowSummary(true);
                              } finally {
                                setIsSuggesting(false);
                              }
                            }}
                          >
                            {isSuggesting ? "Gerando..." : "Gerar sugestão"}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-xs md:text-sm whitespace-nowrap"
                            disabled={isSuggesting || !budgetInput}
                            onClick={() => {
                              const raw = budgetInput.replace(/\./g, "").replace(",", ".");
                              const value = Number(raw);
                              if (!value || value <= 0) {
                                toast.error("Informe um orçamento válido em reais.");
                                return;
                              }
                              if (!products || products.length === 0) {
                                toast.error("Aguarde carregar os produtos antes de atualizar a sugestão.");
                                return;
                              }
                              const randomBump = (Math.random() - 0.5) * (value * 0.05);
                              const adjusted = Math.max(0, value + randomBump);
                              setIsSuggesting(true);
                              try {
                                const rawValue = adjusted;
                                const generateSuggestion = (budget: number) => {
                                  if (!products) return null;
                                  const config: Record<string, Product[]> = {};
                                  const getProductsForStep = (stepId: string) => {
                                    const step = BUILD_STEPS.find((s) => s.id === stepId);
                                    if (!step) return [] as Product[];
                                    const slugs = (resolvedStepSlugs[step.id] || step.categorySlugs).map((s) =>
                                      s.toLowerCase(),
                                    );
                                    const list = products
                                      .filter(
                                        (p) =>
                                          p.category &&
                                          slugs.some((slug) =>
                                            (p.category as string).toLowerCase().includes(slug),
                                          ),
                                      )
                                      .filter((p) => (p.price || 0) > 0)
                                      .sort((a, b) => (a.price || 0) - (b.price || 0));
                                    return list;
                                  };

                                  const essentialSteps = ["processador", "placa-mae", "memoria", "ssd", "fonte", "gabinete"];

                                  for (let attempt = 0; attempt < 60; attempt++) {
                                    let totalParts = 0;
                                    const tempConfig: Record<string, Product[]> = {};

                                    const cpuList = getProductsForStep("processador");
                                    if (!cpuList.length) continue;
                                    const cpu = cpuList[Math.floor(Math.random() * cpuList.length)];
                                    tempConfig["processador"] = [cpu];
                                    totalParts += cpu.price || 0;
                                    const cpuSpecs = parseProductSpecs(cpu.name, cpu.description);

                                    const moboListAll = getProductsForStep("placa-mae");
                                    const moboCandidates = moboListAll.filter((product) => {
                                      const specs = parseProductSpecs(product.name, product.description);
                                      if (cpuSpecs.isAMD && specs.isIntel) return false;
                                      if (cpuSpecs.isIntel && specs.isAMD) return false;
                                      if (
                                        cpuSpecs.socket !== "unknown" &&
                                        specs.socket !== "unknown" &&
                                        cpuSpecs.socket !== specs.socket
                                      ) {
                                        return false;
                                      }
                                      return true;
                                    });
                                    if (!moboCandidates.length) continue;
                                    const mobo = moboCandidates[Math.floor(Math.random() * moboCandidates.length)];
                                    tempConfig["placa-mae"] = [mobo];
                                    totalParts += mobo.price || 0;
                                    const moboSpecs = parseProductSpecs(mobo.name, mobo.description);

                                    const ramListAll = getProductsForStep("memoria");
                                    const ramCandidates = ramListAll.filter((product) => {
                                      const specs = parseProductSpecs(product.name, product.description);
                                      if (specs.isNotebook) return false;
                                      if (moboSpecs.isDDR4 && !specs.isDDR4) return false;
                                      if (moboSpecs.isDDR5 && !specs.isDDR5) return false;
                                      return true;
                                    });
                                    if (!ramCandidates.length) continue;
                                    const ram = ramCandidates[Math.floor(Math.random() * ramCandidates.length)];
                                    tempConfig["memoria"] = [ram];
                                    totalParts += ram.price || 0;

                                    const ssdList = getProductsForStep("ssd");
                                    if (!ssdList.length) continue;
                                    const ssd = ssdList[Math.floor(Math.random() * Math.min(ssdList.length, 6))];
                                    tempConfig["ssd"] = [ssd];
                                    totalParts += ssd.price || 0;

                                    const fonteList = getProductsForStep("fonte");
                                    if (!fonteList.length) continue;
                                    const fonte = fonteList[Math.floor(Math.random() * Math.min(fonteList.length, 6))];
                                    tempConfig["fonte"] = [fonte];
                                    totalParts += fonte.price || 0;

                                    const gabineteList = getProductsForStep("gabinete");
                                    if (!gabineteList.length) continue;
                                    const gabinete =
                                      gabineteList[Math.floor(Math.random() * Math.min(gabineteList.length, 6))];
                                    tempConfig["gabinete"] = [gabinete];
                                    totalParts += gabinete.price || 0;

                                    const gpuList = getProductsForStep("gpu");
                                    if (gpuList.length && totalParts < budget * 0.9) {
                                      const affordableGpus = gpuList.filter((g) => (g.price || 0) + totalParts <= budget);
                                      if (affordableGpus.length) {
                                        const gpu =
                                          affordableGpus[Math.floor(Math.random() * Math.min(affordableGpus.length, 6))];
                                        tempConfig["gpu"] = [gpu];
                                        totalParts += gpu.price || 0;
                                      }
                                    }

                                    const laborEstimate = totalParts > 0 ? Math.max(150, Math.min(500, totalParts * 0.1)) : 0;
                                    const grandEstimate = totalParts + laborEstimate;

                                    const allRequiredPresent = essentialSteps.every(
                                      (id) => (tempConfig[id] || []).length > 0,
                                    );
                                    if (!allRequiredPresent) continue;
                                    if (grandEstimate > budget) continue;

                                    Object.assign(config, tempConfig);
                                    return config;
                                  }

                                  return null;
                                };

                                const suggestion = generateSuggestion(rawValue);
                                if (!suggestion) {
                                  toast.error(
                                    "Não consegui montar uma sugestão dentro desse valor. Tente ajustar o orçamento.",
                                  );
                                  return;
                                }
                                setSelectedParts(suggestion);
                                setCurrentStep(BUILD_STEPS.length - 1);
                                setShowSummary(true);
                              } finally {
                                setIsSuggesting(false);
                              }
                            }}
                          >
                            Ver outra sugestão
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-zinc-100 p-4 animate-pulse space-y-3">
                          <div className="aspect-square bg-zinc-100 rounded-lg" />
                          <div className="h-4 bg-zinc-100 rounded w-3/4" />
                          <div className="h-4 bg-zinc-100 rounded w-1/2" />
                        </div>
                      ))
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const stepId = BUILD_STEPS[currentStep].id;
                        const currentList = selectedParts[stepId] || [];
                        const qty = currentList.filter((p) => p.id === product.id).length;
                        const isSelected = qty > 0;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleCardClick(product)}
                            className={cn(
                              "group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                              isSelected 
                                ? "border-green-500 ring-1 ring-green-500 shadow-md shadow-green-100" 
                                : "border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-100 hover:-translate-y-1"
                            )}
                          >
                             {isSelected && (
                               <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-green-200 animate-in zoom-in duration-200">
                                 <Check className="w-3 h-3" />
                                 {qty > 1 ? `${qty} SELECIONADOS` : 'SELECIONADO'}
                               </div>
                             )}

                             <div className="aspect-square p-8 flex items-center justify-center bg-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img 
                                  src={product.image || "/placeholder.png"} 
                                  alt={product.name}
                                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out" 
                                />
                             </div>

                             <div className="p-4 border-t border-zinc-50 bg-white relative z-10">
                               <div className="mb-3 h-[2.5rem] overflow-hidden">
                                 <h3 className="text-xs font-medium text-zinc-600 line-clamp-2 leading-relaxed group-hover:text-zinc-900 transition-colors">
                                   {product.name}
                                 </h3>
                               </div>
                               
                               <div className="flex items-end justify-between gap-2">
                                 <div className="flex flex-col">
                                   <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">À vista</span>
                                   <span className="text-base font-black text-green-600 leading-none">{formatPrice(product.price)}</span>
                                 </div>
                                 <Button 
                                   size="sm" 
                                   variant={isSelected ? "destructive" : "default"}
                                   className={cn(
                                     "h-9 w-9 p-0 rounded-xl shadow-sm transition-all duration-300", 
                                     isSelected 
                                       ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600" 
                                       : "bg-zinc-900 text-white hover:bg-black hover:scale-105"
                                   )}
                                   onClick={(e) => {
                                     if (isSelected) {
                                       e.stopPropagation();
                                       removeOne(stepId, product.id);
                                     }
                                   }}
                                 >
                                   {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                 </Button>
                               </div>
                             </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <Search className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800 mb-1">Ops! Nada encontrado.</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto">Não encontramos produtos compatíveis com seus filtros nesta categoria.</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchTerm("");
                            setMinPrice(null);
                            setMaxPrice(null);
                          }}
                          className="mt-2 text-red-600"
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* === BOTTOM BAR (Floating Actions) === */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-zinc-200 shadow-lg supports-[backdrop-filter]:bg-white/60">
          <div className="container-balao mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Estimado</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-lg md:text-2xl font-black text-green-600">{formatPrice(grandTotal)}</span>
                   <span className="text-[10px] md:text-xs text-zinc-500 font-medium hidden sm:inline">com montagem</span>
                 </div>
              </div>

              <div className="flex gap-2 md:gap-3">
                 <Button
                   variant="outline"
                   onClick={handleGlobalReset}
                   className="hidden sm:flex border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                 >
                   <Trash2 className="w-4 h-4 mr-2" /> Limpar
                 </Button>
                 
                 {/* Mobile Reset Button */}
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={handleGlobalReset}
                   className="sm:hidden text-zinc-400 hover:text-red-500 hover:bg-red-50"
                 >
                    <Trash2 className="w-5 h-5" />
                 </Button>

                 {!showSummary ? (
                   <Button 
                     onClick={advanceStep}
                     className="bg-zinc-900 hover:bg-black text-white shadow-lg shadow-zinc-200 px-6 md:px-8 h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wide"
                   >
                     {currentStep < BUILD_STEPS.length - 1 ? (
                       <>Próxima Etapa <ChevronRight className="w-4 h-4 ml-2" /></>
                     ) : (
                       <>Ver Resumo <FileText className="w-4 h-4 ml-2" /></>
                     )}
                   </Button>
                 ) : (
                   <Button 
                     onClick={handleFinalizeBuild}
                     disabled={!requiredMet}
                     className="bg-[#E30613] hover:bg-[#c90511] text-white shadow-lg shadow-red-200 px-6 md:px-8 h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wide"
                   >
                     Comprar Agora <ShoppingCart className="w-4 h-4 ml-2" />
                   </Button>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
