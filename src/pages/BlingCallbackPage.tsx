import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';

export default function BlingCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code') || '';
      const state = params.get('state') || '';
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        toast.error(errorDescription || 'Conexão com Bling cancelada');
        navigate('/admin', { replace: true });
        return;
      }

      if (!code || !state) {
        toast.error('Callback inválido do Bling');
        navigate('/admin', { replace: true });
        return;
      }

      const redirectUri = `${window.location.origin}/bling/callback`;

      const { error: exchangeError } = await supabase.functions.invoke('bling-oauth-exchange', {
        body: { code, state, redirect_uri: redirectUri },
      });

      if (exchangeError) {
        toast.error('Erro ao conectar com Bling');
        navigate('/admin', { replace: true });
        return;
      }

      toast.success('Bling conectado com sucesso!');
      navigate('/admin', { replace: true });
    };

    run();
  }, [location.search, navigate]);

  return (
    <Layout>
      <div className="container-balao py-16">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Conectando Bling…</h1>
          <p className="text-muted-foreground mt-2">Aguarde alguns segundos.</p>
        </div>
      </div>
    </Layout>
  );
}

