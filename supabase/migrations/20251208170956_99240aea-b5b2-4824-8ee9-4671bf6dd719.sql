-- Create page_blocks table for homepage layout management
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL, -- 'banner', 'category', 'separator'
  title text, -- Display title for category blocks
  category_slug text, -- For category blocks, references category slug
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Page blocks are viewable by everyone" 
ON public.page_blocks FOR SELECT USING (true);

CREATE POLICY "Anyone can insert page blocks" 
ON public.page_blocks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update page blocks" 
ON public.page_blocks FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete page blocks" 
ON public.page_blocks FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_page_blocks_updated_at
BEFORE UPDATE ON public.page_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default blocks
INSERT INTO public.page_blocks (block_type, title, category_slug, order_index) VALUES
  ('banner', 'Banner Principal', null, 1),
  ('category', 'PC Gamer', 'pc-gamer', 2),
  ('category', 'Monitores', 'monitores', 3),
  ('category', 'Hardware', 'hardware', 4),
  ('category', 'Notebooks', 'notebooks', 5),
  ('category', 'Consoles', 'consoles', 6);