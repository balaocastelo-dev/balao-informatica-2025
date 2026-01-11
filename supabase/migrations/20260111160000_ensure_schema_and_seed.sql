-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    order_index INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- Ensure products table has all columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ram_gb NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage_gb NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS screen_inches NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_confidence TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS final_price NUMERIC(10,2);

-- Handle potential schema mismatch (final_price vs price)
-- Se a tabela ja existia com final_price, vamos garantir que price seja preenchido
DO $$
BEGIN
    UPDATE public.products SET price = final_price WHERE price IS NULL;
    UPDATE public.products SET final_price = price WHERE final_price IS NULL;
END $$;



-- Seed Categories (upsert based on slug)
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
('Acessórios', 'acessorios', 10),
-- Categorias adicionais do menu
('Processadores', 'processadores', 11),
('Placas-mãe', 'placas-mae', 12),
('Memória RAM', 'memoria-ram', 13),
('Armazenamento', 'ssd-hd', 14),
('Gabinetes', 'gabinetes', 15),
('Áudio', 'headset', 16),
('Redes', 'rede', 17)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index;

-- Seed Products (upsert based on ID to ensure idempotency)
INSERT INTO public.products (id, name, price, final_price, cost_price, image, category, description, stock, created_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Processador AMD Ryzen 5 5600X 3.7GHz (4.6GHz Turbo) 6-Cores 12-Threads', 899.99, 899.99, 720.00, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&h=500&fit=crop', 'processadores', 'Processador AMD Ryzen 5 5600X com arquitetura Zen 3, 6 núcleos e 12 threads.', 15, now()),
('10000000-0000-0000-0000-000000000002', 'Placa de Vídeo NVIDIA GeForce RTX 4060 8GB GDDR6', 2499.99, 2499.99, 2000.00, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&h=500&fit=crop', 'placa-de-video', 'Placa de vídeo RTX 4060 com Ray Tracing e DLSS 3.', 8, now()),
('10000000-0000-0000-0000-000000000003', 'Monitor Gamer LG UltraGear 27" 144Hz 1ms IPS', 1599.99, 1599.99, 1280.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop', 'monitores', 'Monitor gamer 27 polegadas com painel IPS, 144Hz e tempo de resposta de 1ms.', 12, now()),
('10000000-0000-0000-0000-000000000004', 'Notebook Gamer ASUS TUF Gaming F15 i5-12500H RTX 3050', 4999.99, 4999.99, 4000.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop', 'notebooks', 'Notebook gamer com Intel Core i5-12500H, RTX 3050 e 16GB de RAM.', 5, now()),
('10000000-0000-0000-0000-000000000005', 'Console PlayStation 5 Edição Digital', 3799.99, 3799.99, 3200.00, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop', 'consoles', 'PlayStation 5 edição digital sem leitor de disco.', 3, now()),
('10000000-0000-0000-0000-000000000006', 'Memória RAM Kingston Fury Beast 16GB DDR4 3200MHz', 299.99, 299.99, 240.00, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&h=500&fit=crop', 'memoria-ram', 'Memória RAM DDR4 16GB com velocidade de 3200MHz.', 25, now()),
('10000000-0000-0000-0000-000000000007', 'SSD NVMe Samsung 980 PRO 1TB M.2', 699.99, 699.99, 560.00, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop', 'ssd-hd', 'SSD NVMe com velocidade de leitura de até 7000MB/s.', 20, now()),
('10000000-0000-0000-0000-000000000008', 'Microsoft Office 365 Personal - Licença Anual', 299.99, 299.99, 200.00, 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=500&h=500&fit=crop', 'licencas', 'Licença anual do Microsoft Office 365 para 1 usuário.', 100, now()),
('10000000-0000-0000-0000-000000000009', 'PC Gamer Completo - RTX 4070 + i7-13700K + 32GB RAM', 12999.99, 12999.99, 10500.00, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&h=500&fit=crop', 'pc-gamer', 'PC Gamer de alta performance com RTX 4070, Intel i7-13700K e 32GB RAM.', 2, now()),
('10000000-0000-0000-0000-000000000010', 'PC Office Completo - i5-12400 + 16GB RAM + SSD 480GB', 3299.99, 3299.99, 2640.00, 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500&h=500&fit=crop', 'pc-office', 'PC para escritório com Intel i5-12400, 16GB RAM e SSD 480GB.', 7, now()),
('10000000-0000-0000-0000-000000000011', 'Placa de Vídeo AMD Radeon RX 7800 XT 16GB', 3299.99, 3299.99, 2640.00, 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=500&h=500&fit=crop', 'placa-de-video', 'Placa de vídeo AMD Radeon RX 7800 XT com 16GB GDDR6.', 6, now()),
('10000000-0000-0000-0000-000000000012', 'Monitor Curvo Samsung Odyssey G5 32" 165Hz', 1899.99, 1899.99, 1520.00, 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500&h=500&fit=crop', 'monitores', 'Monitor curvo 32" com taxa de atualização de 165Hz.', 9, now())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    final_price = EXCLUDED.final_price,
    cost_price = EXCLUDED.cost_price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    stock = EXCLUDED.stock;

