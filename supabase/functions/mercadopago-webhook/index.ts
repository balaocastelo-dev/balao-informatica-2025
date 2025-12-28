import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response('Not configured', { status: 500 });
    }

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Mercado Pago sends different types of notifications
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.error('No payment ID in webhook');
        return new Response('No payment ID', { status: 400 });
      }

      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('Error fetching payment:', await paymentResponse.text());
        return new Response('Error fetching payment', { status: 500 });
      }

      const payment = await paymentResponse.json();
      console.log('Payment details:', JSON.stringify(payment));

      const orderId = payment.external_reference;
      const status = payment.status;

      // Map Mercado Pago status to our status
      const statusMap: Record<string, string> = {
        'approved': 'paid',
        'pending': 'pending',
        'in_process': 'pending',
        'rejected': 'failed',
        'refunded': 'refunded',
        'cancelled': 'cancelled',
        'charged_back': 'refunded',
      };

      const paymentStatus = statusMap[status] || 'pending';
      const orderStatus = paymentStatus === 'paid' ? 'confirmed' : 'pending';

      console.log(`Updating order ${orderId} with payment status: ${paymentStatus}, order status: ${orderStatus}`);

      // Update order in Supabase
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          status: orderStatus,
          transaction_id: paymentId.toString(),
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        return new Response('Error updating order', { status: 500 });
      }

      console.log('Order updated successfully');
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});
