import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SyncRequest = { order_id: string };

const refreshAccessToken = async (clientId: string, clientSecret: string, refreshToken: string) => {
  const tokenUrl = "https://api.bling.com.br/Api/v3/oauth/token";
  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.access_token || !json?.refresh_token || !json?.expires_in) {
    return { ok: false as const, error: json };
  }
  return {
    ok: true as const,
    access_token: json.access_token as string,
    refresh_token: json.refresh_token as string,
    expires_in: Number(json.expires_in) as number,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = (await req.json()) as SyncRequest;
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("authorization") || "";

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, total, items, customer_name, customer_email, customer_phone, customer_address, created_at")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Sem permissão para este pedido" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: integration } = await supabase
      .from("bling_integration")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!integration) {
      return new Response(JSON.stringify({ ok: false, error: "Bling não conectado" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("BLING_CLIENT_ID") || "";
    const clientSecret = Deno.env.get("BLING_CLIENT_SECRET") || "";
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accessToken = integration.access_token as string;
    let refreshToken = integration.refresh_token as string;
    let expiresAt = new Date(integration.expires_at as string).getTime();
    if (Date.now() > expiresAt - 60_000) {
      const refreshed = await refreshAccessToken(clientId, clientSecret, refreshToken);
      if (!refreshed.ok) {
        return new Response(JSON.stringify({ error: "Falha ao atualizar token", details: refreshed.error }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      accessToken = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      expiresAt = Date.now() + refreshed.expires_in * 1000;

      await supabase
        .from("bling_integration")
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: new Date(expiresAt).toISOString(),
        })
        .eq("id", "default");
    }

    const pedido = {
      data: order.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      numero: String(order.id).slice(0, 8).toUpperCase(),
      contato: {
        nome: order.customer_name || "Cliente",
        email: order.customer_email || undefined,
        fone: order.customer_phone || undefined,
      },
      itens: (order.items || []).map((item: any) => ({
        descricao: item.name,
        quantidade: item.quantity,
        valor: item.price,
        unidade: "UN",
      })),
      observacoes: `Pedido do site - ID: ${order.id}`,
      observacoesInternas: order.customer_address ? `Endereço: ${order.customer_address}` : undefined,
    };

    const res = await fetch("https://api.bling.com.br/Api/v3/pedidos/vendas", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(pedido),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: "Falha ao criar pedido no Bling", details: json }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, response: json }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String((error as Error)?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);

