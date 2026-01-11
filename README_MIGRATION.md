# Migração para Supabase Completo

Este documento descreve as mudanças realizadas para centralizar todos os dados no Supabase e remover dependências de dados mockados (hardcoded).

## Mudanças Realizadas

1.  **Schema de Banco de Dados**:
    *   Criado script de migração consolidado: `supabase/migrations/20260111160000_ensure_schema_and_seed.sql`.
    *   Garante a existência das tabelas `categories` e `products`.
    *   Adiciona colunas necessárias em `products` (ram_gb, storage_gb, etc).
    *   Insere dados iniciais (Seed) para Categorias e Produtos.

2.  **Frontend**:
    *   `src/data/mockProducts.ts`: **Removido**.
    *   `src/types/product.ts`: Removida constante `CATEGORIES`.
    *   `src/contexts/CategoryContext.tsx`: Refatorado para buscar categorias exclusivamente do Supabase.
    *   `src/components/ProductModal.tsx`: Atualizado para usar categorias dinâmicas do contexto.
    *   `src/config/categoryIcons.ts`: Criado para gerenciar ícones da UI baseados no slug da categoria.

## Como Aplicar

1.  Acesse o Dashboard do Supabase ou use a CLI.
2.  Execute o conteúdo do arquivo `supabase/migrations/20260111160000_ensure_schema_and_seed.sql` no SQL Editor.
    *   Isso irá criar as tabelas se não existirem e popular com os dados iniciais.

## Verificação

Após aplicar a migração:
1.  O site deve carregar as categorias no menu e na home vindas do banco.
2.  Os produtos devem aparecer na listagem.
3.  Novos produtos cadastrados via Admin ou Importação aparecerão normalmente.
