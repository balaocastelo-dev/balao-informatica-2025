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
    const { messages, session_id } = await req.json();

    // Configuração do Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Salvar mensagem do usuário
    const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === "user")?.content || "";
    if (session_id && lastUserMessage) {
      await supabase.from("chat_messages").insert({
        session_id: session_id,
        role: "user",
        content: lastUserMessage,
      });
    }

    // TODO: Implementar integração com OpenAI ou Gemini diretamente aqui.
    // A integração anterior com Lovable foi removida conforme solicitado.
    
    const responseText = "O assistente de IA está temporariamente indisponível. Por favor, entre em contato pelo WhatsApp.";

    // Retornar resposta simples (não-stream para simplificar, ou stream simulado)
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Simular formato SSE do OpenAI para compatibilidade com o frontend existente
        const data = JSON.stringify({ choices: [{ delta: { content: responseText } }] });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders });
  }
});
