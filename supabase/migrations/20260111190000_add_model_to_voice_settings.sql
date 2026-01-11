alter table public.voice_agent_settings 
add column if not exists model text default 'gpt-4o-mini';
