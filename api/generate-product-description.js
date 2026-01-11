const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeText(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const onlyBody = bodyMatch ? bodyMatch[1] : html;
  let text = onlyBody.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/\b(adicionar ao carrinho|frete grátis|quem viu isso comprou|recomendações|veja também)\b/gi, " ");
  return text.slice(0, 15000);
}

function extractSpecs(text) {
  const specs = [];
  const mem = text.match(/\b(\d{1,3})\s*GB\s*(GDDR[56])\b/i);
  if (mem) specs.push(`${mem[1]}GB ${String(mem[2]).toUpperCase()}`);
  const bus = text.match(/\b(128|192|256)\s*bits?\b/i);
  if (bus) specs.push(`${bus[1]} bits`);
  if (/Display\s*Port\s*2\.?1/i.test(text)) specs.push("DisplayPort 2.1");
  if (/HDMI\s*2\.?1/i.test(text)) specs.push("HDMI 2.1");
  const pcie = text.match(/PCI[-\s]?E\s*(\d(\.0)?)\b/i);
  if (pcie) specs.push(`PCI-E ${pcie[1]}`);
  const clockBoost = text.match(/boost[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (clockBoost) specs.push(`Boost até ${String(clockBoost[1]).replace(",", ".")}MHz`);
  const gameClock = text.match(/game\s*clock[^0-9]*([\d.,]{3,6})\s*mhz/i);
  if (gameClock) specs.push(`Game Clock ${String(gameClock[1]).replace(",", ".")}MHz`);
  const tgp = text.match(/\bTGP\s*(\d{2,3})\s*W\b/i);
  if (tgp) specs.push(`TGP ${tgp[1]}W`);
  const infinityCache = text.match(/Infinity\s*Cache\s*(\d{1,3})\s*MB/i);
  if (infinityCache) specs.push(`Infinity Cache ${infinityCache[1]}MB`);
  return specs;
}

function fallbackGenerate(name) {
  const lower = String(name || "").toLowerCase();
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
}

async function readJsonBody(req) {
  const raw = req.body;
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const body = await readJsonBody(req);
  const name = body && typeof body.name === "string" ? body.name : "";
  const source_url = body && typeof body.source_url === "string" ? body.source_url : "";

  if (!name || !name.trim()) return res.status(400).json({ error: "Missing 'name' field" });

  let pageText = "";
  if (source_url && source_url.startsWith("http")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch(source_url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      }).finally(() => clearTimeout(timeout));
      if (resp.ok) {
        const html = await resp.text();
        pageText = normalizeText(html);
      }
    } catch (err) {
      console.error("fetch source_url failed:", err);
    }
  }

  const specs = pageText ? extractSpecs(pageText) : [];

  if (!OPENAI_API_KEY) {
    const base = fallbackGenerate(name);
    const unique = specs.length > 0
      ? `${name}. ${specs.join(", ")}. Pensada para entregar performance consistente em jogos e aplicativos modernos, com excelente relação custo-benefício e compatibilidade com monitores atuais. Disponível na Balão da Informática.`
      : base;
    return res.status(200).json({ description: unique, simulated: true });
  }

  try {
    const system = [
      "Você é um redator de e-commerce especializado em tecnologia.",
      "Escreva em português (Brasil), com tom persuasivo e claro.",
      "Use tipicamente 100–160 palavras.",
      "Não invente especificações.",
      "Use apenas informações presentes no conteúdo fornecido.",
      "Destaque benefícios reais para jogos, trabalho e estudos quando aplicável.",
      "Evite exageros.",
      "Não use markdown como negrito (**), itálico ou cabeçalhos.",
    ].join("\n");

    const userPrompt = [
      `Produto: ${name}`,
      source_url ? `Link: ${source_url}` : "",
      specs.length ? `Especificações detectadas: ${specs.join(" | ")}` : "",
      "",
      "Conteúdo extraído do link:",
      pageText || "(vazio)",
      "",
      "Tarefa:",
      "- Redija uma descrição de vendas única e objetiva baseada apenas no conteúdo fornecido.",
      "- Inclua explicitamente pelo menos 3 especificações reais do produto (se existirem no conteúdo).",
      "- Evite HTML; responda em texto puro.",
      "- NÃO use ** para negrito. Escreva em texto corrido.",
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
      return res.status(200).json({ description: fallbackGenerate(name), simulated: true });
    }

    const json = await response.json();
    let text = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content)
      ? String(json.choices[0].message.content)
      : fallbackGenerate(name);

    // Remove markdown bold if AI ignored instructions
    text = text.replace(/\*\*/g, "");

    return res.status(200).json({ description: text, simulated: false });
  } catch (error) {
    console.error("generate-product-description api error:", error);
    return res.status(200).json({ description: fallbackGenerate(name), simulated: true });
  }
}

