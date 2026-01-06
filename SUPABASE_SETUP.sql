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

-- BLOG: Artigos e Comentários
create table if not exists public.blog_articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique,
  content text not null,
  cover_image_url text,
  author text,
  status text not null check (status in ('draft', 'published')),
  categories text[] default '{}'::text[],
  tags text[] default '{}'::text[],
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid not null references public.blog_articles(id) on delete cascade,
  author_name text,
  author_email text,
  content text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blog_articles enable row level security;
alter table public.blog_comments enable row level security;

-- Políticas simples: leitura pública de artigos publicados e comentários visíveis
create policy "Leitura pública de artigos publicados"
on public.blog_articles for select
using (status = 'published');

create policy "Leitura pública de comentários visíveis"
on public.blog_comments for select
using (status = 'visible');

-- Escrita aberta para artigos e comentários (ajuste em produção)
create policy "Escrita aberta de artigos"
on public.blog_articles for insert
with check (true);

create policy "Atualização aberta de artigos"
on public.blog_articles for update
using (true)
with check (true);

create policy "Exclusão aberta de artigos"
on public.blog_articles for delete
using (true);

create policy "Escrita aberta de comentários"
on public.blog_comments for insert
with check (true);

create policy "Acesso total a admin_chat_messages"
on public.admin_chat_messages for all
using (true)
with check (true);
