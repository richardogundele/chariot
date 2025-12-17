import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, MessageSquare, FileText, Users, TrendingUp, ArrowUpRight, 
  BarChart3, Target, Send, PackageOpen, Sparkles, Zap, Image, 
  PenTool, Rocket
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your ChariotAI assistant. Ask me anything about your marketing campaigns, products, or analytics." }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    copyVariants: 0,
    images: 0,
    campaigns: 0
  });

  // Load real stats
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [productsRes, copyRes, imagesRes, campaignsRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('deleted', false),
          supabase.from('generated_copy').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('generated_images').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setStats({
          products: productsRes.count || 0,
          copyVariants: copyRes.count || 0,
          images: imagesRes.count || 0,
          campaigns: campaignsRes.count || 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMsg = { role: "user" as const, content: inputMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const CHAT_URL = `https://eoazvnwiobtzzrdxjfzr.supabase.co/functions/v1/chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: assistantContent };
                return newMsgs;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    }
  };

  // Mock data for charts
  const activityData = [
    { name: 'Mon', copies: 4, images: 2 },
    { name: 'Tue', copies: 6, images: 3 },
    { name: 'Wed', copies: 8, images: 5 },
    { name: 'Thu', copies: 5, images: 4 },
    { name: 'Fri', copies: 12, images: 6 },
    { name: 'Sat', copies: 9, images: 3 },
    { name: 'Sun', copies: 7, images: 4 },
  ];

  const pieData = [
    { name: 'Products', value: stats.products || 1, color: 'hsl(var(--primary))', link: '/products' },
    { name: 'Copy', value: stats.copyVariants || 1, color: 'hsl(var(--accent))', link: '/copy-generator' },
    { name: 'Images', value: stats.images || 1, color: 'hsl(142 76% 36%)', link: '/image-generator' },
  ];

  const statsDisplay = [
    { 
      title: "Products", 
      value: stats.products, 
      icon: PackageOpen, 
      trend: "+12%",
      gradient: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      title: "Copy Variants", 
      value: stats.copyVariants, 
      icon: FileText, 
      trend: "+28%",
      gradient: "from-violet-500 to-purple-400",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500"
    },
    { 
      title: "Images Generated", 
      value: stats.images, 
      icon: Image, 
      trend: "+18%",
      gradient: "from-emerald-500 to-green-400",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500"
    },
    { 
      title: "Campaigns", 
      value: stats.campaigns, 
      icon: Rocket, 
      trend: "+5%",
      gradient: "from-orange-500 to-amber-400",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500"
    },
  ];

  const quickActions = [
    {
      title: "Generate Copy",
      description: "AI-powered marketing content",
      icon: PenTool,
      link: "/copy-generator",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "Add Product",
      description: "Add to your catalog",
      icon: PackageOpen,
      link: "/products",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Create Images",
      description: "AI product visuals",
      icon: Image,
      link: "/image-generator",
      gradient: "from-emerald-500 to-green-500"
    },
    {
      title: "Marketing Hub",
      description: "Strategies & ideas",
      icon: Sparkles,
      link: "/marketing-hub",
      gradient: "from-orange-500 to-amber-500"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Dashboard
              </h1>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-xs font-medium text-primary flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Pro
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">Welcome back! Here's your marketing overview.</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/products">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground" asChild>
              <Link to="/copy-generator">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Copy
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            // Skeleton loading state for stats
            [...Array(4)].map((_, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden border-0 bg-card shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <div className="flex items-baseline gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                    <Skeleton className="h-11 w-11 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsDisplay.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-xl transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <span className="text-xs font-medium text-emerald-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] w-full flex flex-col gap-4">
                  <div className="flex-1 flex items-end gap-2 px-4">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                        <Skeleton 
                          className="w-full rounded-t-md" 
                          style={{ height: `${Math.random() * 80 + 40}px` }} 
                        />
                        <Skeleton className="h-3 w-8 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityData}>
                        <defs>
                          <linearGradient id="colorCopies" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Area type="monotone" dataKey="copies" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCopies)" strokeWidth={2} />
                        <Area type="monotone" dataKey="images" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorImages)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Copy Generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-xs text-muted-foreground">Images Created</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Distribution Pie Chart */}
          <Card className="border-0 shadow-lg bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Content Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <div className="relative">
                    <Skeleton className="h-40 w-40 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="h-20 w-20 rounded-full bg-card" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          onClick={(data) => navigate(data.link)}
                          className="cursor-pointer"
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {pieData.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => navigate(item.link)}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Assistant */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-card h-[450px] flex flex-col overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold">AI Marketing Assistant</span>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">Powered by GPT-4</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                <ScrollArea className="flex-1 h-full">
                  <div className="space-y-4 p-5">
                    {messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[85%] p-4 rounded-2xl ${
                            message.role === "user" 
                              ? "bg-gradient-to-br from-primary to-accent text-white rounded-br-md" 
                              : "bg-muted/50 text-foreground rounded-bl-md border border-border/50"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <div className="text-sm leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li>{children}</li>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border/50 flex-shrink-0 bg-muted/20">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ask me anything about marketing..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-background border-border/50 focus:border-primary"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <Link 
                    key={action.title}
                    to={action.link}
                    className="block"
                  >
                    <div className="group relative overflow-hidden rounded-xl border border-border/50 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card">
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <div className="flex items-center gap-3 relative">
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.gradient} shadow-sm`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Pro Tip Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">Pro Tip</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use the AI assistant to brainstorm marketing ideas, analyze your products, or get help with copywriting strategies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
