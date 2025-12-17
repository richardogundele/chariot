import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MessageSquare, Instagram, Copy, Sparkles, Twitter } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageLimitDialog } from "@/components/UsageLimitDialog";

export default function ContentMarketing() {
  const { canUse, checkSubscription } = useSubscription();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [platform, setPlatform] = useState<"whatsapp" | "instagram" | "twitter">("instagram");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { 
      value: "whatsapp", 
      label: "WhatsApp Business", 
      icon: MessageSquare,
      description: "Direct messaging campaigns & customer engagement"
    },
    { 
      value: "instagram", 
      label: "Instagram", 
      icon: Instagram,
      description: "Posts, stories, reels & carousel content"
    },
    { 
      value: "twitter", 
      label: "Twitter/X", 
      icon: Twitter,
      description: "Engaging tweets, threads & viral content"
    },
  ];

  const handleGenerate = async () => {
    // Check usage limit first
    if (!canUse("content_marketing")) {
      setShowLimitDialog(true);
      return;
    }

    if (!productDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a product description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-marketing', {
        body: {
          productDescription,
          targetAudience,
          contentGoal,
          platform,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      await checkSubscription(); // Refresh usage counts
      toast({
        title: "Content Generated!",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} content is ready`,
      });
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const selectedPlatform = platforms.find(p => p.value === platform);

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-3 mb-10 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">Content Marketing</h1>
          <p className="text-lg text-muted-foreground font-normal max-w-2xl">
            Create platform-optimized content for WhatsApp, Instagram, and Twitter/X in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-md hover:shadow-lg transition-smooth border-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                Content Details
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about your product and content goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Select Platform</Label>
                <Tabs value={platform} onValueChange={(v) => setPlatform(v as typeof platform)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {platforms.map((p) => (
                      <TabsTrigger key={p.value} value={p.value} className="gap-2">
                        <p.icon className="h-4 w-4" />
                        {p.label.split(" ")[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                {selectedPlatform && (
                  <p className="text-sm text-muted-foreground">{selectedPlatform.description}</p>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <Label htmlFor="product-desc">Product/Service Description *</Label>
                <Textarea
                  id="product-desc"
                  placeholder="Describe your product, its benefits, and unique features..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Textarea
                  id="audience"
                  placeholder="Who is your ideal customer? (age, interests, pain points...)"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Content Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Content Goal</Label>
                <Select value={contentGoal} onValueChange={setContentGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="What's the main objective?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                    <SelectItem value="engagement">Drive Engagement</SelectItem>
                    <SelectItem value="conversion">Generate Sales</SelectItem>
                    <SelectItem value="education">Educate Audience</SelectItem>
                    <SelectItem value="viral">Go Viral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth shadow-sm"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate {selectedPlatform?.label} Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-md hover:shadow-lg transition-smooth border-border animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Generated Content</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Platform-optimized content ready to use
                  </CardDescription>
                </div>
                {generatedContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="hover:bg-muted transition-smooth"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" text="Generating content..." />
                </div>
              ) : generatedContent ? (
                <div className="space-y-4 animate-fade-in">
                  <Badge variant="secondary" className="mb-4 bg-muted text-foreground">
                    {selectedPlatform?.label}
                  </Badge>
                  <div className="bg-background p-6 rounded-lg border border-border">
                    <div className="space-y-4 text-foreground">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-foreground" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 text-foreground" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 leading-7 text-foreground whitespace-pre-wrap" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground" {...props} />,
                          li: ({node, ...props}) => <li className="leading-7 text-foreground" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-foreground/80" {...props} />,
                          code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-6 border-border" {...props} />,
                        }}
                      >
                        {generatedContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <selectedPlatform.icon className="h-16 w-16 mx-auto mb-4 opacity-10" />
                  <p className="text-base font-medium">Your generated content will appear here</p>
                  <p className="text-sm mt-2 opacity-70">Fill in the details and generate content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <UsageLimitDialog 
        open={showLimitDialog} 
        onOpenChange={setShowLimitDialog} 
        usageType="content_marketing" 
      />
    </AppLayout>
  );
}
