-- Add position column to banners table for different banner placements
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT 'hero';

-- Add a comment to clarify the positions
COMMENT ON COLUMN public.banners.position IS 'Banner position: hero, sidebar, between_categories, footer_top';

-- Create index for faster filtering by position
CREATE INDEX IF NOT EXISTS idx_banners_position ON public.banners(position);
