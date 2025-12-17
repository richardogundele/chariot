import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Paperclip, Star } from "lucide-react";

const Hero = () => {
  const [prompt, setPrompt] = useState("");

  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up opacity-0 text-balance">
            Create a website in minutes
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-up opacity-0 animation-delay-100">
            BuildFast is an AI web developer. Describe the website you want and we'll build it for you. No code required.
          </p>

          {/* Prompt input card */}
          <div className="relative max-w-2xl mx-auto mb-8 animate-fade-up opacity-0 animation-delay-200">
            <div className="relative bg-card rounded-2xl shadow-card border border-border p-2 transition-shadow hover:shadow-card-hover">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create a website for my coffee shop..."
                className="w-full min-h-[80px] p-4 text-foreground bg-transparent placeholder:text-muted-foreground resize-none focus:outline-none text-base"
                rows={2}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Paperclip className="h-4 w-4" />
                  <span>Attach image</span>
                </button>
                <Button variant="hero" size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Build
                </Button>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up opacity-0 animation-delay-300">
            {/* Avatars */}
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {avatars.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt={`User ${i + 1}`}
                    className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div className="ml-4 flex flex-col items-start">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Join <strong className="text-foreground">8,500+</strong> builders
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Publish in one click
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
