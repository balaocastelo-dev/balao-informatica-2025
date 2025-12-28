import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  payment_method: 'credit_card';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) {
      return new Response(
        JSON.stringify({ error: "Stripe não configurado. Defina STRIPE_SECRET_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const {
      items = [],
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      order_id,
    } = await req.json() as PaymentRequest;

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://example.com";
    const successUrl = `${origin}/pedidos?status=success`;
    const cancelUrl = `${origin}/carrinho?status=cancelled`;

    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name.substring(0, 256),
          images: item.image ? [item.image] : [],
        },
      },
    }));

    const form = new URLSearchParams();
    form.append("mode", "payment");
    form.append("success_url", successUrl);
    form.append("cancel_url", cancelUrl);
    lineItems.forEach((li, idx) => {
      form.append(`line_items[${idx}][quantity]`, String(li.quantity));
      form.append(`line_items[${idx}][price_data][currency]`, li.price_data.currency);
      form.append(`line_items[${idx}][price_data][unit_amount]`, String(li.price_data.unit_amount));
      form.append(`line_items[${idx}][price_data][product_data][name]`, li.price_data.product_data.name);
      if (li.price_data.product_data.images && li.price_data.product_data.images.length > 0) {
        form.append(`line_items[${idx}][price_data][product_data][images][0]`, li.price_data.product_data.images[0]);
      }
    });
    if (customer_email) {
      form.append("customer_email", customer_email);
    }
    if (order_id) {
      form.append("client_reference_id", order_id);
    }

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const session = await resp.json();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao criar sessão do Stripe", details: session }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (order_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from("orders")
        .update({
          transaction_id: String(session.id),
          payment_status: "pending",
        })
        .eq("id", order_id);
    }

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
