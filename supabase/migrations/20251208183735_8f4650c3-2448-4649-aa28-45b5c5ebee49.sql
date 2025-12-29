-- Add customer_data column to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_name text,
ADD COLUMN customer_email text,
ADD COLUMN customer_phone text,
ADD COLUMN customer_address text;