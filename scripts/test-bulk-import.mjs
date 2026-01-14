import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://eossaxfosnmtjksefekk.supabase.co';
const DEFAULT_ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2fOzpgED10xOerEYIN7WRg_vrpvCC6M';
const supabase = createClient(DEFAULT_URL, DEFAULT_ANON);

const sample = [
  {
    name: 'Placa de Vídeo RTX 3060 12GB',
    description: null,
    price: 1899.90,
    costPrice: 1500.00,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&h=500&fit=crop',
    category: 'placa-de-video',
    stock: 5,
    sourceUrl: 'https://exemplo.com/produtos/rtx3060',
    tags: ['nvidia', 'badge:Promoção'],
  },
  {
    name: 'Monitor LG 24" 75Hz',
    description: null,
    price: 799.00,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop',
    category: 'monitores',
    stock: 8,
    sourceUrl: null,
    tags: ['lg', 'badge:Última Peça'],
  },
  {
    name: '',
    description: null,
    price: 0,
    image: '',
    category: '',
    stock: 0,
    sourceUrl: null,
    tags: [],
  }
];

async function run() {
  console.log('[Test] Iniciando teste de bulk insert simples sem contexto...');
  const accepted = sample.filter(p => p.name && p.price > 0 && p.category);
  const payload = accepted.map(p => ({
    name: p.name,
    description: p.description || null,
    price: p.price,
    cost_price: p.costPrice || null,
    image: p.image || null,
    category: p.category,
    stock: p.stock || 0,
    source_url: p.sourceUrl || null,
    tags: Array.isArray(p.tags) ? p.tags : null,
  }));
  const { data, error } = await supabase.from('products').insert(payload).select();
  if (error) {
    console.error('[Test] Erro ao inserir produtos:', error);
    process.exit(1);
  }
  console.log('[Test] Inseridos:', data.length);
  for (const row of data) {
    const ribbons = (row.tags || []).filter(t => typeof t === 'string' && t.startsWith('badge:')).map(t => t.replace(/^badge:/, '').trim());
    if (ribbons.length > 0) {
      const { error: rerr } = await supabase
        .from('product_ribbons')
        .upsert(
          ribbons.map(r => ({ product_id: row.id, ribbon_type: r, is_active: true })),
          { onConflict: 'product_id,ribbon_type' }
        );
      if (rerr) {
        console.error('[Test] Erro ao persistir ribbons:', rerr);
        process.exit(1);
      }
      console.log(`[Test] Ribbons aplicadas ao produto ${row.id}:`, ribbons);
    }
  }
  console.log('[Test] OK');
}

run().catch(err => {
  console.error('[Test] Falha geral:', err);
  process.exit(1);
});

