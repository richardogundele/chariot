import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, ArrowRight, Loader2, CreditCard, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionCard() {
  const { tier, subscribed, subscriptionEnd, totalUsed, totalLimit, loading, checkSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType: "pro" },
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
      setCheckoutLoading(false);
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

  const isUnlimited = tier === "pro";
  const percentage = isUnlimited ? 0 : (totalUsed / totalLimit) * 100;

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
            className={tier === "pro" ? "bg-primary" : ""}
          >
            {tier === "free" && "Free Plan"}
            {tier === "pro" && (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Daily Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Creations</span>
              <span>
                {isUnlimited ? (
                  <span className="text-primary font-medium">Unlimited</span>
                ) : (
                  `${totalUsed} / ${totalLimit}`
                )}
              </span>
            </div>
            {!isUnlimited && (
              <Progress
                value={percentage}
                className={percentage >= 90 ? "bg-destructive/20" : ""}
              />
            )}
          </div>
          {!isUnlimited && (
            <p className="text-xs text-muted-foreground">
              Includes products, images, copies, and content marketing
            </p>
          )}
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

          {tier === "free" && (
            <Button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Upgrade to Pro - $9.99/mo
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