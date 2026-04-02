import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Send, LinkIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobEntry {
  url: string;
  description: string;
}

const SubmitJobs = () => {
  const [jobs, setJobs] = useState<JobEntry[]>([{ url: "", description: "" }]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addJob = () => {
    if (jobs.length >= 5) {
      toast({ title: "Maximum 5 jobs", description: "Quality over volume — max 5 applications per batch.", variant: "destructive" });
      return;
    }
    setJobs([...jobs, { url: "", description: "" }]);
  };

  const removeJob = (index: number) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const updateJob = (index: number, field: keyof JobEntry, value: string) => {
    const updated = [...jobs];
    updated[index] = { ...updated[index], [field]: value };
    setJobs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validJobs = jobs.filter((j) => j.url.trim());

    if (validJobs.length === 0) {
      toast({ title: "No URLs", description: "Please add at least one job URL.", variant: "destructive" });
      return;
    }

    const missingDescriptions = validJobs.filter((j) => !j.description.trim());
    if (missingDescriptions.length > 0) {
      toast({ title: "Missing descriptions", description: "Please paste the job description for each URL.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const workflows = validJobs.map((job) => ({
        user_id: user.id,
        product_id: "job-application",
        status: "pending",
        current_agent: "researcher",
        workflow_data: {
          job_url: job.url,
          job_description: job.description,
          linkedin_profile_url: linkedinUrl,
          notes,
          submitted_at: new Date().toISOString(),
        },
      }));

      const { data: insertedRows, error } = await supabase.from("agent_workflows").insert(workflows).select();
      if (error) throw error;

      toast({ title: "Jobs submitted!", description: `${validJobs.length} job(s) queued — agents are processing...` });

      if (insertedRows) {
        for (const row of insertedRows) {
          supabase.functions.invoke("process-workflow", {
            body: { workflow_id: row.id },
          }).catch((err: any) => console.error("Pipeline trigger error:", err));
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
          <h1 className="text-3xl font-bold text-foreground">Submit Jobs</h1>
          <p className="text-muted-foreground">Paste LinkedIn job URLs and descriptions to start the agent pipeline.</p>
        </div>

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

          {/* Job Entries */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Target Jobs</CardTitle>
                  <CardDescription>Paste the URL and the full job description for each role. Max 5 per batch.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addJob} disabled={jobs.length >= 5}>
                  <Plus className="h-4 w-4 mr-1" /> Add Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {jobs.map((job, i) => (
                <div key={i} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Job {i + 1}</span>
                    {jobs.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeJob(i)}>
                        <Trash2 className="h-4 w-4 text-destructive mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="https://www.linkedin.com/jobs/view/..."
                      value={job.url}
                      onChange={(e) => updateJob(i, "url", e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Paste the full job description here..."
                    value={job.description}
                    onChange={(e) => updateJob(i, "description", e.target.value)}
                    rows={6}
                    className="text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Notes (Optional)</CardTitle>
              <CardDescription>Any special instructions for the agents.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Prioritise roles with visa sponsorship, focus on my Python experience..."
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
                Nothing will be submitted to LinkedIn without your explicit approval. You'll review every draft before the Executor acts.
              </p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit to Agent Pipeline
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmitJobs;
