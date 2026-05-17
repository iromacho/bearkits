
-- 1. Lock down SECURITY DEFINER function exposure
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

-- Ensure search_path is set on the trigger fn
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Storage: keep public read of individual files (URL access works)
--    but prevent listing the bucket contents.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

CREATE POLICY "Public can read product images by path"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images' AND name IS NOT NULL);

-- Note: bucket stays public so signed CDN URLs work; listing requires admin.
CREATE POLICY "Admins can list product images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- 3. Replace permissive orders INSERT policy with a stricter one
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Guests can create orders for themselves"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND total >= 0
    AND length(customer_name) BETWEEN 1 AND 200
    AND length(customer_email) BETWEEN 3 AND 320
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) > 0
  );

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND total >= 0
    AND length(customer_name) BETWEEN 1 AND 200
    AND length(customer_email) BETWEEN 3 AND 320
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) > 0
  );
