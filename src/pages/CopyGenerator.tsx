import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Users, FileText, Zap, Trash2, History, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageLimitDialog } from "@/components/UsageLimitDialog";
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

interface GeneratedCopyItem {
  id: string;
  product_name: string;
  product_description: string;
  copywriter_style: string;
  generated_content: any;
  created_at: string;
}

const CopyGenerator = () => {
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    targetAudience: "",
    uniqueValue: "",
  });
  const [selectedCopywriter, setSelectedCopywriter] = useState("");
  const [customCopywriter, setCustomCopywriter] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousCopy, setPreviousCopy] = useState<GeneratedCopyItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const copywriters = [
    { value: "gary-halbert", name: "Gary Halbert", region: "USA" },
    { value: "dan-kennedy", name: "Dan Kennedy", region: "USA" },
    { value: "david-ogilvy", name: "David Ogilvy", region: "UK" },
    { value: "claude-hopkins", name: "Claude Hopkins", region: "USA" },
    { value: "john-caples", name: "John Caples", region: "USA" },
    { value: "eugene-schwartz", name: "Eugene Schwartz", region: "USA" },
    { value: "joe-sugarman", name: "Joe Sugarman", region: "USA" },
    { value: "john-carlton", name: "John Carlton", region: "USA" },
    { value: "clayton-makepeace", name: "Clayton Makepeace", region: "USA" },
    { value: "parris-lampropoulos", name: "Parris Lampropoulos", region: "Cyprus/USA" },
    { value: "victor-schwab", name: "Victor Schwab", region: "USA" },
    { value: "robert-collier", name: "Robert Collier", region: "USA" },
  ];

  const frameworks = ["AIDA", "PAS", "Storytelling", "Direct Offer", "Scarcity/Authority"];

  // Load previous generations on mount
  useEffect(() => {
    loadPreviousCopy();
  }, []);

  const loadPreviousCopy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('generated_copy')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPreviousCopy(data || []);
    } catch (error) {
      console.error('Error loading previous copy:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    // Check and increment usage atomically via RPC
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate content.",
        variant: "destructive",
      });
      return;
    }

    const { data: usageResult, error: usageError } = await supabase.rpc('check_and_increment_usage', {
      p_user_id: user.id,
      p_usage_type: 'copies'
    });

    const result = usageResult as { allowed: boolean } | null;
    if (usageError || !result?.allowed) {
      setShowLimitDialog(true);
      return;
    }

    if (!productDetails.name || !productDetails.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the product name and description.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCopywriter && !customCopywriter) {
      toast({
        title: "Select Copywriter",
        description: "Please choose a copywriter style or enter a custom one.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Use custom copywriter if provided, otherwise use selected
      const copywriterName = customCopywriter || selectedCopywriter;

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: {
          productName: productDetails.name,
          productDescription: productDetails.description,
          targetAudience: productDetails.targetAudience,
          uniqueValue: productDetails.uniqueValue,
          mode: "expert",
          copywriter: copywriterName,
        }
      });

      if (error) throw error;
      if (!data?.content) throw new Error("No content generated");
      
      const content = { rawContent: data.content };
      setGeneratedContent(content);

      // Save to database
      const { error: saveError } = await supabase
        .from('generated_copy')
        .insert({
          user_id: user.id,
          product_name: productDetails.name,
          product_description: productDetails.description,
          copywriter_style: copywriterName,
          generated_content: content,
        });

      if (saveError) {
        console.error('Error saving copy:', saveError);
      } else {
        await loadPreviousCopy();
      }
      
      // Always refresh usage counts after generation
      await checkSubscription();

      toast({
        title: "Content Generated!",
        description: "Your AI-powered marketing content is ready and saved.",
      });
    } catch (error) {
      console.error('Error generating copy:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_copy')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Copy Deleted",
        description: "The generated copy has been removed.",
      });

      // Reload history
      await loadPreviousCopy();

      // Clear current display if it matches deleted item
      const deletedItem = previousCopy.find(item => item.id === id);
      if (deletedItem && JSON.stringify(generatedContent) === JSON.stringify(deletedItem.generated_content)) {
        setGeneratedContent(null);
      }
    } catch (error) {
      console.error('Error deleting copy:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete copy. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const loadPreviousItem = (item: GeneratedCopyItem) => {
    setGeneratedContent(item.generated_content);
    setProductDetails({
      name: item.product_name,
      description: item.product_description,
      targetAudience: "",
      uniqueValue: "",
    });
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-foreground mb-2 tracking-tight">Copy Generator</h1>
          <p className="text-lg text-muted-foreground font-light">Generate high-converting ad copy with AI-powered copywriting frameworks.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-5 w-5" />
                Generate Copy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Premium Coffee Blend"
                    value={productDetails.name}
                    onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Describe your product, its features, and benefits..."
                    className="min-h-[100px]"
                    value={productDetails.description}
                    onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copywriter-select">Choose Copywriter Style</Label>
                  <Select value={selectedCopywriter} onValueChange={(value) => {
                    setSelectedCopywriter(value);
                    if (value !== "custom") {
                      setCustomCopywriter("");
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a legendary copywriter" />
                    </SelectTrigger>
                    <SelectContent>
                      {copywriters.map((writer) => (
                        <SelectItem key={writer.value} value={writer.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{writer.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{writer.region}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Custom Copywriter</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCopywriter === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-copywriter">Enter Copywriter Name</Label>
                    <Input
                      id="custom-copywriter"
                      placeholder="e.g., Neil Patel, Ann Handley, etc."
                      value={customCopywriter}
                      onChange={(e) => setCustomCopywriter(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter any copywriter's name to generate content in their style
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience (Optional)</Label>
                  <Input
                    id="target-audience"
                    placeholder="e.g., Coffee enthusiasts, working professionals"
                    value={productDetails.targetAudience}
                    onChange={(e) => setProductDetails({ ...productDetails, targetAudience: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unique-value">Unique Value Proposition (Optional)</Label>
                  <Input
                    id="unique-value"
                    placeholder="What makes your product special?"
                    value={productDetails.uniqueValue}
                    onChange={(e) => setProductDetails({ ...productDetails, uniqueValue: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Copy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {generatedContent ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Marketing Copy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-background p-6 rounded-lg border border-border">
                      <div className="space-y-4 text-foreground">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-foreground" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 text-foreground" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 leading-7 text-foreground" {...props} />,
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
                          {generatedContent.rawContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCopy(generatedContent.rawContent)}
                      className="mt-4"
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={FileText}
                title="No Content Generated Yet"
                description="Fill in the product details and click Generate Copy to create AI-powered marketing content."
              />
            )}

            {/* Previous Generations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Previous Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : previousCopy.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No previous generations yet. Start creating!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {previousCopy.map((item) => (
                      <div key={item.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {item.product_description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.copywriter_style}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setGeneratedContent(item.generated_content);
                                setProductDetails({
                                  name: item.product_name,
                                  description: item.product_description,
                                  targetAudience: "",
                                  uniqueValue: "",
                                });
                                setSelectedCopywriter(item.copywriter_style);
                              }}
                            >
                              View
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Copy?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this generated copy for "{item.product_name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <UsageLimitDialog 
        open={showLimitDialog} 
        onOpenChange={setShowLimitDialog} 
        usageType="copies" 
      />
    </AppLayout>
  );
};

export default CopyGenerator;