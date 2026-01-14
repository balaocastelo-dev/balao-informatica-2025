-- Create table for product ribbons (visual badges)
create table if not exists public.product_ribbons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  ribbon_type text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- Helpful index and uniqueness to avoid duplicates per product/type
create index if not exists product_ribbons_product_idx on public.product_ribbons (product_id);
create unique index if not exists product_ribbons_unique on public.product_ribbons (product_id, ribbon_type);

-- Enable RLS and allow public read; writes aligned to existing pattern (open) for admin UI
alter table public.product_ribbons enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_ribbons' and policyname = 'Ribbons are viewable by everyone'
  ) then
    create policy "Ribbons are viewable by everyone" on public.product_ribbons for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_ribbons' and policyname = 'Anyone can insert ribbons'
  ) then
    create policy "Anyone can insert ribbons" on public.product_ribbons for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_ribbons' and policyname = 'Anyone can update ribbons'
  ) then
    create policy "Anyone can update ribbons" on public.product_ribbons for update using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_ribbons' and policyname = 'Anyone can delete ribbons'
  ) then
    create policy "Anyone can delete ribbons" on public.product_ribbons for delete using (true);
  end if;
end $$;

