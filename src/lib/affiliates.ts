/**
 * affiliates.ts - Centralized Dynamic Affiliate & Partner Gateway for MealOptimiza
 * 
 * Engineered for high-conversion native utilities:
 * 1. 🛒 Grocery & African Pantry Sourcing (Instacart, Amazon Fresh, SayWeee, Oja UK, Chowdeck)
 * 2. 🩸 Continuous Glucose Monitors (CGM) & Wearables (Levels Health, Dexcom, WHOOP, Ultrahuman)
 * 3. 🧬 Targeted Clinical Supplements (Thorne Vitamin D3+K2, Methylated B12 for Metformin, Berberine)
 * 4. 🧪 At-Home Lab Diagnostics (LetsGetChecked HbA1c Finger-Prick, Everlywell Kidney Panel)
 * 5. 🍳 Smart Healthy Kitchen Hardware (Ninja Air Fryer for oil-free Akara, Vitamix Blender)
 * 
 * To update your affiliate tags, simply update the IDs below or set environment variables in Vercel!
 */

// Global / Regional Affiliate Tag Configuration
export const AFFILIATE_CONFIG = {
  // Amazon Associates Tag (e.g. 'mealoptimiza-20')
  AMAZON_ASSOCIATE_TAG: import.meta.env.VITE_AMAZON_AFFILIATE_TAG || "mealoptimiza-20",
  // Instacart Partner Campaign ID (Impact.com)
  INSTACART_CAMPAIGN_ID: import.meta.env.VITE_INSTACART_CAMPAIGN_ID || "mealoptimiza",
  // Levels Health Referral Link
  LEVELS_REFERRAL_URL: import.meta.env.VITE_LEVELS_AFFILIATE_URL || "https://levels.link/mealoptimiza",
  // Thorne Health Affiliate ID
  THORNE_AFFILIATE_ID: import.meta.env.VITE_THORNE_AFFILIATE_ID || "mealoptimiza",
  // LetsGetChecked Partner ID
  LETSGETCHECKED_ID: import.meta.env.VITE_LETSGETCHECKED_ID || "mealoptimiza",
};

export interface AffiliateProduct {
  id: string;
  category: "cgm" | "supplement" | "grocery" | "lab_test" | "kitchen";
  name: string;
  brand: string;
  badge: string;
  tagline: string;
  emoji: string;
  priceEstimate?: string;
  discountOffer?: string;
  partnerUrl: string;
  clinicalReason: string;
}

