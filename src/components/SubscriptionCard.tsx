import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { CouponCodeDialog } from "./CouponCodeDialog";

export function SubscriptionCard() {
  const { tier, subscribed, subscriptionEnd, totalUsed, totalLimit, loading, checkSubscription } = useSubscription();
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);

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
          {tier === "free" && (
            <Button onClick={() => setCouponDialogOpen(true)}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button variant="ghost" onClick={checkSubscription}>
            Refresh Status
          </Button>
        </div>

        <CouponCodeDialog 
          open={couponDialogOpen} 
          onOpenChange={setCouponDialogOpen} 
        />
      </CardContent>
    </Card>
  );
}