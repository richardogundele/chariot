import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { workflow_id } = await req.json();
    if (!workflow_id) throw new Error("workflow_id is required");

    // Fetch the workflow
    const { data: workflow, error: fetchErr } = await supabase
      .from("agent_workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();
    if (fetchErr || !workflow) throw new Error("Workflow not found");

    const workflowData = (workflow.workflow_data || {}) as Record<string, any>;
    const jobUrl = workflowData.job_url;
    const linkedinProfileUrl = workflowData.linkedin_profile_url || "";
    const notes = workflowData.notes || "";

    // ─── STEP 1: RESEARCHER ───
    await updateWorkflow(supabase, workflow_id, "in_progress", "researcher", workflowData);

    let jobContent = "";
    let jobTitle = "";
    let company = "";

    // Convert LinkedIn collection URLs to direct job view URLs
    const normalizeLinkedInUrl = (url: string): string => {
      // Extract jobId from URLs like /jobs/collections/recommended/?currentJobId=123
      const jobIdMatch = url.match(/currentJobId=(\d+)/);
      if (jobIdMatch) {
        return `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
      }
      // Already a direct view URL
      if (url.includes("/jobs/view/")) {
        return url;
      }
      return url;
    };

    const directJobUrl = normalizeLinkedInUrl(jobUrl);
    console.log("Original URL:", jobUrl);
    console.log("Normalized URL:", directJobUrl);

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (firecrawlKey && directJobUrl) {
      // Step 1a: Try direct scrape first
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: directJobUrl,
            formats: ["markdown"],
            onlyMainContent: true,
            waitFor: 5000,
          }),
        });

        const scrapeData = await scrapeRes.json();
        console.log("Firecrawl scrape status:", scrapeRes.status);
        
        jobContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
        const metadata = scrapeData?.data?.metadata || scrapeData?.metadata || {};
        jobTitle = metadata.title || "";

        const atMatch = jobTitle.match(/at\s+(.+?)(?:\s*[-|·]|$)/i);
        if (atMatch) company = atMatch[1].trim();

        console.log("Scraped content length:", jobContent.length);
      } catch (e) {
        console.error("Firecrawl scrape error:", e);
      }

      // Step 1b: If scrape returned little/no content, fall back to Firecrawl Search
      if (jobContent.length < 200) {
        console.log("Scrape returned insufficient content, falling back to Firecrawl Search...");
        
        // Extract job ID from URL for search query
        const jobIdMatch = directJobUrl.match(/\/jobs\/view\/(\d+)/);
        const jobId = jobIdMatch ? jobIdMatch[1] : "";
        const searchQuery = `linkedin job posting ${jobId} site:linkedin.com OR site:indeed.com OR site:glassdoor.com`;

        try {
          const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${firecrawlKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: searchQuery,
              limit: 3,
              scrapeOptions: { formats: ["markdown"] },
            }),
          });

          const searchData = await searchRes.json();
          console.log("Firecrawl search status:", searchRes.status);

          const results = searchData?.data || [];
          if (results.length > 0) {
            // Use the first result with meaningful content
            for (const result of results) {
              const md = result.markdown || "";
              if (md.length > 200) {
                jobContent = md;
                jobTitle = result.title || jobTitle;
                // Extract company from search result title
                const atMatch2 = (result.title || "").match(/at\s+(.+?)(?:\s*[-|·]|$)/i);
                if (atMatch2) company = atMatch2[1].trim();
                console.log("Search fallback content length:", jobContent.length);
                break;
              }
            }
          }

          if (jobContent.length < 200) {
            console.warn("Search fallback also returned insufficient content");
            jobContent = `Job URL: ${directJobUrl}. LinkedIn blocked scraping and search returned no results. The AI will work with limited information.`;
          }
        } catch (e) {
          console.error("Firecrawl search error:", e);
          jobContent = `Job URL: ${directJobUrl}. Both scrape and search failed.`;
        }
      }
    } else {
      jobContent = `Job URL: ${directJobUrl}. No scraper configured.`;
    }

    // Update with researcher findings
    const researcherData = {
      ...workflowData,
      job_title: jobTitle || "Unknown Position",
      company: company || "Unknown Company",
      job_content: jobContent.slice(0, 8000), // Keep reasonable size
      researcher_completed_at: new Date().toISOString(),
    };
    await updateWorkflow(supabase, workflow_id, "in_progress", "strategist", researcherData);

    // ─── STEP 2: STRATEGIST ───
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const strategistPrompt = `You are the Strategist Agent for a job application system. 

Analyse the fit between the candidate and this job posting.

## Job Posting Content:
${jobContent.slice(0, 6000)}

## Job URL: ${jobUrl}
## Candidate LinkedIn: ${linkedinProfileUrl}
## Candidate Notes: ${notes}

Return your analysis using the provided tool.`;

    const strategistRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a career strategist. Analyse job fit precisely. Be direct and actionable." },
          { role: "user", content: strategistPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_fit_analysis",
              description: "Report the fit analysis between candidate and job",
              parameters: {
                type: "object",
                properties: {
                  fit_score: { type: "number", description: "Fit score 1-10" },
                  top_strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Top 3 value-fit strengths the candidate brings",
                  },
                  gaps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key gaps or risks",
                  },
                  strategy_summary: { type: "string", description: "2-3 sentence strategy for the application" },
                  should_apply: { type: "boolean", description: "Whether the candidate should apply" },
                },
                required: ["fit_score", "top_strengths", "gaps", "strategy_summary", "should_apply"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_fit_analysis" } },
      }),
    });

    if (!strategistRes.ok) {
      const errText = await strategistRes.text();
      console.error("Strategist AI error:", strategistRes.status, errText);
      throw new Error(`Strategist AI failed: ${strategistRes.status}`);
    }

    const strategistResult = await strategistRes.json();
    let fitAnalysis: any = {};
    try {
      const toolCall = strategistResult.choices?.[0]?.message?.tool_calls?.[0];
      fitAnalysis = JSON.parse(toolCall?.function?.arguments || "{}");
    } catch {
      fitAnalysis = { fit_score: 5, top_strengths: [], gaps: [], strategy_summary: "Analysis unavailable", should_apply: true };
    }

    const strategistData = {
      ...researcherData,
      fit_score: fitAnalysis.fit_score,
      top_strengths: fitAnalysis.top_strengths,
      gaps: fitAnalysis.gaps,
      strategy_summary: fitAnalysis.strategy_summary,
      should_apply: fitAnalysis.should_apply,
      strategist_completed_at: new Date().toISOString(),
    };
    await updateWorkflow(supabase, workflow_id, "in_progress", "copywriter", strategistData);

    // ─── STEP 3: COPYWRITER ───
    const copywriterPrompt = `You are the Copywriter Agent. Write bespoke outreach for this job application.

## Job: ${strategistData.job_title} at ${strategistData.company}
## Job Content (excerpt): ${jobContent.slice(0, 3000)}
## Candidate's Top Strengths: ${(fitAnalysis.top_strengths || []).join(", ")}
## Strategy: ${fitAnalysis.strategy_summary}
## Fit Score: ${fitAnalysis.fit_score}/10
## Candidate Notes: ${notes}

Rules:
- Cover note: MAX 150 words. Sharp, human, zero AI clichés. No "I'm excited to apply" or "passionate about".
- Connection request: MAX 280 characters. Direct, specific to the role.
- Sound like a real person, not a bot.`;

    const copywriterRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert copywriter for job applications. Write crisp, human-sounding outreach. No generic phrases." },
          { role: "user", content: copywriterPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "draft_outreach",
              description: "Return the drafted cover note and connection request",
              parameters: {
                type: "object",
                properties: {
                  cover_note: { type: "string", description: "Cover note, max 150 words" },
                  connection_request: { type: "string", description: "LinkedIn connection request, max 280 chars" },
                },
                required: ["cover_note", "connection_request"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "draft_outreach" } },
      }),
    });

    if (!copywriterRes.ok) {
      const errText = await copywriterRes.text();
      console.error("Copywriter AI error:", copywriterRes.status, errText);
      throw new Error(`Copywriter AI failed: ${copywriterRes.status}`);
    }

    const copywriterResult = await copywriterRes.json();
    let drafts: any = {};
    try {
      const toolCall = copywriterResult.choices?.[0]?.message?.tool_calls?.[0];
      drafts = JSON.parse(toolCall?.function?.arguments || "{}");
    } catch {
      drafts = { cover_note: "Draft unavailable", connection_request: "Draft unavailable" };
    }

    // ─── COMPLETE: HITL GATE ───
    const finalData = {
      ...strategistData,
      cover_note: drafts.cover_note,
      connection_request: drafts.connection_request,
      copywriter_completed_at: new Date().toISOString(),
    };

    // Status = "review" means waiting for HITL approval
    await updateWorkflow(supabase, workflow_id, "review", "executor", finalData);

    return new Response(
      JSON.stringify({ success: true, workflow_id, status: "review", fit_score: fitAnalysis.fit_score }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pipeline error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateWorkflow(
  supabase: any,
  id: string,
  status: string,
  currentAgent: string,
  workflowData: Record<string, any>
) {
  const { error } = await supabase
    .from("agent_workflows")
    .update({
      status,
      current_agent: currentAgent,
      workflow_data: workflowData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Update workflow error:", error);
}
