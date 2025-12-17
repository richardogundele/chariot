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
  tier: "free" | "pro" | "max";
  subscribed: boolean;
  subscriptionEnd: string | null;
  usage: UsageData | null;
  limits: {
    products: number;
    images: number;
    copies: number;
    content_marketing: number;
  };
  loading: boolean;
  checkSubscription: () => Promise<void>;
  canUse: (type: "products" | "images" | "copies" | "content_marketing") => boolean;
  getRemainingUsage: (type: "products" | "images" | "copies" | "content_marketing") => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const TIER_LIMITS = {
  free: { products: 15, images: 15, copies: 15, content_marketing: 15 },
  pro: { products: 50, images: 50, copies: 50, content_marketing: 50 },
  max: { products: 100, images: 100, copies: 100, content_marketing: 100 },
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [tier, setTier] = useState<"free" | "pro" | "max">("free");
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
        setTier(data.tier || "free");
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

  const limits = TIER_LIMITS[tier];

  const canUse = (type: "products" | "images" | "copies" | "content_marketing") => {
    if (!usage) return true;
    return usage[type] < limits[type];
  };

  const getRemainingUsage = (type: "products" | "images" | "copies" | "content_marketing") => {
    if (!usage) return limits[type];
    return Math.max(0, limits[type] - usage[type]);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        subscribed,
        subscriptionEnd,
        usage,
        limits,
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
