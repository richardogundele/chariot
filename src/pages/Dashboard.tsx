import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LinkIcon, ClipboardList, Target, Clock, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Briefcase, Search, Zap, AlertCircle,
  RefreshCw, Loader2, Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  current_agent: string | null;
  workflow_data: any;
}

interface SearchRun {
  ran_at: string;
  jobs_found: number;
  jobs_queued: number;
}

const DAILY_LIMIT = 10;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, pending: 0, skipped: 0, review: 0 });
  const [dailyCount, setDailyCount] = useState(0);
  const [lastSearch, setLastSearch] = useState<SearchRun | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchedToday, setSearchedToday] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load applications
      const { data, error } = await supabase
        .from("agent_workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const apps = (data || []) as JobApplication[];
      setApplications(apps);

      // Today's count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayApps = apps.filter(
        (a) => new Date(a.created_at) >= todayStart
      );
      setDailyCount(todayApps.length);

      setStats({
        total: apps.length,
        applied: apps.filter((a) => a.status === "completed").length,
        pending: apps.filter((a) => a.status === "pending" || a.status === "in_progress").length,
        skipped: apps.filter((a) => a.status === "skipped").length,
        review: apps.filter((a) => a.status === "review").length,
      });

      // Load job preferences
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("job_preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      const prefs = (profile as any)?.job_preferences || {};
      setHasPreferences(!!prefs.target_role);

      // Load last search run
      const { data: searchRuns } = await supabase
        .from("job_search_runs")
        .select("ran_at, jobs_found, jobs_queued")
        .eq("user_id", user.id)
        .order("ran_at", { ascending: false })
        .limit(1);

      if (searchRuns && searchRuns.length > 0) {
        setLastSearch(searchRuns[0] as SearchRun);
        // Check if searched today
        const lastRanAt = new Date(searchRuns[0].ran_at);
        setSearchedToday(lastRanAt >= todayStart);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runSearch = async () => {
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("search-jobs", {
        body: { user_id: user.id },
      });

      if (error) throw error;

      if (data?.reason === "daily_limit_reached") {
        toast({
          title: "Daily limit reached",
          description: `You've already applied to ${DAILY_LIMIT} jobs today.`,
        });
      } else {
        toast({
          title: `Search complete`,
          description:
            data?.jobs_queued > 0
              ? `Found ${data.jobs_found} jobs — ${data.jobs_queued} new ones queued through the pipeline.`
              : data?.jobs_found > 0
              ? `Found ${data.jobs_found} jobs but all were already in your pipeline.`
              : `No new Easy Apply jobs found for your search. Try adjusting your role or location in Profile.`,
        });
        setSearchedToday(true);
        await loadData();
      }
    } catch (err: any) {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Applied</Badge>;
      case "review":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Review</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "skipped":
        return <Badge className="bg-muted text-muted-foreground border-border">Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statCards = [
    { title: "Total Jobs", value: stats.total, icon: Briefcase, color: "text-primary" },
    { title: "Applied", value: stats.applied, icon: CheckCircle, color: "text-green-400" },
    { title: "Awaiting Review", value: stats.review, icon: Clock, color: "text-purple-400" },
    { title: "Skipped", value: stats.skipped, icon: XCircle, color: "text-muted-foreground" },
  ];

  const remaining = Math.max(0, DAILY_LIMIT - dailyCount);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Your LinkedIn job agent overview.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/submit-jobs">
              <LinkIcon className="h-4 w-4 mr-2" />
              Submit Jobs Manually
            </Link>
          </Button>
        </div>

        {/* ── Agent Search Card ─────────────────────────────────────────── */}
        <Card className={`border-2 ${hasPreferences ? "border-primary/30 bg-primary/5" : "border-border"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Daily Job Search</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Agent searches LinkedIn for Easy Apply jobs matching your profile
                  </p>
                </div>
              </div>

              {hasPreferences ? (
                <Button
                  onClick={runSearch}
                  disabled={searching || remaining === 0}
                  className="shrink-0"
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching LinkedIn...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {searchedToday ? "Search Again" : "Run Search Now"}
                    </>
                  )}
                </Button>
              ) : (
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Set Up Profile
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Daily quota bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Daily applications used</span>
                <span className={`font-medium ${remaining === 0 ? "text-destructive" : "text-foreground"}`}>
                  {dailyCount} / {DAILY_LIMIT}
                </span>
              </div>
              <Progress value={(dailyCount / DAILY_LIMIT) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {remaining > 0
                  ? `${remaining} slot${remaining !== 1 ? "s" : ""} remaining today`
                  : "Daily limit reached — resets at midnight"}
              </p>
            </div>

            {/* Last search result */}
            {lastSearch ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border text-sm">
                <RefreshCw className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="text-foreground font-medium">
                    Last search: {new Date(lastSearch.ran_at).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    — found {lastSearch.jobs_found} jobs, queued {lastSearch.jobs_queued}
                  </span>
                </div>
                {searchedToday && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    Done today
                  </Badge>
                )}
              </div>
            ) : (
              !hasPreferences && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-400">
                    Set your target role, location, and CV in{" "}
                    <Link to="/profile" className="underline font-medium">
                      Agent Setup
                    </Link>{" "}
                    to enable automated job discovery.
                  </p>
                </div>
              )
            )}

            {/* Review alert */}
            {stats.review > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-medium text-purple-300">
                    {stats.review} job{stats.review !== 1 ? "s" : ""} ready — agent finished, your turn to apply
                  </p>
                </div>
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 shrink-0">
                  <Link to="/applications?filter=review">
                    Review <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-5">
                    <Skeleton className="h-3 w-20 mb-3" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((s) => (
                <Card key={s.title} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {s.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                      </div>
                      <s.icon className={`h-8 w-8 ${s.color} opacity-60`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Recent Applications */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Recent Applications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/applications">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run a job search or submit URLs manually.
                </p>
                <div className="flex gap-3 justify-center">
                  {hasPreferences && (
                    <Button onClick={runSearch} disabled={searching}>
                      {searching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Run Search
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link to="/submit-jobs">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Submit Manually
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 8).map((app) => {
                  const data = app.workflow_data as any;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {data?.job_title || data?.job_url || "Untitled Job"}
                          </p>
                          {data?.source === "agent_search" && (
                            <span title="Found by agent">
                              <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {data?.company || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {data?.fit_score && (
                          <span className="text-sm font-medium text-primary">{data.fit_score}/10</span>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Pipeline Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              How the Agent Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Search", desc: "Finds Easy Apply jobs on LinkedIn", icon: Search },
                { label: "Research", desc: "Scrapes full job description", icon: Briefcase },
                { label: "Strategist", desc: "Scores fit against your CV", icon: Target },
                { label: "Copywriter", desc: "Writes cover note + tailors CV bullets", icon: ClipboardList },
                { label: "You Apply", desc: "Review then click Easy Apply", icon: CheckCircle },
              ].map((step, i) => (
                <div key={step.label} className="p-3 rounded-lg border border-border text-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
