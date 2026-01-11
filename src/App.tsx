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
import { LandingPageConfigProvider } from "@/contexts/LandingPageConfigContext";
import { BatchProgressIndicator } from "@/components/BatchProgressIndicator";
import { MenuItemsProvider } from "./contexts/MenuItemsContext";
import { lazy, Suspense, useEffect } from 'react';
import { Loader2 } from "lucide-react";

// Componente para redirecionar domínio Lovable para o oficial
const DomainRedirect = () => {
  useEffect(() => {
    if (window.location.hostname.includes('lovable.app')) {
      const newUrl = 'https://www.balao.info' + window.location.pathname + window.location.search;
      window.location.href = newUrl;
    }
  }, []);
  return null;
};

// Lazy loading pages
const Index = lazy(() => import("./pages/Index"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PCBuilderPage = lazy(() => import("./pages/PCBuilderPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SobreNosPage = lazy(() => import("./pages/SobreNosPage"));
const ConsignacaoPage = lazy(() => import("./pages/ConsignacaoPage"));
const ManutencaoPage = lazy(() => import("./pages/ManutencaoPage"));
const LandingCarregadorNotebookPage = lazy(() => import("./pages/LandingCarregadorNotebookPage"));
const LandingTonerImpressoraPage = lazy(() => import("./pages/LandingTonerImpressoraPage"));
const LandingLicencasMicrosoftPage = lazy(() => import("./pages/LandingLicencasMicrosoftPage"));
const LandingConsertoApplePage = lazy(() => import("./pages/LandingConsertoApplePage"));
const LandingConsertoConsolePage = lazy(() => import("./pages/LandingConsertoConsolePage"));
const LandingNotebookSeminovoBaratoPage = lazy(() => import("./pages/LandingNotebookSeminovoBaratoPage"));
const LandingMontagemSetupGamerPage = lazy(() => import("./pages/LandingMontagemSetupGamerPage"));
const LandingConsertoNotebookPage = lazy(() => import("./pages/LandingConsertoNotebookPage"));
const LandingCriacaoSiteServicosTIPage = lazy(() => import("./pages/LandingCriacaoSiteServicosTIPage"));
const GenericLandingPage = lazy(() => import("./pages/GenericLandingPage"));
const LandingPlacaDeVideoPromocaoPage = lazy(() => import("./pages/LandingPlacaDeVideoPromocaoPage"));
const LandingPromocaoPcGamerPage = lazy(() => import("./pages/LandingPromocaoPcGamerPage"));
const LandingConsertoAndroidPage = lazy(() => import("./pages/LandingConsertoAndroidPage"));
const LandingAcessoriosGamerPage = lazy(() => import("./pages/LandingAcessoriosGamerPage"));
const LandingVisitaTecnicaPage = lazy(() => import("./pages/LandingVisitaTecnicaPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const ChatCentralPage = lazy(() => import("./pages/ChatCentralPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CategoryProvider>
        <BannerProvider>
          <ProductProvider>
            <LandingPageConfigProvider>
              <BatchOperationsProvider>
                <PageBlocksProvider>
                  <CartProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BatchProgressIndicator />
                      <MenuItemsProvider>
                        <BrowserRouter>
                          <DomainRedirect />
                          <ScrollToTop />
                          <Suspense fallback={<LoadingFallback />}>
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
                              <Route path="/chat-central" element={<ChatCentralPage />} />
                              <Route path="/sobre" element={<SobreNosPage />} />
                              <Route path="/consignacao" element={<ConsignacaoPage />} />
                              <Route path="/manutencao" element={<ManutencaoPage />} />
                              <Route path="/conserto-apple" element={<LandingConsertoApplePage />} />
                              <Route path="/conserto-console" element={<LandingConsertoConsolePage />} />
                              <Route path="/notebook-seminovo-barato" element={<LandingNotebookSeminovoBaratoPage />} />
                              <Route path="/montagem-setup-gamer" element={<LandingMontagemSetupGamerPage />} />
                              <Route path="/conserto-de-notebook" element={<LandingConsertoNotebookPage />} />
                              <Route path="/criacao-de-site-e-servicos-ti" element={<LandingCriacaoSiteServicosTIPage />} />
                              <Route path="/criacao-de-site-e-servicos-de-ti" element={<LandingCriacaoSiteServicosTIPage />} />
                              <Route path="/fonte-de-notebook" element={<LandingCarregadorNotebookPage />} />
                              <Route path="/carregador-de-notebook" element={<LandingCarregadorNotebookPage />} />
                              <Route path="/toner-para-impressora" element={<LandingTonerImpressoraPage />} />
                              <Route path="/licencas-microsoft" element={<LandingLicencasMicrosoftPage />} />
                              <Route path="/lp/placa-de-video-promocao" element={<LandingPlacaDeVideoPromocaoPage />} />
                              <Route path="/lp/promocao-pc-gamer" element={<LandingPromocaoPcGamerPage />} />
                              <Route path="/lp/conserto-android" element={<LandingConsertoAndroidPage />} />
                              <Route path="/lp/acessorios-gamer" element={<LandingAcessoriosGamerPage />} />
                              <Route path="/lp/visita-tecnica" element={<LandingVisitaTecnicaPage />} />
                              <Route path="/lp/:pageKey" element={<GenericLandingPage />} />
                              <Route path="/blog" element={<BlogPage />} />
                              <Route path="/blog/:slug" element={<BlogArticlePage />} />
                              <Route path="/obrigado" element={<ThankYouPage />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </BrowserRouter>
                      </MenuItemsProvider>
                    </TooltipProvider>
                  </CartProvider>
                </PageBlocksProvider>
              </BatchOperationsProvider>
            </LandingPageConfigProvider>
          </ProductProvider>
        </BannerProvider>
      </CategoryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
