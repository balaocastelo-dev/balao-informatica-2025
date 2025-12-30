import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://eossaxfosnmtjksefekk.supabase.co';
const DEFAULT_ANON = 'sb_publishable_2fOzpgED10xOerEYIN7WRg_vrpvCC6M';

const args = process.argv.slice(2);
const [pageKey, label, route, grid, fallbackRaw] = args;

if (!pageKey) {
  console.error('Uso: node scripts/seed-landing.mjs <pageKey> <label> <route> <grid> <fallbacksComma>');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_ANON;
const supabase = createClient(supabaseUrl, supabaseKey);

const payload = {
  page_key: pageKey,
  label: label || pageKey,
  route: route || `/lp/${pageKey}`,
  grid_query: grid || '',
  fallback_queries: (fallbackRaw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const run = async () => {
  const { data, error } = await supabase
    .from('landing_page_configs')
    .upsert({
      page_key: payload.page_key,
      grid_query: payload.grid_query,
      fallback_queries: payload.fallback_queries,
      updated_at: payload.updated_at,
      created_at: payload.created_at,
    }, { onConflict: 'page_key' })
    .select();
  if (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
  console.log('OK:', data);
};

run();
