-- Create table for generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_images
CREATE POLICY "Users can view their own generated images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for generated copy
CREATE TABLE public.generated_copy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  copywriter_style TEXT NOT NULL,
  generated_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_copy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_copy
CREATE POLICY "Users can view their own generated copy"
ON public.generated_copy
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated copy"
ON public.generated_copy
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated copy"
ON public.generated_copy
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);
CREATE INDEX idx_generated_copy_user_id ON public.generated_copy(user_id);
CREATE INDEX idx_generated_copy_created_at ON public.generated_copy(created_at DESC);