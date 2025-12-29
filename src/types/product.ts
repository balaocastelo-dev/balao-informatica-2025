export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  image: string;
  category: Category;
  description?: string;
  stock?: number;
  sourceUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Category = string;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'hardware', name: 'Hardware', icon: '🔧' },
  { id: 'monitores', name: 'Monitores', icon: '🖥️' },
  { id: 'licencas', name: 'Licenças', icon: '📜' },
  { id: 'placa-de-video', name: 'Placa de Vídeo', icon: '🎮' },
  { id: 'notebooks', name: 'Notebooks', icon: '💻' },
  { id: 'consoles', name: 'Consoles', icon: '🎯' },
  { id: 'pc-office', name: 'PC Office', icon: '🏢' },
  { id: 'pc-gamer', name: 'PC Gamer', icon: '⚡' },
];
