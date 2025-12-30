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

function fallbackCompose(name: string) {
  const lower = name.toLowerCase();
  const isGPU = lower.includes("gpu") || lower.includes("rtx") || lower.includes("rx") || lower.includes("radeon") || lower.includes("geforce");
  const isCPU = lower.includes("cpu") || lower.includes("ryzen") || lower.includes("intel");
  const isMonitor = lower.includes("monitor");
  const isNotebook = lower.includes("notebook") || lower.includes("laptop");
  const desc =
    isGPU ? "Placa de vídeo com desempenho sólido para jogos e criação de conteúdo."
    : isCPU ? "Processador com performance eficiente para multitarefa e produtividade."
    : isMonitor ? "Monitor com ótima nitidez e fluidez para trabalho e entretenimento."
    : isNotebook ? "Notebook pensado para quem precisa de mobilidade e desempenho."
    : "Produto com excelente custo-benefício e confiabilidade.";
  const descricaoComercial = `Descrição: ${desc}`;
  const informacoesTecnicas = "Informações Técnicas: Consulte as especificações oficiais do fabricante.";
  const sobre = "Sobre: Ideal para quem busca qualidade e suporte com condições especiais.";
  const combined = [descricaoComercial, informacoesTecnicas, sobre].join("\n\n");
  return { descricaoComercial, informacoesTecnicas, sobre, combined };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url, name }: ReqBody = await req.json();
    if (!url || !url.startsWith("http")) {
      return new Response(JSON.stringify({ error: "URL inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      const fb = fallbackCompose(name || url);
      return new Response(JSON.stringify({ description: fb.combined, sections: fb, simulated: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const system = [
      "Você recebe o texto bruto de uma página de produto de e-commerce.",
      "Extraia apenas informações úteis do produto e ignore menus/rodapés/anúncios.",
      "Responda estritamente em JSON com as chaves:",
      "descricaoComercial: texto persuasivo para vendas (100-180 palavras).",
      "informacoesTecnicas: lista curta (bullet-like) com especificações confirmadas.",
      "sobreProduto: um parágrafo curto destacando uso/benefícios.",
      "Se não houver dados suficientes, seja conservador e não invente.",
    ].join("\n");
    const user = [
      name ? `Nome: ${name}` : "",
      "Texto da página:",
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
      const fb = fallbackCompose(name || url);
      return new Response(JSON.stringify({ description: fb.combined, sections: fb, simulated: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const json = await ai.json();
    const content = json?.choices?.[0]?.message?.content || "";
    let parsed: { descricaoComercial?: string; informacoesTecnicas?: string | string[]; sobreProduto?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    const partes: string[] = [];
    if (parsed.descricaoComercial) partes.push(`Descrição: ${parsed.descricaoComercial}`);
    if (parsed.informacoesTecnicas) {
      const info = Array.isArray(parsed.informacoesTecnicas) ? parsed.informacoesTecnicas.join(" · ") : parsed.informacoesTecnicas;
      partes.push(`Informações Técnicas: ${info}`);
    }
    if (parsed.sobreProduto) partes.push(`Sobre: ${parsed.sobreProduto}`);
    const combined = partes.join("\n\n");
    const fbName = name || url;
    const result = combined || fallbackCompose(fbName).combined;
    return new Response(JSON.stringify({ description: result, sections: parsed, simulated: false }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
