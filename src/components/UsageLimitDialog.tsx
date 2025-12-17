import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usageType: string;
}

export function UsageLimitDialog({ open, onOpenChange, usageType }: UsageLimitDialogProps) {
  const { tier, limits, usage } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (planType: "pro" | "max") => {
    setLoading(planType);
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
      setLoading(null);
    }
  };

  const currentUsage = usage ? usage[usageType as keyof typeof usage] : 0;
  const currentLimit = limits[usageType as keyof typeof limits];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-primary" />
            Usage Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base">
            You've used all {currentLimit} {usageType.replace("_", " ")} this month on your{" "}
            <Badge variant="outline" className="ml-1">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>{" "}
            plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Upgrade your plan to continue creating amazing marketing content.
          </p>

          <div className="grid gap-4">
            {tier !== "pro" && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Pro Plan
                    <Badge className="bg-primary/10 text-primary">Popular</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    50 of each per month • $7.99/mo
                  </p>
                </div>
                <Button onClick={() => handleUpgrade("pro")} disabled={loading !== null}>
                  {loading === "pro" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {tier !== "max" && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Max Plan
                    <Sparkles className="w-4 h-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    100 of each per month • $14.99/mo
                  </p>
                </div>
                <Button
                  variant={tier === "pro" ? "default" : "outline"}
                  onClick={() => handleUpgrade("max")}
                  disabled={loading !== null}
                >
                  {loading === "max" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {tier === "pro" ? "Upgrade" : "Go Max"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
