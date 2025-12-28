import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://pfnqchbzimrtohyvbqjq.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbnFjaGJ6aW1ydG9oeXZicWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDA3NTMsImV4cCI6MjA4MDc3Njc1M30.riWwDKNyKojTIKRcAKBNUh5eLyAnxpurWJ5eVoyTDaU";

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  
  // Helper to fetch index.html
  const getIndexHtml = async () => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;
    const response = await fetch(`${appUrl}/index.html`);
    return await response.text();
  };

  try {
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
      const cleanDescription = product.description 
        ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 200).replace(/"/g, '&quot;') 
        : `Compre ${product.name} na Balão da Informática.`;
      
      const image = product.image || 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png';
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
        const regex = new RegExp(`<meta (property|name)="${key}" content=".*?" />`, 'g');
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
    // Fallback: serve original index.html so client-side routing still works
    try {
      const html = await getIndexHtml();
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (e) {
      res.redirect('/');
    }
  }
}
