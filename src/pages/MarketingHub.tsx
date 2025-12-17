import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Lightbulb, Sparkles, RefreshCw, Copy, BookOpen, Target, Users, Megaphone, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BrainstormIdea {
  title: string;
  description: string;
  potential: string;
}

export default function MarketingHub() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [brainstormType, setBrainstormType] = useState<"product" | "marketing" | "content">("marketing");
  const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const brainstormTypes = [
    { value: "product", label: "Product Ideas", description: "New products or features" },
    { value: "marketing", label: "Marketing Campaigns", description: "Campaign & strategy ideas" },
    { value: "content", label: "Content Ideas", description: "Blog, video & social content" },
  ];

  const handleBrainstorm = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic to brainstorm about",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-brainstorm', {
        body: {
          topic,
          context,
          brainstormType,
        },
      });

      if (error) throw error;

      setIdeas(data.ideas);
      toast({
        title: "Ideas Generated!",
        description: `${data.ideas.length} creative ideas ready for you`,
      });
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ideas",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAllIdeas = () => {
    const text = ideas.map((idea, i) => 
      `${i + 1}. ${idea.title}\n${idea.description}\nPotential: ${idea.potential}\n`
    ).join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "All ideas copied to clipboard",
    });
  };

  const frameworks = [
    {
      name: "AIDA Framework",
      icon: Target,
      description: "Attention, Interest, Desire, Action",
      details: "Grab attention with a bold headline, build interest with benefits, create desire through emotional triggers, and drive action with a clear CTA.",
      example: "Stop wasting money on ads that don't work! (Attention) → Our AI creates professional content (Interest) → Join 1,200+ businesses seeing 3.5x ROI (Desire) → Start Free Today (Action)"
    },
    {
      name: "PAS Framework",
      icon: Megaphone,
      description: "Problem, Agitate, Solution",
      details: "Identify the pain point, amplify the problem's impact, then present your product as the solution.",
      example: "Struggling with poor-quality product photos? (Problem) → Every day without professional images costs you sales (Agitate) → ChariotAI generates studio-quality images in seconds (Solution)"
    },
    {
      name: "Storytelling",
      icon: BookOpen,
      description: "Narrative-driven persuasion",
      details: "Connect emotionally through relatable stories that demonstrate transformation and results.",
      example: "Meet Sarah, a small bakery owner drowning in marketing tasks. She discovered ChariotAI and now creates professional content in minutes, doubling her online sales."
    },
    {
      name: "Direct Offer",
      icon: TrendingUp,
      description: "Clear value proposition",
      details: "State benefits directly, emphasize unique value, and provide immediate call-to-action.",
      example: "Professional product images + sales copy in 5 minutes. No design skills needed. Try free for 14 days."
    }
  ];

  const copywriterStyles = [
    {
      name: "Gary Halbert",
      approach: "Direct, conversational, benefit-driven",
      bestFor: "Personal connection, storytelling, emotional appeals",
      signature: "Uses 'you' language, emphasizes benefits over features, creates urgency"
    },
    {
      name: "Dan Kennedy",
      approach: "Bold, no-nonsense, results-focused",
      bestFor: "B2B offers, high-ticket items, business owners",
      signature: "Strong headlines, scarcity tactics, clear ROI focus"
    },
    {
      name: "David Ogilvy",
      approach: "Research-backed, sophisticated, brand-building",
      bestFor: "Premium products, brand awareness, credibility",
      signature: "Long-form copy, testimonials, detailed product descriptions"
    },
    {
      name: "Claude Hopkins",
      approach: "Scientific, test-driven, reason-based",
      bestFor: "Product differentiation, logical buyers, specific claims",
      signature: "Specific benefits, quantifiable results, unique selling propositions"
    },
    {
      name: "John Caples",
      approach: "Tested headlines, curiosity-driven, clear benefits",
      bestFor: "Email marketing, ads, direct response",
      signature: "Powerful headlines, specific promises, curiosity gaps"
    }
  ];

  const audienceTargeting = [
    {
      category: "Demographics",
      icon: Users,
      points: ["Age range and generation", "Income level and spending power", "Location and cultural context", "Occupation and industry"]
    },
    {
      category: "Psychographics",
      icon: Lightbulb,
      points: ["Values and beliefs", "Lifestyle and interests", "Pain points and frustrations", "Goals and aspirations"]
    },
    {
      category: "Behavior",
      icon: Target,
      points: ["Buying patterns", "Online behavior", "Content consumption habits", "Decision-making process"]
    }
  ];

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-2 mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Lightbulb className="h-8 w-8 text-primary-foreground" />
            </div>
            Marketing Hub
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Brainstorm ideas and master proven marketing frameworks
          </p>
        </div>

        <Tabs defaultValue="brainstorm" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="brainstorm">Brainstorm</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="copywriters">Copywriters</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>

          {/* Brainstorm Tab */}
          <TabsContent value="brainstorm" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="shadow-md hover:shadow-lg transition-smooth border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    What do you want to brainstorm?
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Tell us your topic and we'll generate creative ideas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brainstorm Type */}
                  <div className="space-y-3">
                    <Label>Brainstorm Type</Label>
                    <Tabs value={brainstormType} onValueChange={(v) => setBrainstormType(v as typeof brainstormType)}>
                      <TabsList className="grid w-full grid-cols-3">
                        {brainstormTypes.map((type) => (
                          <TabsTrigger key={type.value} value={type.value}>
                            {type.label.split(" ")[0]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                    <p className="text-sm text-muted-foreground">
                      {brainstormTypes.find(t => t.value === brainstormType)?.description}
                    </p>
                  </div>

                  {/* Topic */}
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic or Challenge *</Label>
                    <Textarea
                      id="topic"
                      placeholder="What do you need ideas for? E.g., 'Launching a fitness app for busy professionals'"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Context */}
                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Add any constraints, goals, target audience, budget considerations..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    onClick={handleBrainstorm} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Brainstorming...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate Ideas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="shadow-md hover:shadow-lg transition-smooth border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">Creative Ideas</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        AI-generated concepts to inspire you
                      </CardDescription>
                    </div>
                    {ideas.length > 0 && !isGenerating && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAllIdeas}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBrainstorm}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" text="Brainstorming creative ideas..." />
                    </div>
                  ) : ideas.length > 0 ? (
                    <div className="space-y-4">
                      {ideas.map((idea, index) => (
                        <Card key={index} className="bg-muted/50 border-border hover:shadow-md transition-smooth">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono">
                                  #{index + 1}
                                </Badge>
                                {idea.title}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-foreground leading-relaxed">
                              {idea.description}
                            </p>
                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Potential:
                              </span>
                              <span className="text-xs text-foreground font-medium">
                                {idea.potential}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-10" />
                      <p className="text-base font-medium">Your brainstormed ideas will appear here</p>
                      <p className="text-sm mt-2 opacity-70">Usually generates 5-8 unique concepts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {frameworks.map((framework, index) => (
                <Card key={index} className="shadow-sm border-border hover:border-primary/50 transition-smooth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <framework.icon className="h-5 w-5 text-primary" />
                      </div>
                      {framework.name}
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit mt-2">{framework.description}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">How it works:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{framework.details}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2 text-sm">Example:</h4>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">{framework.example}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Copywriters Tab */}
          <TabsContent value="copywriters" className="space-y-6">
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Legendary Copywriter Styles</CardTitle>
                <p className="text-muted-foreground">Choose the style that matches your brand voice and target audience.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {copywriterStyles.map((style, index) => (
                  <div key={index} className="p-6 border border-border rounded-lg hover:border-primary/50 transition-smooth">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-foreground">{style.name}</h3>
                      <Badge variant="outline">{style.approach}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold text-foreground">Best For: </span>
                        <span className="text-sm text-muted-foreground">{style.bestFor}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">Signature Techniques: </span>
                        <span className="text-sm text-muted-foreground">{style.signature}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Targeting Tab */}
          <TabsContent value="audience" className="space-y-6">
            <Card className="shadow-sm border-border mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Understanding Your Audience</CardTitle>
                <p className="text-muted-foreground">The more you know about your target audience, the more effective your marketing becomes.</p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audienceTargeting.map((section, index) => (
                <Card key={index} className="shadow-sm border-border hover:border-primary/50 transition-smooth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.points.map((point, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm border-border bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Pro Tip: Create Audience Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Combine all three elements to create detailed customer personas. Give them names, describe their daily challenges, and understand their motivations.
                </p>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground mb-2">Example Avatar:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "Marketing Manager Mike, 35-45, busy professional earning £50K+, struggles with content creation, values efficiency, wants to prove ROI to leadership, spends 20+ hours weekly on social media research."
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}