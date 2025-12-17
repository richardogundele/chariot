import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Settings, RefreshCw, ExternalLink, Upload } from "lucide-react";

const DemoPreview = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const conversation = [
    {
      role: "user",
      content: "I need a website for my bakery",
    },
    {
      role: "assistant",
      content: "I'll create a bakery website with your menu, location, and business hours. Would you like to include photos of your products?",
    },
    {
      role: "user",
      content: "Yes! And add a section for custom orders",
    },
    {
      role: "assistant",
      content: "Perfect! I've added a custom orders form with options for cakes, pastries, and special occasions. The contact info and gallery are also included.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % conversation.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            If you can chat, you can build a website
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Watch how easy it is to create a professional website through conversation.
          </p>
        </div>

        {/* Demo window */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-accent/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
                    <Clock className="h-3.5 w-3.5" />
                    History
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button variant="hero" size="sm">
                  Publish
                </Button>
              </div>
            </div>

            {/* Content area */}
            <div className="grid md:grid-cols-2 min-h-[400px]">
              {/* Chat panel */}
              <div className="border-r border-border p-6 bg-background">
                <div className="space-y-4">
                  {conversation.slice(0, currentMessage + 1).map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary text-secondary-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="mt-6 flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
                  <input
                    type="text"
                    placeholder="What hours are you open?"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Upload className="h-4 w-4" />
                  </button>
                  <Button variant="hero" size="sm">
                    Send
                  </Button>
                </div>
              </div>

              {/* Preview panel */}
              <div className="bg-secondary/20 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 mb-4 animate-float">
                    <div className="h-8 w-8 rounded-full bg-accent animate-pulse-glow" />
                  </div>
                  <p className="text-muted-foreground text-sm">Building your website...</p>
                  <div className="mt-4 flex justify-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoPreview;
