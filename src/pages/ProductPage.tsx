import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId);
  const [techHtml, setTechHtml] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const sanitizeHtml = (input: string) => {
    if (!input) return "";
    let out = input;
    out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
    out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
    out = out.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
    out = out.replace(/<(\w+)[^>]*>/g, "<$1>");
    out = out.replace(/<(?!\/?(ul|li|b|strong|p|br)\b)[^>]*>/gi, "");
    return out;
  };

  useEffect(() => {
    const fetchTech = async () => {
      if (!product?.sourceUrl || !product.name) return;
      try {
        type ScrapeExtractResult = {
          produto?: {
            ficha_tecnica?: string;
            sobre_produto?: string;
          };
        };
        const asScrapeResult = (value: unknown): ScrapeExtractResult | null => {
          if (!value || typeof value !== "object") return null;
          if (!("produto" in value)) return null;
          const produto = (value as { produto?: unknown }).produto;
          if (!produto || typeof produto !== "object") return { produto: undefined };
          const p = produto as Record<string, unknown>;
          return {
            produto: {
              ficha_tecnica: typeof p.ficha_tecnica === "string" ? p.ficha_tecnica : undefined,
              sobre_produto: typeof p.sobre_produto === "string" ? p.sobre_produto : undefined,
            }
          };
        };
        const postApi = async (): Promise<unknown | null> => {
          try {
            const resp = await fetch("/api/scrape-extract-product", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: product.sourceUrl, name: product.name }),
            });
            if (!resp.ok) return null;
            return await resp.json();
          } catch {
            return null;
          }
        };

        const { data, error } = await supabase.functions.invoke("scrape-extract-product", {
          body: { url: product.sourceUrl, name: product.name }
        });
        const raw = !error ? data : null;
        const parsed = asScrapeResult(raw) || asScrapeResult(await postApi());
        const ficha = parsed?.produto?.ficha_tecnica || "";
        const sobre = parsed?.produto?.sobre_produto || "";
        if (ficha) setTechHtml(sanitizeHtml(ficha));
        if (sobre) setAboutText(sobre.trim());
      } catch (err) {
        console.error(err);
      }
    };
    fetchTech();
  }, [product?.sourceUrl, product?.name]);

  const handleShare = async () => {
    if (!product) return;
    
    const url = window.location.href;
    
    // Parse Product Name for better formatting
    // Expected format: "Title, CPU, GPU, RAM, SSD, Monitor..."
    const parts = product.name.split(',').map(p => p.trim()).filter(Boolean);
    
    let formattedText = "";
    
    if (parts.length > 1) {
        // Structured Product Name
        const title = parts[0];
        const otherParts = parts.slice(1);
        
        const cpu = otherParts.find(p => /ryzen|core\s*i\d|intel|amd|xeon|processador/i.test(p));
        const gpu = otherParts.find(p => /rtx|gtx|radeon|geforce|rx\s*\d|nvidia|placa de video|video/i.test(p));
        const monitor = otherParts.find(p => /monitor|tela|display|hz/i.test(p));
        
        const memStorage = otherParts.filter(p => 
            (/gb|tb|ram|ssd|hd|memória|nvme/i.test(p)) && 
            p !== cpu && 
            p !== gpu && 
            p !== monitor
        );

        formattedText += `🔥 ${title}\n`;
        if (cpu) formattedText += `🧠 ${cpu}\n`;
        if (gpu) formattedText += `🎮 ${gpu}\n`;
        if (memStorage.length > 0) formattedText += `⚡ ${memStorage.join(' | ')}\n`;
        if (monitor) formattedText += `🖥️ ${monitor}\n`;
        
    } else {
        // Simple Product Name
        formattedText += `🔥 ${product.name}\n`;
    }

    formattedText += `💰 ${formatPrice(product.price)}\n`;
    formattedText += `.\n.\n.\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: formattedText,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(formattedText);
      toast.success("Link copiado com a nova formatação!");
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success("Produto adicionado ao carrinho!");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a loja
          </Button>
        </div>
      </Layout>
    );
  }

  const productUrl = `https://www.balao.info/produto/${product.id}`;
  const categoryUrl = `https://www.balao.info/categoria/${product.category}`;

  return (
    <Layout>
      <SEOHead
        title={`${product.name} - ${formatPrice(product.price)} | Balão da Informática`}
        description={
          product.description ||
          `Compre ${product.name} na Balão da Informática em Campinas. ${formatPrice(product.price)} à vista ou em até 12x. Entrega rápida!`
        }
        keywords={`${product.name}, ${product.category}, comprar ${product.category} campinas, balão da informática`}
        image={product.image || undefined}
        url={productUrl}
        type="product"
        product={{
          name: product.name,
          price: product.price,
          image: product.image || undefined,
          description: product.description || product.name,
          sku: product.id,
          availability: product.stock && product.stock > 0 ? "InStock" : "OutOfStock",
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.balao.info" },
          { name: product.category || "Produtos", url: categoryUrl },
          { name: product.name, url: productUrl },
        ]}
      />
      
      {/* Layout padrão com scroll natural no mobile */}
      <div className="container mx-auto px-4 pb-4 md:h-auto flex flex-col md:block">
        
        {/* Botão de voltar */}
        <div className="shrink-0 py-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
            </Button>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-start">
          
          {/* ÁREA DA IMAGEM */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-center mb-4 md:mb-0 relative aspect-square md:aspect-auto md:h-[500px]">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain" 
            />
          </div>

          {/* ÁREA DE TEXTO E BOTÕES */}
          <div className="flex flex-col md:block space-y-4 md:space-y-6">
            
            {/* Bloco de Informações */}
            <div className="px-1">
              <div>
                <h1 className="text-lg md:text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
                {product.category && <span className="text-xs text-muted-foreground">Ref: {product.category}</span>}
              </div>

              {product.description && (
                <p className="text-muted-foreground text-xs md:text-base mt-2">
                  {product.description}
                </p>
              )}
              {aboutText && (
                <p className="text-muted-foreground text-xs md:text-base mt-3">
                  {aboutText}
                </p>
              )}
              {techHtml && (
                <div className="mt-4 text-xs md:text-sm text-foreground">
                  <h2 className="text-sm md:text-lg font-semibold mb-2">Ficha Técnica</h2>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: techHtml }}
                  />
                </div>
              )}
            </div>

            {/* Bloco de Preço e Ação */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 bg-background md:bg-transparent">
              <div className="space-y-1">
                <p className="text-2xl md:text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
                <p className="text-xs md:text-sm text-muted-foreground">ou 12x de {formatPrice(product.price / 12)} sem juros</p>
              </div>

              {product.stock !== undefined && (
                <p className={`text-xs md:text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                  {product.stock > 0 ? "Disponível" : "Indisponível"}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-10 md:h-14 text-sm md:text-lg font-bold shadow-md"
                  size="default"
                  disabled={product.stock !== undefined && product.stock <= 0}
                >
                  <ShoppingCart className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                  Comprar
                </Button>
                <Button variant="outline" onClick={handleShare} size="default" className="h-10 md:h-14 px-3">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
