import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid coupon codes that grant Pro access
const VALID_COUPONS = ["JESUSINTECH", "Jesusintech", "jesusintech"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { couponCode } = await req.json();

    if (!couponCode) {
      return new Response(
        JSON.stringify({ success: false, message: "Coupon code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate coupon code (case-insensitive)
    const isValid = VALID_COUPONS.some(
      (code) => code.toLowerCase() === couponCode.toLowerCase()
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid coupon code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = userData.user.id;
    console.log(`Applying coupon ${couponCode} for user ${userId}`);

    // Update user_usage table to set tier to 'pro' and mark as subscribed via coupon
    const { error: updateError } = await supabaseClient
      .from("user_usage")
      .upsert({
        user_id: userId,
        tier: "pro",
        subscribed: true,
        coupon_applied: couponCode.toUpperCase(),
        coupon_applied_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (updateError) {
      console.error("Error updating user usage:", updateError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to apply coupon" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Successfully applied coupon for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Coupon applied successfully! You now have Pro access." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in apply-coupon:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
