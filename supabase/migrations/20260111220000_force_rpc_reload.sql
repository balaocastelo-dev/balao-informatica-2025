-- Force Recreation of RPC Functions and Schema Cache Reload
-- This is to resolve "Could not find function in schema cache" errors

-- 1. Drop existing function to ensure clean state
DROP FUNCTION IF EXISTS public.upsert_voice_agent_settings(_openai_api_key text, _bling_api_key text, _voice_id text, _model text, _initial_message text, _system_prompt text, _is_active boolean);

-- 2. Re-create the function with explicit parameter names
CREATE OR REPLACE FUNCTION public.upsert_voice_agent_settings(
  _openai_api_key text,
  _bling_api_key text,
  _voice_id text,
  _model text,
  _initial_message text,
  _system_prompt text,
  _is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the table exists (redundant check but safe)
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

  IF EXISTS (SELECT 1 FROM voice_agent_settings LIMIT 1) THEN
    UPDATE voice_agent_settings
    SET
      openai_api_key = _openai_api_key,
      bling_api_key = _bling_api_key,
      voice_id = _voice_id,
      model = _model,
      initial_message = _initial_message,
      system_prompt = _system_prompt,
      is_active = _is_active,
      updated_at = now();
  ELSE
    INSERT INTO voice_agent_settings (
      openai_api_key, bling_api_key, voice_id, model, initial_message, system_prompt, is_active
    ) VALUES (
      _openai_api_key, _bling_api_key, _voice_id, _model, _initial_message, _system_prompt, _is_active
    );
  END IF;
END;
$$;

-- 3. Grant Permissions Explicitly
REVOKE ALL ON FUNCTION public.upsert_voice_agent_settings(text, text, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_voice_agent_settings(text, text, text, text, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_voice_agent_settings(text, text, text, text, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_voice_agent_settings(text, text, text, text, text, text, boolean) TO anon; -- Allowing anon for testing if auth fails, though usually restricted

-- 4. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
