import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
// In Vercel Functions, process.env has the variables.
// Users might have VITE_SUPABASE_URL exposed.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest/i.test(userAgent);

  // If it's not a bot, we can redirect to the SPA route immediately to be handled by React
  // BUT: Vercel rewrites handle the "stay on URL but serve content" part.
  // If we redirect, the bot might follow but still see the client-side rendered page if we just 301 to the same path (loop)
  // or if we 301 to /index.html (lose path).
  // Actually, for normal users, we want to serve the HTML app.
  // For bots, we want to serve the HTML app WITH meta tags injected.
  // So we should always serve the HTML app with injected tags.

  try {
    // 1. Fetch product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    // 2. Fetch the base HTML (index.html)
    // We can't use 'fs' easily to read built files in serverless unless configured.
    // Fetching from the public URL is safer for a quick fix.
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;
    
    // Use raw=true or some param to avoid infinite rewrite loop if we were rewriting /index.html (we are not).
    // But we are rewriting /produto/:id.
    // We need to fetch the ROOT index.html.
    const indexResponse = await fetch(`${appUrl}/index.html`);
    let html = await indexResponse.text();

    if (product) {
      const title = `${product.name} | Balão da Informática`;
      const description = product.description 
        ? product.description.substring(0, 160).replace(/"/g, '&quot;') 
        : `Compre ${product.name} na Balão da Informática.`;
      const image = product.image || 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png';
      const url = `${appUrl}/produto/${id}`;

      // Replace Title
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      
      // Replace Meta Tags
      // We use a helper to replace or inject if missing
      const tags = {
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:image:width': '800',
        'og:image:height': '800',
        'og:url': url,
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image,
        'description': description
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
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate'); // Cache for speed
    res.status(200).send(html);

  } catch (error) {
    console.error('Error in SEO function:', error);
    // Fallback: serve generic HTML or redirect to home?
    // Better to serve the generic index.html if we fail
    res.redirect('/');
  }
}
