import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Video, BarChart3, RefreshCw, ArrowRight, Sparkles, TrendingUp, Bot, Check } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  const features = [
    {
      icon: Bot,
      title: "AI Script Generation",
      description: "Feed it a hook or topic — get scroll-stopping scripts for TikTok, Reels, and Shorts in seconds.",
    },
    {
      icon: Video,
      title: "Auto Video Creation",
      description: "Connects to video APIs to generate UGC-style visuals, captions, and formatting automatically.",
    },
    {
      icon: TrendingUp,
      title: "Schedule & Publish",
      description: "Push content directly to your platforms. No more switching between 10 different tabs.",
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Pull analytics after 48 hours. See what's working, what's not, and why.",
    },
    {
      icon: RefreshCw,
      title: "Feedback Loop Engine",
      description: "The agent learns from your top-performing content and auto-adjusts your next brief. That's the moat.",
    },
    {
      icon: Zap,
      title: "Multi-Brand Support",
      description: "Run one engine across multiple brands. Build once, deploy everywhere.",
    },
  ];

  const steps = [
    { number: "01", title: "Drop a hook or topic", description: "Give the agent a content idea, trending topic, or product angle." },
    { number: "02", title: "Agent creates everything", description: "Script, visuals, captions, hashtags — all optimised for your platform." },
    { number: "03", title: "Review & schedule", description: "Approve or tweak, then auto-schedule across all your channels." },
    { number: "04", title: "Learn & repeat", description: "Agent analyzes performance and feeds insights into your next content cycle." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ChariotAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </div>
          <Button variant="hero" size="sm" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>
            Join Waitlist
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Content Flywheel
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-tight">
              Your content runs on
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                autopilot.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
              ChariotAI is an autonomous content agent. It generates scripts, creates videos, schedules posts, tracks performance — and learns what works. Content flywheel, fully automated.
            </p>

            {/* Waitlist form in hero */}
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8 animate-fade-in" id="waitlist">
              {!submitted ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <Button variant="hero" size="lg" type="submit" className="gap-2 h-12">
                    Get Early Access
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-success/10 border border-success/20 text-success mx-auto">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">You're on the list! We'll be in touch.</span>
                </div>
              )}
            </form>

            <p className="text-sm text-muted-foreground animate-fade-in">
              Join <strong className="text-foreground">500+</strong> creators and brands on the waitlist
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One agent. Entire content pipeline.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Stop juggling 10 tools. ChariotAI handles every step from ideation to analytics.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From idea to published content in four steps. The agent handles everything in between.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-card rounded-2xl p-8 border border-border h-full hover-lift transition-all duration-300">
                  <span className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">{step.number}</span>
                  <h3 className="text-lg font-semibold mt-4 mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop creating content.
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Start deploying it.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Be first in line when ChariotAI launches. Early access members get lifetime pricing.
            </p>
            <Button
              variant="hero"
              size="xl"
              className="gap-2"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">ChariotAI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 ChariotAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
