import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    name: string;
    price: number;
    image?: string;
    description?: string;
    sku?: string;
    availability?: 'InStock' | 'OutOfStock';
  };
}

export function SEOHead({ 
  title = 'Balão da Informática - Computadores, Notebooks e Hardware em Campinas',
  description = 'Balão da Informática: as melhores ofertas em computadores, notebooks, hardware e tecnologia em Campinas. PC Gamer, monitores, placas de vídeo e muito mais!',
  keywords = 'computadores, notebooks, hardware, tecnologia, PC Gamer, placa de vídeo, monitores, Campinas, informática',
  image = 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png',
  url = 'https://www.balaodainformatica.com.br',
  type = 'website',
  product
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    
    // Twitter
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Product Schema
    if (product) {
      addProductSchema(product, url);
    }

    return () => {
      // Remove product schema on unmount
      const productSchema = document.getElementById('product-schema');
      if (productSchema) productSchema.remove();
    };
  }, [title, description, keywords, image, url, type, product]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function addProductSchema(product: NonNullable<SEOHeadProps['product']>, url: string) {
  // Remove existing
  const existing = document.getElementById('product-schema');
  if (existing) existing.remove();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'BRL',
      price: product.price,
      availability: product.availability === 'OutOfStock' 
        ? 'https://schema.org/OutOfStock' 
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Balão da Informática'
      }
    },
    brand: {
      '@type': 'Organization',
      name: 'Balão da Informática'
    }
  };

  const script = document.createElement('script');
  script.id = 'product-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// LocalBusiness Schema Component
export function LocalBusinessSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ComputerStore',
      name: 'Balão da Informática',
      description: 'Loja de informática e tecnologia em Campinas. Computadores, notebooks, hardware, periféricos, PC Gamer e assistência técnica.',
      url: 'https://www.balaodainformatica.com.br',
      logo: 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png',
      image: 'https://www.balaodainformatica.com.br/media/wysiwyg/balao500.png',
      telephone: '+55-19-98751-0267',
      email: 'balaocastelo@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Campinas',
        addressLocality: 'Campinas',
        addressRegion: 'SP',
        postalCode: '13000-000',
        addressCountry: 'BR'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -22.9056,
        longitude: -47.0608
      },
      areaServed: [
        { '@type': 'City', name: 'Campinas' },
        { '@type': 'State', name: 'São Paulo' },
        { '@type': 'Country', name: 'Brasil' }
      ],
      priceRange: '$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00'
        }
      ],
      sameAs: [
        'https://www.instagram.com/balaodainformatica',
        'https://www.facebook.com/balaodainformatica',
        'https://wa.me/5519987510267'
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Produtos de Informática',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Computadores e PCs' },
          { '@type': 'OfferCatalog', name: 'Notebooks' },
          { '@type': 'OfferCatalog', name: 'Hardware' },
          { '@type': 'OfferCatalog', name: 'Monitores' },
          { '@type': 'OfferCatalog', name: 'Placas de Vídeo' },
          { '@type': 'OfferCatalog', name: 'Periféricos' },
          { '@type': 'OfferCatalog', name: 'PC Gamer' }
        ]
      }
    };

    const script = document.createElement('script');
    script.id = 'localbusiness-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('localbusiness-schema');
      if (el) el.remove();
    };
  }, []);

  return null;
}

// Breadcrumb Schema
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };

    const script = document.createElement('script');
    script.id = 'breadcrumb-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('breadcrumb-schema');
      if (el) el.remove();
    };
  }, [items]);

  return null;
}
