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
import { Sparkles, Image as ImageIcon, Download, Loader2, Trash2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  style: string | null;
  created_at: string;
}

const ImageGenerator = () => {
  const { toast } = useToast();
  const { canUse, checkSubscription } = useSubscription();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousImages, setPreviousImages] = useState<GeneratedImage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const imageStyles = [
    { value: "realistic", label: "Realistic Photo" },
    { value: "artistic", label: "Artistic" },
    { value: "minimalist", label: "Minimalist" },
    { value: "vintage", label: "Vintage" },
    { value: "modern", label: "Modern" },
    { value: "professional", label: "Professional Product" },
  ];

  // Load previous generations on mount
  useEffect(() => {
    loadPreviousImages();
  }, []);

  const loadPreviousImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPreviousImages(data || []);
    } catch (error) {
      console.error('Error loading previous images:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    // Check usage limit first
    if (!canUse("images")) {
      setShowLimitDialog(true);
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description for your image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create a more detailed prompt based on style
      const stylePrompts = {
        realistic: "Ultra realistic photograph, professional photography, high detail, sharp focus, natural lighting",
        artistic: "Artistic illustration, creative composition, vibrant colors, expressive style, hand-painted aesthetic",
        minimalist: "Minimalist design, clean lines, simple composition, negative space, modern aesthetic",
        vintage: "Vintage style, retro aesthetic, nostalgic feel, classic photography, film grain",
        modern: "Modern contemporary style, sleek design, bold colors, innovative composition",
        professional: "Professional product photography, studio lighting, commercial quality, clean background"
      };

      const stylePrefix = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic;
      const enhancedPrompt = `${stylePrefix}. ${prompt}. High quality, detailed image.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: enhancedPrompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);

        // Save to database
        const { error: saveError } = await supabase
          .from('generated_images')
          .insert({
            user_id: user.id,
            prompt: enhancedPrompt,
            image_url: data.imageUrl,
            style: style,
          });

        if (saveError) {
          console.error('Error saving image:', saveError);
        } else {
          // Reload history
          await loadPreviousImages();
          await checkSubscription(); // Refresh usage counts
        }

        toast({
          title: "Image Generated!",
          description: "Your AI-powered image is ready and saved.",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Image Deleted",
        description: "The generated image has been removed.",
      });

      // Reload history
      await loadPreviousImages();

      // Clear current display if it matches deleted item
      setPreviousImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-foreground mb-2 tracking-tight">Image Generator</h1>
          <p className="text-lg text-muted-foreground font-light">Generate stunning product images with AI-powered image generation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <Card className="shadow-sm border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-5 w-5" />
                Generate Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate... e.g., 'A luxury watch on a marble surface with dramatic lighting'"
                  className="min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Image Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">Tips for better results:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Be specific about lighting, colors, and composition</li>
                  <li>Include details about the product's features</li>
                  <li>Mention the mood or atmosphere you want</li>
                  <li>Specify camera angle or perspective</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6 lg:col-span-2">
            {generatedImage ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Generated Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full h-auto"
                    />
                  </div>
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Enter your image description and select a style to create AI-powered product images.
                  </p>
                </CardContent>
              </Card>
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
                ) : previousImages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No previous generations yet. Start creating!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previousImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full aspect-square object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setGeneratedImage(image.image_url);
                              setPrompt(image.prompt);
                              if (image.style) setStyle(image.style);
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
                                <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this generated image. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(image.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {image.prompt}
                        </p>
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
        usageType="images" 
      />
    </AppLayout>
  );
};

export default ImageGenerator;
