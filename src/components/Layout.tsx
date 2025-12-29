import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import ChatBot from "./ChatBot";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- NOVO: Rolar para o topo sempre que mudar de página ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  // ---------------------------------------------------------

  // Global ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sidebarOpen) {
          setSidebarOpen(false);
          return;
        }
        if (location.pathname !== "/") {
          navigate(-1);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [navigate, location, sidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Mantendo a correção do topo cortado (pt-36 e pt-24) */}
      <div className="flex-1 flex pt-36 md:pt-24">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
