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
    const { topic, context, brainstormType } = await req.json();

    if (!topic) {
      throw new Error("Topic is required");
    }

    console.log(`Brainstorm request - Type: ${brainstormType}, Topic: ${topic.substring(0, 50)}...`);

    let systemPrompt = "";
    let userPrompt = "";

    if (brainstormType === "product") {
      systemPrompt = "You are an innovative product strategist and idea generator who thinks outside the box to create unique, viable product concepts.";
      userPrompt = `Brainstorm product ideas for:

Topic/Challenge: ${topic}
${context ? `Additional Context: ${context}` : ''}

Generate 6-8 unique product ideas. For each idea, provide:
1. **Title** (catchy, descriptive name)
2. **Description** (clear explanation of the product, key features, and how it works)
3. **Potential** (market viability, unique advantages, why it could succeed)

Think creatively but practically. Consider:
- Unmet needs in the market
- Innovative solutions to existing problems
- Technology trends and opportunities
- Different price points and markets
- Scalability and implementation feasibility

Format each idea clearly and make them actionable.`;
    } else if (brainstormType === "marketing") {
      systemPrompt = "You are a creative marketing strategist who develops innovative, results-driven campaign ideas that capture attention and drive conversions.";
      userPrompt = `Brainstorm marketing campaign ideas for:

Topic/Challenge: ${topic}
${context ? `Additional Context: ${context}` : ''}

Generate 6-8 unique marketing campaign concepts. For each campaign, provide:
1. **Title** (compelling campaign name)
2. **Description** (campaign strategy, execution plan, key messaging, channels to use)
3. **Potential** (expected impact, why it would resonate, success metrics)

Think about:
- Multi-channel integration (social, email, content, paid ads)
- Viral potential and shareability
- Emotional triggers and storytelling
- Seasonal opportunities and trends
- Budget considerations and ROI
- Unique angles that competitors aren't using

Make each campaign memorable and executable.`;
    } else if (brainstormType === "content") {
      systemPrompt = "You are a content strategist and creator who generates engaging, valuable content ideas that attract and retain audiences.";
      userPrompt = `Brainstorm content ideas for:

Topic/Challenge: ${topic}
${context ? `Additional Context: ${context}` : ''}

Generate 6-8 unique content concepts. For each content piece, provide:
1. **Title** (attention-grabbing headline)
2. **Description** (content format, key points to cover, angle/hook, platform recommendations)
3. **Potential** (audience appeal, engagement factors, SEO/virality potential)

Consider various formats:
- Blog posts and articles
- Video content (YouTube, TikTok, Reels)
- Social media series
- Podcasts or audio content
- Infographics and visual content
- Interactive content (quizzes, tools, calculators)

Focus on value, engagement, and shareability. Each idea should serve a clear purpose for the audience.`;
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
        tools: [
          {
            type: "function",
            function: {
              name: "brainstorm_ideas",
              description: "Return structured brainstorm ideas",
              parameters: {
                type: "object",
                properties: {
                  ideas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        potential: { type: "string" }
                      },
                      required: ["title", "description", "potential"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["ideas"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "brainstorm_ideas" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No ideas generated");
    }

    const ideas = JSON.parse(toolCall.function.arguments).ideas;

    console.log(`Brainstorm generated successfully - ${ideas.length} ideas`);

    return new Response(
      JSON.stringify({ ideas }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-brainstorm function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
