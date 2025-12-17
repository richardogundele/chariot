import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  ad_copy?: string | null;
}

const copywritingOptions = [
  // Frameworks
  { id: "aida", name: "AIDA Framework", type: "framework" },
  { id: "pas", name: "PAS Framework", type: "framework" },
  { id: "storytelling", name: "Storytelling Approach", type: "framework" },
  { id: "direct", name: "Direct Offer", type: "framework" },
  { id: "scarcity", name: "Scarcity & Authority", type: "framework" },
  
  // Legendary Copywriters
  { id: "kenny-nwokoye", name: "Kenny Nwokoye", type: "copywriter" },
  { id: "david-ogilvy", name: "David Ogilvy", type: "copywriter" },
  { id: "gary-halbert", name: "Gary Halbert", type: "copywriter" },
  { id: "eugene-schwartz", name: "Eugene Schwartz", type: "copywriter" },
  { id: "joe-sugarman", name: "Joe Sugarman", type: "copywriter" },
  { id: "dan-kennedy", name: "Dan Kennedy", type: "copywriter" },
  { id: "clayton-makepeace", name: "Clayton Makepeace", type: "copywriter" },
  { id: "robert-collier", name: "Robert Collier", type: "copywriter" },
  { id: "john-caples", name: "John Caples", type: "copywriter" },
  { id: "claude-hopkins", name: "Claude Hopkins", type: "copywriter" },
  { id: "victor-schwab", name: "Victor Schwab", type: "copywriter" },
  { id: "ted-nicholas", name: "Ted Nicholas", type: "copywriter" },
  { id: "frank-kern", name: "Frank Kern", type: "copywriter" },
  { id: "russell-brunson", name: "Russell Brunson", type: "copywriter" },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [selectedCopywriter, setSelectedCopywriter] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Not authenticated",
            description: "Please sign in to view this product.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .eq("deleted", false)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Product Not Found",
            description: "The product you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/products");
          return;
        }

        setProduct(data as Product);
        document.title = `${data.name} – Product Details`;
      } catch (err) {
        console.error("Error loading product:", err);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
        navigate("/products");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, toast]);

  const parsedCopy = useMemo(() => {
    if (!product?.ad_copy) return null;
    try {
      return JSON.parse(product.ad_copy);
    } catch {
      return { content: product.ad_copy };
    }
  }, [product]);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({ title: "Copied", description: `${section} copied to clipboard` });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleGenerateImage = async () => {
    if (!product) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `Create a stunning 3D product render of ${product.name} with professional studio lighting and a clean white background. Product details: ${product.description}. Style: Ultra-realistic 3D product visualization, commercial photography quality, premium product showcase.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Update product with new image
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: data.imageUrl })
          .eq('id', product.id);

        if (updateError) throw updateError;

        setProduct({ ...product, image_url: data.imageUrl });
        toast({
          title: "Image Generated",
          description: "New product image created successfully!",
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
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!product || !selectedCopywriter) {
      toast({
        title: "Select Option",
        description: "Please select a copywriter or framework first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCopy(true);
    try {
      const selectedOption = copywritingOptions.find(c => c.name === selectedCopywriter);
      const mode = selectedOption?.type === "framework" ? "guided" : 
                   selectedOption?.id === "kenny-nwokoye" ? "kenny" : "expert";
      
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: { 
          productName: product.name,
          productDescription: product.description,
          copywriter: selectedCopywriter,
          mode: mode,
        }
      });

      if (error) throw error;

      if (data?.content) {
        // Update product with new copy
        const { error: updateError } = await supabase
          .from('products')
          .update({ ad_copy: data.content })
          .eq('id', product.id);

        if (updateError) throw updateError;

        setProduct({ ...product, ad_copy: data.content });
        toast({
          title: "Copy Generated",
          description: `New marketing copy created in ${selectedCopywriter}'s style!`,
        });
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate copy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8">
          <LoadingSpinner text="Loading product details..." />
        </div>
      </AppLayout>
    );
  }

  if (!product) return null;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <Button variant="ghost" onClick={() => navigate("/products")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.image_url || heroImage}
                    alt={`${product.name} product image`}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = heroImage;
                    }}
                    loading="lazy"
                  />
                </div>
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={isGeneratingImage}
                  className="w-full"
                  variant="outline"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Another Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <Badge variant={product.status?.toLowerCase() === "ready" ? "default" : "secondary"}>
                  {product.status || "Draft"}
                </Badge>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Copy Regeneration */}
            <Card>
              <CardHeader>
                <CardTitle>Regenerate Marketing Copy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Copywriter or Framework</label>
                  <Select value={selectedCopywriter} onValueChange={setSelectedCopywriter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a style..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Copywriting Frameworks
                      </div>
                      {copywritingOptions.filter(opt => opt.type === "framework").map((opt) => (
                        <SelectItem key={opt.id} value={opt.name}>
                          {opt.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                        Legendary Copywriters
                      </div>
                      {copywritingOptions.filter(opt => opt.type === "copywriter").map((opt) => (
                        <SelectItem key={opt.id} value={opt.name}>
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateCopy} 
                  disabled={isGeneratingCopy || !selectedCopywriter}
                  className="w-full"
                >
                  {isGeneratingCopy ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate New Copy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Marketing Content */}
        {parsedCopy && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Marketing Content</h2>

            {/* Ad Copy */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sales Copy</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(parsedCopy.content || parsedCopy, "Sales Copy")}
                  >
                    {copiedSection === "Sales Copy" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none space-y-6">
                  {(typeof parsedCopy === 'string' ? parsedCopy : parsedCopy.content || '').split('\n').map((line: string, index: number) => {
                    // Check if line is a heading (starts with ** and ends with **)
                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                      const text = line.replace(/\*\*/g, '').trim();
                      return (
                        <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
                          {text}
                        </h3>
                      );
                    }
                    // Check if line is a numbered item
                    if (line.match(/^\d+\.\s+\*\*/)) {
                      const text = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').trim();
                      return (
                        <div key={index} className="mb-4">
                          <h4 className="font-semibold text-foreground mb-2">{text}</h4>
                        </div>
                      );
                    }
                    // Check if line starts with a dash (bullet point)
                    if (line.trim().startsWith('- ')) {
                      return (
                        <div key={index} className="ml-4 mb-2 flex items-start">
                          <span className="mr-2 text-primary">•</span>
                          <span className="text-muted-foreground leading-relaxed flex-1">{line.replace(/^- /, '').trim()}</span>
                        </div>
                      );
                    }
                    // Empty line
                    if (line.trim() === '') {
                      return <div key={index} className="h-2" />;
                    }
                    // Regular paragraph
                    return (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-3">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Marketing Advice */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Marketing Strategy & Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {parsedCopy.advice || 
                    "Your AI-generated copy is ready to use! Consider testing different headlines, emphasizing benefits over features, and creating urgency with limited-time offers. Use this copy across your social media, email campaigns, and landing pages for maximum impact."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!parsedCopy && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No generated copy available. Click "Generate New Copy" above to create marketing content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ProductDetail;
