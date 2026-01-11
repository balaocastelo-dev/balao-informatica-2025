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
  ramGb?: number;
  storageGb?: number;
  screenInches?: number;
  status?: 'draft' | 'published' | 'hidden';
  tags?: string[];
  aiGenerated?: boolean;
  aiConfidence?: 'low' | 'medium' | 'high';
}

export type Category = string;

export interface CartItem {
  product: Product;
  quantity: number;
}

