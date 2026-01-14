-- Rode este comando no SQL Editor do Supabase para corrigir o erro de importação
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT NULL;
