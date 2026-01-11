import { ReactNode } from 'react';

export const categoryIcons: Record<string, string> = {
  'hardware': '🔧',
  'monitores': '🖥️',
  'licencas': '📜',
  'placa-de-video': '🎮',
  'notebooks': '💻',
  'consoles': '🎯',
  'pc-office': '🏢',
  'pc-gamer': '⚡',
  'cameras': '📷',
  'acessorios': '🎧',
};

export const getCategoryIcon = (slug: string): string => {
  return categoryIcons[slug] || '📦';
};
