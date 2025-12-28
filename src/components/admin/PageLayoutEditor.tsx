import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  GripVertical,
  Image,
  LayoutGrid,
  Minus,
  ExternalLink,
  RefreshCw,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageBlocks, PageBlock } from '@/contexts/PageBlocksContext';
import { useCategories } from '@/contexts/CategoryContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  position: string;
  active: boolean;
  order_index: number;
}

interface DisplayBlock {
  id: string;
  type: 'page_block' | 'between_banner';
  block_type: string;
  title: string | null;
  category_slug: string | null;
  active: boolean;
  order_index: number;
  banner?: Banner;
}

const blockTypeLabels: Record<string, string> = {
  banner: 'Banner Carrossel',
  banner_single: 'Banner Único',
  category: 'Categoria',
  separator: 'Separador',
  between_banner: 'Banner Entre Categorias',
  brands: 'Marcas Recomendadas'
};

const blockTypeIcons: Record<string, React.ReactNode> = {
  banner: <Image className="w-4 h-4" />,
  banner_single: <Image className="w-4 h-4 text-green-500" />,
  category: <LayoutGrid className="w-4 h-4" />,
  separator: <Minus className="w-4 h-4" />,
  between_banner: <Image className="w-4 h-4 text-orange-500" />,
  brands: <ThumbsUp className="w-4 h-4 text-blue-500" />
};

const positionLabels: Record<string, string> = {
  hero: 'Carrossel Principal',
  between_categories: 'Entre Categorias',
  footer_top: 'Acima do Rodapé'
};

