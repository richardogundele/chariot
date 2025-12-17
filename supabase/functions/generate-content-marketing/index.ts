import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productDescription, targetAudience, contentGoal, platform } = await req.json();

    if (!productDescription || !platform) {
      throw new Error("Product description and platform are required");
    }

    console.log(`Content marketing request - Platform: ${platform}, Goal: ${contentGoal}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (platform === "whatsapp") {
      systemPrompt = "You are an expert WhatsApp Business marketing strategist specializing in direct messaging campaigns that drive engagement and conversions.";
      userPrompt = `Generate WhatsApp Business content for the following:

Product/Service: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${contentGoal ? `Content Goal: ${contentGoal}` : ''}

Create a complete WhatsApp marketing package with:

1. **BROADCAST MESSAGE (Opening Hook)**
   - Attention-grabbing first message (keep it under 160 characters)
   - Must work without images or formatting

2. **FOLLOW-UP MESSAGE SERIES (3-5 messages)**
   - Natural conversation flow
   - Build interest and trust
   - Include emojis strategically
   - Ask engaging questions

3. **STATUS UPDATES (3 variations)**
   - Short, impactful 24-hour status content
   - Can include call-to-action

4. **RESPONSE TEMPLATES**
   - FAQ responses
   - Objection handling
   - Closing/conversion messages

Make it conversational, personal, and optimized for mobile reading.`;
    } else if (platform === "instagram") {
      systemPrompt = "You are an expert Instagram content creator and social media strategist who creates viral, engaging content that drives results.";
      userPrompt = `Generate Instagram content for the following:

Product/Service: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${contentGoal ? `Content Goal: ${contentGoal}` : ''}

Create a complete Instagram content package with:

1. **FEED POST (3 variations)**
   - Engaging caption with hook (first line CRITICAL)
   - Strategic hashtags (mix of popular and niche, 15-25 total)
   - Call-to-action
   - Emoji usage

2. **STORY SEQUENCE (5-7 slides)**
   - Text overlay suggestions
   - Engagement stickers (polls, questions, sliders)
   - Swipe-up/link placement
   - Story-specific hooks

3. **REEL SCRIPT**
   - Hook (first 3 seconds)
   - Value delivery (15-30 seconds)
   - CTA and trending audio suggestions
   - On-screen text suggestions

4. **CAROUSEL POST OUTLINE**
   - 7-10 slide structure
   - Headline for each slide
   - Design direction notes

Make it visually descriptive, trendy, and optimized for Instagram's algorithm.`;
    } else if (platform === "tiktok") {
      systemPrompt = "You are a viral TikTok content strategist and script writer who understands trends, hooks, and the platform's unique algorithm.";
      userPrompt = `Generate TikTok content for the following:

Product/Service: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${contentGoal ? `Content Goal: ${contentGoal}` : ''}

Create a complete TikTok content package with:

1. **VIRAL VIDEO SCRIPTS (5 different concepts)**
   For each script provide:
   - Hook (First 1-3 seconds - CRITICAL)
   - Script (15-60 seconds)
   - Visual directions
   - Text overlay suggestions
   - Trending sound recommendations
   - Hashtag strategy

2. **CONTENT FRAMEWORKS**
   - POV scenarios
   - Before/After reveals
   - Trending format adaptations
   - Educational "Did you know?" scripts

3. **ENGAGEMENT TACTICS**
   - Comment bait strategies
   - Duet/Stitch opportunities
   - Series ideas for retention

Make it punchy, fast-paced, native to TikTok's style, and optimized for the For You Page algorithm. Focus on hooks that stop the scroll.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    console.log("Content marketing generated successfully");

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-content-marketing function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
