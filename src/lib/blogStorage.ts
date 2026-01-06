export type BlogArticle = {
  id: string;
  title: string;
  slug?: string | null;
  content: string;
  cover_image_url?: string | null;
  author?: string | null;
  status: "draft" | "published";
  categories?: string[] | null;
  tags?: string[] | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

const KEY = "BLOG_ARTICLES";

function now() {
  return new Date().toISOString();
}

function readAll(): BlogArticle[] {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as BlogArticle[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: BlogArticle[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    }
  } catch {
    void 0;
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return String(Date.now());
}

export function listAll(): BlogArticle[] {
  const items = readAll();
  return items
    .slice()
    .sort((a, b) => {
      const ap = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bp = b.published_at ? new Date(b.published_at).getTime() : 0;
      if (bp !== ap) return bp - ap;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
}

export function listPublished(opts: { query?: string; tag?: string | null; category?: string | null; page?: number; pageSize?: number } = {}) {
  const { query = "", tag, category, page = 1, pageSize = 12 } = opts;
  const q = query.trim().toLowerCase();
  let items = listAll().filter((i) => i.status === "published");
  if (q) {
    items = items.filter((i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
  }
  if (tag) {
    items = items.filter((i) => Array.isArray(i.tags) && i.tags.includes(tag));
  }
  if (category) {
    items = items.filter((i) => Array.isArray(i.categories) && i.categories.includes(category));
  }
  const total = items.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  return { items: items.slice(from, to), total };
}

export function getBySlugOrId(key: string) {
  const items = readAll();
  return items.find((i) => i.id === key || i.slug === key) || null;
}

export function upsert(input: Omit<BlogArticle, "id" | "created_at" | "updated_at"> & { id?: string }) {
  const items = readAll();
  const nowStr = now();
  let existingIndex = -1;
  if (input.id) {
    existingIndex = items.findIndex((i) => i.id === input.id);
  } else if (input.slug) {
    existingIndex = items.findIndex((i) => i.slug === input.slug);
  }
  const payload: BlogArticle = {
    id: input.id || generateId(),
    title: input.title,
    slug: input.slug || null,
    content: input.content,
    cover_image_url: input.cover_image_url || null,
    author: input.author || null,
    status: input.status || "draft",
    categories: input.categories || null,
    tags: input.tags || null,
    published_at: input.status === "published" ? input.published_at || nowStr : null,
    created_at: existingIndex >= 0 ? items[existingIndex].created_at : nowStr,
    updated_at: nowStr,
  };
  if (existingIndex >= 0) {
    items[existingIndex] = payload;
  } else {
    items.push(payload);
  }
  writeAll(items);
  return payload;
}

export function remove(id: string) {
  const items = readAll();
  const next = items.filter((i) => i.id !== id);
  writeAll(next);
}
