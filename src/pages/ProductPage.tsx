import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Layout } from "@/components/Layout";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
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

  const productUrl = `https://www.balaodainformatica.com.br/produto/${product.id}`;
  const categoryUrl = `https://www.balaodainformatica.com.br/categoria/${product.category}`;

  return (
    <Layout>
      <SEOHead
        title={`${product.name} | Balão da Informática - Campinas`}
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
          { name: "Home", url: "https://www.balaodainformatica.com.br" },
          { name: product.category || "Produtos", url: categoryUrl },
          { name: product.name, url: productUrl },
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-card rounded-lg p-4">
            <img src={product.image} alt={product.name} className="w-full h-auto max-h-[500px] object-contain" />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.category && <span className="text-sm text-muted-foreground">Categoria: {product.category}</span>}
            </div>

            {product.description && <p className="text-muted-foreground">{product.description}</p>}

            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
              <p className="text-sm text-muted-foreground">ou 12x de {formatPrice(product.price / 12)} sem juros</p>
            </div>

            {product.stock !== undefined && (
              <p className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} unidades em estoque` : "Produto indisponível"}
              </p>
            )}

            {/* BOTÕES ATUALIZADOS AQUI */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-14 text-lg font-bold shadow-md"
                size="lg"
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button variant="outline" onClick={handleShare} size="lg" className="h-14">
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
