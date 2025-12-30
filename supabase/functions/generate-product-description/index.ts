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

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ description: fallbackGenerate(name), simulated: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = [
      "Você é um redator de e-commerce especializado em tecnologia.",
      "Escreva em português (Brasil), com tom persuasivo e claro.",
      "Use tipicamente 100–180 palavras.",
      "Nunca invente especificações; seja conservador quando não tiver certeza.",
      "Destaque benefícios para diferentes perfis (trabalho, estudos, games, escritório).",
      "Se possível, inclua pontos técnicos do produto pesquisando na internet antes de redigir.",
      "Evite linguagem exagerada, foque em benefícios reais e diferenciais.",
    ].join("\n");

    const userPrompt = [
      `Produto: ${name}`,
      source_url ? `Fonte/URL do produto (se útil): ${source_url}` : "",
      "",
      "Tarefa:",
      "- Pesquise características técnicas reais do produto na internet (se possível).",
      "- Redija uma descrição de vendas persuasiva com 100–180 palavras.",
      "- Inclua especificações-chave se confirmadas (ex.: RAM, armazenamento, polegadas, série da GPU/CPU).",
      "- Adapte benefícios para trabalho/estudos/jogos conforme o produto.",
      "- Termine com uma chamada de ação sutil.",
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
        temperature: 0.7,
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
