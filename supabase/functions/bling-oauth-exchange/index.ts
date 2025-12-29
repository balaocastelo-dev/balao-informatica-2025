import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ExchangeRequest = {
  code: string;
  state: string;
  redirect_uri: string;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("BLING_CLIENT_ID");
    const clientSecret = Deno.env.get("BLING_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados" }), {
        status: 500,
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
    const { data: isAdmin, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, state, redirect_uri } = (await req.json()) as ExchangeRequest;
    if (!code || !state || !redirect_uri) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: stateRow, error: stateError } = await supabase
      .from("bling_oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (stateError || !stateRow) {
      return new Response(JSON.stringify({ error: "State inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stateRow.created_by !== userId) {
      return new Response(JSON.stringify({ error: "State não pertence ao usuário" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(stateRow.expires_at).getTime() < Date.now()) {
      await supabase.from("bling_oauth_states").delete().eq("state", state);
      return new Response(JSON.stringify({ error: "State expirado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenUrl = "https://api.bling.com.br/Api/v3/oauth/token";
    const basic = btoa(`${clientId}:${clientSecret}`);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }).toString(),
    });

    const tokenJson = await tokenRes.json().catch(() => null);
    if (!tokenRes.ok || !tokenJson?.access_token || !tokenJson?.refresh_token || !tokenJson?.expires_in) {
      return new Response(JSON.stringify({ error: "Falha ao obter tokens", details: tokenJson }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = new Date(Date.now() + Number(tokenJson.expires_in) * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from("bling_integration")
      .upsert(
        {
          id: "default",
          access_token: tokenJson.access_token,
          refresh_token: tokenJson.refresh_token,
          expires_at: expiresAt,
        },
        { onConflict: "id" },
      );

    await supabase.from("bling_oauth_states").delete().eq("state", state);

    if (upsertError) {
      return new Response(JSON.stringify({ error: "Falha ao salvar tokens" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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

