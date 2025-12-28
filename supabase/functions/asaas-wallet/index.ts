import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ASAAS_API_KEY') || '';
    const walletId = Deno.env.get('ASAAS_WALLET_ID') || '642af8d4-c6bc-44d5-bb74-63cc97de3c2a';

    const configured = !!apiKey;

    return new Response(
      JSON.stringify({
        provider: 'asaas',
        configured,
        wallet_id: walletId,
        message: configured ? 'ASAAS_API_KEY configurado' : 'ASAAS_API_KEY não configurado. Configure no painel de funções.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
