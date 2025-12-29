create table if not exists public.bling_integration (
  id text primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.bling_integration enable row level security;

create policy "Admins can read Bling integration"
on public.bling_integration
for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can write Bling integration"
on public.bling_integration
for insert
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update Bling integration"
on public.bling_integration
for update
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete Bling integration"
on public.bling_integration
for delete
using (public.has_role(auth.uid(), 'admin'));

create trigger update_bling_integration_updated_at
before update on public.bling_integration
for each row
execute function public.update_updated_at_column();

create table if not exists public.bling_oauth_states (
  state text primary key,
  created_by uuid references auth.users(id) on delete cascade not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now()
);

alter table public.bling_oauth_states enable row level security;

create policy "Admins can manage oauth states"
on public.bling_oauth_states
for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

