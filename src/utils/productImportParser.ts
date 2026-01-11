export interface ImportOptions {
  defaultCategory?: string;
  profitMargin?: number;
  autoDetectCategory?: boolean;
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
    
    // 1. Extrair URL de imagem
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.png|\.webp|\.jpeg)[^\s]*)/i;
    const imgMatch = trimmedLine.match(urlRegex);
    
    if (imgMatch) {
      image = imgMatch[0];
    } else {
      // Procura nas partes por algo que pareça URL
      const imgPartIndex = parts.findIndex(p => p.match(/^https?:\/\//i));
      if (imgPartIndex >= 0) {
        image = parts[imgPartIndex];
      }
    }

    // 2. Extrair Preço (R$ 1.234,56 ou 1234.56)
    // Procura o último valor monetário na linha, assumindo que seja o preço
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

    // 3. Extrair Nome
    // O nome é o que sobra removendo a imagem e o preço
    let nameTemp = trimmedLine;
    if (image) nameTemp = nameTemp.replace(image, '');
    if (priceMatches) {
      priceMatches.forEach(p => {
        nameTemp = nameTemp.replace(p, '');
      });
    }
    
    // Limpar caracteres extras e espaços
    name = nameTemp.replace(/[|;\t]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Se o nome ficou vazio, tenta pegar das partes divididas
    if (!name && parts.length > 0) {
      // Assume que a parte mais longa que não é URL é o nome
      const potentialName = parts
        .filter(p => !p.match(/^https?:\/\//))
        .sort((a, b) => b.length - a.length)[0];
      if (potentialName) name = potentialName.trim();
    }

    // Processamento dos valores
    const costPrice = parsePrice(costPriceRaw || priceRaw); // Se só tem um preço, assume como base para custo se margem for aplicada
    let finalPrice = 0;

    // Aplicar margem de lucro se configurada
    if (options.profitMargin && options.profitMargin > 0) {
      finalPrice = costPrice * (1 + (options.profitMargin / 100));
    } else {
      // Se não tem margem configurada, usa o preço de venda explícito se existir (que é o priceRaw), ou o mesmo do custo
      finalPrice = parsePrice(priceRaw);
    }

    // Processar imagem (alta resolução)
    const enhancedImage = enhanceImageUrl(image);

    // Detectar Categoria
    let category = options.defaultCategory || 'Outros';
    if (options.autoDetectCategory) {
      category = detectCategory(name) || category;
    }

    // Detectar Tags/Marcas
    const tags = detectBrands(name);

    // Validação básica
    const isValid = name.length > 2 && finalPrice > 0;
    const validationError = !isValid 
      ? (name.length <= 2 ? 'Nome inválido' : 'Preço inválido') 
      : undefined;

    results.push({
      name,
      price: Number(finalPrice.toFixed(2)),
      costPrice: Number(costPrice.toFixed(2)),
      image: enhancedImage,
      category,
      tags,
      sourceUrl: image || undefined, // Usa a imagem como sourceUrl se não tiver outra
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

const enhanceImageUrl = (url: string): string => {
  if (!url) return '';
  
  let newUrl = url;

  // Remover parâmetros de query que limitam tamanho (comuns em muitos e-commerce)
  if (newUrl.includes('?')) {
    // newUrl = newUrl.split('?')[0]; // Cuidado, alguns precisam dos params
  }

  // Padrões comuns de redimensionamento
  
  // Kabum, etc: _m.jpg, _g.jpg -> remover ou padronizar
  newUrl = newUrl.replace(/_[mps]\.(jpg|png|webp)$/i, '_g.$1'); // Força grande se existir padrão
  
  // Amazon: remover ._SX200_ etc
  // Ex: https://m.media-amazon.com/images/I/61j4+J9M6dL._AC_SX679_.jpg -> https://m.media-amazon.com/images/I/61j4+J9M6dL.jpg
  if (newUrl.includes('amazon') || newUrl.includes('media-amazon')) {
    newUrl = newUrl.replace(/\._[A-Z]{2}\d+_?/, '');
  }

  // Mercado Livre
  // Ex: ...-O.jpg -> ...-F.jpg (Original/Full)
  if (newUrl.includes('mercadolivre') || newUrl.includes('mlstatic')) {
    newUrl = newUrl.replace(/-[OI]\.jpg/i, '-F.jpg');
    newUrl = newUrl.replace(/-[OI]\.webp/i, '-F.webp');
  }

  // Substituição genérica de paths
  newUrl = newUrl.replace('/medium/', '/large/');
  newUrl = newUrl.replace('/thumb/', '/large/');
  newUrl = newUrl.replace('/thumbnail/', '/full/');

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
