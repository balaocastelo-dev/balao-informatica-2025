create table if not exists public.landing_pages (
  page_key text primary key,
  label text not null,
  route text not null,
  active boolean not null default true,
  grid_query text not null default '',
  fallback_queries text[] not null default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.landing_pages enable row level security;

create policy "Acesso total a landing_pages"
on public.landing_pages for all
using (true)
with check (true);
