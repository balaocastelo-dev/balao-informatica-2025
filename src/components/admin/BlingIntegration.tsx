import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

export const BlingIntegration: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from('bling_integration')
        .select('id, updated_at')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      setStatus(data ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Erro ao verificar status do Bling:', error);
      setStatus('disconnected');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('bling_integration')
        .delete()
        .eq('id', 'default');

      if (error) throw error;
      setStatus('disconnected');
      toast({ title: 'Desconectado', description: 'Integração com Bling removida.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desconectar.', variant: 'destructive' });
    }
  };

  const handleConnect = async () => {
    try {
      // Usar implementação direta no cliente para evitar erros de função server-side não configurada
      const clientId = "bbd5f0cf6a54527157368ab525d6a38bd8a8679d";
      const redirectUri = `${window.location.origin}/bling/callback`;
      const state = crypto.randomUUID();
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Salvar state no Supabase para validação posterior
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos
      const { error: insertError } = await supabase.from("bling_oauth_states").insert({
        state,
        created_by: user.id,
        expires_at: expiresAt,
      });

      if (insertError) {
        console.error("Erro ao salvar state:", insertError);
        // Se falhar ao inserir, pode ser permissão ou tabela inexistente.
        // Tenta fallback para a função se a inserção direta falhar?
        // Ou assume que se a inserção falhar, a função também falharia (banco de dados).
        // Vamos tentar invocar a função como fallback se a inserção direta falhar, 
        // mas o erro mais provável aqui é a função estar quebrada e a inserção direta funcionar (se o user for admin).
        throw new Error("Falha ao inicializar segurança da conexão (State).");
      }

      // Construir URL de autorização
      const authorizeUrl = new URL("https://www.bling.com.br/Api/v3/oauth/authorize");
      authorizeUrl.searchParams.set("response_type", "code");
      authorizeUrl.searchParams.set("client_id", clientId);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("state", state);

      window.location.href = authorizeUrl.toString();
      
    } catch (error) {
      console.error('Erro ao iniciar conexão com Bling:', error);
      
      // Fallback: Tentar via Edge Function se o método cliente falhar (ex: erro de permissão na tabela)
      try {
        console.log("Tentando fallback via Edge Function...");
        const { data, error: funcError } = await supabase.functions.invoke('bling-oauth-start');
        if (funcError) throw funcError;
        if (data?.authorize_url) {
          window.location.href = data.authorize_url;
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback também falhou:", fallbackError);
      }

      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Falha ao iniciar conexão com Bling.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Integração Bling ERP
          {status === 'connected' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {status === 'disconnected' && !checking && <XCircle className="w-5 h-5 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Conecte sua conta Bling para sincronizar pedidos automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border">
          <div className="space-y-1">
            <p className="font-medium">Status da Conexão</p>
            <p className="text-sm text-muted-foreground">
              {checking ? 'Verificando...' : 
               status === 'connected' ? 'Conectado e sincronizando pedidos.' : 
               'Não conectado.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={checkStatus} disabled={checking}>
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {status === 'disconnected' ? (
          <div className="space-y-2">
            <Button className="w-full sm:w-auto" onClick={handleConnect}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Conectar Agora
            </Button>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado para o Bling para autorizar o acesso.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="destructive" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
