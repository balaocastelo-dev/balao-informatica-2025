import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  name: string;
  source_url?: string;
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
  const specs: string[] = [];
  const mem = text.match(/\b(\d{1,3})\s*GB\s*(GDDR[56])\b/i);
  if (mem) specs.push(`${mem[1]}GB ${mem[2].toUpperCase()}`);
  const bus = text.match(/\b(128|192|256)\s*bits?\b/i);
  if (bus) specs.push(`${bus[1]} bits`);
  const dp = text.match(/Display\s*Port\s*2\.?1/i);
  if (dp) specs.push("DisplayPort 2.1");
  const hdmi = text.match(/HDMI\s*2\.?1/i);
  if (hdmi) specs.push("HDMI 2.1");
  const pcie = text.match(/PCI[-\s]?E\s*(\d(\.0)?)\b/i);
  if (pcie) specs.push(`PCI-E ${pcie[1]}`);
  const clockBoost = text.match(/boost[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (clockBoost) specs.push(`Boost até ${clockBoost[1].replace(",", ".")}MHz`);
  const gameClock = text.match(/game\s*clock[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (gameClock) specs.push(`Game Clock ${gameClock[1].replace(",", ".")}MHz`);
  const tgp = text.match(/\bTGP\s*(\d{2,3})\s*W\b/i);
  if (tgp) specs.push(`TGP ${tgp[1]}W`);
  const infinityCache = text.match(/Infinity\s*Cache\s*(\d{1,3})\s*MB/i);
  if (infinityCache) specs.push(`Infinity Cache ${infinityCache[1]}MB`);
  return specs;
}

const fallbackGenerate = (name: string) => {
  const lower = name.toLowerCase();
  const isNotebook = lower.includes("notebook") || lower.includes("laptop");
  const isMonitor = lower.includes("monitor") || lower.includes("tela");
  const isGPU = lower.includes("placa de vídeo") || lower.includes("placa de video") || lower.includes("gpu") || lower.includes("rtx") || lower.includes("gtx") || lower.includes("radeon");
  const isSSD = lower.includes("ssd") || lower.includes("nvme");
  const isCPU = lower.includes("processador") || lower.includes("cpu") || lower.includes("ryzen") || lower.includes("intel");

  const hook =
    isNotebook
      ? "Mobilidade e desempenho para estudar, trabalhar e criar."
      : isMonitor
      ? "Imagem nítida e fluida para produtividade e jogos."
      : isGPU
      ? "Gráficos impressionantes e altas taxas de FPS."
      : isSSD
      ? "Velocidade de leitura e escrita para carregar tudo em segundos."
      : isCPU
      ? "Performance eficiente para multitarefa e responsividade."
      : "Desempenho e confiabilidade com excelente custo-benefício.";

  return `Conheça ${name}. ${hook} Ideal para quem busca qualidade, suporte e condições especiais na Balão da Informática.`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, source_url }: GenerateRequest = await req.json();

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: "Missing 'name' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let pageText = "";
    if (source_url && source_url.startsWith("http")) {
      try {
        const resp = await fetch(source_url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });
        if (resp.ok) {
          const html = await resp.text();
          pageText = normalizeText(html);
        }
      } catch {}
    }

    if (!OPENAI_API_KEY) {
      const specs = pageText ? extractSpecs(pageText) : [];
      const base = fallbackGenerate(name);
      const unique = specs.length > 0
        ? `${name}. ${specs.join(", ")}. Pensada para entregar performance consistente em jogos e aplicativos modernos, com excelente relação custo-benefício e compatibilidade com monitores atuais. Disponível na Balão da Informática.`
        : base;
      return new Response(JSON.stringify({ description: unique, simulated: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = [
      "Você é um redator de e-commerce especializado em tecnologia.",
      "Escreva em português (Brasil), com tom persuasivo e claro.",
      "Use tipicamente 100–160 palavras.",
      "Não invente especificações.",
      "Use apenas informações presentes no conteúdo fornecido.",
      "Destaque benefícios reais para jogos, trabalho e estudos quando aplicável.",
      "Evite exageros.",
    ].join("\n");

    const userPrompt = [
      `Produto: ${name}`,
      source_url ? `Link: ${source_url}` : "",
      "",
      "Conteúdo extraído do link:",
      pageText || "(vazio)",
      "",
      "Tarefa:",
      "- Redija uma descrição de vendas única e objetiva baseada apenas no conteúdo fornecido.",
      "- Inclua especificações-chave encontradas (ex.: memória, barramento, saídas, clock, TGP).",
      "- Evite HTML; responda em texto puro.",
      "- Termine com uma chamada de ação discreta.",
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return new Response(JSON.stringify({ description: fallbackGenerate(name), simulated: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const text: string =
      json?.choices?.[0]?.message?.content ??
      fallbackGenerate(name);

    return new Response(JSON.stringify({ description: text, simulated: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-product-description error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
