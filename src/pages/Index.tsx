import { FileText, Video, Link2, Download, ArrowRight, BookOpen, Wrench, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    category: "Guides & PDFs",
    title: "Strategy Playbooks",
    description: "Step-by-step guides and frameworks you can download and apply immediately.",
    count: "12 resources",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Wrench,
    category: "Tools & Templates",
    title: "Ready-Made Templates",
    description: "Spreadsheets, checklists, and planning tools to streamline your workflow.",
    count: "8 resources",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: PlayCircle,
    category: "Video Library",
    title: "Training & Walkthroughs",
    description: "On-demand video tutorials covering key concepts and practical techniques.",
    count: "6 resources",
    color: "from-primary/15 to-accent/10",
  },
  {
    icon: Link2,
    category: "Curated Links",
    title: "Tools & Articles",
    description: "Hand-picked external resources, articles, and tools we recommend.",
    count: "15+ links",
    color: "from-accent/15 to-primary/10",
  },
];

const featured = [
  { title: "Getting Started Guide", type: "PDF", icon: Download },
  { title: "Strategy Framework Template", type: "Template", icon: FileText },
  { title: "Onboarding Walkthrough", type: "Video", icon: PlayCircle },
  { title: "Weekly Planning Checklist", type: "Template", icon: BookOpen },
  { title: "Best Practices Overview", type: "PDF", icon: Download },
  { title: "Tool Recommendations", type: "Links", icon: Link2 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-display font-bold tracking-tight">
            <span className="text-primary">V</span>eridian
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#resources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Resources</a>
            <a href="#featured" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Featured</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-6 animate-fade-in">
              Client Resource Hub
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-[1.1]">
              Everything you need,
              <span className="block text-gradient">in one place.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in">
              Guides, templates, videos, and curated tools — all designed to help you get results faster.
            </p>
            <Button size="lg" className="gap-2 h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 animate-fade-in" asChild>
              <a href="#resources">
                Browse Resources
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section id="resources" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Resource Library</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Browse by category to find exactly what you need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {resources.map((r, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift cursor-pointer"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4`}>
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">{r.category}</p>
                <h3 className="text-lg font-semibold mb-2">{r.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{r.description}</p>
                <span className="text-xs text-muted-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section id="featured" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Featured Resources</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Our most popular and recommended materials.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {featured.map((f, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200 hover-lift cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.type}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Need something specific?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Reach out and we'll point you to the right resource — or create one for you.
            </p>
            <Button size="lg" className="gap-2 h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold">
            <span className="text-primary">V</span>eridian
          </span>
          <p className="text-sm text-muted-foreground">© 2026 Veridian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
