import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UsageData {
  products: number;
  images: number;
  copies: number;
  content_marketing: number;
  period_start: string;
}

interface SubscriptionContextType {
  tier: "free" | "pro";
  subscribed: boolean;
  subscriptionEnd: string | null;
  usage: UsageData | null;
  totalUsed: number;
  totalLimit: number;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  canUse: () => boolean;
  getRemainingUsage: () => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_DAILY_LIMIT = 10; // 10 total creations per day

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      if (data) {
        // Map any tier to just free or pro
        const mappedTier = data.tier === "pro" || data.tier === "max" ? "pro" : "free";
        setTier(mappedTier);
        setSubscribed(data.subscribed || false);
        setSubscriptionEnd(data.subscription_end || null);
        setUsage(data.usage || null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user, checkSubscription]);

  // Check subscription periodically (every minute)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Calculate total usage across all types
  const totalUsed = usage 
    ? (usage.products + usage.images + usage.copies + usage.content_marketing) 
    : 0;
  
  // Pro = unlimited, Free = 10 per day
  const totalLimit = tier === "pro" ? Infinity : FREE_DAILY_LIMIT;

  const canUse = () => {
    if (tier === "pro") return true; // Pro is unlimited
    return totalUsed < FREE_DAILY_LIMIT;
  };

  const getRemainingUsage = () => {
    if (tier === "pro") return Infinity;
    return Math.max(0, FREE_DAILY_LIMIT - totalUsed);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        subscribed,
        subscriptionEnd,
        usage,
        totalUsed,
        totalLimit,
        loading,
        checkSubscription,
        canUse,
        getRemainingUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
