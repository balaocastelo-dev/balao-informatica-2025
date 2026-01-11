-- Fix: Bypass Table Schema Cache issues using RPCs (Security Definer functions)

-- 1. Function to Get Settings
CREATE OR REPLACE FUNCTION get_voice_agent_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT row_to_json(t) INTO result 
  FROM (
    SELECT 
      openai_api_key,
      bling_api_key,
      voice_id,
      model,
      initial_message,
      system_prompt,
      is_active
    FROM voice_agent_settings 
    LIMIT 1
  ) t;
  
  RETURN result;
END;
$$;

-- 2. Function to Upsert Settings
CREATE OR REPLACE FUNCTION upsert_voice_agent_settings(
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

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_voice_agent_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_voice_agent_settings TO anon;
GRANT EXECUTE ON FUNCTION get_voice_agent_settings TO service_role;

GRANT EXECUTE ON FUNCTION upsert_voice_agent_settings TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_voice_agent_settings TO service_role;
-- Do not grant upsert to anon for security, usually admin only. 
-- Assuming the user is authenticated as admin in the dashboard.
