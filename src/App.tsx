import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { BannerProvider } from "@/contexts/BannerContext";
import { PageBlocksProvider } from "@/contexts/PageBlocksContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BatchOperationsProvider } from "@/contexts/BatchOperationsContext";
import { BatchProgressIndicator } from "@/components/BatchProgressIndicator";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import PCBuilderPage from "./pages/PCBuilderPage";
import ProductPage from "./pages/ProductPage";
import SobreNosPage from "./pages/SobreNosPage";
import ConsignacaoPage from "./pages/ConsignacaoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CategoryProvider>
        <BannerProvider>
          <ProductProvider>
            <BatchOperationsProvider>
              <PageBlocksProvider>
                <CartProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BatchProgressIndicator />
                    <BrowserRouter>
                      <ScrollToTop />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/categoria/:categoryId" element={<CategoryPage />} />
                        <Route path="/produto/:productId" element={<ProductPage />} />
                        <Route path="/busca" element={<SearchPage />} />
                        <Route path="/carrinho" element={<CartPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/pedidos" element={<OrdersPage />} />
                        <Route path="/perfil" element={<ProfilePage />} />
                        <Route path="/montar-pc" element={<PCBuilderPage />} />
                        <Route path="/sobre" element={<SobreNosPage />} />
                        <Route path="/consignacao" element={<ConsignacaoPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </CartProvider>
              </PageBlocksProvider>
            </BatchOperationsProvider>
          </ProductProvider>
        </BannerProvider>
      </CategoryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
