import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://eossaxfosnmtjksefekk.supabase.co';
const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2fOzpgED10xOerEYIN7WRg_vrpvCC6M';
const supabase = createClient(url, anon);

function describeError(err) {
  if (!err) return "Erro desconhecido";
  const code = err?.code || err?.status || "";
  const message = err?.message || err?.error || "";
  const details = err?.details || "";
  const hint = err?.hint || "";
  const parts = [];
  if (message) parts.push(message);
  if (code) parts.push(`Código: ${code}`);
  if (details) parts.push(`Detalhes: ${details}`);
  if (hint) parts.push(`Hint: ${hint}`);
  return parts.join(" | ") || "Erro desconhecido";
}

async function run() {
  console.log("[Check] Verificando tabela product_ribbons...");
  const { data, error } = await supabase.from('product_ribbons').select('count(*)');
  if (error) {
    console.error("[Check] Erro ao acessar product_ribbons:", describeError(error));
    process.exit(1);
  }
  console.log("[Check] OK. Tabela acessível.");
  console.log("[Check] count(*) =", data);
}

run().catch(err => {
  console.error("[Check] Falha geral:", err?.message || err);
  process.exit(1);
});

