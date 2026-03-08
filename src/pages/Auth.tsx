import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, Mail } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Check your email!", description: "We sent you a magic link to sign in." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold mb-2">
            <div className="p-2 bg-primary rounded-xl">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-foreground">LinkedIn Agent</span>
          </Link>
          <p className="text-muted-foreground mt-2">Multi-Agent Job Application System</p>
        </div>

        <Card className="border-border/50 backdrop-blur-md bg-card/95">
          <CardHeader>
            <CardTitle>{sent ? "Check Your Email" : "Get Started"}</CardTitle>
            <CardDescription>
              {sent
                ? "We sent a magic link to your email. Click it to sign in."
                : "Enter your email to receive a sign-in link — no password needed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <Mail className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Sent to <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Magic Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
