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
import { supabase } from "@/integrations/supabase/client";
import {
  Search, ClipboardList, ExternalLink, Target, Clock, CheckCircle,
  XCircle, Eye, Brain, PenTool, Play, RefreshCw,
} from "lucide-react";

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

  useEffect(() => {
    loadApplications();
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

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground">Track all your job applications and agent progress.</p>
          </div>
          <Button variant="outline" onClick={loadApplications}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
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
              return (
                <Card
                  key={app.id}
                  className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label label="Status">{getStatusBadge(selectedApp.status)}</Label>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Agent</p>
                    <p className="font-medium capitalize">{selectedApp.current_agent || "Queued"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {(selectedApp.workflow_data as any)?.job_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={(selectedApp.workflow_data as any).job_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job Posting
                    </a>
                  </Button>
                )}

                {(selectedApp.workflow_data as any)?.cover_note && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Cover Note</p>
                    <p className="text-sm p-3 rounded-lg bg-muted border border-border">
                      {(selectedApp.workflow_data as any).cover_note}
                    </p>
                  </div>
                )}

                {(selectedApp.workflow_data as any)?.connection_request && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Connection Request</p>
                    <p className="text-sm p-3 rounded-lg bg-muted border border-border">
                      {(selectedApp.workflow_data as any).connection_request}
                    </p>
                  </div>
                )}

                {(selectedApp.workflow_data as any)?.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedApp.workflow_data as any).notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

// Simple label component for the detail dialog
const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
);

export default Applications;
