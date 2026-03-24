import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Send, LinkIcon, AlertCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DAILY_LIMIT = 10;

const SubmitJobs = () => {
  const [jobUrls, setJobUrls] = useState<string[]>([""]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [easyApplyOnly, setEasyApplyOnly] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user's saved LinkedIn URL and preferences, plus today's count
  useEffect(() => {
    const loadContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load saved LinkedIn URL + job preferences
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("linkedin_url, job_preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        if ((profile as any).linkedin_url) setLinkedinUrl((profile as any).linkedin_url);
        const prefs = (profile as any).job_preferences || {};
        if (prefs.easy_apply_only !== undefined) setEasyApplyOnly(prefs.easy_apply_only);
      }

      // Count today's applications
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("agent_workflows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      setDailyCount(count || 0);
    };

    loadContext();
  }, []);

  const remaining = Math.max(0, DAILY_LIMIT - dailyCount);

  const addUrl = () => {
    if (jobUrls.length >= remaining) {
      toast({
        title: `Daily limit reached`,
        description: `You've used ${dailyCount}/${DAILY_LIMIT} applications today.`,
        variant: "destructive",
      });
      return;
    }
    setJobUrls([...jobUrls, ""]);
  };

  const removeUrl = (index: number) => {
    setJobUrls(jobUrls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const updated = [...jobUrls];
    updated[index] = value;
    setJobUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = jobUrls.filter((url) => url.trim());

    if (validUrls.length === 0) {
      toast({ title: "No URLs", description: "Add at least one job URL.", variant: "destructive" });
      return;
    }

    const invalidUrls = validUrls.filter((url) => !url.includes("linkedin.com"));
    if (invalidUrls.length > 0) {
      toast({ title: "Invalid URLs", description: "All URLs must be LinkedIn job postings.", variant: "destructive" });
      return;
    }

    if (dailyCount + validUrls.length > DAILY_LIMIT) {
      toast({
        title: "Daily limit exceeded",
        description: `You can only submit ${remaining} more job(s) today.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const workflows = validUrls.map((url) => ({
        user_id: user.id,
        product_id: "job-application",
        status: "pending",
        current_agent: "researcher",
        workflow_data: {
          job_url: url,
          linkedin_profile_url: linkedinUrl,
          notes,
          easy_apply_only: easyApplyOnly,
          submitted_at: new Date().toISOString(),
        },
      }));

      const { data: insertedRows, error } = await supabase
        .from("agent_workflows")
        .insert(workflows)
        .select();
      if (error) throw error;

      toast({
        title: "Jobs queued!",
        description: `${validUrls.length} job(s) sent to the agent pipeline.`,
      });

      if (insertedRows) {
        for (const row of insertedRows) {
          supabase.functions
            .invoke("process-workflow", { body: { workflow_id: row.id } })
            .catch((err: any) => console.error("Pipeline trigger error:", err));
        }
      }

      navigate("/applications");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submit Jobs</h1>
              <p className="text-muted-foreground">Paste LinkedIn job URLs to start the agent pipeline.</p>
            </div>
            {/* Daily quota badge */}
            <div className="text-right">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                remaining === 0
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : remaining <= 3
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-green-500/10 text-green-400 border-green-500/20"
              }`}>
                <Zap className="h-3.5 w-3.5" />
                {dailyCount}/{DAILY_LIMIT} today
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {remaining} slot{remaining !== 1 ? "s" : ""} left
              </p>
            </div>
          </div>
        </div>

        {remaining === 0 ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Daily limit reached</h3>
              <p className="text-muted-foreground text-sm">
                You've submitted {DAILY_LIMIT} jobs today. Come back tomorrow.
              </p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LinkedIn Profile */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Your LinkedIn Profile</CardTitle>
                <CardDescription>Used by the Strategist agent to analyse fit.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="https://www.linkedin.com/in/your-slug"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Job URLs */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Target Job URLs</CardTitle>
                    <CardDescription>
                      Up to {remaining} more job{remaining !== 1 ? "s" : ""} today.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUrl}
                    disabled={jobUrls.length >= remaining}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add URL
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="https://www.linkedin.com/jobs/view/..."
                        value={url}
                        onChange={(e) => updateUrl(i, e.target.value)}
                      />
                    </div>
                    {jobUrls.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeUrl(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Easy Apply Filter */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Control how the agent processes these jobs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">Easy Apply Only</p>
                    <p className="text-xs text-muted-foreground">
                      Skip jobs without LinkedIn Easy Apply — the agent can't submit those automatically
                    </p>
                  </div>
                  <Switch checked={easyApplyOnly} onCheckedChange={setEasyApplyOnly} />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Notes (Optional)</CardTitle>
                <CardDescription>Special instructions for the agents.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g. Prioritise roles with visa sponsorship, focus on my Python experience..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* HITL Notice */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">HITL Gate Active</p>
                <p className="text-sm text-muted-foreground">
                  The agent researches, scores fit, tailors your CV bullets, and writes cover notes. You review
                  everything before clicking Apply on LinkedIn.
                </p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit {jobUrls.filter((u) => u.trim()).length || ""} Job
                  {jobUrls.filter((u) => u.trim()).length !== 1 ? "s" : ""} to Agent Pipeline
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default SubmitJobs;
