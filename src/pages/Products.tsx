import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Trash2, Sparkles, Loader2, ExternalLink, Star, RefreshCw, Search, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageLimitDialog } from "@/components/UsageLimitDialog";

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

const Products = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canUse, checkSubscription } = useSubscription();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(product => product.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [products, searchQuery, statusFilter, sortBy]);

  const loadProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error Loading Products",
        description: "Failed to load your products. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageGenerationMode, setImageGenerationMode] = useState<"upload" | "generate">("upload");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    imagePrompt: "",
    generatedImageUrl: "",
    targetAudience: "",
    uniqueValue: "",
    selectedCopywriter: "",
    generatedCopy: null as any,
  });

  const copywriters = [
    { id: "kenny-nwokoye", name: "Kenny Nwokoye" },
    { id: "david-ogilvy", name: "David Ogilvy" },
    { id: "gary-halbert", name: "Gary Halbert" },
    { id: "eugene-schwartz", name: "Eugene Schwartz" },
    { id: "joe-sugarman", name: "Joe Sugarman" },
    { id: "dan-kennedy", name: "Dan Kennedy" },
    { id: "clayton-makepeace", name: "Clayton Makepeace" },
  ];

  const handleGenerateImage = async (isRefresh = false) => {
    const prompt = newProduct.imagePrompt || 
      `Create a stunning 3D product render of ${newProduct.name} with professional studio lighting and a clean white background. The image should be:

- A high-quality 3D render with realistic materials, textures, and lighting
- Positioned at a 45-degree angle to show depth and dimensionality
- Illuminated with soft, even studio lighting that eliminates harsh shadows
- Set against a pure white seamless background for e-commerce use
- Rendered with photorealistic detail and premium finish
- Optimized for advertising and marketing materials
- Sharp focus with subtle depth of field
- Professional product photography style

Product details: ${newProduct.description}

Style: Ultra-realistic 3D product visualization, commercial photography quality, cinema 4D render, octane render, studio lighting setup, premium product showcase, marketing ready.`;
    
    console.log("Sending 3D render generation request with enhanced prompt");
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setNewProduct({ ...newProduct, generatedImageUrl: data.imageUrl, imagePrompt: prompt });
        toast({
          title: isRefresh ? "Image Regenerated" : "Image Generated",
          description: "Your AI image has been generated successfully!",
        });
        return data.imageUrl; // Return the URL for immediate use
      }
      return null;
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCopy = async () => {
    try {
      const copywriterId = copywriters.find(c => c.name === newProduct.selectedCopywriter)?.id;
      const mode = copywriterId === "kenny-nwokoye" ? "kenny" : "expert";
      
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: { 
          productName: newProduct.name,
          productDescription: newProduct.description,
          targetAudience: newProduct.targetAudience,
          uniqueValue: newProduct.uniqueValue,
          copywriter: newProduct.selectedCopywriter,
          mode: mode,
        }
      });

      if (error) throw error;

      if (data) {
        setNewProduct({ ...newProduct, generatedCopy: data });
      }
      return data;
    } catch (error) {
      console.error('Error generating copy:', error);
      throw error;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct({ ...newProduct, imageFile: file });
      toast({
        title: "Image Selected",
        description: `${file.name} is ready to upload.`,
      });
    }
  };

  const handleAddProduct = async () => {
    // Check usage limit first
    if (!canUse("products")) {
      setShowLimitDialog(true);
      return;
    }

    if (!newProduct.name || !newProduct.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in both product name and description.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.selectedCopywriter) {
      toast({
        title: "Select Copywriter",
        description: "Please select a copywriter style for AI-generated content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate or finetune image
      let imageUrl = null;
      if (imageGenerationMode === "generate") {
        const generatedUrl = await handleGenerateImage();
        imageUrl = generatedUrl;
      } else if (newProduct.imageFile) {
        // Convert uploaded file to base64
        const reader = new FileReader();
        const uploadedImageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newProduct.imageFile!);
        });

        // Refine uploaded image with AI
        toast({
          title: "Refining Image",
          description: "AI is enhancing your uploaded image...",
        });

        try {
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { 
              prompt: `Enhance this product image to professional marketing quality with improved lighting, clarity, and presentation. Remove any background distractions and create a clean, professional look suitable for e-commerce. Product: ${newProduct.name}. ${newProduct.description}`,
              imageUrl: uploadedImageBase64
            }
          });

          if (error) throw error;
          imageUrl = data?.imageUrl || uploadedImageBase64;
          
          if (data?.imageUrl) {
            toast({
              title: "Image Enhanced",
              description: "Your image has been refined by AI!",
            });
          }
        } catch (error) {
          console.error('Error refining image:', error);
          imageUrl = uploadedImageBase64; // Fallback to original
          toast({
            title: "Using Original Image",
            description: "AI enhancement unavailable, using your uploaded image.",
            variant: "destructive",
          });
        }
      }

      // Generate copy
      const copyData = await handleGenerateCopy();

      // Save to database
      const { data: savedProduct, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: newProduct.name,
          description: newProduct.description,
          image_url: imageUrl,
          ad_copy: copyData?.content || null,
          status: "Ready",
        })
        .select()
        .single();

      if (error) throw error;
      
      // Reset form
      setNewProduct({ 
        name: "", 
        description: "", 
        imageFile: null, 
        imagePrompt: "", 
        generatedImageUrl: "",
        targetAudience: "",
        uniqueValue: "",
        selectedCopywriter: "",
        generatedCopy: null,
      });
      
      // Reload products and close dialog
      await loadProducts();
      await checkSubscription(); // Refresh usage counts
      setIsAddDialogOpen(false);
      
      // Reset filters to show new product
      setSearchQuery("");
      setStatusFilter("all");
      setSortBy("newest");
      
      // Scroll to top to see the new product
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast({
        title: "Product Added Successfully!",
        description: "Your product is now visible in your catalog.",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Failed to Add Product",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteProduct = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      await loadProducts();
      toast({
        title: "Product Deleted",
        description: "Product has been removed from your catalog.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
        <div className="space-y-3 mb-10 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-lg text-muted-foreground font-normal max-w-2xl">
            Manage your product catalog with AI-powered marketing content generation.
          </p>
        </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="touch-target">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in your product details and generate AI-powered marketing content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Product Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Product Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      placeholder="e.g., Premium Coffee Blend"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea
                      id="product-description"
                      placeholder="Describe your product and its key features..."
                      className="min-h-[100px]"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-audience">Target Audience (Optional)</Label>
                      <Input
                        id="target-audience"
                        placeholder="e.g., Coffee enthusiasts"
                        value={newProduct.targetAudience}
                        onChange={(e) => setNewProduct({ ...newProduct, targetAudience: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unique-value">Unique Value (Optional)</Label>
                      <Input
                        id="unique-value"
                        placeholder="What makes it special?"
                        value={newProduct.uniqueValue}
                        onChange={(e) => setNewProduct({ ...newProduct, uniqueValue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Product Image</h3>
                  <Tabs defaultValue="upload" className="w-full" onValueChange={(v) => setImageGenerationMode(v as "upload" | "generate")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </TabsTrigger>
                      <TabsTrigger value="generate">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-3">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {newProduct.imageFile ? newProduct.imageFile.name : "Click to upload product image"}
                          </p>
                        </Label>
                      </div>
                      {newProduct.imageFile && (
                        <div className="border rounded-lg p-2">
                          <img 
                            src={URL.createObjectURL(newProduct.imageFile)} 
                            alt="Uploaded preview" 
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="generate" className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="image-prompt">Image Description (Optional)</Label>
                        <Textarea
                          id="image-prompt"
                          placeholder="AI will auto-generate based on your product details, or customize the prompt here..."
                          value={newProduct.imagePrompt}
                          onChange={(e) => setNewProduct({ ...newProduct, imagePrompt: e.target.value })}
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave blank to auto-generate from product name and description
                        </p>
                      </div>
                      {newProduct.generatedImageUrl && (
                        <div className="border rounded-lg p-2 relative">
                          <img 
                            src={newProduct.generatedImageUrl} 
                            alt="Generated" 
                            className="w-full h-48 object-cover rounded"
                          />
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-4 right-4"
                            onClick={() => handleGenerateImage(true)}
                            disabled={isGenerating}
                          >
                            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Copy Generation Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Marketing Copy</h3>
                  
                  <div className="space-y-3">
                    <Label>Select Copywriter Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {copywriters.map((copywriter) => (
                        <Button
                          key={copywriter.id}
                          type="button"
                          variant={newProduct.selectedCopywriter === copywriter.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewProduct({ ...newProduct, selectedCopywriter: copywriter.name })}
                          className="justify-start"
                        >
                          <Star className={`h-3 w-3 mr-2 ${newProduct.selectedCopywriter === copywriter.name ? 'fill-current' : ''}`} />
                          {copywriter.name}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AI will generate comprehensive marketing content in the style of your selected copywriter
                    </p>
                  </div>

                  {newProduct.generatedCopy && (
                    <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Complete marketing package generated in the style of {newProduct.selectedCopywriter}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Includes: Ad Copy Variations, Full Sales Letter, and Marketing Insights
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Product Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={isGenerating || !newProduct.name || !newProduct.description || !newProduct.selectedCopywriter}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Product...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading your products..." className="py-16" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Yet"
            description="Create your first product to start generating AI-powered marketing content and professional product images."
            actionLabel="Add Your First Product"
            onAction={() => setIsAddDialogOpen(true)}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`No products match your search "${searchQuery}". Try adjusting your filters or search term.`}
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden hover-lift"
                onClick={() => handleViewProduct(product.id)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-muted overflow-hidden relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Failed to load image for product:', product.name, product.image_url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <Badge 
                    className="absolute top-3 right-3" 
                    variant={product.status === "Ready" ? "default" : "secondary"}
                  >
                    {product.status}
                  </Badge>
                </div>

                {/* Product Info */}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => handleDeleteProduct(e, product.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Full Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && products.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      <UsageLimitDialog 
        open={showLimitDialog} 
        onOpenChange={setShowLimitDialog} 
        usageType="products" 
      />
    </AppLayout>
  );
};

export default Products;