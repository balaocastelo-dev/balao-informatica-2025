create table if not exists public.landing_page_assets (
  page_key text primary key,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.landing_page_assets enable row level security;

create policy "Acesso total a landing_page_assets"
on public.landing_page_assets for all
using (true)
with check (true);

