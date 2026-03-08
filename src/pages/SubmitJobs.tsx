import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Send, LinkIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubmitJobs = () => {
  const [jobUrls, setJobUrls] = useState<string[]>([""]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addUrl = () => {
    if (jobUrls.length >= 5) {
      toast({ title: "Maximum 5 jobs", description: "Quality over volume — max 5 applications per batch.", variant: "destructive" });
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

  const isValidLinkedInUrl = (url: string) => {
    return url.includes("linkedin.com/jobs") || url.includes("linkedin.com/in/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = jobUrls.filter((url) => url.trim());

    if (validUrls.length === 0) {
      toast({ title: "No URLs", description: "Please add at least one job URL.", variant: "destructive" });
      return;
    }

    const invalidUrls = validUrls.filter((url) => !url.includes("linkedin.com"));
    if (invalidUrls.length > 0) {
      toast({ title: "Invalid URLs", description: "All URLs must be LinkedIn job postings.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a workflow for each job URL
      const workflows = validUrls.map((url) => ({
        user_id: user.id,
        product_id: "job-application",
        status: "pending",
        current_agent: "researcher",
        workflow_data: {
          job_url: url,
          linkedin_profile_url: linkedinUrl,
          notes,
          submitted_at: new Date().toISOString(),
        },
      }));

      const { error } = await supabase.from("agent_workflows").insert(workflows);
      if (error) throw error;

      toast({ title: "Jobs submitted!", description: `${validUrls.length} job(s) added to your pipeline.` });
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
          <p className="text-muted-foreground">Paste LinkedIn job URLs to start the agent pipeline.</p>
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

          {/* Job URLs */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Target Job URLs</CardTitle>
                  <CardDescription>Maximum 5 per batch — quality over volume.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addUrl} disabled={jobUrls.length >= 5}>
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
