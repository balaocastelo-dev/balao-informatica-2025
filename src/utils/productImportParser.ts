export interface ImportOptions {
  defaultCategory?: string;
  profitMargin?: number;
  autoDetectCategory?: boolean;
  defaultTags?: string[];
  ribbonLabel?: string;
}

export interface ParsedProduct {
  name: string;
  price: number; // Preço de venda calculado ou extraído
  costPrice?: number; // Preço de custo original (se detectado)
  image: string;
  category: string;
  tags: string[];
  sourceUrl?: string;
  originalLine: string;
  isValid: boolean;
  validationError?: string;
}

// Mapeamento de palavras-chave para categorias
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Processadores': ['processador', 'ryzen', 'core i', 'intel core', 'amd ryzen', 'xeon', 'threadripper'],
  'Placas de Vídeo': ['placa de video', 'placa de vídeo', 'geforce', 'rtx', 'gtx', 'radeon', 'rx ', 'gpu'],
  'Placas-Mãe': ['placa mãe', 'placa mae', 'motherboard', 'z790', 'b550', 'b450', 'x570', 'h610', 'a520', 'lga'],
  'Memória RAM': ['memória', 'memoria', 'ddr4', 'ddr5', 'dimm', 'udimm', 'sodimm'],
  'Armazenamento': ['ssd', 'nvme', 'hd ', 'hdd', 'disco rígido', 'disco rigido', 'kingston nv2', 'wd green', 'wd blue'],
  'Notebooks': ['notebook', 'laptop', 'macbook', 'chromebook', 'aspire', 'ideapad', 'vivoBook'],
  'Monitores': ['monitor', 'tela', 'display', 'ultrawide', 'curvo', '144hz', '165hz', '240hz', '75hz'],
  'Gabinetes': ['gabinete', 'case', 'tower', 'atx', 'mid tower', 'full tower'],
  'Fontes': ['fonte', 'psu', 'atx', '500w', '600w', '750w', '850w', '1000w', 'modular'],
  'Periféricos': ['teclado', 'mouse', 'headset', 'fone', 'webcam', 'microfone', 'mousepad'],
  'Impressoras': ['impressora', 'multifuncional', 'toner', 'cartucho', 'epson', 'hp', 'canon'],
  'Tablets': ['tablet', 'ipad', 'galaxy tab'],
  'Smartphones': ['smartphone', 'celular', 'iphone', 'galaxy', 'xiaomi', 'redmi', 'moto g'],
};

// Mapeamento de marcas comuns
const BRANDS = [
  'corsair', 'nvidia', 'intel', 'amd', 'logitech', 'asus', 'msi', 'razer', 'gigabyte', 
  'asrock', 'kingston', 'wd', 'western digital', 'seagate', 'samsung', 'lg', 'dell', 
  'hp', 'lenovo', 'acer', 'apple', 'redragon', 'hyperx', 'steelseries', 'evga', 
  'zotac', 'pny', 'galax', 'biostar', 'palit', 'gainward', 'powercolor', 'sapphire', 
  'xfx', 'nzxt', 'cooler master', 'thermaltake', 'lian li', 'deepcool', 'gamdias',
  'rise mode', 'mancer', 'pichau', 'terabyte', 'kabum'
];

