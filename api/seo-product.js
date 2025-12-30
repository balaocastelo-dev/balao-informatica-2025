import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const supabase = getSupabaseClient();

  const isBot = (ua) => {
    if (!ua) return false;
    return /facebookexternalhit|WhatsApp|Twitterbot|Slackbot|TelegramBot|Discordbot|LinkedInBot|Googlebot|bingbot|DuckDuckGo|Pinterest|Yahoo|Applebot/i.test(
      ua,
    );
  };
  const formatBRL = (n) => {
    const num = typeof n === 'number' ? n : Number(n || 0);
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    } catch {
      return `R$ ${num.toFixed(2)}`;
    }
  };

  const buildOgImage = (raw) => {
    if (!raw || typeof raw !== 'string') return raw;
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) return raw;
    const noProto = raw.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(noProto)}&w=1200&h=630&fit=contain&bg=ffffff`;
  };
  
  // Helper to fetch index.html
  const getIndexHtml = async () => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;
    
    // Add User-Agent to avoid blocks and handle potential 401/403
    const response = await fetch(`${appUrl}/index.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch index.html: ${response.status}`);
    }
    
    return await response.text();
  };

  try {
    // For navegadores humanos, pule SSR para evitar loops de rewrite
    if (!isBot(userAgent)) {
      const fallbackUrl = id ? `/produto/${id}?ssr=false` : '/?ssr=false';
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.redirect(307, fallbackUrl);
    }

    if (!supabase) throw new Error('Missing Supabase env vars (SUPABASE_URL and SUPABASE_ANON_KEY)');
    // 1. Fetch product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    let html = await getIndexHtml();
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;

    if (product) {
      const title = `${product.name} | Balão da Informática`;
      // Clean description: remove HTML tags if any, limit length
      const cleanDescriptionRaw = product.description 
        ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 200).replace(/"/g, '&quot;') 
        : `Compre ${product.name} na Balão da Informática.`;
      const priceStr = formatBRL(product.price);
      const cleanDescription = `${priceStr} • ${cleanDescriptionRaw}`;
      
      const rawImage = product.image || 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png';
      const image = buildOgImage(rawImage);
      const url = `${appUrl}/produto/${id}`;
      const price = product.price ? product.price.toString() : '0';

      // Replace Title
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      
      // Extended Meta Tags for better Facebook/WhatsApp support
      const tags = {
        'og:title': title,
        'og:description': cleanDescription,
        'og:image': image,
        'og:image:secure_url': image,
        'og:image:width': '1200', // Recommended by FB
        'og:image:height': '630', // Recommended by FB (1.91:1 ratio)
        'og:image:alt': product.name,
        'og:url': url,
        'og:type': 'product',
        'og:site_name': 'Balão da Informática',
        'og:locale': 'pt_BR',
        'product:price:amount': price,
        'product:price:currency': 'BRL',
        'product:retailer_item_id': id,
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': cleanDescription,
        'twitter:image': image,
        'description': cleanDescription
      };

      Object.entries(tags).forEach(([key, value]) => {
        // Regex to find meta tag with property or name
        const regex = new RegExp(`<meta (property|name)="${key}" content=".*?"\\s*/?>`, 'g');
        if (regex.test(html)) {
          html = html.replace(regex, `<meta $1="${key}" content="${value}" />`);
        } else {
          // Inject before </head>
          html = html.replace('</head>', `<meta property="${key}" content="${value}" />\n</head>`);
        }
      });
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate'); 
    res.status(200).send(html);

  } catch (error) {
    console.error('Error in SEO function:', error);
    // Fallback: Redirect to client-side rendering with special param to bypass this function
    // This prevents the "open and close" (redirect loop) issue if the function fails
    const fallbackUrl = id ? `/produto/${id}?ssr=false` : '/?ssr=false';
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.redirect(307, fallbackUrl);
  }
}
