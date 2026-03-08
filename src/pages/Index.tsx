import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Search, Brain, PenTool, Play,
  ArrowRight, Sparkles, Shield,
  Check, Target, Clock, Eye,
} from "lucide-react";

const Index = () => {

  const agents = [
    {
      icon: Search,
      title: "Researcher Agent",
      description: "Scrapes LinkedIn job postings and extracts real requirements — not just keywords, but the underlying problems the employer needs solved.",
    },
    {
      icon: Brain,
      title: "Strategist Agent",
      description: "Compares your LinkedIn profile to the job. Identifies your top 3 value-fit strengths and scores overall fit 1–10.",
    },
    {
      icon: PenTool,
      title: "Copywriter Agent",
      description: "Writes bespoke cover notes (max 150 words) and connection requests (max 280 chars). Sharp, human-sounding, zero AI clichés.",
    },
    {
      icon: Play,
      title: "Executor Agent",
      description: "Presents drafts for your approval. On confirmation, opens a visible browser and submits the application — you watch every action.",
    },
  ];

  const principles = [
    {
      icon: Target,
      title: "Quality Over Volume",
      description: "Maximum 5 applications/day. Every application is bespoke and tailored.",
    },
    {
      icon: Shield,
      title: "Human Always in Control",
      description: "HITL gate is non-negotiable. Nothing is sent without your explicit approval.",
    },
    {
      icon: Clock,
      title: "Behavioural Realism",
      description: "Randomised delays, business-hours-only operation, and warm footprint before outreach.",
    },
    {
      icon: Eye,
      title: "Full Transparency",
      description: "If asked, be honest that AI assisted with research and drafting. Integrity first.",
    },
  ];

  const steps = [
    { number: "01", title: "Drop your target job URLs", description: "Browse LinkedIn, find roles you want. Paste the URLs into the agent." },
    { number: "02", title: "Agent researches & strategises", description: "Researcher extracts requirements. Strategist scores your fit 1–10 with gap analysis." },
    { number: "03", title: "Bespoke copy is drafted", description: "Copywriter creates a tailored cover note and connection request. No generic templates." },
    { number: "04", title: "You approve, agent executes", description: "Review everything at the HITL gate. Type 'yes' to submit — watch it happen in real time." },
  ];

  const techStack = [
    { component: "Agent Framework", tech: "CrewAI ≥ 0.28" },
    { component: "LLM Backbone", tech: "Claude Sonnet (Anthropic)" },
    { component: "Browser Automation", tech: "Playwright + Stealth" },
    { component: "Scraping", tech: "requests + BeautifulSoup4" },
    { component: "Runtime", tech: "AWS EC2 (Ubuntu)" },
    { component: "Environment", tech: "python-dotenv" },
  ];

  const roadmap = [
    {
      version: "v0.1 — Now",
      items: ["Full 4-agent skeleton with HITL", "Easy Apply support", "Connection request drafting", "Playwright stealth browser"],
    },
    {
      version: "v0.2 — Next",
      items: ["Google Sheets application tracker", "Follow-up message agent (7-day)", "Sponsorship filter (auto-skip)"],
    },
    {
      version: "v0.3 — Future",
      items: ["Warm footprint automation", "Slack/WhatsApp HITL notifications", "Multi-platform (Indeed, Glassdoor)"],
    },
    {
      version: "v1.0 — Public",
      items: ["Full public GitHub release", "YAML-based profile config", "Docker one-command deployment"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LinkedIn Agent</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Agents</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#tech" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tech Stack</a>
            <a href="#roadmap" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="ocean-bg">
          <div className="ocean-blob-1" />
          <div className="ocean-blob-2" />
          <div className="ocean-blob-3" />
          <div className="ocean-caustics" />
          <div className="ocean-wave" />
          <div className="ocean-wave-2" />
          <div className="ocean-wave-3" />
          <div className="ocean-ray" style={{ left: "15%", height: "60%", top: 0, animationDelay: "0s" }} />
          <div className="ocean-ray" style={{ left: "35%", height: "75%", top: 0, animationDelay: "2s" }} />
          <div className="ocean-ray" style={{ left: "55%", height: "55%", top: 0, animationDelay: "4s" }} />
          <div className="ocean-ray" style={{ left: "75%", height: "70%", top: 0, animationDelay: "1s" }} />
          <div className="ocean-ray" style={{ left: "90%", height: "50%", top: 0, animationDelay: "3s" }} />
          <div className="ocean-bubble" style={{ left: "10%", width: 6, height: 6, animationDuration: "12s", animationDelay: "0s" }} />
          <div className="ocean-bubble" style={{ left: "25%", width: 4, height: 4, animationDuration: "15s", animationDelay: "3s" }} />
          <div className="ocean-bubble" style={{ left: "45%", width: 8, height: 8, animationDuration: "18s", animationDelay: "1s" }} />
          <div className="ocean-bubble" style={{ left: "60%", width: 3, height: 3, animationDuration: "14s", animationDelay: "5s" }} />
          <div className="ocean-bubble" style={{ left: "78%", width: 5, height: 5, animationDuration: "16s", animationDelay: "2s" }} />
          <div className="ocean-bubble" style={{ left: "88%", width: 7, height: 7, animationDuration: "20s", animationDelay: "4s" }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Multi-Agent Automation · CrewAI · Claude Sonnet
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-tight">
              Your job applications
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                on autopilot.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
              An autonomous AI agent that researches jobs, analyses fit, drafts bespoke outreach, and executes applications — with you in full control at every step.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8 animate-fade-in">
              <Button variant="hero" size="lg" className="gap-2 h-12" asChild>
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-in">
              Built by <strong className="text-foreground">Richard Ogundele</strong> · Private Build v0.1
            </p>
          </div>
        </div>
      </section>

      {/* The Four Agents */}
      <section id="agents" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Four agents. One pipeline.</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Each agent has a specialised role. Together they form a complete job application engine.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {agents.map((agent, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <agent.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{agent.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Design Principles</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              This isn't a spray-and-pray tool. Every decision is deliberate.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {principles.map((p, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From job URL to submitted application in four steps. The HITL gate keeps you in control.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
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

      {/* Tech Stack */}
      <section id="tech" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Technology Stack</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Built on battle-tested open-source tools for reliability and transparency.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {techStack.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.component}</p>
                  <p className="text-muted-foreground text-xs">{item.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Roadmap</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Where we are and where we're headed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {roadmap.map((phase, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border hover-lift transition-all duration-300">
                <h3 className="text-lg font-bold text-primary mb-4">{phase.version}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
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
              Stop applying manually.
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Start deploying agents.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Sign up and start using the LinkedIn Job Application Agent today.
            </p>
            <Button variant="hero" size="xl" className="gap-2" asChild>
              <Link to="/auth">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">LinkedIn Agent</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Richard Ogundele. Private Build v0.1. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
