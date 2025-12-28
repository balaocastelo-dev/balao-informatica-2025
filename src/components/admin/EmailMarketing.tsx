import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/contexts/ProductContext';
import { 
  Mail, 
  Send, 
  Plus, 
  Trash2, 
  Edit,
  Check,
  X,
  Search,
  Upload,
  Sparkles,
  Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EmailBuilder } from './EmailBuilder';

interface Campaign {
  id: string;
  subject: string;
  content: string;
  product_ids: string[];
  recipient_emails: string[];
  status: string;
  sent_at: string | null;
  created_at: string;
}

// Email templates for promotional campaigns
const EMAIL_TEMPLATES = [
  { id: 'fechamento-mes', name: '🏷️ Fechamento de Mês', subject: 'ÚLTIMA CHANCE! Ofertas de Fechamento de Mês', content: 'Aproveite os últimos dias do mês com descontos exclusivos! Não perca essa oportunidade de economizar.' },
  { id: 'inicio-mes', name: '🌟 Início de Mês', subject: 'Comece o Mês Economizando!', content: 'Novo mês, novas ofertas! Confira as promoções especiais para começar bem.' },
  { id: 'natal', name: '🎄 Natal', subject: '🎄 Feliz Natal! Presentes com até 40% OFF', content: 'Neste Natal, presenteie quem você ama com tecnologia de qualidade. Ofertas imperdíveis!' },
  { id: 'ano-novo', name: '🎆 Ano Novo', subject: '🎆 Promoção de Ano Novo - Comece 2025 com Tecnologia!', content: 'Ano novo, setup novo! Confira as ofertas especiais para renovar seus equipamentos.' },
  { id: 'black-friday', name: '🖤 Black Friday', subject: '🖤 BLACK FRIDAY - Até 70% OFF!', content: 'A maior promoção do ano chegou! Descontos imperdíveis em toda a loja.' },
  { id: 'cyber-monday', name: '💻 Cyber Monday', subject: '💻 CYBER MONDAY - Ofertas Relâmpago!', content: 'Continuamos com preços de Black Friday! Aproveite as últimas chances.' },
  { id: 'promo-sexta', name: '🔥 Promo Sexta', subject: '🔥 SEXTA MALUCA - Descontos Exclusivos!', content: 'É sexta-feira e os preços estão em queda livre! Confira as ofertas do dia.' },
  { id: 'promo-segunda', name: '💪 Promo Segunda', subject: '💪 Segunda de Ofertas - Comece a Semana Economizando!', content: 'Segunda-feira com promoções especiais para você começar bem a semana.' },
  { id: 'dia-cliente', name: '👤 Dia do Cliente', subject: '👤 Dia do Cliente - Você Merece!', content: 'Hoje é seu dia! Descontos exclusivos para nossos clientes especiais.' },
  { id: 'dia-consumidor', name: '🛒 Dia do Consumidor', subject: '🛒 Semana do Consumidor - Ofertas Imperdíveis!', content: 'Celebre o Dia do Consumidor com as melhores ofertas em tecnologia.' },
  { id: 'pascoa', name: '🐰 Páscoa', subject: '🐰 Páscoa Tecnológica - Caça às Ofertas!', content: 'Nesta Páscoa, encontre os melhores preços em hardware e periféricos.' },
  { id: 'dia-maes', name: '💐 Dia das Mães', subject: '💐 Dia das Mães - Presenteie com Tecnologia!', content: 'Surpreenda sua mãe com o presente perfeito. Ofertas especiais!' },
  { id: 'dia-pais', name: '👔 Dia dos Pais', subject: '👔 Dia dos Pais - O Presente Ideal!', content: 'Para o pai que ama tecnologia, temos as melhores ofertas!' },
  { id: 'dia-namorados', name: '💕 Dia dos Namorados', subject: '💕 Dia dos Namorados - Amor e Tecnologia!', content: 'Presenteie quem você ama com os melhores produtos.' },
  { id: 'volta-aulas', name: '📚 Volta às Aulas', subject: '📚 Volta às Aulas - Prepare-se para Estudar!', content: 'Notebooks, periféricos e mais para seu sucesso acadêmico.' },
  { id: 'carnaval', name: '🎭 Carnaval', subject: '🎭 Carnaval de Ofertas!', content: 'A folia é de descontos! Aproveite as promoções de Carnaval.' },
  { id: 'halloween', name: '🎃 Halloween', subject: '🎃 Halloween de Preços Assustadores!', content: 'Preços de arrepiar! Ofertas assustadoramente boas.' },
  { id: 'aniversario-loja', name: '🎂 Aniversário da Loja', subject: '🎂 Aniversário Balão - Quem Ganha Presente é Você!', content: 'Celebre conosco com descontos exclusivos de aniversário!' },
  { id: 'queima-estoque', name: '📦 Queima de Estoque', subject: '📦 QUEIMA DE ESTOQUE - Últimas Unidades!', content: 'Estamos renovando nosso estoque! Aproveite preços únicos.' },
  { id: 'lancamento', name: '🚀 Lançamento', subject: '🚀 LANÇAMENTO - Novidades Chegaram!', content: 'Conheça os produtos mais recentes do mercado. Seja o primeiro!' },
  { id: 'gamer-week', name: '🎮 Semana Gamer', subject: '🎮 Semana Gamer - Level Up nos Descontos!', content: 'Hardware gamer com preços especiais. Suba de nível!' },
  { id: 'tech-week', name: '💎 Tech Week', subject: '💎 Tech Week - A Semana da Tecnologia!', content: 'Uma semana inteira de ofertas em tecnologia. Não perca!' },
  { id: 'frete-gratis', name: '🚚 Frete Grátis', subject: '🚚 FRETE GRÁTIS em Todo o Site!', content: 'Por tempo limitado, entregamos sem custo adicional!' },
  { id: 'flash-sale', name: '⚡ Flash Sale', subject: '⚡ FLASH SALE - Corra que Acaba!', content: 'Ofertas relâmpago por tempo limitadíssimo. Não pisque!' },
];

