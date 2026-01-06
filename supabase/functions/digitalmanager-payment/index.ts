import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface PaymentRequest {
  items: PaymentItem[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  order_id?: string;
  payment_method: 'pix' | 'credit_card';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DIGITALMANAGER_API_KEY');
    const baseUrl = Deno.env.get('DIGITALMANAGER_BASE_URL') || 'https://digitalmanager.guru';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Digital Manager não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as PaymentRequest;
    const orderId = body.order_id || crypto.randomUUID();

    const checkoutUrl = `${baseUrl}/admin/myprofile?order=${encodeURIComponent(orderId)}`;

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
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
