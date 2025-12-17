CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid, p_usage_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    WHEN 'free' THEN v_limit := 15;
    WHEN 'pro' THEN v_limit := 50;
    WHEN 'max' THEN v_limit := 100;
    ELSE v_limit := 15;
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
$function$;