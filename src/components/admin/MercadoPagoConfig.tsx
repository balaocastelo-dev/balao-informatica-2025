import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  QrCode, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff,
  ExternalLink,
  Info,
  Loader2,
  Shield,
  Wallet
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MercadoPagoSettings {
  publicKey: string;
  accessToken: string;
  pixEnabled: boolean;
  cardEnabled: boolean;
  testMode: boolean;
}

interface PaymentProviderSettings {
  provider: 'mercadopago' | 'digitalmanager' | 'cora';
  dmgApiUrl: string;
  dmgApiKey: string;
}

export function MercadoPagoConfig() {
  const [settings, setSettings] = useState<MercadoPagoSettings>({
    publicKey: '',
    accessToken: '',
    pixEnabled: true,
    cardEnabled: true,
    testMode: true,
  });
  const [providerSettings, setProviderSettings] = useState<PaymentProviderSettings>({
    provider: 'mercadopago',
    dmgApiUrl: 'https://digitalmanager.guru',
    dmgApiKey: '',
  });
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem('mercadopago_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (providerSettings.provider === 'mercadopago') {
          setIsConnected(!!parsed.accessToken && !!parsed.publicKey);
        }
      }
      const prov = localStorage.getItem('payment_provider_settings');
      if (prov) {
        const parsedProv = JSON.parse(prov);
        setProviderSettings(parsedProv);
        if (parsedProv.provider === 'digitalmanager') {
          setIsConnected(!!parsedProv.dmgApiKey);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (providerSettings.provider === 'mercadopago') {
      if (!settings.publicKey || !settings.accessToken) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha a Public Key e o Access Token',
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!providerSettings.dmgApiKey) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Informe a chave da Digital Manager',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      localStorage.setItem('mercadopago_settings', JSON.stringify(settings));
      localStorage.setItem('payment_provider_settings', JSON.stringify(providerSettings));
      setIsConnected(true);
      toast({
        title: 'Configurações salvas!',
        description: 'Configurações de pagamento atualizadas.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('mercadopago_settings');
    localStorage.removeItem('payment_provider_settings');
    setSettings({
      publicKey: '',
      accessToken: '',
      pixEnabled: true,
      cardEnabled: true,
      testMode: true,
    });
    setProviderSettings({
      provider: 'mercadopago',
      dmgApiUrl: 'https://digitalmanager.guru',
      dmgApiKey: '',
    });
    setIsConnected(false);
    toast({
      title: 'Desconectado',
      description: 'Integrações de pagamento foram desconectadas.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009ee3] rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            Mercado Pago
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure sua integração com Mercado Pago para receber pagamentos via PIX e Cartão
          </p>
        </div>
        <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Conectado
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Não configurado
            </>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Métodos de Pagamento
          </TabsTrigger>
          <TabsTrigger value="help" className="gap-2">
            <Info className="w-4 h-4" />
            Ajuda
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Provedor de Pagamento</CardTitle>
              <CardDescription>Escolha o provedor para o checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  className={`px-3 py-2 rounded border ${providerSettings.provider === 'mercadopago' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                  onClick={() => setProviderSettings(prev => ({ ...prev, provider: 'mercadopago' }))}
                >
                  Mercado Pago
                </button>
                <button
                  className={`px-3 py-2 rounded border ${providerSettings.provider === 'digitalmanager' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                  onClick={() => setProviderSettings(prev => ({ ...prev, provider: 'digitalmanager' }))}
                >
                  Digital Manager Guru
                </button>
                <button
                  className={`px-3 py-2 rounded border ${providerSettings.provider === 'cora' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                  onClick={() => setProviderSettings(prev => ({ ...prev, provider: 'cora' }))}
                >
                  Cora Bank (PIX)
                </button>
              </div>
              {providerSettings.provider === 'digitalmanager' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dmgUrl">URL</Label>
                    <Input
                      id="dmgUrl"
                      type="text"
                      value={providerSettings.dmgApiUrl}
                      onChange={(e) => setProviderSettings({ ...providerSettings, dmgApiUrl: e.target.value })}
                      placeholder="https://digitalmanager.guru"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dmgKey">Chave API</Label>
                    <Input
                      id="dmgKey"
                      type="text"
                      value={providerSettings.dmgApiKey}
                      onChange={(e) => setProviderSettings({ ...providerSettings, dmgApiKey: e.target.value })}
                      placeholder="Cole sua chave API"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Credenciais da API
              </CardTitle>
              <CardDescription>
                Insira suas credenciais do Mercado Pago. Você pode encontrá-las no{' '}
                <a 
                  href="https://www.mercadopago.com.br/developers/panel/app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Painel de Desenvolvedores
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicKey">Public Key</Label>
                <Input
                  id="publicKey"
                  type="text"
                  value={settings.publicKey}
                  onChange={(e) => setSettings({ ...settings, publicKey: e.target.value })}
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Chave pública para integração no frontend
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <div className="relative">
                  <Input
                    id="accessToken"
                    type={showAccessToken ? 'text' : 'password'}
                    value={settings.accessToken}
                    onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                    placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Token de acesso para processamento de pagamentos (mantenha seguro!)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="testMode" className="font-medium">Modo de Teste</Label>
                  <p className="text-xs text-muted-foreground">
                    Ative para usar credenciais de teste do Mercado Pago
                  </p>
                </div>
                <Switch
                  id="testMode"
                  checked={settings.testMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, testMode: checked })}
                />
              </div>

              {settings.testMode && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Modo de teste ativo. Os pagamentos não serão processados de verdade.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>
            {isConnected && (
              <Button variant="destructive" onClick={handleDisconnect}>
                Desconectar
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* PIX Card */}
            <Card className={settings.pixEnabled ? 'border-green-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#32BCAD]/10 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-[#32BCAD]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">PIX</CardTitle>
                      <CardDescription>Pagamento instantâneo</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pixEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, pixEnabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Aprovação instantânea</li>
                  <li>• Sem taxas para o cliente</li>
                  <li>• Disponível 24/7</li>
                  <li>• QR Code + Copia e Cola</li>
                </ul>
              </CardContent>
            </Card>

            {/* Credit Card */}
            <Card className={settings.cardEnabled ? 'border-green-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cartão de Crédito</CardTitle>
                      <CardDescription>Parcelamento em até 12x</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.cardEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cardEnabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visa, Mastercard, Elo, Amex</li>
                  <li>• Parcelamento em até 12x</li>
                  <li>• Antifraude integrado</li>
                  <li>• Checkout transparente</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving || !isConnected}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Métodos de Pagamento'
            )}
          </Button>

          {!isConnected && (
            <p className="text-center text-sm text-muted-foreground">
              Configure suas credenciais primeiro para habilitar os métodos de pagamento
            </p>
          )}
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Como configurar o Mercado Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Crie uma conta no Mercado Pago Developers</p>
                    <p className="text-sm text-muted-foreground">
                      Acesse{' '}
                      <a 
                        href="https://www.mercadopago.com.br/developers" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        mercadopago.com.br/developers
                      </a>
                      {' '}e faça login com sua conta
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Crie uma aplicação</p>
                    <p className="text-sm text-muted-foreground">
                      No painel de desenvolvedores, crie uma nova aplicação para sua loja
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Copie as credenciais</p>
                    <p className="text-sm text-muted-foreground">
                      Nas configurações da aplicação, copie a Public Key e o Access Token
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Cole aqui e salve</p>
                    <p className="text-sm text-muted-foreground">
                      Cole as credenciais na aba "Configuração" e clique em salvar
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxas do Mercado Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 text-[#32BCAD]" />
                    <span className="font-medium">PIX</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">0,99%</p>
                  <p className="text-sm text-muted-foreground">por transação</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium">Cartão de Crédito</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">4,98%</p>
                  <p className="text-sm text-muted-foreground">por transação (à vista)</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Taxas podem variar. Consulte o site do Mercado Pago para valores atualizados.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <a 
                href="https://www.mercadopago.com.br/developers/panel/app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Acessar Painel MP
              </a>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a 
                href="https://www.mercadopago.com.br/developers/pt/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Documentação
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
