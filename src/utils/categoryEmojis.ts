
// Auto-generate emoji based on category name
export const getCategoryEmoji = (name: string, slug: string, explicitEmoji?: string | null): string => {
  if (explicitEmoji) return explicitEmoji;

  const nameLower = name.toLowerCase();
  const slugLower = slug.toLowerCase();
  
  // Match by common keywords
  if (nameLower.includes('hardware') || slugLower.includes('hardware')) return '🔧';
  if (nameLower.includes('monitor') || nameLower.includes('tela')) return '🖥️';
  if (nameLower.includes('licen')) return '📜';
  if (nameLower.includes('placa') || nameLower.includes('video') || nameLower.includes('gpu')) return '🎮';
  if (nameLower.includes('notebook') || nameLower.includes('laptop')) return '💻';
  if (nameLower.includes('console') || nameLower.includes('playstation') || nameLower.includes('xbox') || nameLower.includes('game')) return '🎯';
  if (nameLower.includes('office') || nameLower.includes('escritório')) return '🏢';
  if (nameLower.includes('gamer') || nameLower.includes('gaming')) return '⚡';
  if (nameLower.includes('câmera') || nameLower.includes('camera') || nameLower.includes('foto')) return '📷';
  if (nameLower.includes('acessório') || nameLower.includes('acessorio') || nameLower.includes('periferico')) return '🎧';
  if (nameLower.includes('teclado') || nameLower.includes('keyboard')) return '⌨️';
  if (nameLower.includes('mouse')) return '🖱️';
  if (nameLower.includes('fone') || nameLower.includes('headset') || nameLower.includes('audio') || nameLower.includes('som')) return '🎧';
  if (nameLower.includes('rede') || nameLower.includes('network') || nameLower.includes('wifi') || nameLower.includes('internet')) return '📡';
  if (nameLower.includes('armazenamento') || nameLower.includes('ssd') || nameLower.includes('hd') || nameLower.includes('disco')) return '💾';
  if (nameLower.includes('memória') || nameLower.includes('memoria') || nameLower.includes('ram')) return '🧠';
  if (nameLower.includes('processador') || nameLower.includes('cpu')) return '⚙️';
  if (nameLower.includes('fonte') || nameLower.includes('power') || nameLower.includes('energia')) return '🔌';
  if (nameLower.includes('gabinete') || nameLower.includes('case')) return '🖥️';
  if (nameLower.includes('cooler') || nameLower.includes('refrigeração') || nameLower.includes('fan')) return '❄️';
  if (nameLower.includes('cabo') || nameLower.includes('cable') || nameLower.includes('adaptador')) return '🔗';
  if (nameLower.includes('impressora') || nameLower.includes('printer') || nameLower.includes('toner') || nameLower.includes('cartucho')) return '🖨️';
  if (nameLower.includes('celular') || nameLower.includes('smartphone') || nameLower.includes('phone') || nameLower.includes('iphone')) return '📱';
  if (nameLower.includes('tablet') || nameLower.includes('ipad')) return '📱';
  if (nameLower.includes('tv') || nameLower.includes('televisão') || nameLower.includes('smart')) return '📺';
  if (nameLower.includes('drone')) return '🚁';
  if (nameLower.includes('segurança') || nameLower.includes('security') || nameLower.includes('cftv')) return '🔒';
  if (nameLower.includes('software') || nameLower.includes('programa') || nameLower.includes('windows')) return '💿';
  if (nameLower.includes('cadeira') || nameLower.includes('chair')) return '🪑';
  if (nameLower.includes('mesa') || nameLower.includes('desk')) return '🪑';
  if (nameLower.includes('pilha') || nameLower.includes('bateria') || nameLower.includes('battery') || nameLower.includes('nobreak')) return '🔋';
  if (nameLower.includes('cartão') || nameLower.includes('cartao') || nameLower.includes('sd') || nameLower.includes('pen drive')) return '💳';
  if (nameLower.includes('ferramenta')) return '🛠️';
  if (nameLower.includes('promo')) return '🏷️';
  if (nameLower.includes('kit')) return '📦';
  
  // Default emoji for unknown categories
  return '📦';
};
