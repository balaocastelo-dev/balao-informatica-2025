-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC NOT NULL,
  min_cart_value NUMERIC,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure code is stored in uppercase
CREATE OR REPLACE FUNCTION public.coupons_uppercase_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS coupons_upper_code_trg ON public.coupons;
CREATE TRIGGER coupons_upper_code_trg
BEFORE INSERT OR UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.coupons_uppercase_code();

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can validate coupons (read)
CREATE POLICY "Public can read coupons"
ON public.coupons FOR SELECT
USING (true);

-- Admins can manage coupons
CREATE POLICY "Admins can insert coupons"
ON public.coupons FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coupons"
ON public.coupons FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons"
ON public.coupons FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Orders updates: add coupon fields
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_consumed BOOLEAN NOT NULL DEFAULT false;

-- Helpful index on coupons.code
CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons (code);

