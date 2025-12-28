-- Tabela de Usuários Administrativos (Funcionários e Admins)
create table if not exists public.admin_users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null, -- Em produção, use hash!
  name text not null,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Mensagens do Chat
create table if not exists public.admin_chat_messages (
  id uuid default gen_random_uuid() primary key,
  sender_name text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configuração de Realtime para o Chat
-- Habilita o realtime para a tabela de mensagens
alter publication supabase_realtime add table public.admin_chat_messages;

-- Inserir usuário Admin inicial (se não existir)
-- Login: admin / Senha: admin123
insert into public.admin_users (username, password, name, role)
values ('admin', 'admin123', 'Administrador Principal', 'admin')
on conflict (username) do nothing;

-- POLÍTICAS DE SEGURANÇA (RLS)
-- Como estamos usando um sistema de login customizado simples (sem Supabase Auth completo),
-- precisamos permitir acesso público (anon) a essas tabelas para que a aplicação funcione.
-- Em um cenário ideal, você integraria isso com o auth.users do Supabase.

alter table public.admin_users enable row level security;
alter table public.admin_chat_messages enable row level security;

-- Permitir leitura e escrita para todos (necessário pois o login é feito via tabela customizada)
create policy "Acesso total a admin_users"
on public.admin_users for all
using (true)
with check (true);

create policy "Acesso total a admin_chat_messages"
on public.admin_chat_messages for all
using (true)
with check (true);
