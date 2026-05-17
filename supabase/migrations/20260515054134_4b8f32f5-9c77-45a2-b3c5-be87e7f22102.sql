ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
-- Backfill existing image_url into images array if not present
UPDATE public.products SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images,1) IS NULL);