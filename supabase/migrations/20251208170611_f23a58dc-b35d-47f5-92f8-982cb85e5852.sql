-- Add parent_id column to categories for subcategory support
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Insert hardware subcategories
INSERT INTO public.categories (name, slug, order_index, parent_id) VALUES
  ('Processadores', 'processadores', 1, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('Memória RAM', 'memoria-ram', 2, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('SSD e HD', 'ssd-hd', 3, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('Fontes', 'fontes', 4, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('Placas-mãe', 'placas-mae', 5, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('Coolers', 'coolers', 6, (SELECT id FROM public.categories WHERE slug = 'hardware')),
  ('Gabinetes', 'gabinetes', 7, (SELECT id FROM public.categories WHERE slug = 'hardware'));