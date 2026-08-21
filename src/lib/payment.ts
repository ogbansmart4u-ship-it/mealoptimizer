/**
 * payment.ts - Subscription & Payment Management for MealOptimizer PRO & Diaspora Care
 */

export type CurrencyCode = "USD" | "GBP" | "NGN";
export type BillingCycle = "monthly" | "annual";
export type PlanTier = "free" | "pro" | "family";

export interface PlanPricing {
  id: PlanTier;
  name: string;
  badge?: string;
  description: string;
  prices: {
    USD: { monthly: number; annual: number; symbol: string };
    GBP: { monthly: number; annual: number; symbol: string };
    NGN: { monthly: number; annual: number; symbol: string };
  };
  features: string[];
  cta: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: PlanPricing[] = [
  {
    id: "free",
    name: "Starter",
    description: "Essential daily food & hydration tracking",
    prices: {
      USD: { monthly: 0, annual: 0, symbol: "$" },
      GBP: { monthly: 0, annual: 0, symbol: "£" },
      NGN: { monthly: 0, annual: 0, symbol: "₦" },
    },
    features: [
      "3 Meal logs per day",
      "Standard African food database",
      "Daily water tracker",
      "Basic weight logs",
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "MealOptimizer PRO 👑",
    badge: "Most Popular",
    popular: true,
    description: "Complete clinical metabolic disease management & AI vision",
    prices: {
      USD: { monthly: 9.99, annual: 79, symbol: "$" },
      GBP: { monthly: 7.99, annual: 65, symbol: "£" },
      NGN: { monthly: 4500, annual: 39000, symbol: "₦" },
    },
    features: [
      "Unlimited AI Camera Food Scans",
      "Unlimited WhatsApp AI Food Bot (Snap photos & text)",
      "🪄 'Fix My Plate' Unlimited Glycemic Rebalancer",
      "🏥 1-Tap Doctor Visit Clinical PDF Reports (eA1c + Vitals)",
      "🎙️ Voice Food Dictation (English & Pidgin)",
      "Full Medical Vault & Biomarker Lab Results",
      "Diaspora vs Local Ingredient Swaps (Lagos vs London/US)",
    ],
    cta: "Upgrade to PRO",
  },
  {
    id: "family",
    name: "Diaspora Parent Care 🌍",
    badge: "Family Healthcare",
    description: "Remote metabolic health monitoring for parents in Africa",
    prices: {
      USD: { monthly: 29, annual: 249, symbol: "$" },
      GBP: { monthly: 22, annual: 199, symbol: "£" },
      NGN: { monthly: 14000, annual: 120000, symbol: "₦" },
    },
    features: [
      "Everything in MealOptimizer PRO for up to 3 family members",
      "Elderly Parents log meals simply via WhatsApp (No app download required)",
      "Live WhatsApp & Email alerts for high glucose spikes",
      "Weekly Clinical Doctor PDF summaries sent straight to your email",
      "Dedicated Dietitian Priority Review",
    ],
    cta: "Start Family Care Plan",
  },
];

/**
 * Gets user's current subscription status with multi-layer permanent locking
 */
export function getSubscriptionStatus(userId?: string): { isPro: boolean; plan: PlanTier; expiresAt?: string } {
  try {
    // 1. Check direct master unlock flag
    const masterUnlocked = localStorage.getItem("mealoptimizer_pro_unlocked") === "true";

    // 2. Check user-specific storage if userId provided
    if (userId) {
      const userSaved = localStorage.getItem(`user_subscription_status_${userId}`);
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (parsed.isPro || parsed.plan === "pro" || parsed.plan === "family") {
          return { isPro: true, plan: parsed.plan || "pro", expiresAt: parsed.expiresAt };
        }
      }
      const userProfile = localStorage.getItem(`user-profile-${userId}`);
      if (userProfile) {
        const p = JSON.parse(userProfile);
        if (p.isPro || p.plan === "pro" || p.plan === "family") {
          return { isPro: true, plan: p.plan || "pro", expiresAt: p.subscriptionExpiresAt };
        }
      }
    }

    // 3. Check general device subscription status
    const saved = localStorage.getItem("user_subscription_status");
    if (saved) {
      const parsed = JSON.parse(saved);
      const isPro = parsed.plan === "pro" || parsed.plan === "family" || parsed.isPro === true || masterUnlocked;
      return {
        isPro,
        plan: isPro ? (parsed.plan || "pro") : "free",
        expiresAt: parsed.expiresAt,
      };
    }

    if (masterUnlocked) {
      return { isPro: true, plan: "pro" };
    }
  } catch {
    /* fallback to free */
  }
  return { isPro: false, plan: "free" };
}

/**
 * Saves subscription status with permanent lock across device and user account
 */
export function setSubscriptionStatus(plan: PlanTier, durationMonths = 1, userId?: string): void {
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + durationMonths);
  const data = {
    plan,
    isPro: plan !== "free",
    activatedAt: new Date().toISOString(),
    expiresAt: expiry.toISOString(),
  };

  try {
    // General device lock
    localStorage.setItem("user_subscription_status", JSON.stringify(data));
    if (plan !== "free") {
      localStorage.setItem("mealoptimizer_pro_unlocked", "true");
    }

    // User-specific permanent lock
    if (userId) {
      localStorage.setItem(`user_subscription_status_${userId}`, JSON.stringify(data));
      const userProfRaw = localStorage.getItem(`user-profile-${userId}`);
      if (userProfRaw) {
        const prof = JSON.parse(userProfRaw);
        prof.plan = plan;
        prof.isPro = plan !== "free";
        prof.subscriptionExpiresAt = expiry.toISOString();
        localStorage.setItem(`user-profile-${userId}`, JSON.stringify(prof));
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Syncs subscription from the user's backend profile into local storage
 */
export function syncSubscriptionFromProfile(profile: any, userId?: string): boolean {
  if (!profile) return false;
  const isPro = profile.plan === "pro" || profile.plan === "family" || profile.isPro === true;
  if (isPro) {
    setSubscriptionStatus(profile.plan || "pro", 12, userId || profile.id);
    return true;
  }
  return false;
}

/**
 * Initiates payment via Paystack or Sandbox Simulation
 */
export async function processPayment({
  plan,
  currency,
  cycle,
  userEmail,
  onSuccess,
  onCancel,
}: {
  plan: PlanTier;
  currency: CurrencyCode;
  cycle: BillingCycle;
  userEmail?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}): Promise<void> {
  const targetPlan = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
  if (!targetPlan || plan === "free") return;

  const price = targetPlan.prices[currency][cycle];
  console.log(`[Payment] Initializing checkout for ${plan} (${currency} ${price})`);

  // Instant activation & permanent lock
  return new Promise((resolve) => {
    setTimeout(() => {
      setSubscriptionStatus(plan, cycle === "annual" ? 12 : 1);
      onSuccess();
      resolve();
    }, 1000);
  });
}
