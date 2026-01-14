# Balão da Informática 2025

Este projeto é a plataforma de e-commerce do Balão da Informática, desenvolvida com React, Vite, TypeScript e Supabase.

## Configuração do Projeto

### Pré-requisitos

- Node.js & npm
- Conta no Supabase

### Instalação

1. Clone o repositório:
```sh
git clone https://github.com/balaocastelo-dev/balao-informatica-2025.git
cd balao-informatica-2025
```

2. Instale as dependências:
```sh
npm install
```

3. Inicie o servidor de desenvolvimento:
```sh
npm run dev
```

## Configuração do Supabase (Autenticação)

Para que o login com Google funcione corretamente e redirecione para o seu domínio (localhost ou Vercel), você precisa configurar as URLs de redirecionamento no painel do Supabase:

1. Acesse seu projeto no Supabase Dashboard.
2. Vá em **Authentication** > **URL Configuration**.
3. Em **Site URL**, coloque a URL principal do seu site (ex: `https://seu-projeto.vercel.app`).
4. Em **Redirect URLs**, adicione todas as URLs permitidas, incluindo:
   - `http://localhost:5173` (para desenvolvimento local)
   - `https://seu-projeto.vercel.app` (para produção)
   - `https://www.balao.info` (se houver domínio personalizado)

**Importante:** Remova qualquer URL antiga que aponte para `lovable.app` se não quiser mais usar aquele ambiente.

## Deploy

O projeto está configurado para deploy na Vercel. Basta conectar este repositório à sua conta Vercel.

## Tecnologias

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Auth, Database, Edge Functions)

## Manual do Administrador: Ribbons na Importação em Massa

- Acesse Administração > Importação em Massa.
- Informe os produtos em texto (URL da imagem + Nome + Preço) e configure:
  - Categoria (auto ou seleção/criação).
  - Etiquetas padrão (tags) para todos os itens.
  - Ribbon (obrigatória): selecione “Promoção”, “Usado”, “Última Peça” ou “Personalizada…” e informe o texto.
- Clique em “Analisar Produtos” e depois “Confirmar Importação”.
- As ribbons são persistidas em `product_ribbons` e exibidas como faixas de destaque nos cards da homepage.
- Em caso de erro de dados, o sistema sinaliza itens inválidos com mensagem e não os importa.

## Função de Importação em Massa (bulkImportProducts)

Parâmetros:
- products: lista de produtos a serem importados (name, price, category obrigatórios)
- onProgress?: callback de progresso (current, total)

Retorno:
- Promise<void> com toasts de feedback e logs no console

Validações:
- Nome não vazio
- Preço numérico > 0
- Categoria não vazia
- Remoção de duplicados no lote (por nome sem source_url e por source_url)

Ribbons:
- Derivadas de tags que começam com `badge:` (ex.: `badge:Promoção`)
- Persistência em `product_ribbons` com `upsert` e unicidade por produto/tipo

Códigos de erro e logs:
- Erros de inserção/atualização registrados via `console.error`
- Sumário no final com contagem de sucesso/falhas

Exemplo de uso:
```ts
const { bulkImportProducts } = useProducts();
await bulkImportProducts(lista, (current, total) => {
  // atualizar UI de progresso
});
```
