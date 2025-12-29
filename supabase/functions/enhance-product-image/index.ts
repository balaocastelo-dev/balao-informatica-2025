import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

async function getImageSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return 0;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return 0;
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch {
    return 0;
  }
}

async function findBestKabumImage(originalUrl: string): Promise<string> {
  // Kabum image URL pattern: https://images.kabum.com.br/produtos/fotos/sync_mirakl/XXXXX/medium/...
  // Try to replace 'medium' with larger sizes
  
  const sizeVariants = ['gg', 'big', 'original', 'large', 'grande'];
  let bestUrl = originalUrl;
  let bestSize = await getImageSize(originalUrl);
  
  console.log(`Kabum original: ${originalUrl}, size: ${bestSize}`);
  
  for (const variant of sizeVariants) {
    // Replace /medium/, /small/, /thumb/ with variant
    let newUrl = originalUrl.replace(/\/(medium|small|thumb|mini)\//gi, `/${variant}/`);
    
    if (newUrl !== originalUrl) {
      const exists = await checkImageExists(newUrl);
      if (exists) {
        const size = await getImageSize(newUrl);
        console.log(`Trying ${variant}: ${newUrl}, size: ${size}`);
        if (size > bestSize) {
          bestSize = size;
          bestUrl = newUrl;
          console.log(`Found better image with ${variant}: ${size} bytes`);
        }
      }
    }
  }
  
  return bestUrl;
}

async function findBestImage(originalUrl: string): Promise<string> {
  if (!originalUrl || !originalUrl.startsWith('http')) {
    console.log('Invalid URL provided:', originalUrl);
    return originalUrl;
  }

  const urlLower = originalUrl.toLowerCase();
  
  // Handle Kabum CDN images specifically
  if (urlLower.includes('images.kabum.com.br')) {
    return await findBestKabumImage(originalUrl);
  }
  
  // Handle Pichau CDN images
  if (urlLower.includes('images.pichau.com.br')) {
    // Try similar size variant pattern
    const variants = ['large', 'big', 'original'];
    let bestUrl = originalUrl;
    let bestSize = await getImageSize(originalUrl);
    
    for (const variant of variants) {
      const newUrl = originalUrl.replace(/\/(medium|small|thumb)\//gi, `/${variant}/`);
      if (newUrl !== originalUrl) {
        const exists = await checkImageExists(newUrl);
        if (exists) {
          const size = await getImageSize(newUrl);
          if (size > bestSize) {
            bestSize = size;
            bestUrl = newUrl;
          }
        }
      }
    }
    return bestUrl;
  }
  
  // Generic patterns for other CDNs
  const patterns = [
    { pattern: /[?&]w=\d+/i, replacements: ['?w=1200', '?w=1000'] },
    { pattern: /[?&]width=\d+/i, replacements: ['?width=1200', '?width=1000'] },
    { pattern: /_small\./i, replacements: ['_large.', '.'] },
    { pattern: /_thumb\./i, replacements: ['_large.', '.'] },
    { pattern: /-\d{2,3}x\d{2,3}\./i, replacements: ['-1200x1200.', '.'] },
    { pattern: /\/medium\//i, replacements: ['/large/', '/big/', '/original/'] },
  ];
  
  let bestUrl = originalUrl;
  let bestSize = await getImageSize(originalUrl);
  
  for (const { pattern, replacements } of patterns) {
    if (pattern.test(originalUrl)) {
      for (const replacement of replacements) {
        const newUrl = originalUrl.replace(pattern, replacement);
        if (newUrl !== originalUrl) {
          const exists = await checkImageExists(newUrl);
          if (exists) {
            const size = await getImageSize(newUrl);
            if (size > bestSize) {
              bestSize = size;
              bestUrl = newUrl;
            }
          }
        }
      }
    }
  }
  
  console.log(`Best image found: ${bestUrl}, size: ${bestSize}`);
  return bestUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      console.log('No image URL provided');
      return new Response(
        JSON.stringify({ error: 'Image URL is required', enhancedUrl: null }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if URL is actually an image URL (not a product page URL)
    const urlLower = imageUrl.toLowerCase();
    const isActualImageUrl = (
      urlLower.includes('images.') ||
      urlLower.includes('/fotos/') ||
      urlLower.includes('/img/') ||
      urlLower.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i)
    );
    
    if (!isActualImageUrl) {
      console.log('URL is not an image URL, returning as-is:', imageUrl);
      return new Response(
        JSON.stringify({ 
          success: true, 
          originalUrl: imageUrl,
          enhancedUrl: imageUrl,
          wasEnhanced: false,
          reason: 'Not an image URL'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image URL:', imageUrl);
    const enhancedUrl = await findBestImage(imageUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        originalUrl: imageUrl,
        enhancedUrl,
        wasEnhanced: enhancedUrl !== imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error enhancing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, enhancedUrl: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
