create table if not exists public.landing_page_configs (
  page_key text primary key,
  grid_query text not null default '',
  fallback_queries text[] not null default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.landing_page_configs enable row level security;

create policy "Acesso total a landing_page_configs"
on public.landing_page_configs for all
using (true)
with check (true);

