import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    const publishable = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

    const configured = !!secret && !!publishable;

    return new Response(
      JSON.stringify({
        provider: "stripe",
        configured,
        message: configured
          ? "Stripe configurado corretamente via variáveis de ambiente"
          : "Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
