/**
 * groceryAffiliates.ts - Multi-regional Diaspora & Local African Grocery Store Partners & Affiliate Links
 */

export interface GroceryStorePartner {
  id: string;
  name: string;
  region: "uk" | "us" | "ca" | "ng" | "gh" | "global";
  regionLabel: string;
  flag: string;
  badge: string;
  tagline: string;
  deliverySpeed: string;
  currency: string;
  symbol: string;
  baseUrl: string;
  getSearchUrl: (query: string) => string;
}

export interface MetabolicSwapItem {
  original: string;
  diasporaSwap: string;
  marketAisle: string;
  glycemicBenefit: string;
}

export const GROCERY_PARTNERS: GroceryStorePartner[] = [
  // 🇬🇧 UNITED KINGDOM
  {
    id: "oja-uk",
    name: "Oja African & Caribbean",
    region: "uk",
    regionLabel: "United Kingdom",
    flag: "🇬🇧",
    badge: "Official Partner · Same Day",
    tagline: "Authentic Ugu, Ewedu, Titus Fish & Fresh Yam to your door",
    deliverySpeed: "Same-Day / Next-Day",
    currency: "GBP",
    symbol: "£",
    baseUrl: "https://oja.life?ref=mealoptimizer",
    getSearchUrl: (query) => `https://oja.life/search?q=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },
  {
    id: "sainsburys-uk",
    name: "Sainsbury's World Foods",
    region: "uk",
    regionLabel: "United Kingdom",
    flag: "🇬🇧",
    badge: "Major Supermarket",
    tagline: "Plantains, Scotch Bonnets, Black-eyed Peas & Basmati",
    deliverySpeed: "Next-Day Delivery / Click & Collect",
    currency: "GBP",
    symbol: "£",
    baseUrl: "https://www.sainsburys.co.uk?utm_source=mealoptimizer",
    getSearchUrl: (query) =>
      `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(query)}?utm_source=mealoptimizer`,
  },
  {
    id: "chopafrican-uk",
    name: "ChopAfrican Store",
    region: "uk",
    regionLabel: "United Kingdom",
    flag: "🇬🇧",
    badge: "Nationwide UK Shipping",
    tagline: "Premium Ogbono, Egusi, Crayfish and Cooled Flours",
    deliverySpeed: "1-2 Business Days",
    currency: "GBP",
    symbol: "£",
    baseUrl: "https://chopafrican.com?ref=mealoptimizer",
    getSearchUrl: (query) => `https://chopafrican.com/search?q=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },

  // 🇺🇸 UNITED STATES & CANADA
  {
    id: "weee-us",
    name: "Weee! African & Caribbean",
    region: "us",
    regionLabel: "United States",
    flag: "🇺🇸",
    badge: "#1 E-Grocer for Immigrants",
    tagline: "Fresh Green Plantain, Smoked Fish, Bitter Leaf & Cassava",
    deliverySpeed: "Next-Day Free Delivery",
    currency: "USD",
    symbol: "$",
    baseUrl: "https://www.sayweee.com/en?ref=mealoptimizer",
    getSearchUrl: (query) =>
      `https://www.sayweee.com/en/search?keyword=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },
  {
    id: "instacart-us",
    name: "Instacart Ethnic Aisles",
    region: "us",
    regionLabel: "United States",
    flag: "🇺🇸",
    badge: "2-Hour Local Delivery",
    tagline: "Shop H-Mart, Patel Brothers, and local ethnic markets",
    deliverySpeed: "Within 2 Hours",
    currency: "USD",
    symbol: "$",
    baseUrl: "https://www.instacart.com?utm_source=mealoptimizer",
    getSearchUrl: (query) =>
      `https://www.instacart.com/store/s?k=${encodeURIComponent(query)}&utm_source=mealoptimizer`,
  },
  {
    id: "africanmarket-us",
    name: "African Market USA",
    region: "us",
    regionLabel: "United States",
    flag: "🇺🇸",
    badge: "Diaspora Pantry",
    tagline: "Dried Fish, Stockfish, Iru (Locust Beans) & Yam Flour",
    deliverySpeed: "2-3 Days Nationwide",
    currency: "USD",
    symbol: "$",
    baseUrl: "https://africanmarketusa.com?ref=mealoptimizer",
    getSearchUrl: (query) =>
      `https://africanmarketusa.com/search?q=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },

  // 🇳🇬 NIGERIA & WEST AFRICA
  {
    id: "pricepally-ng",
    name: "PricePally Farm Direct",
    region: "ng",
    regionLabel: "Nigeria",
    flag: "🇳🇬",
    badge: "Bulk Farm Prices · 30% Off",
    tagline: "Farm-fresh Ugu, Ewedu, Catfish, Titus & Brown Beans in Lagos/Abuja",
    deliverySpeed: "Next-Day Morning Delivery",
    currency: "NGN",
    symbol: "₦",
    baseUrl: "https://pricepally.com?ref=mealoptimizer",
    getSearchUrl: (query) => `https://pricepally.com/search?query=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },
  {
    id: "chowdeck-ng",
    name: "Chowdeck Supermarket",
    region: "ng",
    regionLabel: "Nigeria",
    flag: "🇳🇬",
    badge: "Instant 30-Min Delivery",
    tagline: "Instant supermarket delivery from Spar, Hubmart & local vendors",
    deliverySpeed: "30-45 Minutes",
    currency: "NGN",
    symbol: "₦",
    baseUrl: "https://chowdeck.com?ref=mealoptimizer",
    getSearchUrl: (query) => `https://chowdeck.com/search?q=${encodeURIComponent(query)}&ref=mealoptimizer`,
  },
];

/**
 * Intelligent Diaspora Ingredient Substitutions with Metabolic Science
 */
export const DIASPORA_SWAPS: MetabolicSwapItem[] = [
  {
    original: "Fresh Ugu (Fluted Pumpkin) Leaves",
    diasporaSwap: "Frozen Spinach + Dark Collard Greens",
    marketAisle: "Frozen Veg / Fresh Greens Aisle",
    glycemicBenefit: "High lutein & iron; provides identical fiber matrix to slow carb absorption.",
  },
  {
    original: "Fresh Ewedu Leaves",
    diasporaSwap: "Frozen Jute Leaves (Molokhia) or Okra Blend",
    marketAisle: "Middle Eastern / Mediterranean / Afro Freezer",
    glycemicBenefit: "Viscous mucilage forms a gel in intestine, reducing glucose spike by 30%.",
  },
  {
    original: "White Garri / Heavy Cassava Fufu",
    diasporaSwap: "Fonio (Ancient Grain) or Cooled Oatmeal Fufu",
    marketAisle: "Organic / Health Food / Grain Aisle",
    glycemicBenefit: "Low-GI complex carbs rich in methionine & zinc with sustained energy release.",
  },
  {
    original: "Refined White Rice",
    diasporaSwap: "Ofada Rice or Brown Basmati / Quinoa",
    marketAisle: "World Food or Whole Grains Aisle",
    glycemicBenefit: "Retains high-fiber bran layer; prevents insulin surge.",
  },
  {
    original: "Fresh Scotch Bonnet (Atarodo)",
    diasporaSwap: "Habanero Peppers",
    marketAisle: "Fresh Produce Aisle",
    glycemicBenefit: "Identical capsaicin level to stimulate metabolic thermogenesis.",
  },
  {
    original: "Dried Crayfish Powder",
    diasporaSwap: "Dried Baby Shrimp or Bonito Flakes",
    marketAisle: "Asian / Seafood Specialty Aisle",
    glycemicBenefit: "Zero-carb protein umami boost without added MSG or sodium.",
  },
];

/**
 * Finds partners matching user's selected country / location
 */
export function getPartnersForLocation(country: string): GroceryStorePartner[] {
  const c = (country || "").toLowerCase();

  if (c.includes("united kingdom") || c.includes("uk") || c.includes("london") || c.includes("birmingham")) {
    return GROCERY_PARTNERS.filter((p) => p.region === "uk");
  }

  if (c.includes("united states") || c.includes("us") || c.includes("usa") || c.includes("america") || c.includes("canada")) {
    return GROCERY_PARTNERS.filter((p) => p.region === "us" || p.region === "ca");
  }

  if (c.includes("nigeria") || c.includes("lagos") || c.includes("abuja")) {
    return GROCERY_PARTNERS.filter((p) => p.region === "ng");
  }

  // Default: Return UK & US top diaspora partners
  return GROCERY_PARTNERS;
}
