alter table if exists public.landing_page_configs
  add column if not exists label text,
  add column if not exists route text,
  add column if not exists active boolean default true;

-- Keep existing RLS/policies; just ensure table still accessible

