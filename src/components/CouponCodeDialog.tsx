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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface CouponCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponCodeDialog({ open, onOpenChange }: CouponCodeDialogProps) {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("apply-coupon", {
        body: { couponCode: couponCode.trim() },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        toast({
          title: "🎉 Coupon Applied!",
          description: "You now have Pro access with unlimited creations!",
        });
        
        // Refresh subscription status
        await checkSubscription();
        
        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false);
          setCouponCode("");
          setStatus("idle");
        }, 1500);
      } else {
        setStatus("error");
        toast({
          title: "Invalid Coupon",
          description: data?.message || "This coupon code is not valid",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Enter your coupon code to unlock unlimited creations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="coupon">Coupon Code</Label>
            <Input
              id="coupon"
              placeholder="Enter coupon code..."
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setStatus("idle");
              }}
              disabled={loading || status === "success"}
              className={
                status === "success" 
                  ? "border-green-500 focus-visible:ring-green-500" 
                  : status === "error" 
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Coupon applied successfully!</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <XCircle className="w-4 h-4" />
              <span>Invalid coupon code. Please try again.</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || status === "success"}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Apply Coupon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
