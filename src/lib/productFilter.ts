import type { Product } from "@/types/product";

export function filterProductsByQuery(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  });
}

export function mergeUniqueProductsById(lists: Product[][]): Product[] {
  const out: Product[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const p of list) {
      if (!p?.id) continue;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

