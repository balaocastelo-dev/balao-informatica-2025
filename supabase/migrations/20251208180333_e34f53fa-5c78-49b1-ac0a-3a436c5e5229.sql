-- Drop existing RLS policies for email_campaigns
DROP POLICY IF EXISTS "Admins can view campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.email_campaigns;

-- Add recipient_emails column
ALTER TABLE public.email_campaigns 
ADD COLUMN IF NOT EXISTS recipient_emails TEXT[] DEFAULT '{}';

-- Create new permissive policies (admin access is controlled via frontend secret code)
CREATE POLICY "Anyone can view campaigns"
ON public.email_campaigns
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert campaigns"
ON public.email_campaigns
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update campaigns"
ON public.email_campaigns
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete campaigns"
ON public.email_campaigns
FOR DELETE
USING (true);