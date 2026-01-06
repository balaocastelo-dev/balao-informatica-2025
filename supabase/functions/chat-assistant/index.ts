import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Pegamos session_id (para persistência) se o front mandar
    const { messages, session_id } = await req.json();

    // Configuração do Supabase dentro do Bot
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Use a Service Role Key para busca total
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 1. DESCOBRIR O QUE O CLIENTE QUER
    const lastUserMessage =
      messages
        .slice()
        .reverse()
        .find((m: any) => m.role === "user")?.content || "";

    // Extrai palavras-chave simples da pergunta (ex: "RTX 4060" -> "rtx", "4060")
    const searchTerms = lastUserMessage
      .toLowerCase()
      .split(" ")
      .filter((w: string) => w.length > 2);
    let dbQuery = supabase.from("products").select("id, name, price, stock, category, slug").gt("stock", 0).limit(10);

    // 2. BUSCA REAL NO BANCO (GROUNDING)
    // Se o cliente digitou algo específico, filtramos no banco
    if (searchTerms.length > 0) {
      // Cria uma busca "OR" para encontrar qualquer uma das palavras no nome
      const orQuery = searchTerms.map((term: string) => `name.ilike.%${term}%`).join(",");
      dbQuery = dbQuery.or(orQuery);
    }

    const { data: foundProducts } = await dbQuery;

    // 3. MONTAR O CONTEXTO BLINDADO
    // O robô só vai conhecer o que veio dessa busca
    const productContext =
      foundProducts && foundProducts.length > 0
        ? `\n\nESTOQUE REAL ENCONTRADO (USE APENAS ISSO):
${foundProducts
  .map(
    (p: any) =>
      `- PRODUTO: ${p.name} 
   - PREÇO: R$ ${p.price.toFixed(2)} 
   - LINK CORRETO: /produto/${p.slug || p.id} 
   - CATEGORIA: ${p.category}`,
  )
  .join("\n")}`
        : "\n\nAVISO: Não encontrei produtos exatos com esse nome no estoque. Peça para o cliente refinar a busca ou ofereça uma categoria geral.";

    // 4. SALVAR PERGUNTA DO CLIENTE NO HISTÓRICO (PERSISTÊNCIA)
    if (session_id) {
      await supabase.from("chat_messages").insert({
        session_id: session_id,
        role: "user",
        content: lastUserMessage,
      });
    }

    const systemPrompt = `Você é o Vendedor do Balão da Informática.
DATA DE HOJE: ${new Date().toLocaleDateString("pt-BR")}.

REGRA DE OURO (LINKS):
- Você está PROIBIDO de inventar links.
- Copie EXATAMENTE o "LINK CORRETO" da lista de estoque abaixo.
- Formato obrigatório: [Nome do Produto](LINK_DA_LISTA)

SUA LISTA DE VENDAS AGORA:
${productContext}

INSTRUÇÕES:
1. Se a lista estiver vazia, diga que não temos esse modelo específico e pergunte se pode sugerir outro.
2. Seja curto, direto e use emojis.
3. Tente fechar a venda ("Posso separar pra você?").
`;

    // 5. CHAMADA AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.1, // Temperatura baixa para não alucinar
        stream: true,
      }),
    });

    // Tratamento de resposta para salvar a resposta do bot (opcional, requer leitura do stream)
    // Nota: Como é stream, salvar a resposta completa do bot no banco exige processar o stream no Frontend e salvar lá,
    // ou bufferizar aqui (o que atrasa a resposta).
    // RECOMENDAÇÃO: O Frontend deve salvar a resposta do bot no Supabase assim que ela terminar de chegar.

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders });
  }
});
