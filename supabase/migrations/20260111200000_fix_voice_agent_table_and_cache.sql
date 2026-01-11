-- Fix Voice Agent Tables and Schema Cache
-- This migration ensures tables exist, have correct columns, and forces a schema cache reload

-- 1. Ensure voice_agent_settings table exists
CREATE TABLE IF NOT EXISTS public.voice_agent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_api_key text,
  bling_api_key text,
  voice_id text DEFAULT 'alloy',
  model text DEFAULT 'gpt-4o-mini',
  initial_message text,
  system_prompt text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Ensure columns exist (idempotent checks)
DO $$
BEGIN
    -- Check for model column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_agent_settings' AND column_name = 'model') THEN
        ALTER TABLE public.voice_agent_settings ADD COLUMN model text DEFAULT 'gpt-4o-mini';
    END IF;
    
    -- Check for bling_api_key column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_agent_settings' AND column_name = 'bling_api_key') THEN
        ALTER TABLE public.voice_agent_settings ADD COLUMN bling_api_key text;
    END IF;

    -- Check for system_prompt column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_agent_settings' AND column_name = 'system_prompt') THEN
        ALTER TABLE public.voice_agent_settings ADD COLUMN system_prompt text;
    END IF;
END $$;

-- 3. Ensure voice_agent_documents table exists
CREATE TABLE IF NOT EXISTS public.voice_agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  content_text text,
  content_type text,
  size_bytes bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Grant Permissions (Crucial for PostgREST visibility)
GRANT ALL ON TABLE public.voice_agent_settings TO authenticated;
GRANT ALL ON TABLE public.voice_agent_settings TO service_role;
GRANT SELECT ON TABLE public.voice_agent_settings TO anon;

GRANT ALL ON TABLE public.voice_agent_documents TO authenticated;
GRANT ALL ON TABLE public.voice_agent_documents TO service_role;
GRANT SELECT ON TABLE public.voice_agent_documents TO anon;

-- 5. Refresh RLS Policies
ALTER TABLE public.voice_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_agent_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts before recreating
DROP POLICY IF EXISTS "Enable read access for all users" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Allow read for anon" ON public.voice_agent_settings;

-- Create unified policies
CREATE POLICY "Public Read Access" ON public.voice_agent_settings FOR SELECT USING (true);
CREATE POLICY "Auth Full Access" ON public.voice_agent_settings FOR ALL USING (auth.role() = 'authenticated');

-- Documents policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.voice_agent_documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.voice_agent_documents;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.voice_agent_documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.voice_agent_documents;

CREATE POLICY "Public Read Access Docs" ON public.voice_agent_documents FOR SELECT USING (true);
CREATE POLICY "Auth Full Access Docs" ON public.voice_agent_documents FOR ALL USING (auth.role() = 'authenticated');

-- 6. Reload PostgREST Schema Cache
-- This is often necessary when tables are created/modified and API throws "Could not find the table in the schema cache"
NOTIFY pgrst, 'reload config';
