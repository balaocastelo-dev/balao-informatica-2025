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

function extractSpecs(text: string) {
  const specs: { k: string; v: string }[] = [];
  const mem = text.match(/\b(\d{1,3})\s*GB\s*(GDDR[56])\b/i);
  if (mem) specs.push({ k: "Memória", v: `${mem[1]}GB ${mem[2].toUpperCase()}` });
  const bus = text.match(/\b(128|192|256)\s*bits?\b/i);
  if (bus) specs.push({ k: "Barramento", v: `${bus[1]} bits` });
  const pcie = text.match(/PCI[-\s]?E\s*(\d(\.0)?)\b/i);
  if (pcie) specs.push({ k: "Interface", v: `PCI-E ${pcie[1]}` });
  const clockBoost = text.match(/boost[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (clockBoost) specs.push({ k: "Boost", v: `até ${clockBoost[1].replace(",", ".")}MHz` });
  const gameClock = text.match(/game\s*clock[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (gameClock) specs.push({ k: "Game Clock", v: `${gameClock[1].replace(",", ".")}MHz` });
  const tgp = text.match(/\bTGP\s*(\d{2,3})\s*W\b/i);
  if (tgp) specs.push({ k: "TGP", v: `${tgp[1]}W` });
  const dpCount = text.match(/\b(\d)\s*x\s*(?:sa[ií]da\s*-\s*)?Display\s*Port/i);
  const dp21 = /Display\s*Port\s*2\.?1/i.test(text);
  const hdmiCount = text.match(/\b(\d)\s*x\s*(?:sa[ií]da\s*-\s*)?HDMI/i);
  const hdmi21 = /HDMI\s*2\.?1/i.test(text);
  if (dpCount || dp21) {
    const n = dpCount?.[1] ? `${dpCount[1]}x ` : "";
    const ver = dp21 ? "2.1" : "";
    specs.push({ k: "DisplayPort", v: `${n}${ver}`.trim() || "DisplayPort" });
  }
  if (hdmiCount || hdmi21) {
    const n = hdmiCount?.[1] ? `${hdmiCount[1]}x ` : "";
    const ver = hdmi21 ? "2.1" : "";
    specs.push({ k: "HDMI", v: `${n}${ver}`.trim() || "HDMI" });
  }
  const infinityCache = text.match(/Infinity\s*Cache[^0-9]*?(\d{1,3})\s*MB/i);
  if (infinityCache) specs.push({ k: "Infinity Cache", v: `${infinityCache[1]}MB` });
  return specs.slice(0, 10);
}

function fallbackProduto(name: string, pageText: string) {
  const lower = name.toLowerCase();
  const isGPU = lower.includes("gpu") || lower.includes("rtx") || lower.includes("rx") || lower.includes("radeon") || lower.includes("geforce");
  const isCPU = lower.includes("cpu") || lower.includes("ryzen") || lower.includes("intel");
  const isMonitor = lower.includes("monitor");
  const isNotebook = lower.includes("notebook") || lower.includes("laptop");
  const specs = pageText ? extractSpecs(pageText) : [];
  const specsHtml = specs.length
    ? `<ul>${specs.map(s => `<li><b>${s.k}:</b> ${s.v}</li>`).join("")}</ul>`
    : `<ul><li><b>Especificações:</b> consulte o fabricante</li></ul>`;
  const base =
    isGPU ? "Placa de vídeo com desempenho sólido para jogos em 1080p e criação de conteúdo."
    : isCPU ? "Processador com performance eficiente para multitarefa e produtividade diária."
    : isMonitor ? "Monitor com nitidez e fluidez para trabalho e entretenimento."
    : isNotebook ? "Notebook pensado para mobilidade e desempenho equilibrado."
    : "Produto com excelente custo-benefício e confiabilidade.";
  const extra = specs.length ? ` Confira alguns destaques técnicos na ficha abaixo.` : "";
  const descricao = `<p>${base}${extra}</p>`;
  const ficha = specsHtml;
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    }).finally(() => clearTimeout(timeout));
    const ok = resp.ok;
    const html = ok ? await resp.text() : "";
    const text = html ? normalizeText(html) : "";

    if (!OPENAI_API_KEY) {
      const fb = fallbackProduto(name || url, text);
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
      `URL: ${url}`,
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
      const fb = fallbackProduto(name || url, text);
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
      const fb = fallbackProduto(name || url, text);
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
      const fb = fallbackProduto(name || url, text);
      return new Response(JSON.stringify(fb), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!result.produto.nome_refinado) result.produto.nome_refinado = name || url;
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ sucesso: false, error: "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
