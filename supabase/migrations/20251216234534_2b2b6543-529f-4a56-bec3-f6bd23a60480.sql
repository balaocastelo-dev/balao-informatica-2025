-- Create brands table to store recommended brands
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  gradient TEXT DEFAULT 'from-gray-800 to-gray-900',
  active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Brands are viewable by everyone" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert brands" ON public.brands
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands" ON public.brands
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands" ON public.brands
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for brand images
INSERT INTO storage.buckets (id, name, public) VALUES ('brands', 'brands', true);

-- Storage policies for brands bucket
CREATE POLICY "Brand images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'brands');

CREATE POLICY "Admins can upload brand images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brands' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brands' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand images" ON storage.objects
  FOR DELETE USING (bucket_id = 'brands' AND public.has_role(auth.uid(), 'admin'));

-- Insert default brands
INSERT INTO public.brands (name, slug, gradient, order_index) VALUES
  ('CORSAIR', 'corsair', 'from-gray-900 via-gray-800 to-yellow-600', 1),
  ('NVIDIA', 'nvidia', 'from-green-600 via-green-700 to-gray-900', 2),
  ('INTEL', 'intel', 'from-blue-500 via-blue-600 to-blue-800', 3),
  ('KINGSTON', 'kingston', 'from-red-600 via-red-700 to-gray-900', 4),
  ('LOGITECH', 'logitech', 'from-cyan-400 via-teal-500 to-gray-800', 5),
  ('AMD', 'amd', 'from-red-500 via-red-600 to-gray-900', 6),
  ('HYPERX', 'hyperx', 'from-red-600 via-purple-700 to-gray-900', 7),
  ('ASUS', 'asus', 'from-blue-900 via-gray-800 to-red-600', 8);