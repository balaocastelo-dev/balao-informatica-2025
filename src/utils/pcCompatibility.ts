// PC Builder Compatibility Logic
// Extracts compatibility attributes from product names and checks compatibility

export interface CompatibilityInfo {
  socket?: string;       // AM4, AM5, LGA1200, LGA1700, LGA1851, etc.
  memoryType?: string;   // DDR3, DDR4, DDR5
  formFactor?: string;   // ATX, Micro-ATX, Mini-ITX
  pciGen?: string;       // PCIe 4.0, PCIe 5.0
  wattage?: number;      // PSU wattage
  gpuTier?: string;      // low, mid, high (based on GPU model)
  platform?: 'AMD' | 'Intel'; // CPU/Motherboard platform
}

// ============= SOCKET DETECTION =============

// Direct socket extraction from product name
function extractSocketDirect(text: string): string | undefined {
  // Normalize text for matching
  const normalized = text.toUpperCase();
  
  // AMD Sockets - check AM4, AM5 explicitly
  if (/\bAM5\b/.test(normalized)) return 'AM5';
  if (/\bAM4\b/.test(normalized)) return 'AM4';
  if (/\bAM3\+?\b/.test(normalized)) return 'AM3';
  if (/\bsTRX4\b/i.test(normalized)) return 'sTRX4';
  if (/\bTR4\b/.test(normalized)) return 'TR4';
  
  // Intel Sockets - various formats: LGA1700, LGA 1700, LGA-1700
  if (/\bLGA\s*[-]?\s*1851\b/.test(normalized)) return 'LGA1851';
  if (/\bLGA\s*[-]?\s*1700\b/.test(normalized)) return 'LGA1700';
  if (/\bLGA\s*[-]?\s*1200\b/.test(normalized)) return 'LGA1200';
  if (/\bLGA\s*[-]?\s*1151\b/.test(normalized)) return 'LGA1151';
  if (/\bLGA\s*[-]?\s*1150\b/.test(normalized)) return 'LGA1150';
  if (/\bLGA\s*[-]?\s*2066\b/.test(normalized)) return 'LGA2066';
  if (/\bLGA\s*[-]?\s*2011\b/.test(normalized)) return 'LGA2011';
  
  return undefined;
}

// Detect socket from AMD chipset
function getSocketFromAMDChipset(text: string): string | undefined {
  const normalized = text.toUpperCase();
  
  // AM5 Chipsets (600/800 series)
  if (/\b(X870E?|B850|A820)\b/.test(normalized)) return 'AM5';
  if (/\b(X670E?|B650E?|A620)\b/.test(normalized)) return 'AM5';
  
  // AM4 Chipsets (300/400/500 series)
  if (/\b(X570S?|B550|A520)\b/.test(normalized)) return 'AM4';
  if (/\b(X470|B450|A320)\b/.test(normalized)) return 'AM4';
  if (/\b(X370|B350|A300)\b/.test(normalized)) return 'AM4';
  
  // Threadripper
  if (/\b(TRX40|TRX50|WRX80)\b/.test(normalized)) return 'sTRX4';
  
  return undefined;
}

// Detect socket from Intel chipset
function getSocketFromIntelChipset(text: string): string | undefined {
  const normalized = text.toUpperCase();
  
  // LGA1851 - Arrow Lake (800 series)
  if (/\b(Z890|B860|H810)\b/.test(normalized)) return 'LGA1851';
  
  // LGA1700 - Alder/Raptor Lake (600/700 series)
  if (/\b(Z790|B760|H770|H710)\b/.test(normalized)) return 'LGA1700';
  if (/\b(Z690|B660|H670|H610)\b/.test(normalized)) return 'LGA1700';
  
  // LGA1200 - Comet/Rocket Lake (400/500 series)
  if (/\b(Z590|B560|H570|H510)\b/.test(normalized)) return 'LGA1200';
  if (/\b(Z490|B460|H470|H410)\b/.test(normalized)) return 'LGA1200';
  
  // LGA1151 - Coffee Lake (300 series)
  if (/\b(Z390|B365|B360|H370|H310)\b/.test(normalized)) return 'LGA1151';
  if (/\b(Z370|Z270|B250|H270)\b/.test(normalized)) return 'LGA1151';
  
  // HEDT
  if (/\bX299\b/.test(normalized)) return 'LGA2066';
  if (/\bX99\b/.test(normalized)) return 'LGA2011';
  
  return undefined;
}

