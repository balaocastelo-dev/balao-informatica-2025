create table if not exists public.menu_items (
  slug text primary key,
  name text not null,
  route text not null,
  order_index integer not null default 0,
  active boolean not null default true,
  image_url text
);

alter table public.menu_items enable row level security;

create policy "Acesso total a menu_items"
on public.menu_items for all
using (true)
with check (true);
