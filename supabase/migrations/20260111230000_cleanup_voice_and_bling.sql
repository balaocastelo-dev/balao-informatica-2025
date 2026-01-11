-- Drop tables for Voice Agent
DROP TABLE IF EXISTS public.voice_agent_settings;
DROP TABLE IF EXISTS public.voice_agent_documents;

-- Drop tables for Bling Integration
DROP TABLE IF EXISTS public.bling_integration;
DROP TABLE IF EXISTS public.bling_oauth_states;

-- Drop functions related to Voice Agent
DROP FUNCTION IF EXISTS public.upsert_voice_agent_settings;
DROP FUNCTION IF EXISTS public.get_voice_agent_settings;

-- Remove storage bucket for Voice Agent documents
-- Note: This might fail if the bucket is not empty, but usually deleting the bucket cascades or we need to empty it first.
-- Since we can't easily iterate objects in SQL to delete them, we try to delete the bucket. 
-- If it fails, the user might need to empty it manually, but usually `delete from storage.objects` works if policies allow.
DELETE FROM storage.objects WHERE bucket_id = 'agent-documents';
DELETE FROM storage.buckets WHERE id = 'agent-documents';

-- Drop policies on storage.objects related to Voice Agent
-- We use DO block to avoid errors if policies don't exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
