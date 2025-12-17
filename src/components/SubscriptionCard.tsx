import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles, ArrowRight, Loader2, CreditCard, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionCard() {
  const { tier, subscribed, subscriptionEnd, usage, limits, loading, checkSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (planType: "pro" | "max") => {
    setCheckoutLoading(planType);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    { label: "Products", key: "products" as const },
    { label: "Images", key: "images" as const },
    { label: "Copies", key: "copies" as const },
    { label: "Content Marketing", key: "content_marketing" as const },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your plan and usage</CardDescription>
          </div>
          <Badge
            variant={tier === "free" ? "secondary" : "default"}
            className={tier !== "free" ? "bg-primary" : ""}
          >
            {tier === "free" && "Free Plan"}
            {tier === "pro" && (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </>
            )}
            {tier === "max" && (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Max Plan
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Monthly Usage</h4>
          {usageItems.map((item) => {
            const current = usage?.[item.key] || 0;
            const limit = limits[item.key];
            const percentage = (current / limit) * 100;

            return (
              <div key={item.key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span>
                    {current} / {limit}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={percentage >= 90 ? "bg-destructive/20" : ""}
                />
              </div>
            );
          })}
        </div>

        {subscriptionEnd && (
          <p className="text-sm text-muted-foreground">
            Your subscription renews on{" "}
            {new Date(subscriptionEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {subscribed && (
            <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Settings2 className="w-4 h-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}

          {tier !== "max" && (
            <Button
              onClick={() => handleUpgrade(tier === "free" ? "pro" : "max")}
              disabled={checkoutLoading !== null}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : tier === "free" ? (
                <Crown className="w-4 h-4 mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {tier === "free" ? "Upgrade to Pro" : "Upgrade to Max"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button variant="ghost" onClick={checkSubscription}>
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
