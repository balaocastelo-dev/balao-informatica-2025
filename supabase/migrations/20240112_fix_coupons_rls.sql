-- Fix RLS policies for coupons table

-- Drop existing policies to avoid conflicts
drop policy if exists "Coupons are viewable by everyone" on public.coupons;
drop policy if exists "Admins can manage coupons" on public.coupons;

-- Enable RLS
alter table public.coupons enable row level security;

-- Policy for reading coupons (Public access required for checkout)
create policy "Coupons are viewable by everyone" 
on public.coupons for select 
using (true);

-- Policy for managing coupons (Authenticated users only - Admins)
create policy "Authenticated users can manage coupons" 
on public.coupons for all 
using (auth.role() = 'authenticated');

-- Ensure the increment function exists and is accessible
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

-- Grant execute permission on the function to public (so it can be called during checkout)
grant execute on function public.increment_coupon_usage(uuid) to public;
grant execute on function public.increment_coupon_usage(uuid) to anon;
grant execute on function public.increment_coupon_usage(uuid) to authenticated;
grant execute on function public.increment_coupon_usage(uuid) to service_role;