export function PageLayoutEditor() {
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = usePageBlocks();
  const { categories } = useCategories();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  
  // Drag and drop state
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  // Fetch banners from database
  useEffect(() => {
    fetchBanners();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('banners-layout-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners'
        },
        () => {
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const getBannersByPosition = (position: string) => {
    return banners.filter(b => b.position === position);
  };

  // Build display blocks: merge page_blocks with between_categories banners
  const displayBlocks = useMemo(() => {
    const result: DisplayBlock[] = [];
    const betweenBanners = getBannersByPosition('between_categories').filter(b => b.active);
    let categoryCount = 0;
    let bannerIndex = 0;

    // Sort page blocks by order_index
    const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);

    sortedBlocks.forEach((block) => {
      // Add the block
      result.push({
        id: block.id,
        type: 'page_block',
        block_type: block.block_type,
        title: block.title,
        category_slug: block.category_slug,
        active: block.active,
        order_index: block.order_index
      });

      // After every 2 active category blocks, insert a between_banner
      if (block.block_type === 'category' && block.active) {
        categoryCount++;
        if (categoryCount % 2 === 0 && bannerIndex < betweenBanners.length) {
          const banner = betweenBanners[bannerIndex];
          result.push({
            id: `between_banner_${banner.id}`,
            type: 'between_banner',
            block_type: 'between_banner',
            title: banner.title || `Banner ${bannerIndex + 1}`,
            category_slug: null,
            active: banner.active,
            order_index: block.order_index + 0.5,
            banner
          });
          bannerIndex++;
        }
      }
    });

    // Add remaining between banners at the end (not yet placed)
    while (bannerIndex < betweenBanners.length) {
      const banner = betweenBanners[bannerIndex];
      result.push({
        id: `between_banner_${banner.id}`,
        type: 'between_banner',
        block_type: 'between_banner',
        title: banner.title || `Banner ${bannerIndex + 1}`,
        category_slug: null,
        active: banner.active,
        order_index: 9999 + bannerIndex,
        banner
      });
      bannerIndex++;
    }

    return result;
  }, [blocks, banners]);

  const activeDisplayBlocks = displayBlocks.filter(b => b.active);
  const inactiveDisplayBlocks = displayBlocks.filter(b => !b.active && b.type === 'page_block');

  const handleMoveUp = (displayBlock: DisplayBlock, index: number) => {
    if (displayBlock.type === 'between_banner') {
      toast({ title: 'Banners entre categorias são posicionados automaticamente a cada 2 categorias', variant: 'default' });
      return;
    }
    
    const blockIndex = blocks.findIndex(b => b.id === displayBlock.id);
    if (blockIndex <= 0) return;
    
    const newBlocks = [...blocks];
    [newBlocks[blockIndex - 1], newBlocks[blockIndex]] = [newBlocks[blockIndex], newBlocks[blockIndex - 1]];
    reorderBlocks(newBlocks);
  };

  const handleMoveDown = (displayBlock: DisplayBlock, index: number) => {
    if (displayBlock.type === 'between_banner') {
      toast({ title: 'Banners entre categorias são posicionados automaticamente a cada 2 categorias', variant: 'default' });
      return;
    }
    
    const blockIndex = blocks.findIndex(b => b.id === displayBlock.id);
    if (blockIndex >= blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
    reorderBlocks(newBlocks);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, displayBlock: DisplayBlock) => {
    if (displayBlock.type === 'between_banner') {
      e.preventDefault();
      return;
    }
    setDraggedBlockId(displayBlock.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, displayBlock: DisplayBlock) => {
    e.preventDefault();
    if (displayBlock.type === 'between_banner' || displayBlock.id === draggedBlockId) return;
    setDragOverBlockId(displayBlock.id);
  };

  const handleDragLeave = () => {
    setDragOverBlockId(null);
  };

  const handleDrop = (e: React.DragEvent, targetBlock: DisplayBlock) => {
    e.preventDefault();
    if (!draggedBlockId || targetBlock.type === 'between_banner' || draggedBlockId === targetBlock.id) {
      setDraggedBlockId(null);
      setDragOverBlockId(null);
      return;
    }

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex(b => b.id === targetBlock.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(targetIndex, 0, removed);
      reorderBlocks(newBlocks);
    }

    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  const handleAddBanner = () => {
    addBlock('banner', 'Banner', null);
    setShowAddMenu(false);
  };

  const handleAddSeparator = () => {
    addBlock('separator', 'Separador', null);
    setShowAddMenu(false);
  };

  const handleAddBrands = () => {
    addBlock('brands', 'Marcas Recomendadas', null);
    setShowAddMenu(false);
  };

  const handleAddBannerSingle = () => {
    addBlock('banner_single', 'Banner Único', null);
    setShowAddMenu(false);
  };

  const handleAddCategory = () => {
    if (!selectedCategory) return;
    const cat = categories.find(c => c.slug === selectedCategory);
    if (cat) {
      addBlock('category', cat.name, cat.slug);
    }
    setSelectedCategory('');
    setShowAddMenu(false);
  };

  const toggleActive = async (displayBlock: DisplayBlock) => {
    if (displayBlock.type === 'between_banner' && displayBlock.banner) {
      // Toggle banner active status
      const { error } = await supabase
        .from('banners')
        .update({ active: !displayBlock.active })
        .eq('id', displayBlock.banner.id);
      
      if (error) {
        toast({ title: 'Erro ao atualizar banner', variant: 'destructive' });
      } else {
        fetchBanners();
      }
      return;
    }
    
    const block = blocks.find(b => b.id === displayBlock.id);
    if (block) {
      updateBlock(block.id, { active: !block.active });
    }
  };

  const handleDelete = async (displayBlock: DisplayBlock) => {
    if (displayBlock.type === 'between_banner' && displayBlock.banner) {
      if (!confirm('Excluir este banner?')) return;
      
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', displayBlock.banner.id);
      
      if (error) {
        toast({ title: 'Erro ao excluir banner', variant: 'destructive' });
      } else {
        toast({ title: 'Banner excluído!' });
        fetchBanners();
      }
      return;
    }
    
    deleteBlock(displayBlock.id);
  };

  // Get parent categories and their subcategories for grouped display
  const parentCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  // Count banners by position
  const heroBanners = getBannersByPosition('hero');
  const betweenBanners = getBannersByPosition('between_categories');
  const footerBanners = getBannersByPosition('footer_top');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Layout da Página Inicial</h3>
        <div className="relative">
          <Button onClick={() => setShowAddMenu(!showAddMenu)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
          
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-xl z-50 p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tipo de Bloco</p>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAddBanner}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Banner Carrossel
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAddBannerSingle}
                >
                  <Image className="w-4 h-4 mr-2 text-green-500" />
                  Banner Único
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAddSeparator}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Separador
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAddBrands}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Marcas Recomendadas
                </Button>
                
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">Categoria de Produtos</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {parentCategories.map(cat => {
                      const subs = getSubcategories(cat.id);
                      if (subs.length > 0) {
                        return (
                          <optgroup key={cat.id} label={cat.name}>
                            <option value={cat.slug}>{cat.name} (Todos)</option>
                            {subs.map(sub => (
                              <option key={sub.id} value={sub.slug}>↳ {sub.name}</option>
                            ))}
                          </optgroup>
                        );
                      }
                      return (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      );
                    })}
                  </select>
                  {selectedCategory && (
                    <Button 
                      className="w-full"
                      onClick={handleAddCategory}
                    >
                      Adicionar Categoria
                    </Button>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Para adicionar banners entre categorias, vá na aba "Banners" e crie um banner com posição "Entre Categorias".
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => setShowAddMenu(false)}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-secondary/30 rounded-lg border border-border text-center">
          <p className="text-2xl font-bold text-primary">{heroBanners.filter(b => b.active).length}</p>
          <p className="text-xs text-muted-foreground">Carrossel</p>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 text-center">
          <p className="text-2xl font-bold text-orange-500">{betweenBanners.filter(b => b.active).length}</p>
          <p className="text-xs text-muted-foreground">Entre Categorias</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg border border-border text-center">
          <p className="text-2xl font-bold text-primary">{footerBanners.filter(b => b.active).length}</p>
          <p className="text-xs text-muted-foreground">Rodapé</p>
        </div>
      </div>

      {/* Active Blocks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Blocos Ativos (arraste para reordenar)
          </p>
          <Button variant="ghost" size="sm" onClick={fetchBanners} className="h-7">
            <RefreshCw className="w-3 h-3 mr-1" />
            Atualizar
          </Button>
        </div>
        
        {activeDisplayBlocks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-lg">
            Nenhum bloco ativo. Adicione blocos para montar a página.
          </p>
        ) : (
          <div className="space-y-2">
            {activeDisplayBlocks.map((displayBlock, index) => {
              const isBetweenBanner = displayBlock.type === 'between_banner';
              const isDragging = draggedBlockId === displayBlock.id;
              const isDragOver = dragOverBlockId === displayBlock.id;
              
              return (
                <div
                  key={displayBlock.id}
                  draggable={!isBetweenBanner}
                  onDragStart={(e) => handleDragStart(e, displayBlock)}
                  onDragOver={(e) => handleDragOver(e, displayBlock)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, displayBlock)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isBetweenBanner 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : isDragOver
                        ? 'bg-primary/20 border-primary border-2 scale-[1.02]'
                        : isDragging
                          ? 'opacity-50 bg-secondary/30 border-dashed'
                          : 'bg-secondary/50 border-border hover:border-primary/50'
                  } ${!isBetweenBanner ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  <GripVertical className={`w-4 h-4 ${isBetweenBanner ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {blockTypeIcons[displayBlock.block_type]}
                    <span className="font-medium text-sm truncate">
                      {displayBlock.title || blockTypeLabels[displayBlock.block_type]}
                    </span>
                    {displayBlock.category_slug && (
                      <span className="text-xs text-muted-foreground">({displayBlock.category_slug})</span>
                    )}
                    {isBetweenBanner && (
                      <span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded">
                        Auto
                      </span>
                    )}
                  </div>

                  {/* Banner preview thumbnail */}
                  {isBetweenBanner && displayBlock.banner && (
                    <img 
                      src={displayBlock.banner.image_url} 
                      alt="" 
                      className="h-8 w-auto rounded border border-border object-cover"
                    />
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveUp(displayBlock, index)}
                      disabled={isBetweenBanner || index === 0}
                      title={isBetweenBanner ? 'Posicionado automaticamente' : 'Mover para cima'}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveDown(displayBlock, index)}
                      disabled={isBetweenBanner || index === activeDisplayBlocks.length - 1}
                      title={isBetweenBanner ? 'Posicionado automaticamente' : 'Mover para baixo'}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(displayBlock)}
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(displayBlock)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info about between banners */}
      {betweenBanners.length > 0 && (
        <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
          <p className="text-xs text-orange-600 dark:text-orange-400">
            <strong>Banners Entre Categorias:</strong> São exibidos automaticamente após cada 2 categorias na ordem em que foram criados. 
            Para adicionar mais, vá na aba "Banners" e crie com posição "Entre Categorias".
          </p>
        </div>
      )}

      {/* Inactive Blocks */}
      {inactiveDisplayBlocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Blocos Inativos</p>
          <div className="space-y-2 opacity-60">
            {inactiveDisplayBlocks.map((displayBlock) => (
              <div
                key={displayBlock.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                
                <div className="flex items-center gap-2 flex-1">
                  {blockTypeIcons[displayBlock.block_type]}
                  <span className="font-medium text-sm">{displayBlock.title || blockTypeLabels[displayBlock.block_type]}</span>
                  {displayBlock.category_slug && (
                    <span className="text-xs text-muted-foreground">({displayBlock.category_slug})</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleActive(displayBlock)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(displayBlock)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Como funciona:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Arrastar e Soltar:</strong> Arraste os blocos pelo ícone ≡ para reordenar</li>
          <li><strong>Banner Carrossel:</strong> Carrossel de banners com rotação automática</li>
          <li><strong>Banner Único:</strong> Banner estático único (sem rotação)</li>
          <li><strong>Marcas Recomendadas:</strong> Seção com as marcas em destaque</li>
          <li><strong>Categorias:</strong> Seções de produtos por categoria</li>
          <li><strong>Banners Entre Categorias:</strong> Exibidos automaticamente a cada 2 categorias (não podem ser movidos)</li>
          <li><strong>Separador:</strong> Linha divisória entre seções</li>
        </ul>
      </div>
    </div>
  );
}
