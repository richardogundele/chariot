-- Create user_usage table to track monthly usage limits
CREATE TABLE public.user_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  products_count integer NOT NULL DEFAULT 0,
  images_count integer NOT NULL DEFAULT 0,
  copies_count integer NOT NULL DEFAULT 0,
  content_marketing_count integer NOT NULL DEFAULT 0,
  subscription_tier text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_end_date timestamptz,
  period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON public.user_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update their own usage"
ON public.user_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can manage all usage records
CREATE POLICY "Service role can manage usage"
ON public.user_usage
FOR ALL
USING (true);

-- Users can insert their own usage record
CREATE POLICY "Users can insert their own usage"
ON public.user_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize usage for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create usage record when user signs up
CREATE TRIGGER on_auth_user_created_usage
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_usage();

-- Function to check and increment usage
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_user_id uuid,
  p_usage_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_usage user_usage%ROWTYPE;
  v_limit integer;
  v_current integer;
  v_tier text;
BEGIN
  -- Get current usage record
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id) VALUES (p_user_id)
    RETURNING * INTO v_usage;
  END IF;
  
  -- Reset counts if new month
  IF v_usage.period_start < date_trunc('month', now()) THEN
    UPDATE user_usage 
    SET products_count = 0, images_count = 0, copies_count = 0, content_marketing_count = 0,
        period_start = date_trunc('month', now())
    WHERE user_id = p_user_id
    RETURNING * INTO v_usage;
  END IF;
  
  v_tier := v_usage.subscription_tier;
  
  -- Determine limit based on tier
  CASE v_tier
    WHEN 'free' THEN v_limit := 5;
    WHEN 'pro' THEN v_limit := 50;
    WHEN 'max' THEN v_limit := 100;
    ELSE v_limit := 5;
  END CASE;
  
  -- Get current count for the usage type
  CASE p_usage_type
    WHEN 'products' THEN v_current := v_usage.products_count;
    WHEN 'images' THEN v_current := v_usage.images_count;
    WHEN 'copies' THEN v_current := v_usage.copies_count;
    WHEN 'content_marketing' THEN v_current := v_usage.content_marketing_count;
    ELSE RETURN jsonb_build_object('allowed', false, 'error', 'Invalid usage type');
  END CASE;
  
  -- Check if limit reached
  IF v_current >= v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'current', v_current, 
      'limit', v_limit, 
      'tier', v_tier,
      'error', 'Usage limit reached'
    );
  END IF;
  
  -- Increment the count
  CASE p_usage_type
    WHEN 'products' THEN UPDATE user_usage SET products_count = products_count + 1 WHERE user_id = p_user_id;
    WHEN 'images' THEN UPDATE user_usage SET images_count = images_count + 1 WHERE user_id = p_user_id;
    WHEN 'copies' THEN UPDATE user_usage SET copies_count = copies_count + 1 WHERE user_id = p_user_id;
    WHEN 'content_marketing' THEN UPDATE user_usage SET content_marketing_count = content_marketing_count + 1 WHERE user_id = p_user_id;
  END CASE;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'current', v_current + 1, 
    'limit', v_limit, 
    'tier', v_tier
  );
END;
$$;