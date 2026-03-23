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
    const easyApplyOnly = workflowData.easy_apply_only !== false; // default true

    // ─── Load user's CV and preferences ───
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("cv_text, full_name, job_title, job_preferences")
      .eq("user_id", workflow.user_id)
      .maybeSingle();

    const cvText = (userProfile as any)?.cv_text || "";
    const candidateName = (userProfile as any)?.full_name || "";
    const jobPrefs = (userProfile as any)?.job_preferences || {};
    const highlightKeywords = jobPrefs.keywords || "";

    // ─── STEP 1: RESEARCHER ───
    await updateWorkflow(supabase, workflow_id, "in_progress", "researcher", workflowData);

    let jobContent = "";
    let jobTitle = "";
    let company = "";
    let isEasyApply = false;

    // Convert LinkedIn collection URLs to direct job view URLs
    const normalizeLinkedInUrl = (url: string): string => {
      const jobIdMatch = url.match(/currentJobId=(\d+)/);
      if (jobIdMatch) {
        return `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
      }
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

      // Step 1b: Fallback to Firecrawl Search if insufficient content
      if (jobContent.length < 200) {
        console.log("Scrape returned insufficient content, falling back to Firecrawl Search...");

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
          for (const result of results) {
            const md = result.markdown || "";
            if (md.length > 200) {
              jobContent = md;
              jobTitle = result.title || jobTitle;
              const atMatch2 = (result.title || "").match(/at\s+(.+?)(?:\s*[-|·]|$)/i);
              if (atMatch2) company = atMatch2[1].trim();
              console.log("Search fallback content length:", jobContent.length);
              break;
            }
          }

          if (jobContent.length < 200) {
            console.warn("Search fallback also returned insufficient content");
            jobContent = `Job URL: ${directJobUrl}. LinkedIn blocked scraping and search returned no results.`;
          }
        } catch (e) {
          console.error("Firecrawl search error:", e);
          jobContent = `Job URL: ${directJobUrl}. Both scrape and search failed.`;
        }
      }
    } else {
      jobContent = `Job URL: ${directJobUrl}. No scraper configured.`;
    }

    // ─── Detect Easy Apply ───
    // LinkedIn Easy Apply is indicated by the button text or URL patterns in the scraped content
    const contentLower = jobContent.toLowerCase();
    isEasyApply =
      contentLower.includes("easy apply") ||
      contentLower.includes("easyapply") ||
      directJobUrl.includes("linkedin.com/jobs/view/") ||
      directJobUrl.includes("linkedin.com/jobs/collections/");

    console.log("Is Easy Apply:", isEasyApply);

    // ─── Skip if not Easy Apply and filter is active ───
    if (easyApplyOnly && !isEasyApply) {
      const skippedData = {
        ...workflowData,
        job_title: jobTitle || "Unknown Position",
        company: company || "Unknown Company",
        skip_reason: "No Easy Apply button detected — skipped per your filter settings.",
        is_easy_apply: false,
        researcher_completed_at: new Date().toISOString(),
      };
      await updateWorkflow(supabase, workflow_id, "skipped", "researcher", skippedData);
      return new Response(
        JSON.stringify({ success: true, workflow_id, status: "skipped", reason: "not_easy_apply" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update with researcher findings
    const researcherData = {
      ...workflowData,
      job_title: jobTitle || "Unknown Position",
      company: company || "Unknown Company",
      job_content: jobContent.slice(0, 8000),
      is_easy_apply: isEasyApply,
      easy_apply_url: directJobUrl,
      researcher_completed_at: new Date().toISOString(),
    };
    await updateWorkflow(supabase, workflow_id, "in_progress", "strategist", researcherData);

    // ─── STEP 2: STRATEGIST ───
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const cvContext = cvText
      ? `\n\n## Candidate's Full CV:\n${cvText.slice(0, 4000)}`
      : "\n\n## Candidate CV: Not provided.";

    const strategistPrompt = `You are the Strategist Agent for a job application system.

Analyse the fit between the candidate and this job posting.

## Job Posting Content:
${jobContent.slice(0, 4000)}

## Job URL: ${jobUrl}
## Candidate LinkedIn: ${linkedinProfileUrl}
## Candidate Name: ${candidateName}
## Candidate Notes: ${notes}
## Keywords to highlight: ${highlightKeywords}
${cvContext}

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

    // ─── STEP 3: COPYWRITER (cover note + connection request + tailored CV bullets) ───
    const cvSection = cvText
      ? `\n\n## Candidate's CV (use to tailor bullets):\n${cvText.slice(0, 3000)}`
      : "";

    const copywriterPrompt = `You are the Copywriter Agent for a LinkedIn job application system.

## Job: ${strategistData.job_title} at ${strategistData.company}
## Job Requirements (excerpt): ${jobContent.slice(0, 2000)}
## Candidate's Top Strengths: ${(fitAnalysis.top_strengths || []).join(", ")}
## Application Strategy: ${fitAnalysis.strategy_summary}
## Fit Score: ${fitAnalysis.fit_score}/10
## Candidate Notes: ${notes}
## Keywords to emphasise: ${highlightKeywords}
${cvSection}

Write ALL three outputs using the provided tool:

1. cover_note: MAX 150 words. Sharp, human, zero AI clichés. No "I'm excited to apply" or "passionate about". Lead with specific value.

2. connection_request: MAX 280 characters. Direct and specific to the role.

3. tailored_cv_bullets: 3-5 bullet points rewritten to match THIS job's requirements. Take the most relevant experiences from the CV and rephrase them to mirror the job description's language and priorities. Use strong action verbs and quantify where possible. These are ready to paste into a CV.`;

    const copywriterRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert copywriter and career coach. Write crisp, human-sounding outreach and targeted CV bullets. Never use generic phrases. Mirror the job description's language.",
          },
          { role: "user", content: copywriterPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "draft_application",
              description: "Return the cover note, connection request, and tailored CV bullets",
              parameters: {
                type: "object",
                properties: {
                  cover_note: { type: "string", description: "Cover note, max 150 words" },
                  connection_request: { type: "string", description: "LinkedIn connection request, max 280 chars" },
                  tailored_cv_bullets: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 tailored CV bullet points matching this specific job",
                  },
                },
                required: ["cover_note", "connection_request", "tailored_cv_bullets"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "draft_application" } },
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
      drafts = { cover_note: "Draft unavailable", connection_request: "Draft unavailable", tailored_cv_bullets: [] };
    }

    // ─── COMPLETE: HITL GATE ───
    const finalData = {
      ...strategistData,
      cover_note: drafts.cover_note,
      connection_request: drafts.connection_request,
      tailored_cv_bullets: drafts.tailored_cv_bullets || [],
      copywriter_completed_at: new Date().toISOString(),
    };

    // status = "review" → waiting for user HITL approval before applying on LinkedIn
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
