import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, TrendingUp, Users, Globe, DollarSign, Eye, 
  Zap, Image as ImageIcon, FileText, BookOpen, Sparkles,
  Check, Star, Loader2, ChevronLeft, ChevronRight, Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Active Users", value: "1,200+", icon: Users },
    { label: "Countries Served", value: "12+", icon: Globe },
    { label: "Content Pieces Created", value: "50K+", icon: TrendingUp },
    { label: "Customer Satisfaction", value: "4.8/5", icon: DollarSign },
  ];

  // Chart data
  const growthData = [
    { month: "Jan", users: 120, revenue: 4800 },
    { month: "Feb", users: 250, revenue: 8900 },
    { month: "Mar", users: 420, revenue: 15200 },
    { month: "Apr", users: 680, revenue: 24500 },
    { month: "May", users: 950, revenue: 38600 },
    { month: "Jun", users: 1200, revenue: 52400 },
  ];

  const conversionData = [
    { name: "Before ChariotAI", rate: 1.2 },
    { name: "After ChariotAI", rate: 4.8 },
  ];

  const performanceData = [
    { metric: "Image Quality", score: 95 },
    { metric: "Copy Effectiveness", score: 92 },
    { metric: "Time Saved", score: 88 },
    { metric: "ROI", score: 96 },
  ];

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: ImageIcon,
      title: "AI Image Generation",
      description: "Create stunning product images with AI. Upload or describe your product and get professional, sales-ready images in seconds.",
      color: "text-blue-500"
    },
    {
      icon: FileText,
      title: "Expert Copywriting",
      description: "Choose from 12+ legendary copywriters' styles. Generate ad copy, sales letters, and complete marketing packages instantly.",
      color: "text-purple-500"
    },
    {
      icon: BookOpen,
      title: "Marketing Guide",
      description: "Get practical insights on why your content converts and how to reach your target audience effectively.",
      color: "text-green-500"
    },
    {
      icon: Sparkles,
      title: "Complete Workflow",
      description: "From product images to sales copy - everything you need to launch and market your products successfully.",
      color: "text-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Amara N.",
      role: "Lagos Boutique Owner",
      location: "Nigeria",
      content: "ChariotAI helped me create professional product photos without expensive equipment. My online sales doubled in 3 months!",
      rating: 5
    },
    {
      name: "Kwame A.",
      role: "Tech Startup Founder",
      location: "Ghana",
      content: "The copywriting feature saves me hours every week. I can now focus on growing my business instead of struggling with marketing copy.",
      rating: 5
    },
    {
      name: "Zara M.",
      role: "Fashion Designer",
      location: "Kenya",
      content: "As a solo entrepreneur, ChariotAI is like having a full marketing team. The AI understands my brand and creates content that converts.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-glow">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              CHARIOT<span className="text-primary">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={scrollToAuth}
              className="hover-scale"
            >
              Login
            </Button>
            <Button 
              onClick={scrollToAuth}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover-scale"
            >
              Sign Up Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Marketing for African & Global SMEs</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Professional Marketing Content
              <span className="block text-primary mt-2">in Minutes</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI-powered images and sales copy for small businesses. No design skills or expensive tools required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg"
                onClick={scrollToAuth}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover-lift"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • 1,200+ businesses trust us
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center space-y-3 hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl lg:text-5xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground text-center mb-4">
            How ChariotAI Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Three simple steps to professional marketing content
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Describe Your Product",
                description: "Enter your product name, description, and target audience. Our AI understands your unique value proposition.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Generate Content",
                description: "Choose from legendary copywriter styles or let AI create stunning product images in seconds.",
                icon: Sparkles,
              },
              {
                step: "3",
                title: "Launch & Convert",
                description: "Download your professional marketing materials and start attracting customers immediately.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden border-border hover:border-primary/50 transition-smooth">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground text-center mb-4 animate-fade-in">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 animate-fade-in">
            All-in-one marketing solution for small businesses
          </p>
          
          <Carousel className="w-full">
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border-border hover:border-primary/50 transition-smooth hover-scale">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ${feature.color}`}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground text-center mb-4">
            Trusted by African Entrepreneurs
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Real stories from business owners transforming their marketing
          </p>
          
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {testimonial.role}
                        <span className="text-xs">• {testimonial.location}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        "{testimonial.content}"
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Start free, upgrade when you're ready to scale
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-border hover:border-primary/30 transition-smooth">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                {[
                    "10 Total Creations per Day",
                    "Products, Images, Copy & Content",
                    "All Copywriter Styles",
                    "Basic Support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={scrollToAuth}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  Pro
                  <Crown className="w-5 h-5 text-primary" />
                </CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Unlimited Creations",
                    "Products, Images, Copy & Content",
                    "All Copywriter Styles",
                    "Priority Support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={scrollToAuth}
                >
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="py-24 lg:py-32 bg-gradient-to-b from-secondary/20 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                Ready to Transform Your Marketing?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of entrepreneurs creating professional marketing content with AI.
              </p>
              <ul className="space-y-4">
                {[
                  "Generate stunning product images instantly",
                  "Create sales copy in legendary copywriters' styles",
                  "Get complete marketing packages in minutes",
                  "No credit card required to start"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="shadow-card border-border backdrop-blur-md bg-card/95 animate-scale-in">
              <CardHeader>
                <CardTitle>{isLogin ? "Welcome Back" : "Create Your Account"}</CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Sign in to access your marketing dashboard"
                    : "Get started with AI-powered marketing - free trial included"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                CHARIOT<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ChariotAI. Professional Marketing for Small Businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
