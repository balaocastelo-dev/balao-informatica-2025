
-- Create bling_settings table
CREATE TABLE IF NOT EXISTS public.bling_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  code TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bling_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin only (assuming admin check is done via application logic or specific role)
-- For now, allow authenticated users to view/edit (assuming only admins have access to the admin panel where this is used)
CREATE POLICY "Allow authenticated users to manage bling settings"
ON public.bling_settings
FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at
CREATE TRIGGER update_bling_settings_updated_at
BEFORE UPDATE ON public.bling_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
