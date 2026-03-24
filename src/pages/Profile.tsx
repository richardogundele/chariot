import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, FileText, Linkedin, Target, AlertCircle } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    job_title: "",
    company: "",
    phone: "",
    linkedin_url: "",
    cv_text: "",
  });

  const [jobPrefs, setJobPrefs] = useState({
    target_role: "",
    location: "",
    keywords: "",
    easy_apply_only: true,
    daily_limit: 10,
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          job_title: data.job_title || "",
          company: data.company || "",
          phone: data.phone || "",
          linkedin_url: (data as any).linkedin_url || "",
          cv_text: (data as any).cv_text || "",
        });
        const prefs = (data as any).job_preferences || {};
        setJobPrefs({
          target_role: prefs.target_role || "",
          location: prefs.location || "",
          keywords: prefs.keywords || "",
          easy_apply_only: prefs.easy_apply_only !== false,
          daily_limit: prefs.daily_limit || 10,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        full_name: profile.full_name,
        job_title: profile.job_title,
        company: profile.company,
        phone: profile.phone,
        linkedin_url: profile.linkedin_url,
        cv_text: profile.cv_text,
        job_preferences: jobPrefs,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Profile saved!", description: "Your agent will use this for all future applications." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Agent Setup</h1>
          <p className="text-muted-foreground">
            Configure your profile and CV — the agent uses this for every application.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Basic details used in outreach and fit analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Current Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.job_title}
                    onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Where you work now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+44..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">LinkedIn Profile</CardTitle>
              </div>
              <CardDescription>Used by the Strategist agent to analyse role fit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://www.linkedin.com/in/your-slug"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* CV */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Your CV</CardTitle>
              </div>
              <CardDescription>
                Paste your full CV here. The Copywriter agent uses this to tailor resume bullets for each job.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={`Paste your full CV here — work experience, skills, education, achievements.\n\nExample:\nSoftware Engineer | Acme Corp | 2021–Present\n- Built microservices handling 10M req/day\n- Led team of 5 engineers...\n\nSkills: Python, TypeScript, AWS, Kubernetes...`}
                value={profile.cv_text}
                onChange={(e) => setProfile({ ...profile, cv_text: e.target.value })}
                rows={14}
                className="font-mono text-sm"
              />
              {profile.cv_text && (
                <p className="text-xs text-muted-foreground">
                  {profile.cv_text.length.toLocaleString()} characters — agent can read this.
                </p>
              )}
              {!profile.cv_text && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400">
                    Without a CV, the agent can't tailor your application. Add it for best results.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Preferences */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Job Search Preferences</CardTitle>
              </div>
              <CardDescription>
                Used to filter and prioritise jobs in the agent pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Input
                    placeholder="e.g. Senior Product Manager"
                    value={jobPrefs.target_role}
                    onChange={(e) => setJobPrefs({ ...jobPrefs, target_role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. London, Remote, UK"
                    value={jobPrefs.location}
                    onChange={(e) => setJobPrefs({ ...jobPrefs, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Keywords / Skills to Highlight</Label>
                <Input
                  placeholder="e.g. Python, fintech, Series B, visa sponsorship"
                  value={jobPrefs.keywords}
                  onChange={(e) => setJobPrefs({ ...jobPrefs, keywords: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated. The agent will emphasise these in cover notes and tailored bullets.
                </p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Easy Apply Only</p>
                  <p className="text-xs text-muted-foreground">
                    Skip jobs without the LinkedIn Easy Apply button
                  </p>
                </div>
                <Switch
                  checked={jobPrefs.easy_apply_only}
                  onCheckedChange={(v) => setJobPrefs({ ...jobPrefs, easy_apply_only: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Application Limit</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={jobPrefs.daily_limit}
                  onChange={(e) =>
                    setJobPrefs({ ...jobPrefs, daily_limit: Math.min(10, Math.max(1, Number(e.target.value))) })
                  }
                />
                <p className="text-xs text-muted-foreground">Max 10 per day. Quality over volume.</p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Profile;
