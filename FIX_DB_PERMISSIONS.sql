-- GRANT PERMISSIONS (Forçar permissões de acesso)
-- Execute este script para garantir que o usuário anônimo (seu site) consiga acessar as tabelas

-- 1. Garante uso do esquema public
grant usage on schema public to anon, authenticated, service_role;

-- 2. Garante acesso total à tabela admin_users
grant select, insert, update, delete on public.admin_users to anon, authenticated, service_role;

-- 3. Garante acesso total à tabela admin_chat_messages
grant select, insert, update, delete on public.admin_chat_messages to anon, authenticated, service_role;

-- 4. Garante acesso a sequências (necessário para IDs auto-incremento se houver, embora estejamos usando UUID)
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

-- 5. Reforça as Políticas de Segurança (RLS)
alter table public.admin_users enable row level security;
alter table public.admin_chat_messages enable row level security;

-- Remove políticas antigas para evitar duplicação/conflito
drop policy if exists "Acesso total a admin_users" on public.admin_users;
drop policy if exists "Acesso total a admin_chat_messages" on public.admin_chat_messages;

-- Cria políticas novas permissivas
create policy "Acesso total a admin_users"
on public.admin_users for all
using (true)
with check (true);

create policy "Acesso total a admin_chat_messages"
on public.admin_chat_messages for all
using (true)
with check (true);
