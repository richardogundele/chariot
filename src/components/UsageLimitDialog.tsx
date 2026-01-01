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
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usageType: string;
}

export function UsageLimitDialog({ open, onOpenChange }: UsageLimitDialogProps) {
  const { tier, totalUsed, totalLimit } = useSubscription();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-primary" />
            Daily Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base">
            You've used all {totalLimit} creations today on your{" "}
            <Badge variant="outline" className="ml-1">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>{" "}
            plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Upgrade to Pro for unlimited creations and never hit a limit again.
          </p>

          <div className="grid gap-4">
            {tier === "free" && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Pro Plan
                    <Badge className="bg-primary/10 text-primary">Unlimited</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Unlimited creations • $9.99/mo
                  </p>
                </div>
                <Button onClick={handleUpgrade} disabled={loading}>
                  {loading ? (
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