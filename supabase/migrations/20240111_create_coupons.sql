-- Create coupons table
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null,
  min_order_value numeric,
  max_discount_value numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  usage_count integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Create RLS policies
alter table public.coupons enable row level security;

create policy "Coupons are viewable by everyone" on public.coupons
  for select using (true);

create policy "Admins can manage coupons" on public.coupons
  for all using (true); -- Adjust for real auth roles

-- Function to increment usage count safely
create or replace function public.increment_coupon_usage(coupon_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.coupons
  set usage_count = usage_count + 1
  where id = coupon_id;
end;
$$;