// ============= PLATFORM DETECTION =============

function detectPlatformFromText(text: string): 'AMD' | 'Intel' | undefined {
  const normalized = text.toUpperCase();
  
  // Check for explicit AMD indicators
  if (/\bAMD\b/.test(normalized)) return 'AMD';
  if (/\bRYZEN\b/.test(normalized)) return 'AMD';
  if (/\bATHLON\b/.test(normalized)) return 'AMD';
  if (/\bTHREADRIPPER\b/.test(normalized)) return 'AMD';
  if (/\bAM[345]\b/.test(normalized)) return 'AMD';
  
  // Check for explicit Intel indicators
  if (/\bINTEL\b/.test(normalized)) return 'Intel';
  if (/\bCORE\s*(ULTRA\s*)?I[3579]/.test(normalized)) return 'Intel';
  if (/\bPENTIUM\b/.test(normalized)) return 'Intel';
  if (/\bCELERON\b/.test(normalized)) return 'Intel';
  if (/\bXEON\b/.test(normalized)) return 'Intel';
  if (/\bLGA\s*\d{4}\b/.test(normalized)) return 'Intel';
  
  // Check AMD chipsets
  const amdChipsets = ['X870', 'B850', 'A820', 'X670', 'B650', 'A620', 'X570', 'B550', 'A520', 'X470', 'B450', 'A320', 'X370', 'B350'];
  for (const chipset of amdChipsets) {
    if (normalized.includes(chipset)) return 'AMD';
  }
  
  // Check Intel chipsets
  const intelChipsets = ['Z890', 'B860', 'H810', 'Z790', 'B760', 'H770', 'H710', 'Z690', 'B660', 'H670', 'H610', 'Z590', 'B560', 'H570', 'H510', 'Z490', 'B460', 'H470', 'H410', 'Z390', 'B365', 'B360', 'H370', 'H310'];
  for (const chipset of intelChipsets) {
    if (normalized.includes(chipset)) return 'Intel';
  }
  
  return undefined;
}

// Socket to DDR type mapping
const SOCKET_DDR_MAP: Record<string, string> = {
  'AM5': 'DDR5',
  'AM4': 'DDR4',
  'AM3': 'DDR3',
  'sTRX4': 'DDR4',
  'TR4': 'DDR4',
  'LGA1851': 'DDR5',
  'LGA1700': 'DDR4', // Can support DDR5 too
  'LGA1200': 'DDR4',
  'LGA1151': 'DDR4',
  'LGA1150': 'DDR3',
  'LGA2066': 'DDR4',
  'LGA2011': 'DDR4',
};

// Socket to platform mapping
const SOCKET_PLATFORM_MAP: Record<string, 'AMD' | 'Intel'> = {
  'AM5': 'AMD',
  'AM4': 'AMD',
  'AM3': 'AMD',
  'sTRX4': 'AMD',
  'TR4': 'AMD',
  'LGA1851': 'Intel',
  'LGA1700': 'Intel',
  'LGA1200': 'Intel',
  'LGA1151': 'Intel',
  'LGA1150': 'Intel',
  'LGA2066': 'Intel',
  'LGA2011': 'Intel',
};

// DDR memory patterns
const MEMORY_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /\bDDR5\b/i, type: 'DDR5' },
  { pattern: /\bDDR4\b/i, type: 'DDR4' },
  { pattern: /\bDDR3L?\b/i, type: 'DDR3' },
];

// Form factor patterns
const FORM_FACTOR_PATTERNS: { pattern: RegExp; formFactor: string }[] = [
  { pattern: /\bE-?ATX\b/i, formFactor: 'E-ATX' },
  { pattern: /\bMini-?ITX\b/i, formFactor: 'Mini-ITX' },
  { pattern: /\bMicro-?ATX\b|\bmATX\b|\bm-?ATX\b|\bMatx\b/i, formFactor: 'Micro-ATX' },
  { pattern: /\bATX\b/i, formFactor: 'ATX' },
];

// PSU wattage pattern
const WATTAGE_PATTERN = /\b(\d{3,4})\s*W\b/i;

