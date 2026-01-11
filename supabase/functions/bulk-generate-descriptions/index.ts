import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkRequest {
  ids: string[];
}

const fallbackGenerate = (name: string) => {
  const lower = name.toLowerCase();
  const isNotebook = lower.includes("notebook") || lower.includes("laptop");
  const isMonitor = lower.includes("monitor") || lower.includes("tela");
  const isGPU = lower.includes("gpu") || lower.includes("rtx") || lower.includes("gtx") || lower.includes("radeon");
  const isSSD = lower.includes("ssd") || lower.includes("nvme");
  const isCPU = lower.includes("cpu") || lower.includes("ryzen") || lower.includes("intel");
  const hook =
    isNotebook ? "Mobilidade e desempenho para estudar, trabalhar e criar."
    : isMonitor ? "Imagem nítida e fluida para produtividade e jogos."
    : isGPU ? "Gráficos impressionantes e altas taxas de FPS."
    : isSSD ? "Velocidade para carregar tudo em segundos."
    : isCPU ? "Performance eficiente para multitarefa e responsividade."
    : "Desempenho e confiabilidade com excelente custo-benefício.";
  return `Conheça ${name}. ${hook} Ideal para quem busca qualidade, suporte e condições especiais na Balão da Informática.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Supabase não configurado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: BulkRequest = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter(id => typeof id === "string") : [];
    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: "Lista de IDs vazia" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = { total: ids.length, done: 0, failed: 0 };

    for (const id of ids) {
      try {
        const { data: product, error: fetchErr } = await supabase
          .from("products")
          .select("id,name,source_url")
          .eq("id", id)
          .single();
        if (fetchErr || !product?.name) {
          results.failed++;
          continue;
        }

        let description = "";

        if (OPENAI_API_KEY) {
          const system = [
            "Você é um redator de e-commerce especializado em tecnologia.",
            "Escreva em português (Brasil), com tom persuasivo e claro.",
            "Use tipicamente 100–180 palavras.",
            "Nunca invente especificações; seja conservador quando não tiver certeza.",
            "Destaque benefícios para diferentes perfis (trabalho, estudos, games, escritório).",
            "Se possível, inclua pontos técnicos do produto pesquisando na internet antes de redigir.",
            "Não use markdown como negrito (**), itálico ou cabeçalhos.",
          ].join("\n");
          const prompt = [
            `Produto: ${product.name}`,
            product.source_url ? `Fonte/URL do produto: ${product.source_url}` : "",
            "",
            "Tarefa:",
            "- Pesquise características técnicas reais do produto na internet (se possível).",
            "- Redija uma descrição de vendas persuasiva com 100–180 palavras.",
            "- Inclua especificações-chave se confirmadas.",
            "- Adapte benefícios para trabalho/estudos/jogos conforme o produto.",
            "- NÃO use ** para negrito. Escreva em texto corrido.",
            "- Termine com uma chamada de ação sutil.",
          ].join("\n");
          const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
              temperature: 0.7,
            }),
          });
          if (resp.ok) {
            const json = await resp.json();
            description = (json?.choices?.[0]?.message?.content || "").trim();
            // Remove markdown bold
            description = description.replace(/\*\*/g, "");
          }
        }

        if (!description) {
          description = fallbackGenerate(product.name);
        }

        const { error: updateErr } = await supabase
          .from("products")
          .update({ description, ai_generated: true })
          .eq("id", id);
        if (updateErr) {
          results.failed++;
        } else {
          results.done++;
        }
      } catch {
        results.failed++;
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
