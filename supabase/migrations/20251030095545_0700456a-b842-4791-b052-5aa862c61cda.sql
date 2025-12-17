-- Fix RLS policies for sales_letters table
-- Users should be able to view/manage sales letters for their own products

CREATE POLICY "Users can view their own sales letters"
ON public.sales_letters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales_letters.product_id
    AND products.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create sales letters for their products"
ON public.sales_letters
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales_letters.product_id
    AND products.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own sales letters"
ON public.sales_letters
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales_letters.product_id
    AND products.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own sales letters"
ON public.sales_letters
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = sales_letters.product_id
    AND products.user_id = auth.uid()
  )
);

-- Fix function security by ensuring proper search_path
-- Update existing functions to have explicit search_path

CREATE OR REPLACE FUNCTION public.log_copy_generation(
  p_product_id uuid,
  p_user_id uuid,
  p_copy_type text,
  p_generated_copy text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_letter_id UUID;
BEGIN
  INSERT INTO sales_letters (product_id, title, content)
  VALUES (p_product_id, p_copy_type, p_generated_copy)
  RETURNING id INTO v_letter_id;
  
  RETURN v_letter_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_api_keys_last_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_platform_connections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;