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
import ManutencaoPage from "./pages/ManutencaoPage";
import LandingCarregadorNotebookPage from "./pages/LandingCarregadorNotebookPage";
import LandingTonerImpressoraPage from "./pages/LandingTonerImpressoraPage";
import LandingLicencasMicrosoftPage from "./pages/LandingLicencasMicrosoftPage";
import LandingConsertoApplePage from "./pages/LandingConsertoApplePage";
import LandingConsertoConsolePage from "./pages/LandingConsertoConsolePage";
import LandingNotebookSeminovoBaratoPage from "./pages/LandingNotebookSeminovoBaratoPage";
import LandingMontagemSetupGamerPage from "./pages/LandingMontagemSetupGamerPage";
import LandingConsertoNotebookPage from "./pages/LandingConsertoNotebookPage";
import LandingCriacaoSiteServicosTIPage from "./pages/LandingCriacaoSiteServicosTIPage";
import GenericLandingPage from "./pages/GenericLandingPage";
import LandingPlacaDeVideoPromocaoPage from "./pages/LandingPlacaDeVideoPromocaoPage";
import LandingPromocaoPcGamerPage from "./pages/LandingPromocaoPcGamerPage";
import LandingConsertoAndroidPage from "./pages/LandingConsertoAndroidPage";
import LandingAcessoriosGamerPage from "./pages/LandingAcessoriosGamerPage";
import LandingVisitaTecnicaPage from "./pages/LandingVisitaTecnicaPage";
import ThankYouPage from "./pages/ThankYouPage";
import ChatCentralPage from "./pages/ChatCentralPage";
import BlingCallbackPage from "./pages/BlingCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                          <Route path="/chat-central" element={<ChatCentralPage />} />
                          <Route path="/bling/callback" element={<BlingCallbackPage />} />
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
                          <Route path="/obrigado" element={<ThankYouPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
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
