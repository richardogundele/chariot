import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, ClipboardList, ExternalLink, Target, Clock, CheckCircle,
  XCircle, Brain, PenTool, Play, RefreshCw, Zap, Copy, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  current_agent: string | null;
  workflow_data: any;
  completed_at: string | null;
}

const Applications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("workflow-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "agent_workflows",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setApplications((prev) => prev.filter((a) => a.id !== payload.old.id));
            } else if (payload.eventType === "INSERT") {
              setApplications((prev) => [payload.new as JobApplication, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setApplications((prev) =>
                prev.map((a) => (a.id === payload.new.id ? (payload.new as JobApplication) : a))
              );
              // Auto-update selected app if it's open
              setSelectedApp((prev) =>
                prev && prev.id === payload.new.id ? (payload.new as JobApplication) : prev
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtime();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("agent_workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data || []) as JobApplication[]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markApplied = async (appId: string) => {
    const { error } = await supabase
      .from("agent_workflows")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", appId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as Applied!", description: "Application recorded successfully." });
      setSelectedApp(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const filtered = applications.filter((app) => {
    const data = app.workflow_data as any;
    const matchesSearch =
      !searchQuery ||
      (data?.job_url || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data?.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data?.job_title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      completed: { className: "bg-green-500/20 text-green-400 border-green-500/30", label: "Applied" },
      review: { className: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Awaiting Review" },
      in_progress: { className: "bg-primary/20 text-primary border-primary/30", label: "In Progress" },
      pending: { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Pending" },
      skipped: { className: "bg-muted text-muted-foreground border-border", label: "Skipped" },
    };
    const s = map[status] || { className: "", label: status };
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getAgentIcon = (agent: string | null) => {
    switch (agent) {
      case "researcher": return <Search className="h-4 w-4" />;
      case "strategist": return <Brain className="h-4 w-4" />;
      case "copywriter": return <PenTool className="h-4 w-4" />;
      case "executor": return <Play className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Counts
  const reviewCount = applications.filter((a) => a.status === "review").length;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground">Track all your job applications and agent progress.</p>
          </div>
          <div className="flex items-center gap-3">
            {reviewCount > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-3 py-1">
                {reviewCount} awaiting your review
              </Badge>
            )}
            <Button variant="outline" onClick={loadApplications}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by company, title, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Awaiting Review</SelectItem>
              <SelectItem value="completed">Applied</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                {applications.length === 0
                  ? "Submit job URLs to start your pipeline."
                  : "No applications match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const data = app.workflow_data as any;
              const isReview = app.status === "review";
              return (
                <Card
                  key={app.id}
                  className={`border-border transition-colors cursor-pointer ${
                    isReview
                      ? "hover:border-purple-500/40 border-purple-500/20"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isReview ? "bg-purple-500/10" : "bg-primary/10"
                        }`}>
                          {getAgentIcon(app.current_agent)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {data?.job_title || data?.job_url || "Untitled Job"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{data?.company || "—"}</span>
                            <span>·</span>
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                            {data?.is_easy_apply && (
                              <>
                                <span>·</span>
                                <span className="text-green-400 flex items-center gap-1">
                                  <Zap className="h-3 w-3" /> Easy Apply
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {data?.fit_score && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{data.fit_score}</p>
                            <p className="text-xs text-muted-foreground">/10</p>
                          </div>
                        )}
                        {getStatusBadge(app.status)}
                        {isReview && (
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                    {data?.skip_reason && (
                      <p className="mt-2 text-xs text-muted-foreground pl-13">
                        Skipped: {data.skip_reason}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedApp?.workflow_data?.job_title || "Application Details"}
              </DialogTitle>
            </DialogHeader>
            {selectedApp && (() => {
              const data = selectedApp.workflow_data as any;
              const isReady = selectedApp.status === "review";

              return (
                <div className="space-y-4">
                  {/* Status row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(selectedApp.status)}
                    {data?.is_easy_apply && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Zap className="h-3 w-3 mr-1" /> Easy Apply
                      </Badge>
                    )}
                    {data?.fit_score && (
                      <span className="text-sm font-medium text-primary">
                        Fit: {data.fit_score}/10
                      </span>
                    )}
                  </div>

                  {data?.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{data.company}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                  </div>

                  {/* HITL Apply Section */}
                  {isReady && (
                    <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-3">
                      <p className="text-sm font-semibold text-purple-300">
                        Ready to Apply — review below, then click Apply on LinkedIn
                      </p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => window.open(data.easy_apply_url || data.job_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Easy Apply on LinkedIn
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => markApplied(selectedApp.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Applied
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tabs: Analysis / Cover Note / CV Bullets */}
                  {(data?.fit_score || data?.cover_note || (data?.tailored_cv_bullets?.length > 0)) && (
                    <Tabs defaultValue={isReady ? "cover" : "analysis"}>
                      <TabsList className="w-full">
                        <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
                        <TabsTrigger value="cover" className="flex-1">Cover Note</TabsTrigger>
                        <TabsTrigger value="cv" className="flex-1">CV Bullets</TabsTrigger>
                      </TabsList>

                      {/* Analysis Tab */}
                      <TabsContent value="analysis" className="space-y-3 mt-3">
                        {data?.fit_score && (
                          <div className="p-3 rounded-lg bg-muted border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Fit Score</p>
                              <p className="text-2xl font-bold text-primary">
                                {data.fit_score}
                                <span className="text-sm text-muted-foreground">/10</span>
                              </p>
                            </div>
                            {data.strategy_summary && (
                              <p className="text-sm text-muted-foreground">{data.strategy_summary}</p>
                            )}
                          </div>
                        )}

                        {data?.top_strengths?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Top Strengths</p>
                            <ul className="space-y-1">
                              {data.top_strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {data?.gaps?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Gaps / Risks</p>
                            <ul className="space-y-1">
                              {data.gaps.map((g: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TabsContent>

                      {/* Cover Note Tab */}
                      <TabsContent value="cover" className="space-y-3 mt-3">
                        {data?.cover_note && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-muted-foreground">Cover Note</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(data.cover_note, "Cover note")}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                              </Button>
                            </div>
                            <p className="text-sm p-3 rounded-lg bg-muted border border-border whitespace-pre-wrap">
                              {data.cover_note}
                            </p>
                          </div>
                        )}

                        {data?.connection_request && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-muted-foreground">Connection Request</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(data.connection_request, "Connection request")}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                              </Button>
                            </div>
                            <p className="text-sm p-3 rounded-lg bg-muted border border-border">
                              {data.connection_request}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tailored CV Bullets Tab */}
                      <TabsContent value="cv" className="space-y-3 mt-3">
                        {data?.tailored_cv_bullets?.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Tailored CV Bullets
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    (data.tailored_cv_bullets as string[]).map((b) => `• ${b}`).join("\n"),
                                    "CV bullets"
                                  )
                                }
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              These bullets are rewritten to match this specific job's language. Update your CV before applying.
                            </p>
                            <ul className="space-y-2">
                              {(data.tailored_cv_bullets as string[]).map((bullet, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5 shrink-0">•</span>
                                  <p className="text-sm p-2 rounded bg-muted border border-border flex-1">
                                    {bullet}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              {!data?.cover_note
                                ? "Agent is still processing..."
                                : "Add your CV to your profile to get tailored bullet points."}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}

                  {/* Skip reason */}
                  {data?.skip_reason && (
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Skipped: </span>
                        {data.skip_reason}
                      </p>
                    </div>
                  )}

                  {/* Job link */}
                  {data?.job_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={data.job_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Job Posting
                      </a>
                    </Button>
                  )}

                  {data?.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Your Notes</p>
                      <p className="text-sm text-muted-foreground">{data.notes}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Applications;
