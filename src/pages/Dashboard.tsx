import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LinkIcon, ClipboardList, Target, Clock, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  current_agent: string | null;
  workflow_data: any;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, pending: 0, skipped: 0 });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("agent_workflows")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        const apps = (data || []) as JobApplication[];
        setApplications(apps);
        setStats({
          total: apps.length,
          applied: apps.filter(a => a.status === "completed").length,
          pending: apps.filter(a => a.status === "pending" || a.status === "in_progress").length,
          skipped: apps.filter(a => a.status === "skipped").length,
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Applied</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/20 text-primary border-primary/30">In Progress</Badge>;
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
    { title: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
    { title: "Skipped", value: stats.skipped, icon: XCircle, color: "text-muted-foreground" },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Your job application pipeline overview.</p>
          </div>
          <Button asChild>
            <Link to="/submit-jobs">
              <LinkIcon className="h-4 w-4 mr-2" />
              Submit New Jobs
            </Link>
          </Button>
        </div>

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
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.title}</p>
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
                <p className="text-muted-foreground mb-4">Submit your first job URLs to get started.</p>
                <Button asChild>
                  <Link to="/submit-jobs">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Submit Jobs
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => {
                  const data = app.workflow_data as any;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {data?.job_title || data?.job_url || "Untitled Job"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {data?.company || "Unknown Company"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
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

        {/* Agent Pipeline Status */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Agent Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Researcher", "Strategist", "Copywriter", "Executor"].map((agent, i) => (
                <div key={agent} className="p-4 rounded-lg border border-border text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium">{agent}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {i === 0 && "Scrape & extract"}
                    {i === 1 && "Analyse fit"}
                    {i === 2 && "Draft copy"}
                    {i === 3 && "HITL submit"}
                  </p>
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
