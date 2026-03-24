import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Extract LinkedIn job view IDs from any text (markdown, HTML, links)
function extractJobIds(text: string): string[] {
  const ids = new Set<string>();
  const patterns = [
    /linkedin\.com\/jobs\/view\/(\d+)/gi,
    /\/jobs\/view\/(\d+)/gi,
    /"jobId":"(\d+)"/gi,
    /currentJobId=(\d+)/gi,
  ];
  for (const pattern of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      ids.add(m[1]);
    }
  }
  return Array.from(ids);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

  try {
    const body = await req.json();
    const { user_id } = body;
    if (!user_id) throw new Error("user_id is required");

    // ── Fetch user preferences ──────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("job_preferences, linkedin_url, cv_text")
      .eq("user_id", user_id)
      .maybeSingle();

    const prefs = (profile as any)?.job_preferences || {};
    const targetRole: string = prefs.target_role || "";
    const location: string = prefs.location || "";
    const keywords: string = prefs.keywords || "";
    const dailyLimit: number = prefs.daily_limit || 10;

    if (!targetRole) {
      return new Response(
        JSON.stringify({ success: false, error: "No target role set in profile preferences." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check today's usage ─────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
      .from("agent_workflows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .gte("created_at", todayStart.toISOString());

    const slotsRemaining = Math.max(0, dailyLimit - (todayCount || 0));

    if (slotsRemaining === 0) {
      return new Response(
        JSON.stringify({ success: true, jobs_found: 0, jobs_queued: 0, reason: "daily_limit_reached" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build LinkedIn search URL ──────────────────────────────────────────
    // f_LF=f_AL  = Easy Apply only
    // f_TPR=r86400 = posted in last 24 hours
    // sortBy=DD  = most recent first
    const searchTerms = [targetRole, keywords].filter(Boolean).join(" ");
    const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerms)}&location=${encodeURIComponent(location)}&f_LF=f_AL&f_TPR=r86400&sortBy=DD`;

    console.log("Searching LinkedIn:", linkedInUrl);

    const foundJobIds = new Set<string>();

    // ── Strategy 1: Firecrawl scrape of LinkedIn search results ───────────
    if (firecrawlKey) {
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            url: linkedInUrl,
            formats: ["markdown", "links"],
            onlyMainContent: false,
            waitFor: 6000,
          }),
        });
        const scrapeData = await scrapeRes.json();
        const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
        const links: string[] = scrapeData?.data?.links || scrapeData?.links || [];

        console.log(`Scrape: ${markdown.length} chars, ${links.length} links`);

        // Extract from markdown text
        extractJobIds(markdown).forEach((id) => foundJobIds.add(id));

        // Extract from links array
        for (const link of links) {
          extractJobIds(link).forEach((id) => foundJobIds.add(id));
        }

        console.log(`After scrape: ${foundJobIds.size} unique job IDs`);
      } catch (e) {
        console.error("Firecrawl scrape error:", e);
      }
    }

    // ── Strategy 2: Firecrawl search (fallback / supplement) ─────────────
    if (firecrawlKey && foundJobIds.size < slotsRemaining) {
      try {
        const searchQuery = `site:linkedin.com/jobs "${targetRole}" ${location} easy apply`;
        const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            limit: 15,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });
        const searchData = await searchRes.json();
        const results = searchData?.data || [];
        console.log(`Search fallback: ${results.length} results`);

        for (const result of results) {
          // Extract from result URL
          extractJobIds(result.url || "").forEach((id) => foundJobIds.add(id));
          // Extract from result markdown
          extractJobIds(result.markdown || "").forEach((id) => foundJobIds.add(id));
        }

        console.log(`After search fallback: ${foundJobIds.size} unique job IDs`);
      } catch (e) {
        console.error("Firecrawl search error:", e);
      }
    }

    const allFoundUrls = Array.from(foundJobIds).map(
      (id) => `https://www.linkedin.com/jobs/view/${id}/`
    );

    // ── Deduplicate against existing workflows ────────────────────────────
    const { data: existing } = await supabase
      .from("agent_workflows")
      .select("workflow_data")
      .eq("user_id", user_id);

    const existingUrls = new Set(
      (existing || [])
        .map((w: any) => w.workflow_data?.job_url)
        .filter(Boolean)
    );

    const newUrls = allFoundUrls
      .filter((url) => !existingUrls.has(url))
      .slice(0, slotsRemaining);

    console.log(
      `Found ${allFoundUrls.length} total, ${newUrls.length} new (${slotsRemaining} slots available)`
    );

    // ── Create workflows and trigger pipeline ─────────────────────────────
    let queuedCount = 0;
    if (newUrls.length > 0) {
      const workflows = newUrls.map((url) => ({
        user_id,
        product_id: "job-application",
        status: "pending",
        current_agent: "researcher",
        workflow_data: {
          job_url: url,
          linkedin_profile_url: (profile as any)?.linkedin_url || "",
          notes: `Auto-found by LinkedIn agent. Role: ${targetRole}, Location: ${location}${keywords ? `, Keywords: ${keywords}` : ""}`,
          easy_apply_only: true,
          source: "agent_search",
          submitted_at: new Date().toISOString(),
        },
      }));

      const { data: insertedRows, error: insertErr } = await supabase
        .from("agent_workflows")
        .insert(workflows)
        .select();

      if (insertErr) throw insertErr;

      queuedCount = insertedRows?.length || 0;

      // Fire pipeline for each (non-blocking)
      for (const row of insertedRows || []) {
        supabase.functions
          .invoke("process-workflow", { body: { workflow_id: row.id } })
          .catch((err: any) => console.error("Pipeline trigger error:", err));
      }
    }

    // ── Log the search run ────────────────────────────────────────────────
    await supabase.from("job_search_runs").insert({
      user_id,
      jobs_found: allFoundUrls.length,
      jobs_queued: queuedCount,
      search_params: {
        target_role: targetRole,
        location,
        keywords,
        search_url: linkedInUrl,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobs_found: allFoundUrls.length,
        jobs_queued: queuedCount,
        slots_remaining: slotsRemaining - queuedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("search-jobs error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
