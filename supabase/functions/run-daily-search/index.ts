import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * run-daily-search
 *
 * Called once per day by the pg_cron scheduler (or manually).
 * Loops through every user who has a target_role set in job_preferences
 * and hasn't had a search run today, then fires search-jobs for each one.
 *
 * Trigger SQL (run in Supabase SQL editor after deployment):
 *   SELECT cron.schedule(
 *     'daily-linkedin-job-search',
 *     '0 7 * * *',   -- 7 AM UTC every day
 *     $$
 *     SELECT net.http_post(
 *       url      := 'https://<PROJECT_REF>.supabase.co/functions/v1/run-daily-search',
 *       headers  := jsonb_build_object(
 *                     'Content-Type', 'application/json',
 *                     'Authorization', 'Bearer ' || current_setting('app.service_role_key')
 *                   ),
 *       body     := '{}'::jsonb
 *     ) AS request_id;
 *     $$
 *   );
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // ── Find all users who have a target_role configured ─────────────────
    const { data: profiles, error: profilesErr } = await supabase
      .from("user_profiles")
      .select("user_id, job_preferences");

    if (profilesErr) throw profilesErr;

    const eligibleUsers = (profiles || []).filter((p: any) => {
      const prefs = p.job_preferences || {};
      return !!prefs.target_role; // only users who set a target role
    });

    console.log(`Eligible users: ${eligibleUsers.length}`);

    // ── Check which ones haven't had a search today ───────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayRuns } = await supabase
      .from("job_search_runs")
      .select("user_id")
      .gte("ran_at", todayStart.toISOString());

    const alreadyRanIds = new Set((todayRuns || []).map((r: any) => r.user_id));

    const toSearch = eligibleUsers.filter(
      (p: any) => !alreadyRanIds.has(p.user_id)
    );

    console.log(`Users to search today: ${toSearch.length}`);

    // ── Invoke search-jobs for each user ──────────────────────────────────
    const results: Array<{ user_id: string; result?: any; error?: string }> = [];

    for (const profile of toSearch) {
      try {
        const { data, error } = await supabase.functions.invoke("search-jobs", {
          body: { user_id: profile.user_id },
        });

        if (error) throw error;

        results.push({ user_id: profile.user_id, result: data });
        console.log(
          `User ${profile.user_id}: found ${data?.jobs_found}, queued ${data?.jobs_queued}`
        );

        // Brief pause between users to avoid hammering Firecrawl
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err: any) {
        console.error(`Error for user ${profile.user_id}:`, err);
        results.push({ user_id: profile.user_id, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        users_processed: results.length,
        results,
        ran_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("run-daily-search error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
