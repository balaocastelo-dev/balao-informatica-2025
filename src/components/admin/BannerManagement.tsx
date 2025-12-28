import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Upload,
  GripVertical,
  Link as LinkIcon,
  Monitor,
  Sidebar,
  LayoutGrid,
  ArrowDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Banner {
  id: string;
  image_url: string;
  image_mobile_url?: string | null;
  title: string | null;
  link: string | null;
  order_index: number;
  active: boolean;
  position: string;
}

const POSITION_LABELS: Record<string, string> = {
  hero: 'Banner Principal (Carrossel)',
  sidebar_left: 'Lateral Esquerda',
  sidebar_right: 'Lateral Direita',
  between_categories: 'Entre Categorias',
  footer_top: 'Acima do Rodapé',
};

const POSITION_ICONS: Record<string, any> = {
  hero: Monitor,
  sidebar_left: Sidebar,
  sidebar_right: Sidebar,
  between_categories: LayoutGrid,
  footer_top: ArrowDown,
};

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [activePosition, setActivePosition] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    image_url: '',
    image_mobile_url: '',
    title: '',
    link: '',
    position: 'hero',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position')
      .order('order_index');

    if (error) {
      toast({ title: 'Erro ao carregar banners', variant: 'destructive' });
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'image_mobile_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/*',
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl } as typeof prev));
      if (field === 'image_url' && desktopInputRef.current) desktopInputRef.current.value = '';
      if (field === 'image_mobile_url' && mobileInputRef.current) mobileInputRef.current.value = '';
      toast({ title: 'Imagem enviada!' });
    } catch (error) {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url && !formData.image_mobile_url) {
      toast({ title: 'Selecione uma imagem (PC ou Celular)', variant: 'destructive' });
      return;
    }

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            image_url: formData.image_url || null,
            image_mobile_url: formData.image_mobile_url || null,
            title: formData.title || null,
            link: formData.link || null,
            position: formData.position,
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast({ title: 'Banner atualizado!' });
      } else {
        const maxOrder = banners.filter(b => b.position === formData.position).length;
        
        const { error } = await supabase
          .from('banners')
          .insert({
            image_url: formData.image_url || null,
            image_mobile_url: formData.image_mobile_url || null,
            title: formData.title || null,
            link: formData.link || null,
            position: formData.position,
            order_index: maxOrder,
            active: true,
          });

        if (error) throw error;
        toast({ title: 'Banner criado!' });
      }

      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast({ title: 'Erro ao salvar banner', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ image_url: '', image_mobile_url: '', title: '', link: '', position: 'hero' });
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      image_mobile_url: banner.image_mobile_url || '',
      title: banner.title || '',
      link: banner.link || '',
      position: banner.position,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    const { error } = await supabase.from('banners').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Erro ao excluir banner', variant: 'destructive' });
    } else {
      toast({ title: 'Banner excluído!' });
      fetchBanners();
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ active: !banner.active })
      .eq('id', banner.id);

    if (error) {
      toast({ title: 'Erro ao atualizar banner', variant: 'destructive' });
    } else {
      fetchBanners();
    }
  };

  const filteredBanners = activePosition === 'all' 
    ? banners 
    : banners.filter(b => b.position === activePosition);

  const positionCounts = banners.reduce((acc, b) => {
    acc[b.position] = (acc[b.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Banners</h2>
          <p className="text-muted-foreground">{banners.length} banner(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Banner
        </Button>
      </div>

      {/* Position Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Object.entries(POSITION_LABELS).map(([key, label]) => {
          const Icon = POSITION_ICONS[key];
          const count = positionCounts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => setActivePosition(activePosition === key ? 'all' : key)}
              className={`p-4 rounded-xl border transition-all ${
                activePosition === key 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-2" />
              <p className="text-xs font-medium truncate">{label}</p>
              <p className="text-lg font-bold">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Banner Grid */}
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {activePosition === 'all' 
              ? 'Nenhum banner cadastrado' 
              : `Nenhum banner na posição "${POSITION_LABELS[activePosition]}"`}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            Adicionar primeiro banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-card rounded-xl border overflow-hidden transition-all ${
                banner.active ? 'border-border' : 'border-destructive/50 opacity-60'
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-muted">
                <img
                  src={banner.image_url || banner.image_mobile_url || ''}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    banner.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-black/70 text-white">
                    {POSITION_LABELS[banner.position] || banner.position}
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4 space-y-3">
                {banner.title && (
                  <p className="font-medium text-foreground truncate">{banner.title}</p>
                )}
                {banner.link && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <LinkIcon className="w-3 h-3" />
                    {banner.link}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(banner)}
                    className="flex-1"
                  >
                    {banner.active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {banner.active ? 'Ocultar' : 'Mostrar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Editar Banner' : 'Novo Banner'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Position */}
            <div className="space-y-2">
              <Label>Posição do Banner *</Label>
              <Select 
                value={formData.position} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, position: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POSITION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Imagens *</Label>
              <Tabs defaultValue="desktop">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="desktop" className="gap-2">
                    <Monitor className="w-4 h-4" />
                    PC
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="gap-2">
                    <Sidebar className="w-4 h-4" />
                    Celular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="desktop" className="space-y-3 mt-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {formData.image_url ? (
                      <div className="space-y-2">
                        <img
                          src={formData.image_url}
                          alt="Preview PC"
                          className="max-h-40 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => desktopInputRef.current?.click()}
                          disabled={uploading}
                          className="mx-auto"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Enviando...' : 'Enviar imagem (PC)'}
                        </Button>
                        <input
                          ref={desktopInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'image_url')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Ou cole a URL da imagem (PC):</p>
                  <Input
                    placeholder="https://exemplo.com/banner-pc.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                </TabsContent>

                <TabsContent value="mobile" className="space-y-3 mt-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {formData.image_mobile_url ? (
                      <div className="space-y-2">
                        <img
                          src={formData.image_mobile_url}
                          alt="Preview Celular"
                          className="max-h-40 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, image_mobile_url: '' }))}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => mobileInputRef.current?.click()}
                          disabled={uploading}
                          className="mx-auto"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Enviando...' : 'Enviar imagem (Celular)'}
                        </Button>
                        <input
                          ref={mobileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'image_mobile_url')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Ou cole a URL da imagem (Celular):</p>
                  <Input
                    placeholder="https://exemplo.com/banner-mobile.jpg"
                    value={formData.image_mobile_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_mobile_url: e.target.value }))}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                placeholder="Promoção de Verão"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label>Link (opcional)</Label>
              <Input
                placeholder="/categoria/notebooks"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={uploading || (!formData.image_url && !formData.image_mobile_url)}>
                {editingBanner ? 'Salvar' : 'Criar Banner'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