// GPU tier based on model
const GPU_TIER_PATTERNS: { pattern: RegExp; tier: string; minWattage: number }[] = [
  // NVIDIA High-end
  { pattern: /\bRTX\s*50[89]0\b/i, tier: 'high', minWattage: 850 },
  { pattern: /\bRTX\s*5070\s*(Ti)?\b/i, tier: 'high', minWattage: 750 },
  { pattern: /\bRTX\s*40[89]0\b/i, tier: 'high', minWattage: 850 },
  { pattern: /\bRTX\s*4070\s*(Ti\s*Super|Ti|Super)\b/i, tier: 'high', minWattage: 700 },
  { pattern: /\bRTX\s*30[89]0\b/i, tier: 'high', minWattage: 750 },
  { pattern: /\bRTX\s*3070\s*Ti\b/i, tier: 'high', minWattage: 700 },
  // NVIDIA Mid-range
  { pattern: /\bRTX\s*5060\s*(Ti)?\b/i, tier: 'mid', minWattage: 600 },
  { pattern: /\bRTX\s*4070\b/i, tier: 'mid', minWattage: 650 },
  { pattern: /\bRTX\s*4060\s*(Ti)?\b/i, tier: 'mid', minWattage: 550 },
  { pattern: /\bRTX\s*3070\b/i, tier: 'mid', minWattage: 650 },
  { pattern: /\bRTX\s*3060\s*(Ti)?\b/i, tier: 'mid', minWattage: 550 },
  // NVIDIA Entry
  { pattern: /\bRTX\s*4050\b/i, tier: 'low', minWattage: 450 },
  { pattern: /\bGTX\s*16[56]0\b/i, tier: 'low', minWattage: 450 },
  { pattern: /\bGTX\s*1650\b/i, tier: 'low', minWattage: 350 },
  // AMD High-end
  { pattern: /\bRX\s*9070\s*(XT)?\b/i, tier: 'high', minWattage: 800 },
  { pattern: /\bRX\s*7900\s*(XTX|XT|GRE)?\b/i, tier: 'high', minWattage: 800 },
  { pattern: /\bRX\s*6900\s*XT\b/i, tier: 'high', minWattage: 750 },
  { pattern: /\bRX\s*6800\s*(XT)?\b/i, tier: 'high', minWattage: 700 },
  // AMD Mid-range
  { pattern: /\bRX\s*7800\s*XT\b/i, tier: 'mid', minWattage: 650 },
  { pattern: /\bRX\s*7700\s*XT\b/i, tier: 'mid', minWattage: 600 },
  { pattern: /\bRX\s*6700\s*XT\b/i, tier: 'mid', minWattage: 550 },
  { pattern: /\bRX\s*7600\b/i, tier: 'mid', minWattage: 500 },
  // AMD Entry
  { pattern: /\bRX\s*6600\s*(XT)?\b/i, tier: 'low', minWattage: 450 },
  { pattern: /\bRX\s*6500\s*XT\b/i, tier: 'low', minWattage: 400 },
];

