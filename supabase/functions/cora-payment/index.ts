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

function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '');
}

async function getAccessToken() {
  const clientId = Deno.env.get('CORA_CLIENT_ID');
  const clientSecret = Deno.env.get('CORA_CLIENT_SECRET');
  const authBase = Deno.env.get('CORA_AUTH_BASE') || 'https://api.stage.cora.com.br';

  if (!clientId || !clientSecret) {
    return { error: 'Cora não configurado' };
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');

  const resp = await fetch(`${authBase}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    return { error: 'Falha ao obter token da Cora' };
  }

  const data = await resp.json();
  return { token: data.access_token as string };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, error: tokenError } = await getAccessToken();
    if (!token || tokenError) {
      return new Response(
        JSON.stringify({ error: tokenError || 'Cora não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as PaymentRequest;
    if (body.payment_method !== 'pix') {
      return new Response(
        JSON.stringify({ error: 'Método de pagamento não suportado pelo Cora' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const total = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCents = Math.round(total * 100);

    const apiBase = Deno.env.get('CORA_API_BASE') || 'https://api.stage.cora.com.br';
    const idempotencyKey = body.order_id || crypto.randomUUID();

    const documentDigits = onlyDigits(body.customer_phone) || '00000000000';
    const inferredType = documentDigits.length > 11 ? 'CNPJ' : 'CPF';
    const today = new Date().toISOString().slice(0, 10);

    const invoicePayload = {
      code: body.order_id || crypto.randomUUID(),
      customer: {
        name: body.customer_name.substring(0, 60),
        email: body.customer_email || undefined,
        document: {
          identity: documentDigits,
          type: inferredType,
        },
      },
      services: [
        {
          name: `Pedido`,
          amount: totalCents,
        },
      ],
      payment_terms: {
        due_date: today,
      },
      payment_options: {
        pix: {
          amount: totalCents,
        },
      },
      notification: {
        enabled: false,
      },
    };

    const resp = await fetch(`${apiBase}/v2/invoices/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(
        JSON.stringify({ error: 'Falha ao criar QR Code Pix na Cora', details: txt }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();

    const pixObj = (data.pix || {}) as Record<string, unknown>;
    const emv = (pixObj['emv'] as string) || (pixObj['code'] as string) || (pixObj['copy_and_paste'] as string) || '';
    const base64 = (pixObj['qr_code_base64'] as string) || (pixObj['image_base64'] as string) || '';
    const ticketUrl = (pixObj['ticket_url'] as string) || '';

    return new Response(
      JSON.stringify({
        pix: {
          qr_code: emv,
          qr_code_base64: base64 || null,
          ticket_url: ticketUrl || null,
        },
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
