import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FRAMEWORKS = {
  aida: "AIDA (Attention, Interest, Desire, Action)",
  pas: "PAS (Problem, Agitate, Solution)",
  storytelling: "Storytelling approach",
  direct: "Direct Offer",
  scarcity: "Scarcity & Authority",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, mode = "guided", copywriter = "", targetAudience = "", uniqueValue = "" } = await req.json();

    if (!productName || !productDescription) {
      throw new Error("Product name and description are required");
    }

    console.log(`Copy generation request - Mode: ${mode}, Product: ${productName}, Copywriter: ${copywriter}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "kenny") {
      systemPrompt = `You are Kenny Nwokoye, a Nigerian entrepreneur and digital marketing genius and expert known for his persuasive, conversational, and no-fluff approach with consistency in making crazy sales.`;

      userPrompt = `Write a high-converting sales copy in the style of Kenny Nwokoye. 
The tone should be energetic, engaging, and direct—using storytelling, bold statements, emotional triggers, and a clear call to action. 
Use short, punchy sentences, occasional capital letters, and relevant emojis to make the message pop. DO NOT use markdown formatting like asterisks (**).
The copy should focus on the product ${productName}, highlight key pain points, and position the solution as a must-have. 
End with a strong sense of urgency and a compelling CTA.

Product Description: ${productDescription}${targetAudience ? `\nTarget Audience: ${targetAudience}` : ''}${uniqueValue ? `\nUnique Value: ${uniqueValue}` : ''}`;
    } else if (mode === "expert" && copywriter) {
      systemPrompt = `You are an expert copywriter emulating the legendary style of ${copywriter}. Generate compelling marketing content that captures their unique voice, persuasion techniques, and proven frameworks. Focus on conversion-driven copy that sells.`;
      
      const contextInfo = `
Product Name: ${productName}
Description: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ''}
`;

      userPrompt = `${contextInfo}

In the distinctive style of ${copywriter}, create a comprehensive marketing package with real, ready-to-use copy:

**1. HEADLINE OPTIONS (5 variations)**
Create 5 different headline options that grab attention and promise transformation. Each should be immediately usable in ads or landing pages.

**2. COMPLETE SALES LETTER (500-700 words)**
Write a full persuasive sales letter that:
- Opens with a hook that addresses the main pain point
- Builds desire through storytelling and benefits
- Handles objections naturally
- Creates urgency
- Ends with a compelling call-to-action
Format it ready to paste into an email or landing page.

**3. SHORT AD COPY (5 variations, 50-100 words each)**
Create 5 different short-form ad copies perfect for:
- Facebook/Instagram ads
- Google ads
- Social media posts
Each should be complete and ready to use.

**4. MARKETING STRATEGY**
Provide specific, actionable advice on:
- Which platforms to prioritize
- Best audience targeting approach
- Key messaging angles to emphasize
- Recommended budget allocation

Make every piece authentic to ${copywriter}'s proven techniques. Focus on benefits over features, create emotional resonance, and drive immediate action.`;
    } else {
      systemPrompt = "You are an expert marketing copywriter specializing in high-converting ad copy using proven frameworks. Generate real, ready-to-use copy that drives sales.";
      userPrompt = `Product: ${productName}
Description: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${uniqueValue ? `Unique Value: ${uniqueValue}` : ''}

Generate 5 complete ad copy variations, one for each proven framework below. Each should be ready to use immediately in marketing campaigns.

**For each framework, provide:**
1. **Headline** - Attention-grabbing, benefit-focused (10-15 words)
2. **Body Copy** - Compelling story/pitch (75-150 words)
3. **Call-to-Action** - Specific, action-oriented (5-10 words)

**Frameworks:**
1. **AIDA (Attention, Interest, Desire, Action)** - Grab attention, build interest, create desire, prompt action
2. **PAS (Problem, Agitate, Solution)** - Identify problem, agitate pain points, present solution
3. **Storytelling** - Use narrative and emotional connection to sell transformation
4. **Direct Offer** - Straightforward value proposition with clear benefits
5. **Scarcity & Authority** - Leverage urgency, social proof, and expert positioning

Format each as ready-to-use copy that can be immediately deployed in ads, emails, or landing pages.`;
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

    console.log("Copy generated successfully");

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-copy function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
