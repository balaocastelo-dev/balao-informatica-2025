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
    const { messages, session_id, voice_mode } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Settings
    const { data: settings } = await supabase
      .from("voice_agent_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const apiKey = settings?.openai_api_key; // Use user provided key
    const blingKey = settings?.bling_api_key;
    const systemPrompt = settings?.system_prompt || "Você é um assistente útil.";
    const initialMessage = settings?.initial_message;

    // 2. Fetch Context (PDFs)
    const { data: docs } = await supabase
      .from("voice_agent_documents")
      .select("content_text")
      .not("content_text", "is", null);

    const contextText = docs?.map((d: any) => d.content_text).join("\n\n") || "";
    
    // 3. Construct System Message with Context
    const fullSystemPrompt = `${systemPrompt}\n\nCONTEXTO DOS DOCUMENTOS:\n${contextText}\n\nSe a resposta estiver no contexto, use-o. Caso contrário, use seu conhecimento.`;

    // 4. OpenAI Call (using fetch)
    if (!apiKey) {
       // Fallback if no key provided
       return new Response(JSON.stringify({ reply: "Erro: API Key não configurada no Admin." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Define Tools
    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description: "Search for products in the database by name or category",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_order",
          description: "Create a sales order for a customer",
          parameters: {
            type: "object",
            properties: {
              customer_name: { type: "string" },
              items: { 
                type: "array", 
                items: { 
                  type: "object",
                  properties: {
                    product_id: { type: "string" },
                    quantity: { type: "number" }
                  }
                } 
              }
            },
            required: ["items"],
          },
        },
      },
    ];

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Fast and cheap
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages
        ],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
      }),
    });

    const openAIJson = await openAIResponse.json();
    const choice = openAIJson.choices?.[0];
    const message = choice?.message;

    let reply = message?.content || "Desculpe, não consegui processar sua solicitação.";

    // Handle Tool Calls
    if (message?.tool_calls) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "search_products") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Execute search
        const { data: products } = await supabase
          .from("products")
          .select("id, name, price, stock")
          .ilike("name", `%${args.query}%`)
          .limit(5);
        
        const productInfo = products?.map((p: any) => `${p.name} - R$ ${p.price} (Estoque: ${p.stock})`).join("\n") || "Nenhum produto encontrado.";
        
        // Call LLM again with tool output
        const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: fullSystemPrompt },
              ...messages,
              message,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: productInfo
              }
            ],
          }),
        });
        
        const secondJson = await secondResponse.json();
        reply = secondJson.choices?.[0]?.message?.content || reply;
      } else if (toolCall.function.name === "create_order") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Mock Order Creation or Call Bling
        let orderResult = "Erro ao criar pedido.";
        if (blingKey) {
           // Here we would call Bling API
           // const blingRes = await fetch('https://bling.com.br/Api/v2/pedido/json', ...)
           orderResult = `Pedido criado com sucesso no Bling! (Simulação com chave configurada). Itens: ${JSON.stringify(args.items)}`;
        } else {
           orderResult = "Pedido anotado, mas não enviado ao Bling (Chave não configurada).";
        }
        
        const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: fullSystemPrompt },
              ...messages,
              message,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: orderResult
              }
            ],
          }),
        });
        
        const secondJson = await secondResponse.json();
        reply = secondJson.choices?.[0]?.message?.content || reply;
      }
    }

    // 5. Bling Integration Logic (Simplified)

    // 5. Bling Integration Logic (Simplified)
    // If the reply indicates a sale, we would trigger Bling.
    // For now, let's just log it.
    
    // Return JSON
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: "Erro interno", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
