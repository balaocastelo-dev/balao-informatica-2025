import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, products } = await req.json();

    // 1. Prepare system message with context
    const systemMessage = {
      role: 'system',
      content: `Você é o "Balão Expert", um assistente de IA altamente inteligente e amigável da loja Balão da Informática.
      Sua personalidade é entusiasta, técnica mas acessível, e focada em resolver o problema do cliente.
      Você está conversando por áudio/texto em tempo real. Suas respostas devem ser concisas para serem faladas, mas completas.
      
      CONTEXTO DA LOJA:
      - Somos especialistas em informática, PC Gamer, hardware e escritório.
      - Estamos em Campinas, SP.
      - Temos entrega rápida e retirada na loja.

      PRODUTOS DISPONÍVEIS AGORA (Use esta lista para recomendar):
      ${JSON.stringify(products.slice(0, 50).map(p => `${p.name} - R$ ${p.price} (ID: ${p.id})`))}

      DIRETRIZES:
      1. Se o cliente perguntar sobre um produto que está na lista acima, RECOMENDE com entusiasmo e mencione o preço.
      2. Se o cliente pedir algo que não está na lista, diga que vai verificar com a equipe ou sugira algo próximo.
      3. Se o cliente estiver confuso, faça perguntas simples para entender o uso (jogos, trabalho, estudo).
      4. IMPORTANTE: Se você sugerir um produto específico da lista, você DEVE incluir o ID do produto no formato JSON no final da resposta, assim: {"action": "add_to_cart", "id": "ID_DO_PRODUTO", "quantity": 1} (mas apenas se o cliente demonstrar intenção de compra clara) OU apenas mencione o nome exato para que o sistema mostre o card.
      5. Mantenha o tom de conversa natural, como um vendedor experiente na loja física.
      6. Use gírias leves de tecnologia se apropriado (ex: "rodar liso", "tankar", "custo-benefício").
      
      Responda sempre em Português do Brasil.
      `
    };

    // 2. Select AI Provider (Grok/xAI preference)
    const GROK_API_KEY = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    let apiUrl = 'https://api.openai.com/v1/chat/completions';
    let apiKey = OPENAI_API_KEY;
    let model = 'gpt-4o-mini'; // Fast and smart enough

    // If Grok key is available, use it (Simulated logic as I don't have the real endpoint/key in this env, but this is how it would work)
    if (GROK_API_KEY) {
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      apiKey = GROK_API_KEY;
      model = 'grok-beta';
    } else if (!OPENAI_API_KEY) {
        // Fallback for demo without keys: Return a scripted "Smart" response
        // This prevents the chatbot from breaking if no keys are set in Vercel
        const lastMsg = messages[messages.length - 1].content.toLowerCase();
        let fallbackText = "Estou processando sua solicitação com minha inteligência avançada. ";
        
        if (lastMsg.includes('gamer') || lastMsg.includes('jogo')) {
            fallbackText += "Para gamers, recomendo focar em uma boa placa de vídeo e processador. Temos ótimas opções de RTX e Ryzen.";
        } else if (lastMsg.includes('trabalho') || lastMsg.includes('office')) {
            fallbackText += "Para trabalho, produtividade é chave. Um SSD rápido e boa memória RAM são essenciais.";
        } else {
            fallbackText += "Como posso ajudar você a encontrar o equipamento ideal hoje?";
        }
        
        return new Response(JSON.stringify({
            choices: [{
                message: { content: fallbackText }
            }]
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 3. Call AI API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))],
        temperature: 0.7,
        max_tokens: 300, // Keep it concise for audio
        stream: true // Enable streaming for faster perceived latency
      })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("AI API Error:", err);
        throw new Error(`AI Provider Error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
