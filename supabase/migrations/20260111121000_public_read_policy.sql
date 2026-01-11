-- Allow public read access to mercadopago_public_key
create policy "Public can read public keys"
on public.store_settings
for select
using (key = 'mercadopago_public_key');
