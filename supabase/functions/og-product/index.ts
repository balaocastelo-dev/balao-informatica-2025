import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(url, key);

function formatBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function html({ title, description, image, pageUrl, type }: { title: string; description: string; image: string; pageUrl: string; type: string }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Balão da Informática">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<script>window.location.href = "${pageUrl}";</script>
</head>
<body>
  <p>Redirecionando para <a href="${pageUrl}">${title}</a>...</p>
</body>
</html>`;
}

serve(async (req) => {
  const u = new URL(req.url);
  const id = u.searchParams.get("id");
  const host = u.searchParams.get("host") || "https://www.balao.info";
  if (!id) {
    return new Response("missing id", { status: 400 });
  }
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !data) {
    return new Response("not found", { status: 404 });
  }
  const price = typeof data.price === "number" ? data.price : Number(data.price || 0);
  const title = `${data.name} - ${formatBRL(price)} | Balão da Informática`;
  const descBase = data.description || data.name;
  const description = `${formatBRL(price)} • ${descBase}`;
  const image = data.image || "https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png";
  
  // Resolve relative images
  const finalImage = image.startsWith('/') 
    ? `https://www.balao.info${image}`
    : image;

  const pageUrl = `${host}/produto/${data.id}`;
  const body = html({ title, description, image: finalImage, pageUrl, type: "product" });
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=900" },
  });
});