export function EmailMarketing() {
  const { products } = useProducts();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [recipientEmailsText, setRecipientEmailsText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Parse and validate emails from text
  const parseEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches.map(email => email.toLowerCase().trim()))];
  };

  const parsedEmails = parseEmails(recipientEmailsText);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload for email extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({ title: 'Processando arquivo...', description: file.name });

    try {
      const text = await file.text();
      const extractedEmails = parseEmails(text);
      
      if (extractedEmails.length > 0) {
        const currentEmails = parseEmails(recipientEmailsText);
        const newEmails = [...new Set([...currentEmails, ...extractedEmails])];
        setRecipientEmailsText(newEmails.join('\n'));
        
        toast({ 
          title: 'Emails extraídos com sucesso!',
          description: `${extractedEmails.length} email(s) encontrado(s) no arquivo.`
        });
      } else {
        toast({ 
          title: 'Nenhum email encontrado',
          description: 'O arquivo não contém emails válidos.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({ 
        title: 'Erro ao ler arquivo',
        description: 'Não foi possível processar o arquivo.',
        variant: 'destructive'
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData({
        subject: template.subject,
        content: template.content,
      });
      setSelectedTemplate(templateId);
      toast({ title: 'Template aplicado!', description: template.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast({ title: 'Selecione pelo menos um produto', variant: 'destructive' });
      return;
    }

    if (parsedEmails.length === 0) {
      toast({ title: 'Adicione pelo menos um email de destinatário', variant: 'destructive' });
      return;
    }

    try {
      if (editingCampaign) {
        const { error } = await supabase
          .from('email_campaigns')
          .update({
            subject: formData.subject,
            content: formData.content,
            product_ids: selectedProducts,
            recipient_emails: parsedEmails,
          })
          .eq('id', editingCampaign.id);

        if (error) throw error;
        toast({ title: 'Campanha atualizada!' });
      } else {
        const { error } = await supabase
          .from('email_campaigns')
          .insert({
            subject: formData.subject,
            content: formData.content,
            product_ids: selectedProducts,
            recipient_emails: parsedEmails,
            status: 'draft',
          });

        if (error) throw error;
        toast({ title: 'Campanha criada!' });
      }

      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({ title: 'Erro ao salvar campanha', variant: 'destructive' });
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      subject: campaign.subject,
      content: campaign.content,
    });
    setSelectedProducts(campaign.product_ids || []);
    setRecipientEmailsText((campaign.recipient_emails || []).join('\n'));
    setSelectedTemplate('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta campanha?')) return;

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (!error) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast({ title: 'Campanha excluída!' });
    }
  };

  const handleSend = async (campaign: Campaign) => {
    if (!campaign.recipient_emails || campaign.recipient_emails.length === 0) {
      toast({ 
        title: 'Nenhum destinatário',
        description: 'Adicione emails antes de enviar.',
        variant: 'destructive'
      });
      return;
    }

    const campaignProducts = products.filter(p => campaign.product_ids?.includes(p.id));
    
    if (campaignProducts.length === 0) {
      toast({ 
        title: 'Nenhum produto',
        description: 'Adicione produtos antes de enviar.',
        variant: 'destructive'
      });
      return;
    }

    toast({ title: 'Enviando campanha...', description: `Para ${campaign.recipient_emails.length} destinatário(s)` });

    try {
      const response = await supabase.functions.invoke('send-campaign', {
        body: {
          subject: campaign.subject,
          content: campaign.content,
          recipient_emails: campaign.recipient_emails,
          products: campaignProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      
      if (data.success) {
        await supabase
          .from('email_campaigns')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', campaign.id);

        toast({ 
          title: 'Campanha enviada!',
          description: `${data.sent} email(s) enviado(s)${data.failed > 0 ? `, ${data.failed} falha(s)` : ''}`
        });
        
        fetchCampaigns();
      } else {
        throw new Error(data.error || 'Erro ao enviar');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error sending campaign:', error);
      toast({ 
        title: 'Erro ao enviar campanha',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({ subject: '', content: '' });
    setSelectedProducts([]);
    setRecipientEmailsText('');
    setSelectedTemplate('');
    setEditingCampaign(null);
    setShowModal(false);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(current =>
      current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Email Marketing
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Palette className="w-4 h-4" />
            Editor Visual
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma campanha criada</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4"
          >
            Criar Primeira Campanha
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="admin-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{campaign.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {campaign.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-muted-foreground">
                      {campaign.product_ids?.length || 0} produto(s)
                    </span>
                    <span className="text-muted-foreground">
                      {campaign.recipient_emails?.length || 0} destinatário(s)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      campaign.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status === 'sent' ? 'Enviada' : 'Rascunho'}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(campaign.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleSend(campaign)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content max-w-5xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="text-xl font-bold text-foreground">
                {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Templates Promocionais
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-secondary/30">
                  {EMAIL_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template.id)}
                      className={`text-left p-2 rounded-lg text-sm transition-all ${
                        selectedTemplate === template.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-muted border border-border'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Assunto do Email
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Ofertas imperdíveis em placas de vídeo!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Conteúdo do Email
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Escreva o conteúdo do email..."
                  required
                />
              </div>

              {/* Recipient Emails with File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Emails dos Destinatários
                  {parsedEmails.length > 0 && (
                    <span className="ml-2 text-primary font-normal">
                      ({parsedEmails.length} email(s) válido(s))
                    </span>
                  )}
                </label>
                
                {/* File Upload Button */}
                <div className="flex gap-2 mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv,.xlsx,.xls,.json,.xml,.html,.md,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted rounded-lg transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Importar Arquivo
                  </button>
                  <span className="text-xs text-muted-foreground self-center">
                    Suporta: TXT, CSV, Excel, JSON, XML, HTML, PDF, DOC
                  </span>
                </div>

                <textarea
                  value={recipientEmailsText}
                  onChange={e => setRecipientEmailsText(e.target.value)}
                  className="input-field min-h-[100px] font-mono text-sm"
                  placeholder="Cole aqui os emails (separados por vírgula, espaço ou um por linha) ou importe um arquivo..."
                  required
                />
                
                {parsedEmails.length > 0 && (
                  <div className="mt-2 p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Emails detectados:</p>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {parsedEmails.slice(0, 20).map((email, idx) => (
                        <span key={`email-${idx}-${email}`} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {email}
                        </span>
                      ))}
                      {parsedEmails.length > 20 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{parsedEmails.length - 20} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecione os Produtos ({selectedProducts.length} selecionados)
                </label>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar produto..."
                    className="input-field pl-10"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="max-h-[250px] overflow-y-auto border border-border rounded-lg p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredProducts.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground py-4">
                      Nenhum produto encontrado
                    </p>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedProducts.includes(product.id)
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-secondary hover:bg-muted'
                        }`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain bg-white rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-primary font-semibold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        {selectedProducts.includes(product.id) && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Preview */}
              {selectedProducts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preview dos Produtos Selecionados
                  </label>
                  <div className="bg-secondary rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {products.filter(p => selectedProducts.includes(p.id)).slice(0, 8).map(product => (
                      <div key={product.id} className="bg-background rounded-lg p-2 text-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-20 object-contain mb-2"
                        />
                        <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                        <p className="text-sm text-primary font-bold mt-1">{formatPrice(product.price)}</p>
                      </div>
                    ))}
                    {selectedProducts.length > 8 && (
                      <div className="bg-background rounded-lg p-4 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">
                          +{selectedProducts.length - 8} produtos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-secondary hover:bg-muted rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingCampaign ? 'Salvar' : 'Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Email Builder */}
      {showBuilder && (
        <EmailBuilder
          products={products}
          selectedProducts={selectedProducts}
          initialSubject={formData.subject}
          onSave={(blocks, subject) => {
            // Convert blocks to content string for storage
            const content = blocks.map(b => {
              if (b.type === 'header') return `# ${b.content.title}\n${b.content.subtitle || ''}`;
              if (b.type === 'text') return b.content.text;
              if (b.type === 'button') return `[${b.content.text}](${b.content.url})`;
              if (b.type === 'products') return '[PRODUTOS SELECIONADOS]';
              return '';
            }).filter(Boolean).join('\n\n');
            
            setFormData({ subject, content });
            setShowBuilder(false);
            setShowModal(true);
            toast({ title: 'Template aplicado!', description: 'Continue editando a campanha.' });
          }}
          onCancel={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
