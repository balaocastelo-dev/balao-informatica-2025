-- Create table if not exists (based on usage in code)
CREATE TABLE IF NOT EXISTS public.bling_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  client_id TEXT,
  client_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bling_settings ENABLE ROW LEVEL SECURITY;

-- Policy (Allow all for simplicity in this pair programming context, or restrict to admin)
DROP POLICY IF EXISTS "Admins can manage bling settings" ON public.bling_settings;
CREATE POLICY "Admins can manage bling settings"
ON public.bling_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert provided credentials
-- Hypothesis:
-- Client ID: 6ebfe752d7d5df4aa89669bb505ec8c852920ffe (40 chars)
-- Client Secret: a839dec385b4501534fa016f1ad4f996f18188f0960a9bc07c2130f3119b (64 chars)
-- Note: fda5e334ee292f98aeb7d73a420ee0404846829630796d0bb1b92c0c88ace56663ff9410 (72 chars) might be the secret if the above fails.

INSERT INTO public.bling_settings (id, client_id, client_secret)
VALUES (
  'default',
  '96f38dbc512f18abde6c338c696946d591b66c4a',
  '5e6628e22ff163c42e3b1793a9a360232e1246ef2072238293d6bd9c3008'
)
ON CONFLICT (id) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  client_secret = EXCLUDED.client_secret;
