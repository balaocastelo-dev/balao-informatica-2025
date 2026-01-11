create table if not exists public.voice_agent_settings (
  id uuid primary key default gen_random_uuid(),
  openai_api_key text,
  bling_api_key text,
  voice_id text default 'alloy',
  initial_message text default 'Olá! Eu sou o assistente de vendas do Balão da Informática Anchieta. Como posso te ajudar hoje?',
  system_prompt text default 'Você é um agente de vendas especializado do Balão da Informática Anchieta...',
  is_active boolean default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- RLS for settings
alter table public.voice_agent_settings enable row level security;

create policy "Enable read access for all users"
on public.voice_agent_settings for select
using (true);

create policy "Enable insert for authenticated users only"
on public.voice_agent_settings for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on public.voice_agent_settings for update
using (auth.role() = 'authenticated');


-- Documents table
create table if not exists public.voice_agent_documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  file_path text not null,
  content_text text, -- Extracted text
  content_type text,
  size_bytes bigint,
  created_at timestamp with time zone not null default now()
);

-- RLS for documents
alter table public.voice_agent_documents enable row level security;

create policy "Enable read access for all users"
on public.voice_agent_documents for select
using (true);

create policy "Enable insert for authenticated users only"
on public.voice_agent_documents for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
on public.voice_agent_documents for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
on public.voice_agent_documents for delete
using (auth.role() = 'authenticated');

-- Storage Bucket for Documents
insert into storage.buckets (id, name, public) 
values ('agent-documents', 'agent-documents', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'agent-documents' );

create policy "Auth Upload"
on storage.objects for insert
with check ( bucket_id = 'agent-documents' and auth.role() = 'authenticated' );

create policy "Auth Delete"
on storage.objects for delete
using ( bucket_id = 'agent-documents' and auth.role() = 'authenticated' );
