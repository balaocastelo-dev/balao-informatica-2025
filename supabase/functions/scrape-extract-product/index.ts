import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  url: string;
  name?: string;
}

function normalizeText(html: string) {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, 15000);
}

function fallbackProduto(name: string) {
  const lower = name.toLowerCase();
  const isGPU = lower.includes("gpu") || lower.includes("rtx") || lower.includes("rx") || lower.includes("radeon") || lower.includes("geforce");
  const isCPU = lower.includes("cpu") || lower.includes("ryzen") || lower.includes("intel");
  const isMonitor = lower.includes("monitor");
  const isNotebook = lower.includes("notebook") || lower.includes("laptop");
  const base =
    isGPU ? "Placa de vídeo com desempenho sólido para jogos em 1080p e criação de conteúdo."
    : isCPU ? "Processador com performance eficiente para multitarefa e produtividade diária."
    : isMonitor ? "Monitor com nitidez e fluidez para trabalho e entretenimento."
    : isNotebook ? "Notebook pensado para mobilidade e desempenho equilibrado."
    : "Produto com excelente custo-benefício e confiabilidade.";
  const descricao = `<p>${base}</p>`;
  const ficha = `<ul><li><b>Especificações:</b> consulte o fabricante</li></ul>`;
  const sobre = "Ideal para quem busca qualidade, suporte e condições especiais.";
  return {
    sucesso: true,
    produto: {
      nome_refinado: name,
      descricao_comercial: descricao,
      ficha_tecnica: ficha,
      sobre_produto: sobre,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url, name }: ReqBody = await req.json();
    if (!url || !url.startsWith("http")) {
      return new Response(JSON.stringify({ sucesso: false, error: "URL inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });
    const ok = resp.ok;
    const html = ok ? await resp.text() : "";
    const text = html ? normalizeText(html) : "";

    if (!OPENAI_API_KEY) {
      const fb = fallbackProduto(name || url);
      return new Response(JSON.stringify(fb), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const system = [
      "Você recebe o texto bruto de uma página de produto de e-commerce.",
      "Ignore menus, rodapés, recomendações e anúncios.",
      "Responda em JSON com as chaves: sucesso, produto.nome_refinado, produto.descricao_comercial (HTML simples <p>/<b>), produto.ficha_tecnica (HTML <ul>/<li> com chaves/valores), produto.sobre_produto.",
      "Mantenha termos técnicos como 8GB GDDR6 sem alterar.",
      "Se faltar 'sobre_produto', gere um breve resumo coerente.",
    ].join("\n");
    const user = [
      name ? `Metadados: ${name}` : "",
      "Conteúdo bruto:",
      text || "(vazio)",
    ].join("\n\n");

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });
    if (!ai.ok) {
      const fb = fallbackProduto(name || url);
      return new Response(JSON.stringify(fb), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const json = await ai.json();
    const content = json?.choices?.[0]?.message?.content || "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object") {
      const fb = fallbackProduto(name || url);
      return new Response(JSON.stringify(fb), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const result = parsed as {
      sucesso?: boolean;
      produto?: {
        nome_refinado?: string;
        descricao_comercial?: string;
        ficha_tecnica?: string;
        sobre_produto?: string;
      };
    };
    if (!result.sucesso || !result.produto) {
      const fb = fallbackProduto(name || url);
      return new Response(JSON.stringify(fb), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!result.produto.nome_refinado) result.produto.nome_refinado = name || url;
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ sucesso: false, error: "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
