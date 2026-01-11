import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User, LogOut, Package, UserCircle, MessageCircle, Monitor, Mic } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceAgent } from '@/contexts/VoiceAgentContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { openAgent } = useVoiceAgent();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-md' 
          : 'bg-background border-b border-border'
      }`}
    >
      <div className="container-balao">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Menu Button - Always visible on left */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png"
              alt="Balão da Informática"
              className="h-10 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* WhatsApp Button */}
          <Button
            className="flex bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 font-bold shadow-md hover:scale-105 transition-all duration-300 rounded-full px-2 lg:px-4"
            onClick={() => window.open('https://wa.me/5519987510267', '_blank')}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden xl:inline">WhatsApp</span>
          </Button>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="flex-1 max-w-xl hidden sm:block"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="search-input pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Voice Agent Button - Desktop */}
          <Button
            onClick={openAgent}
            className="hidden sm:flex bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white gap-2 font-bold shadow-md hover:scale-105 transition-all duration-300 rounded-full px-2 lg:px-4"
          >
            <Mic className="w-5 h-5" />
            <span className="hidden xl:inline">IA de Vendas</span>
          </Button>

          {/* Monte seu PC Button */}
          <Link to="/montar-pc" className="flex">
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2 font-bold shadow-md hover:scale-105 transition-all duration-300 rounded-full px-2 lg:px-4"
            >
              <Monitor className="w-5 h-5" />
              <span className="hidden xl:inline">Monte seu PC</span>
            </Button>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium truncate">
                    {profile?.full_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pedidos')}>
                    <Package className="w-4 h-4 mr-2" />
                    Meus Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}

            {/* Cart Button */}
            <Link
              to="/carrinho"
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="sm:hidden pb-3 flex gap-2">
          <form 
            onSubmit={handleSearch}
            className="flex-1"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="search-input pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          <Button size="icon" onClick={openAgent} className="bg-red-600 hover:bg-red-700 rounded-lg shrink-0 h-10 w-10">
             <Mic className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
