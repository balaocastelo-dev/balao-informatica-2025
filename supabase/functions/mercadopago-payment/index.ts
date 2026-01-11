import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  items?: PaymentItem[];
  transaction_amount?: number;
  description?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  order_id?: string;
  payment_method: 'pix' | 'credit_card';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Mercado Pago não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { items, transaction_amount, description, customer_name, customer_email, customer_phone, customer_address, order_id, payment_method } = await req.json() as PaymentRequest;

    console.log('Creating payment for order:', order_id);
    console.log('Payment method:', payment_method);
    
    // Calculate total
    let total = 0;
    if (transaction_amount) {
      total = transaction_amount;
    } else if (items) {
      console.log('Items:', JSON.stringify(items));
      total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (total <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor total inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment_method === 'pix') {
      const pixBody = {
        transaction_amount: Number(total.toFixed(2)),
        description: description || `Pedido ${order_id || ''}`,
        payment_method_id: 'pix',
        payer: {
          email: customer_email,
          first_name: customer_name.split(' ')[0] || customer_name,
          last_name: customer_name.split(' ').slice(1).join(' ') || '',
        },
        external_reference: order_id || crypto.randomUUID(),
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      };

      const pixRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pixBody),
      });

      const pixData = await pixRes.json();

      if (!pixRes.ok) {
        console.error('Mercado Pago PIX error:', JSON.stringify(pixData));
        return new Response(
          JSON.stringify({ error: 'Erro ao criar pagamento PIX', details: pixData }),
          { status: pixRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (order_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('orders')
          .update({ 
            transaction_id: String(pixData.id),
            payment_status: 'pending'
          })
          .eq('id', order_id);
      }

      const qr = pixData?.point_of_interaction?.transaction_data || {};
      return new Response(
        JSON.stringify({
          pix: {
            payment_id: pixData.id,
            qr_code_base64: qr.qr_code_base64 || '',
            qr_code: qr.qr_code || '',
            ticket_url: qr.ticket_url || '',
            date_of_expiration: pixData.date_of_expiration || null,
            status: pixData.status || 'pending',
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      if (!items) {
        return new Response(
          JSON.stringify({ error: 'Items são obrigatórios para pagamento com cartão' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const preferenceData = {
        items: items.map(item => ({
          id: item.id,
          title: item.name.substring(0, 256),
          description: item.name.substring(0, 256),
          picture_url: item.image || '',
          quantity: item.quantity,
          currency_id: 'BRL',
          unit_price: Number(item.price.toFixed(2)),
        })),
        payer: {
          name: customer_name.split(' ')[0] || customer_name,
          surname: customer_name.split(' ').slice(1).join(' ') || '',
          email: customer_email,
          phone: {
            area_code: customer_phone.replace(/\D/g, '').substring(0, 2),
            number: customer_phone.replace(/\D/g, '').substring(2),
          },
          address: {
            street_name: customer_address.split(',')[0] || '',
            zip_code: customer_address.match(/CEP:\s*(\d{5}-?\d{3})/)?.[1]?.replace('-', '') || '',
          },
        },
        back_urls: {
          success: `${req.headers.get('origin')}/pedidos?status=success`,
          failure: `${req.headers.get('origin')}/carrinho?status=failure`,
          pending: `${req.headers.get('origin')}/pedidos?status=pending`,
        },
        auto_return: 'approved',
        external_reference: order_id || crypto.randomUUID(),
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
        statement_descriptor: 'BALAO INFO',
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 12,
        },
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Mercado Pago error:', JSON.stringify(responseData));
        return new Response(
          JSON.stringify({ error: 'Erro ao criar preferência de pagamento', details: responseData }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (order_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('orders')
          .update({ 
            transaction_id: responseData.id,
            payment_status: 'pending'
          })
          .eq('id', order_id);
      }

      return new Response(
        JSON.stringify({
          preference_id: responseData.id,
          init_point: responseData.init_point,
          sandbox_init_point: responseData.sandbox_init_point,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in mercadopago-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
