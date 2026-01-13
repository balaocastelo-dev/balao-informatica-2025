import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCategories, CategoryData } from '@/contexts/CategoryContext';
import { ChevronRight, Home, Cpu, X, Info, Handshake, Wrench, BatteryCharging, Printer, BadgeCheck, Gamepad2, Globe, Laptop, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMenuItems } from '@/contexts/MenuItemsContext';
import { getCategoryEmoji } from '@/utils/categoryEmojis';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { categories } = useCategories();
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Separate parent categories and subcategories
  const parentCategories = [...categories.filter(c => !c.parent_id)].sort((a, b) => a.order_index - b.order_index);
  const getSubcategories = (parentId: string): CategoryData[] => 
    [...categories.filter(c => c.parent_id === parentId)].sort((a, b) => a.order_index - b.order_index);

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (slug: string) => location.pathname === `/categoria/${slug}`;
  const { items, loading } = useMenuItems();
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "inicio": Home,
    "assistencia-tecnica": Wrench,
    "conserto-apple": Smartphone,
    "conserto-console": Gamepad2,
    "fonte-de-notebook": BatteryCharging,
    "conserto-notebook": Laptop,
    "notebook-seminovo": Laptop,
    "montagem-setup-gamer": Cpu,
    "monte-seu-pc": Cpu,
    "toner-para-impressora": Printer,
    "licencas-microsoft": BadgeCheck,
    "criacao-site-ti": Globe,
    "sobre": Info,
    "consignacao": Handshake,
    "lp-placa-de-video-promocao": Cpu,
    "lp-promocao-pc-gamer": Gamepad2,
    "lp-conserto-android": Smartphone,
    "lp-acessorios-gamer": Globe,
    "lp-visita-tecnica": Wrench,
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky left-0 top-16 lg:top-20 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-background border-r border-border z-50 lg:z-10 transition-transform duration-300 overflow-y-auto",
        "w-64 lg:w-56 xl:w-64",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 pt-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Categorias
            </h3>
            <nav className="space-y-1">
              {parentCategories.map(category => {
                const subcategories = getSubcategories(category.id);
                const hasSubmenu = subcategories.length > 0;
                const isExpanded = expandedCategory === category.id;
                const active = isCategoryActive(category.slug);

                return (
                  <div key={category.id}>
                    <div className="flex items-center">
                      <Link
                        to={`/categoria/${category.slug}`}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors flex-1",
                          active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        )}
                      >
                        <span className="text-base">{getCategoryEmoji(category.name, category.slug, category.emoji)}</span>
                        <span className="flex-1 truncate">{category.name}</span>
                      </Link>
                      {hasSubmenu && (
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className={cn(
                            "p-2 hover:bg-secondary rounded-lg transition-colors",
                            active && "text-primary-foreground hover:bg-primary/80"
                          )}
                        >
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                        {subcategories.map(sub => (
                          <Link
                            key={sub.id}
                            to={`/categoria/${sub.slug}`}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                              isCategoryActive(sub.slug) ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground"
                            )}
                          >
                            <span className="text-sm">{getCategoryEmoji(sub.name, sub.slug, sub.emoji)}</span>
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Navegação
            </h3>
            <nav className="space-y-1">
              {(loading ? [] : items.filter(i => i.active).sort((a, b) => a.order_index - b.order_index)).map((item) => {
                const Icon = iconMap[item.slug] || Home;
                return (
                  <Link
                    key={item.slug}
                    to={item.route}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(item.route) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Removido espaço para banner lateral */}
        </div>
      </aside>
    </>
  );
}