// Case size patterns
const CASE_SIZE_PATTERNS: { pattern: RegExp; size: string; supports: string[] }[] = [
  { pattern: /\bFull\s*Tower\b/i, size: 'Full Tower', supports: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'] },
  { pattern: /\bMid\s*Tower\b/i, size: 'Mid Tower', supports: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
  { pattern: /\bMini\s*Tower\b|\bMicro\b/i, size: 'Mini Tower', supports: ['Micro-ATX', 'Mini-ITX'] },
  { pattern: /\bMini-?ITX\b|SFF|Small\s*Form/i, size: 'Mini-ITX', supports: ['Mini-ITX'] },
  { pattern: /\bATX\b/i, size: 'Mid Tower', supports: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
];

// ============= MAIN EXTRACTION FUNCTION =============

export function extractCompatibilityInfo(productName: string, description?: string): CompatibilityInfo {
  const text = `${productName} ${description || ''}`;
  const info: CompatibilityInfo = {};

  // 1. Try direct socket extraction first (most reliable)
  info.socket = extractSocketDirect(text);
  
  // 2. If no direct socket, try chipset-based detection
  if (!info.socket) {
    info.socket = getSocketFromAMDChipset(text) || getSocketFromIntelChipset(text);
  }
  
  // 3. Detect platform
  info.platform = detectPlatformFromText(text);
  
  // 4. If we have socket but not platform, derive platform from socket
  if (!info.platform && info.socket) {
    info.platform = SOCKET_PLATFORM_MAP[info.socket];
  }
  
  // 5. If we have platform but not socket (rare), that's okay - platform alone can filter

  // 6. Extract memory type
  for (const { pattern, type } of MEMORY_PATTERNS) {
    if (pattern.test(text)) {
      info.memoryType = type;
      break;
    }
  }

  // 7. If no explicit DDR but socket found, infer from socket
  if (!info.memoryType && info.socket) {
    info.memoryType = SOCKET_DDR_MAP[info.socket];
  }

  // 8. Extract form factor
  for (const { pattern, formFactor } of FORM_FACTOR_PATTERNS) {
    if (pattern.test(text)) {
      info.formFactor = formFactor;
      break;
    }
  }

  // 9. Extract wattage
  const wattageMatch = text.match(WATTAGE_PATTERN);
  if (wattageMatch) {
    info.wattage = parseInt(wattageMatch[1], 10);
  }

  // 10. Extract GPU tier
  for (const { pattern, tier } of GPU_TIER_PATTERNS) {
    if (pattern.test(text)) {
      info.gpuTier = tier;
      break;
    }
  }

  return info;
}

// Get the expected DDR type for a socket
export function getDDRForSocket(socket: string): string | undefined {
  return SOCKET_DDR_MAP[socket];
}

export function getMinWattageForGPU(productName: string): number {
  for (const { pattern, minWattage } of GPU_TIER_PATTERNS) {
    if (pattern.test(productName)) {
      return minWattage;
    }
  }
  return 400;
}

export function getCaseSupportedFormFactors(productName: string): string[] {
  for (const { pattern, supports } of CASE_SIZE_PATTERNS) {
    if (pattern.test(productName)) {
      return supports;
    }
  }
  return ['ATX', 'Micro-ATX', 'Mini-ITX'];
}

export interface SelectedPartWithCompat {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  compatibility: CompatibilityInfo;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  reason?: string;
  warning?: string;
}

// ============= COMPATIBILITY CHECKING =============

export function checkProductCompatibility(
  stepId: string,
  productName: string,
  selectedParts: Record<string, SelectedPartWithCompat | null>
): CompatibilityResult {
  const productInfo = extractCompatibilityInfo(productName);
  
  switch (stepId) {
    case 'placa-mae': {
      const processor = selectedParts['processador'];
      if (!processor) {
        return { isCompatible: true };
      }
      
      const cpuSocket = processor.compatibility.socket;
      const cpuPlatform = processor.compatibility.platform;
      const mbSocket = productInfo.socket;
      const mbPlatform = productInfo.platform;
      
      // CRITICAL: Platform check (AMD vs Intel)
      if (cpuPlatform && mbPlatform && cpuPlatform !== mbPlatform) {
        return {
          isCompatible: false,
          reason: `Incompatível: Placa mãe ${mbPlatform} não funciona com processador ${cpuPlatform}`
        };
      }
      
      // Socket check
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        return {
          isCompatible: false,
          reason: `Incompatível: Soquete ${mbSocket} não é compatível com processador ${cpuSocket}`
        };
      }
      
      // If we detected CPU platform but couldn't detect MB platform/socket, warn
      if (cpuPlatform && !mbPlatform && !mbSocket) {
        return {
          isCompatible: true,
          warning: 'Verifique manualmente a compatibilidade do soquete'
        };
      }
      
      // If CPU socket matches MB socket, it's compatible
      if (cpuSocket && mbSocket && cpuSocket === mbSocket) {
        return { isCompatible: true };
      }
      
      // If platforms match but no socket info, probably compatible
      if (cpuPlatform && mbPlatform && cpuPlatform === mbPlatform) {
        if (!mbSocket) {
          return {
            isCompatible: true,
            warning: 'Plataforma compatível, verifique o soquete específico'
          };
        }
      }
      
      return { isCompatible: true };
    }

    case 'memoria': {
      const motherboard = selectedParts['placa-mae'];
      const processor = selectedParts['processador'];
      
      // Check against motherboard DDR type first
      if (motherboard?.compatibility.memoryType) {
        if (productInfo.memoryType && productInfo.memoryType !== motherboard.compatibility.memoryType) {
          return {
            isCompatible: false,
            reason: `Incompatível: Memória ${productInfo.memoryType} não funciona com placa mãe ${motherboard.compatibility.memoryType}`
          };
        }
      }
      // If no motherboard, check against processor
      else if (processor?.compatibility.socket) {
        const requiredDDR = getDDRForSocket(processor.compatibility.socket);
        if (requiredDDR && productInfo.memoryType && productInfo.memoryType !== requiredDDR) {
          return {
            isCompatible: false,
            reason: `Incompatível: Memória ${productInfo.memoryType} não funciona com ${processor.compatibility.socket} (requer ${requiredDDR})`
          };
        }
      }
      break;
    }

    case 'cooler': {
      const processor = selectedParts['processador'];
      if (processor?.compatibility.platform) {
        const coolerText = productName.toLowerCase();
        const platform = processor.compatibility.platform;
        
        const coolerSupportsAMD = /\bam4\b|\bam5\b|\bamd\b/i.test(coolerText);
        const coolerSupportsIntel = /\blga\b|\bintel\b|\b115[01]\b|\b1200\b|\b1700\b|\b1851\b/i.test(coolerText);
        
        // If cooler explicitly supports only one platform
        if (coolerSupportsAMD && !coolerSupportsIntel && platform === 'Intel') {
          return {
            isCompatible: false,
            reason: 'Cooler apenas para AMD, incompatível com Intel'
          };
        }
        if (coolerSupportsIntel && !coolerSupportsAMD && platform === 'AMD') {
          return {
            isCompatible: false,
            reason: 'Cooler apenas para Intel, incompatível com AMD'
          };
        }
      }
      break;
    }

    case 'fonte': {
      const gpu = selectedParts['gpu'];
      if (gpu && productInfo.wattage) {
        const minWattage = getMinWattageForGPU(gpu.name);
        if (productInfo.wattage < minWattage) {
          return {
            isCompatible: false,
            reason: `Fonte ${productInfo.wattage}W insuficiente (mínimo ${minWattage}W para GPU)`
          };
        }
      }
      
      const processor = selectedParts['processador'];
      const hasHighEndCPU = processor && /\bi[79]-|Ryzen\s*[79]/i.test(processor.name);
      const hasHighEndGPU = gpu?.compatibility.gpuTier === 'high';
      
      if (hasHighEndCPU && hasHighEndGPU && productInfo.wattage && productInfo.wattage < 750) {
        return {
          isCompatible: true,
          warning: 'Sistema high-end: recomendado 750W ou mais'
        };
      }
      break;
    }

    case 'gabinete': {
      const motherboard = selectedParts['placa-mae'];
      if (motherboard?.compatibility.formFactor) {
        const supportedFormFactors = getCaseSupportedFormFactors(productName);
        if (!supportedFormFactors.includes(motherboard.compatibility.formFactor)) {
          return {
            isCompatible: false,
            reason: `Gabinete não suporta placa mãe ${motherboard.compatibility.formFactor}`
          };
        }
      }
      
      const gpu = selectedParts['gpu'];
      if (gpu?.compatibility.gpuTier === 'high') {
        const caseText = productName.toLowerCase();
        if (caseText.includes('mini') || caseText.includes('sff') || caseText.includes('compact')) {
          return {
            isCompatible: true,
            warning: 'Gabinete compacto pode não suportar GPUs grandes'
          };
        }
      }
      break;
    }
  }

  return { isCompatible: true };
}

// Helper to get compatibility summary for display
export function getCompatibilitySummary(selectedParts: Record<string, SelectedPartWithCompat | null>): string[] {
  const summary: string[] = [];
  
  const processor = selectedParts['processador'];
  const motherboard = selectedParts['placa-mae'];
  
  if (processor?.compatibility.platform) {
    summary.push(`Plataforma: ${processor.compatibility.platform}`);
  }
  
  if (processor?.compatibility.socket) {
    summary.push(`Soquete: ${processor.compatibility.socket}`);
  }
  
  if (motherboard?.compatibility.memoryType) {
    summary.push(`Memória: ${motherboard.compatibility.memoryType}`);
  }
  
  if (motherboard?.compatibility.formFactor) {
    summary.push(`Form Factor: ${motherboard.compatibility.formFactor}`);
  }
  
  return summary;
}
