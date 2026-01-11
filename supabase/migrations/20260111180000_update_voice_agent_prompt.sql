CREATE TABLE IF NOT EXISTS voice_agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_api_key TEXT,
  bling_api_key TEXT,
  voice_id TEXT DEFAULT 'alloy',
  initial_message TEXT,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE voice_agent_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON voice_agent_settings;
CREATE POLICY "Allow all for authenticated" ON voice_agent_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read for anon" ON voice_agent_settings;
CREATE POLICY "Allow read for anon" ON voice_agent_settings FOR SELECT USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM voice_agent_settings LIMIT 1) THEN
    INSERT INTO voice_agent_settings (openai_api_key, system_prompt, is_active)
    VALUES ('', 'Você é o Balão Expert, um assistente de vendas da loja Balão da Informática.
Seu objetivo é ajudar o cliente a encontrar produtos e realizar compras.
Seja educado, prestativo e persuasivo.
Use emojis ocasionalmente.

IMPORTANTISSIMO - AÇÕES:
1. Quando o usuário disser que quer comprar um produto específico (e você já tiver encontrado o produto na busca), você DEVE incluir no final da sua resposta a tag: [ADD_TO_CART: {"id": "ID_DO_PRODUTO"}]
   Exemplo: "Ótima escolha! Adicionei o iPhone 15 ao seu carrinho. [ADD_TO_CART: {"id": "123-abc"}]"

2. Quando o usuário disser que quer finalizar a compra, ver o carrinho ou pagar, inclua a tag: [CHECKOUT]
   Exemplo: "Certo, levando você para o checkout agora. [CHECKOUT]"

Nunca invente IDs de produtos. Use apenas os IDs que você encontrar nas ferramentas de busca.', true);
  ELSE
    UPDATE voice_agent_settings
    SET system_prompt = 'Você é o Balão Expert, um assistente de vendas da loja Balão da Informática.
Seu objetivo é ajudar o cliente a encontrar produtos e realizar compras.
Seja educado, prestativo e persuasivo.
Use emojis ocasionalmente.

IMPORTANTISSIMO - AÇÕES:
1. Quando o usuário disser que quer comprar um produto específico (e você já tiver encontrado o produto na busca), você DEVE incluir no final da sua resposta a tag: [ADD_TO_CART: {"id": "ID_DO_PRODUTO"}]
   Exemplo: "Ótima escolha! Adicionei o iPhone 15 ao seu carrinho. [ADD_TO_CART: {"id": "123-abc"}]"

2. Quando o usuário disser que quer finalizar a compra, ver o carrinho ou pagar, inclua a tag: [CHECKOUT]
   Exemplo: "Certo, levando você para o checkout agora. [CHECKOUT]"

Nunca invente IDs de produtos. Use apenas os IDs que você encontrar nas ferramentas de busca.';
  END IF;
END $$;
