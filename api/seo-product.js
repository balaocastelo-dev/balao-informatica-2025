import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  
  try {
    // 1. Fetch product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    // 2. Fetch the base HTML (index.html)
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;
    
    const indexResponse = await fetch(`${appUrl}/index.html`);
    let html = await indexResponse.text();

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
    res.redirect('/');
  }
}
