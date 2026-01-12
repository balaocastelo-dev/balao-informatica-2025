-- Consolidated Coupons Setup Migration
-- This script handles the complete setup for the coupons feature.
-- It is designed to be idempotent (can be run multiple times safely).

-- 1. Create the coupons table if it doesn't exist
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

-- 2. Enable Row Level Security (RLS)
alter table public.coupons enable row level security;

-- 3. Drop existing policies to ensure clean state and avoid conflicts
drop policy if exists "Coupons are viewable by everyone" on public.coupons;
drop policy if exists "Admins can manage coupons" on public.coupons;
drop policy if exists "Authenticated users can manage coupons" on public.coupons;

-- 4. Re-create Policies

-- Allow everyone (including anonymous users) to read active coupons
-- This is crucial for the checkout process to validate coupons
create policy "Coupons are viewable by everyone" 
on public.coupons for select 
using (true);

-- Allow authenticated users (Admins) to manage (insert, update, delete) coupons
-- In a real app with roles, you might want to check for 'admin' role specifically
create policy "Authenticated users can manage coupons" 
on public.coupons for all 
using (auth.role() = 'authenticated');

-- 5. Create or Replace the usage increment function
create or replace function public.increment_coupon_usage(coupon_id uuid)
returns void
language plpgsql
security definer -- Runs with privileges of the function creator (admin)
as $$
begin
  update public.coupons
  set usage_count = usage_count + 1
  where id = coupon_id;
end;
$$;

-- 6. Grant Permissions
-- Ensure the public and authenticated roles can use the table and function

grant select on public.coupons to anon;
grant select on public.coupons to authenticated;
grant select on public.coupons to service_role;

grant all on public.coupons to service_role;
grant all on public.coupons to authenticated; -- Allow admins to edit

grant execute on function public.increment_coupon_usage(uuid) to anon;
grant execute on function public.increment_coupon_usage(uuid) to authenticated;
grant execute on function public.increment_coupon_usage(uuid) to service_role;
grant execute on function public.increment_coupon_usage(uuid) to public;
