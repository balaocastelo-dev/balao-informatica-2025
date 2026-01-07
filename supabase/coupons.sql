create type if not exists public.discount_type as enum ('percentage', 'fixed');

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type public.discount_type not null,
  discount_value numeric not null check (discount_value > 0),
  min_order_value numeric,
  max_discount_value numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  usage_count integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists coupons_code_idx on public.coupons (lower(code));

alter table public.coupons enable row level security;

create policy "Select only active coupons"
  on public.coupons
  for select
  using (active = true);

create policy "Insert coupons only by admin"
  on public.coupons
  for insert
  to authenticated
  with check (public.has_role('admin', auth.uid()));

create policy "Update coupons only by admin"
  on public.coupons
  for update
  to authenticated
  using (public.has_role('admin', auth.uid()))
  with check (public.has_role('admin', auth.uid()));

create policy "Delete coupons only by admin"
  on public.coupons
  for delete
  to authenticated
  using (public.has_role('admin', auth.uid()));