export const AFFILIATE_CATALOG: Record<string, AffiliateProduct> = {
  // =========================================================================
  // 🩸 1. CONTINUOUS GLUCOSE MONITORS (CGMS) & WEARABLES
  // =========================================================================
  "levels-cgm": {
    id: "levels-cgm",
    category: "cgm",
    name: "Levels Continuous Glucose Monitor (CGM)",
    brand: "Levels Health & Dexcom G7",
    badge: "$50 Partner Discount 🩸",
    tagline: "Track your real-time blood sugar curve after eating Jollof & swallows",
    emoji: "🩸",
    discountOffer: "$50 Off Sensor Kit",
    partnerUrl: AFFILIATE_CONFIG.LEVELS_REFERRAL_URL,
    clinicalReason: "Live interstitial glucose feedback teaches exact personal carb tolerance."
  },
  "whoop-4": {
    id: "whoop-4",
    category: "cgm",
    name: "WHOOP 4.0 Biometric & Recovery Strap",
    brand: "WHOOP",
    badge: "1 Month Free Trial 🏃🏾‍♂️",
    tagline: "Continuous heart rate variability (HRV), sleep staging & strain tracking",
    emoji: "⌚",
    discountOffer: "Free Sensor + 1 Month Free",
    partnerUrl: "https://join.whoop.com/mealoptimiza",
    clinicalReason: "Poor sleep and high nocturnal cortisol directly elevate morning fasting glucose."
  },

  // =========================================================================
  // 🧬 2. TARGETED CLINICAL SUPPLEMENTS (THORNE & PURE ENCAPSULATIONS)
  // =========================================================================
  "thorne-vitamin-d3": {
    id: "thorne-vitamin-d3",
    category: "supplement",
    name: "Thorne Vitamin D3 + K2 Liquid / Capsules",
    brand: "Thorne Certified Clean",
    badge: "Essential Diaspora Shield ☀️",
    tagline: "Clinically proven 5,000 IU Vitamin D3 with MK-7 K2 for arterial safety",
    emoji: "☀️",
    priceEstimate: "$24.00",
    partnerUrl: `https://www.thorne.com/products/dp/vitamin-d-k2-liquid?aff=${AFFILIATE_CONFIG.THORNE_AFFILIATE_ID}`,
    clinicalReason: "Over 82% of African diaspora adults in the UK/US/Canada have suboptimal Vitamin D3 due to melanin sun absorption."
  },
  "thorne-methyl-b12": {
    id: "thorne-methyl-b12",
    category: "supplement",
    name: "Thorne Methylcobalamin (Bioactive B12)",
    brand: "Thorne Clinical",
    badge: "Metformin Co-Factor 🧬",
    tagline: "High-absorption Methyl B12 to prevent neuropathy and fatigue",
    emoji: "💊",
    priceEstimate: "$20.00",
    partnerUrl: `https://www.thorne.com/products/dp/methyl-b-complex?aff=${AFFILIATE_CONFIG.THORNE_AFFILIATE_ID}`,
    clinicalReason: "Long-term Metformin therapy reduces ileal Vitamin B12 absorption by up to 30%."
  },
  "thorne-berberine": {
    id: "thorne-berberine",
    category: "supplement",
    name: "Thorne Dual-Action Berberine-500",
    brand: "Thorne Clinical",
    badge: "Natural AMPK Activator 🌿",
    tagline: "Botanical polyphenol that supports insulin sensitivity and lipid balance",
    emoji: "🌿",
    priceEstimate: "$38.00",
    partnerUrl: `https://www.thorne.com/products/dp/berberine-500?aff=${AFFILIATE_CONFIG.THORNE_AFFILIATE_ID}`,
    clinicalReason: "Activates cellular AMPK pathway, mimicking the metabolic benefits of exercise and healthy fasting."
  },
  "thorne-magnesium-glycinate": {
    id: "thorne-magnesium-glycinate",
    category: "supplement",
    name: "Thorne Magnesium Bisglycinate Powder",
    brand: "Thorne Clinical",
    badge: "Arterial Relaxation & Sleep 🫀",
    tagline: "Gentle chelated magnesium for blood vessel elasticity and restful sleep",
    emoji: "🫀",
    priceEstimate: "$44.00",
    partnerUrl: `https://www.thorne.com/products/dp/magnesium-bisglycinate?aff=${AFFILIATE_CONFIG.THORNE_AFFILIATE_ID}`,
    clinicalReason: "Relaxes vascular smooth muscle to support optimal systolic/diastolic blood pressure."
  },

  // =========================================================================
  // 🧪 3. AT-HOME LAB DIAGNOSTICS & HBA1C TEST KITS
  // =========================================================================
  "letsgetchecked-hba1c": {
    id: "letsgetchecked-hba1c",
    category: "lab_test",
    name: "LetsGetChecked At-Home HbA1c Test Kit",
    brand: "LetsGetChecked CLIA-Certified",
    badge: "Home Finger-Prick 🧪",
    tagline: "Get your true 90-day average blood sugar (HbA1c) in 5 days with physician review",
    emoji: "🧪",
    priceEstimate: "$59.00",
    discountOffer: "20% Off with code MEALOPTIMIZA",
    partnerUrl: `https://www.letsgetchecked.com/home-diabetes-test/?ref=${AFFILIATE_CONFIG.LETSGETCHECKED_ID}`,
    clinicalReason: "Enables objective clinical tracking without waiting 6 months for clinic appointments."
  },
  "everlywell-kidney": {
    id: "everlywell-kidney",
    category: "lab_test",
    name: "Everlywell Kidney Health (eGFR & Albumin) Test",
    brand: "Everlywell",
    badge: "Kidney Shield Panel 💧",
    tagline: "Screen creatinine, eGFR, and microalbumin from home to protect kidney filtration",
    emoji: "💧",
    priceEstimate: "$69.00",
    partnerUrl: `https://www.everlywell.com/products/kidney-health-test/?ref=${AFFILIATE_CONFIG.LETSGETCHECKED_ID}`,
    clinicalReason: "Early detection of microalbuminuria is the #1 defense against hypertension-induced renal damage."
  },

  // =========================================================================
  // 🍳 4. SMART HEALTHY KITCHEN HARDWARE
  // =========================================================================
  "ninja-air-fryer": {
    id: "ninja-air-fryer",
    category: "kitchen",
    name: "Ninja Foodi DualZone Air Fryer (XL)",
    brand: "Ninja / Amazon",
    badge: "Oil-Free Akara & Plantain 🍟",
    tagline: "Crispy plantain and bean cakes with 85% less oxidized oil",
    emoji: "🍳",
    priceEstimate: "$159.00",
    partnerUrl: `https://www.amazon.com/dp/B089TQWJKK?tag=${AFFILIATE_CONFIG.AMAZON_ASSOCIATE_TAG}`,
    clinicalReason: "Eliminates reused deep-frying trans-fats that cause arterial plaque."
  },
  "vitamix-blender": {
    id: "vitamix-blender",
    category: "kitchen",
    name: "Vitamix Explorian High-Power Blender",
    brand: "Vitamix / Amazon",
    badge: "Silky Smooth Swallows 🥣",
    tagline: "Pulverizes tough Ugu, Bitter Leaf, Fonio & soaked beans in 60 seconds",
    emoji: "🥣",
    priceEstimate: "$299.00",
    partnerUrl: `https://www.amazon.com/dp/B07P5J8H24?tag=${AFFILIATE_CONFIG.AMAZON_ASSOCIATE_TAG}`,
    clinicalReason: "Breaks plant cell walls to unlock 100% of bound polyphenols and antioxidant pigments."
  }
};

/**
 * Opens an affiliate or partner product safely in a new tab
 */
export function openAffiliateProduct(productId: string): void {
  const item = AFFILIATE_CATALOG[productId];
  if (!item) {
    console.warn(`Affiliate product not found: ${productId}`);
    return;
  }

  // Open partner link
  window.open(item.partnerUrl, "_blank", "noopener,noreferrer");
}
