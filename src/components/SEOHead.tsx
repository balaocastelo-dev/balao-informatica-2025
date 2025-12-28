import { Helmet } from 'react-helmet-async';

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
  
  const schema = product ? {
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
      availability: product.availability === 'OutOfStock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    }
  } : null;

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Balão da Informática" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
