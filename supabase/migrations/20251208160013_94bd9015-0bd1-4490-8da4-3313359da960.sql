-- Create banners table for carousel
CREATE TABLE public.banners (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    link TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for banners
CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Anyone can insert banners" ON public.banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update banners" ON public.banners FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete banners" ON public.banners FOR DELETE USING (true);

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, order_index) VALUES
('Hardware', 'hardware', 1),
('Monitores', 'monitores', 2),
('Licenças', 'licencas', 3),
('Placa de Vídeo', 'placa-de-video', 4),
('Notebooks', 'notebooks', 5),
('Consoles', 'consoles', 6),
('PC Office', 'pc-office', 7),
('PC Gamer', 'pc-gamer', 8),
('Câmeras', 'cameras', 9),
('Acessórios', 'acessorios', 10);