export const parseBulkImport = (text: string, options: ImportOptions): ParsedProduct[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const results: ParsedProduct[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Pular linhas de cabeçalho comuns
    if (/^(nome|produto|descrição|preço|valor|imagem|url|categoria)/i.test(trimmedLine)) {
      continue;
    }

    // Tentar separar por TAB, pipe ou ponto e vírgula
    let parts = trimmedLine.split(/\t/);
    if (parts.length < 2) parts = trimmedLine.split('|');
    if (parts.length < 2) parts = trimmedLine.split(';');
    
    // Se ainda não separou bem, tenta identificar padrões com regex na linha inteira
    // Exemplo de linha misturada: "https://img.com/a.jpg Produto X R$ 100,00"
    
    let image = '';
    let name = '';
    let priceRaw = '';
    let costPriceRaw = '';
    let sourceUrl = '';
    
    const allUrlRegex = /(https?:\/\/[^\s]+)/gi;
    const allUrls = [];
    let m: RegExpExecArray | null;
    while ((m = allUrlRegex.exec(trimmedLine)) !== null) {
      if (m[0]) allUrls.push(m[0]);
    }

    const looksLikeImage = (url: string) =>
      /\.(jpg|jpeg|png|webp|gif|bmp|tiff)(\?|$)/i.test(url);

    if (allUrls.length > 0) {
      const imageCandidate = allUrls.find(u => looksLikeImage(u));
      const nonImageCandidate = allUrls.find(u => !looksLikeImage(u));
      if (imageCandidate) {
        image = imageCandidate;
      } else {
        image = allUrls[0];
      }
      if (nonImageCandidate && nonImageCandidate !== imageCandidate) {
        sourceUrl = nonImageCandidate;
      } else if (allUrls.length > 1) {
        const second = allUrls[1];
        if (!looksLikeImage(second)) {
          sourceUrl = second;
        }
      }
    } else {
      const imgPartIndex = parts.findIndex(p => p.match(/^https?:\/\//i));
      if (imgPartIndex >= 0) {
        image = parts[imgPartIndex];
      }
    }

    const priceRegex = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})|(\d+\.\d{2})/g;
    const priceMatches = trimmedLine.match(priceRegex);
    
    if (priceMatches && priceMatches.length > 0) {
      // Se tiver mais de um preço, assume que o menor é custo e o maior é venda, ou pega o último
      // Mas para simplificar, vamos pegar o último encontrado como preço base
      priceRaw = priceMatches[priceMatches.length - 1];
      
      // Se tiver dois preços, o primeiro pode ser custo
      if (priceMatches.length >= 2) {
        costPriceRaw = priceMatches[0];
      }
    }

    let nameTemp = trimmedLine;
    if (image) nameTemp = nameTemp.replace(image, '');
    if (sourceUrl) nameTemp = nameTemp.replace(sourceUrl, '');
    if (priceMatches) {
      priceMatches.forEach(p => {
        nameTemp = nameTemp.replace(p, '');
      });
    }
    
    // Limpar caracteres extras e espaços
    name = nameTemp.replace(/[|;\t]/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (!name && parts.length > 0) {
      const potentialName = parts
        .filter(p => !p.match(/^https?:\/\//))
        .sort((a, b) => b.length - a.length)[0];
      if (potentialName) name = potentialName.trim();
    }

    const costPrice = parsePrice(costPriceRaw || priceRaw); // Se só tem um preço, assume como base para custo se margem for aplicada
    let finalPrice = 0;

    if (options.profitMargin && options.profitMargin > 0) {
      finalPrice = costPrice * (1 + (options.profitMargin / 100));
    } else {
      // Se não tem margem configurada, usa o preço de venda explícito se existir (que é o priceRaw), ou o mesmo do custo
      finalPrice = parsePrice(priceRaw);
    }

    const enhancedImage = enhanceImageUrl(image);
    const isLowRes = isLowResolution(enhancedImage);
    
    if (isLowRes) {
      continue;
    }

    let category = options.defaultCategory || 'Outros';
    if (options.autoDetectCategory) {
      category = detectCategory(name) || category;
    }

    const detectedTags = detectBrands(name);
    const allTags = [...(options.defaultTags || []), ...detectedTags];
    
    if (options.ribbonLabel) {
      allTags.push(`badge:${options.ribbonLabel}`);
    }

    const uniqueTags = Array.from(new Set(allTags));

    const isValid = name.length > 2 && finalPrice > 0;
    let validationError = !isValid 
      ? (name.length <= 2 ? 'Nome inválido' : 'Preço inválido') 
      : undefined;

    results.push({
      name,
      price: Number(finalPrice.toFixed(2)),
      costPrice: Number(costPrice.toFixed(2)),
      image: enhancedImage,
      category,
      tags: uniqueTags,
      sourceUrl: sourceUrl || undefined,
      originalLine: line,
      isValid,
      validationError
    });
  }

  return results;
};

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  
  // Remove R$ e espaços
  let clean = priceStr.replace(/[R$\s]/g, '');
  
  // Se formato brasileiro (1.234,56)
  if (clean.includes(',') && !clean.includes('.')) {
     // Ex: 100,00 -> 100.00
     return parseFloat(clean.replace(',', '.'));
  }
  
  if (clean.includes('.') && clean.includes(',')) {
    // Ex: 1.234,56 -> 1234.56
    return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
  }
  
  // Se formato americano simples (1234.56)
  return parseFloat(clean);
};

// Verifica se a URL parece ser de baixa resolução
const isLowResolution = (url: string): boolean => {
  if (!url) return false;
  
  const lower = url.toLowerCase();
  
  // 1. Kabum (se ainda tiver _m, _p, _peq é porque não conseguiu converter)
  if (lower.includes('kabum.com.br') && (lower.includes('_m.') || lower.includes('_p.') || lower.includes('_peq.'))) {
    return true;
  }

  // 2. Terabyte (thumbs)
  if (lower.includes('terabyteshop.com.br') && (lower.includes('_t.') || lower.includes('/thumbs/'))) {
    return true;
  }
  
  // Keywords comuns de thumbnails
  const thumbKeywords = [
    'thumb', 'thumbnail', 'mini', 'small', 'tiny', 
    '50x50', '75x75', '100x100', '150x150', '200x200', '250x250', '300x300',
    'width=50', 'width=100', 'width=150', 'width=200', 'width=300',
    'w=50', 'w=100', 'w=150', 'w=200', 'w=300'
  ];

  if (thumbKeywords.some(k => lower.includes(k))) {
    // Exceção: se tiver "max" ou "full" junto, talvez não seja
    if (!lower.includes('max') && !lower.includes('full') && !lower.includes('high')) {
      return true;
    }
  }

  // Amazon specific
  if (lower.includes('amazon') || lower.includes('media-amazon')) {
    // _SS40_ ou _SX50_ etc. (se for menor que 500)
    const match = lower.match(/_[sS][a-zA-Z](\d+)_/);
    if (match && match[1]) {
      const size = parseInt(match[1]);
      if (size < 500) return true;
    }
  }

  return false;
};

const enhanceImageUrl = (url: string): string => {
  if (!url) return '';
  
  let newUrl = url;

  // Remover parâmetros de query que limitam tamanho (comuns em muitos e-commerce)
  // Mas cuidado para não remover tudo se a imagem depender de query params
  
  // 1. Kabum
  // Ex: https://images.kabum.com.br/produtos/fotos/123456/produto_123456_m.jpg -> _g.jpg
  if (newUrl.includes('kabum.com.br')) {
    newUrl = newUrl.replace(/_m\.(jpg|png|webp|gif)/i, '_g.$1');
    newUrl = newUrl.replace(/_p\.(jpg|png|webp|gif)/i, '_g.$1');
    newUrl = newUrl.replace(/_peq\.(jpg|png|webp|gif)/i, '_g.$1');
  }

  // 2. Terabyte Shop
  // Tentar substituir thumbs por imagens full se padrão conhecido
  if (newUrl.includes('terabyteshop.com.br')) {
    newUrl = newUrl.replace(/_t\.(jpg|png|webp)/i, '_g.$1');
    newUrl = newUrl.replace(/_small\.(jpg|png|webp)/i, '.$1');
  }

  // 3. Amazon: remover ._SX200_ etc
  // Ex: https://m.media-amazon.com/images/I/61j4+J9M6dL._AC_SX679_.jpg -> https://m.media-amazon.com/images/I/61j4+J9M6dL.jpg
  if (newUrl.includes('amazon') || newUrl.includes('media-amazon')) {
    newUrl = newUrl.replace(/\._[A-Z]{2,4}\d+_?/, '');
    newUrl = newUrl.replace(/\._AC_/, '');
  }

  // 4. Mercado Livre
  // Ex: ...-O.jpg -> ...-F.jpg (Original/Full)
  if (newUrl.includes('mercadolivre') || newUrl.includes('mlstatic')) {
    newUrl = newUrl.replace(/-[OI]\.jpg/i, '-F.jpg');
    newUrl = newUrl.replace(/-[OI]\.webp/i, '-F.webp');
    newUrl = newUrl.replace(/-[OI]\.png/i, '-F.png');
  }

  // 5. Google / Shopee / Geral - Remover params de redimensionamento
  if (newUrl.includes('?')) {
     // Tenta remover params explícitos de tamanho
     // Ex: image.jpg?width=200 -> image.jpg
     // Mas mantém outros params que podem ser necessários
     newUrl = newUrl.replace(/([?&])(width|w|height|h|size|resize)=\d+/gi, '$1');
     // Limpar se ficou pontuação solta
     newUrl = newUrl.replace(/[?&]+$/, '');
  }
  
  return newUrl;
};

const detectCategory = (name: string): string | null => {
  const nameLower = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => nameLower.includes(k.toLowerCase()))) {
      return category;
    }
  }
  
  return null;
};

const detectBrands = (name: string): string[] => {
  const nameLower = name.toLowerCase();
  const foundBrands: string[] = [];
  
  BRANDS.forEach(brand => {
    // Verifica palavra inteira para evitar falsos positivos (ex: "os" em "cosmos")
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(nameLower)) {
      foundBrands.push(brand);
    }
  });
  
  return foundBrands;
};
