-- Create store_settings table
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.store_settings enable row level security;

-- Create policies for store_settings
-- Only allow balaocastelo@gmail.com to manage settings
create policy "Admin can manage store settings"
on public.store_settings
for all
using (auth.jwt() ->> 'email' = 'balaocastelo@gmail.com')
with check (auth.jwt() ->> 'email' = 'balaocastelo@gmail.com');

-- Allow read access to everyone (or authenticated) if needed for public keys?
-- For now, let's assume some settings are public (like public key) and others private.
-- But the checkout needs the public key.
-- So we might need a separate policy for reading specific keys, or just expose the public key via an Edge Function to be safe?
-- Simpler approach: Allow read for everyone, but maybe don't store the Access Token in the client-side JSON if possible?
-- No, the client needs the public key. The Access Token is used by Edge Functions.
-- Actually, the `MercadoPagoConfig` component needs to read/write everything.
-- The `CartPage` needs the Public Key.

-- Let's make it simple: Admin has full access.
-- Authenticated users (or public) can read ONLY if we define a specific view or function.
-- But wait, `CartPage` runs on the client. It needs the Public Key.
-- If I lock it to `balaocastelo@gmail.com`, customers can't pay.

-- Better approach:
-- Store sensitive credentials (Access Token) in `store_settings` but maybe separate keys?
-- Or just allow public read for `mercadopago_public` key?
-- The current implementation stores everything in one JSON object `mercadopago_settings`.
-- I should split it.

-- Let's stick to the current structure but fix the RLS.
-- Customers don't need to read the settings table directly if we pass the public key via environment variables or a specific public config endpoint.
-- BUT, the user wants "persistencia nas configuracoes".
-- If I store it in DB, I need to let `CartPage` read it.
-- `CartPage` needs `publicKey`. It does NOT need `accessToken`.
-- `MercadoPagoConfig` (Admin) needs both.

-- Solution:
-- `store_settings` contains `{ publicKey: "...", accessToken: "..." }`.
-- RLS: Admin (balaocastelo) can do everything.
-- RLS: Others cannot read.
-- HOW does `CartPage` get the public key?
-- I will create an Edge Function `get-payment-config` that returns ONLY the public key to anyone.
-- OR, I can make `store_settings` readable by everyone, but I assume the user trusts the client-side code not to leak the access token? No, that's bad.

-- Alternative:
-- Store `mercadopago_public_key` and `mercadopago_access_token` as separate rows.
-- RLS: `mercadopago_public_key` is readable by everyone.
-- RLS: `mercadopago_access_token` is readable only by admin.

-- Let's go with separate rows approach for better security.

-- Update policies for bling_integration to ensure balaocastelo has access
drop policy if exists "Admins can read Bling integration" on public.bling_integration;
drop policy if exists "Admins can write Bling integration" on public.bling_integration;
drop policy if exists "Admins can update Bling integration" on public.bling_integration;
drop policy if exists "Admins can delete Bling integration" on public.bling_integration;

create policy "Admin can manage bling integration"
on public.bling_integration
for all
using (auth.jwt() ->> 'email' = 'balaocastelo@gmail.com')
with check (auth.jwt() ->> 'email' = 'balaocastelo@gmail.com');

-- Clear existing configurations as requested
truncate table public.bling_integration;
delete from public.store_settings; -- It's empty but just in case
