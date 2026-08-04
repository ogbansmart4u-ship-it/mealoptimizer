// Molecular Pairing Database - Nutrient Synergy & Anti-Synergy
export type PairingEffect = 'maximize-absorption' | 'minimize-inflammation' | 'both' | 'avoid';

export type FoodPairing = {
  ingredient: string;
  category: string;
  pairsWith: {
    food: string;
    nutrient: string;
    effect: PairingEffect;
    explanation: string;
    bioavailabilityBoost: number; // percentage
    engineerNote: string;
  }[];
  avoidPairing: {
    food: string;
    reason: string;
    impact: string;
  }[];
};

export const nutrientPairings: FoodPairing[] = [
  {
    ingredient: "Spinach",
    category: "Leafy Green",
    pairsWith: [
      {
        food: "Lemon juice / Oranges",
        nutrient: "Vitamin C + Iron",
        effect: "maximize-absorption",
        explanation: "Vitamin C converts non-heme iron into a form that's 3-4x more absorbable",
        bioavailabilityBoost: 300,
        engineerNote: "Add lemon to your spinach soup to unlock iron! Your body will thank you.",
      },
      {
        food: "Olive oil / Avocado",
        nutrient: "Fat + Vitamin K",
        effect: "maximize-absorption",
        explanation: "Vitamin K is fat-soluble - needs healthy fats for absorption",
        bioavailabilityBoost: 400,
        engineerNote: "Dress that salad! Fat is your friend for vitamin absorption.",
      },
    ],
    avoidPairing: [
      {
        food: "Tea / Coffee (with meal)",
        reason: "Tannins bind to iron",
        impact: "Reduces iron absorption by up to 60%",
      },
      {
        food: "Calcium-rich foods (at same time)",
        reason: "Calcium competes with iron for absorption",
        impact: "Can block iron uptake significantly",
      },
    ],
  },
  {
    ingredient: "Tomatoes",
    category: "Vegetable",
    pairsWith: [
      {
        food: "Olive oil / Healthy fats",
        nutrient: "Fat + Lycopene",
        effect: "maximize-absorption",
        explanation: "Lycopene (powerful antioxidant) absorption increases 2-3x when paired with fat",
        bioavailabilityBoost: 250,
        engineerNote: "Cook your tomatoes in olive oil - lycopene becomes MORE bioavailable when heated with fat!",
      },
      {
        food: "Black pepper",
        nutrient: "Piperine + Lycopene",
        effect: "both",
        explanation: "Piperine enhances lycopene absorption and has anti-inflammatory properties",
        bioavailabilityBoost: 200,
        engineerNote: "A dash of black pepper turns tomato sauce into an antioxidant powerhouse.",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Turmeric",
    category: "Spice",
    pairsWith: [
      {
        food: "Black pepper",
        nutrient: "Piperine + Curcumin",
        effect: "maximize-absorption",
        explanation: "Piperine increases curcumin absorption by 2000%!",
        bioavailabilityBoost: 2000,
        engineerNote: "This is THE pairing! Black pepper makes turmeric 20x more effective. Science at its finest.",
      },
      {
        food: "Healthy fats (coconut oil, ghee)",
        nutrient: "Fat + Curcumin",
        effect: "maximize-absorption",
        explanation: "Curcumin is fat-soluble and poorly absorbed without lipids",
        bioavailabilityBoost: 700,
        engineerNote: "Add turmeric to curry with coconut milk - perfect combo!",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Beans / Lentils",
    category: "Legume",
    pairsWith: [
      {
        food: "Vitamin C rich foods (peppers, tomatoes)",
        nutrient: "Vitamin C + Plant Iron",
        effect: "maximize-absorption",
        explanation: "Enhances iron absorption from plant sources",
        bioavailabilityBoost: 300,
        engineerNote: "Add bell peppers to your bean stew - iron absorption skyrockets!",
      },
      {
        food: "Rice / Whole grains",
        nutrient: "Complementary Proteins",
        effect: "both",
        explanation: "Combines to form complete amino acid profile",
        bioavailabilityBoost: 150,
        engineerNote: "Beans + Rice = Complete protein. Classic pairing for a reason!",
      },
    ],
    avoidPairing: [
      {
        food: "Tea with meal",
        reason: "Tannins inhibit iron absorption",
        impact: "Can reduce iron uptake by 50-60%",
      },
    ],
  },
  {
    ingredient: "Salmon / Fish",
    category: "Protein",
    pairsWith: [
      {
        food: "Garlic / Onions",
        nutrient: "Sulfur compounds + Omega-3",
        effect: "minimize-inflammation",
        explanation: "Sulfur compounds enhance anti-inflammatory effects of omega-3 fatty acids",
        bioavailabilityBoost: 180,
        engineerNote: "Garlic + salmon = inflammation's worst nightmare. Delicious science!",
      },
      {
        food: "Cruciferous vegetables (broccoli, kale)",
        nutrient: "Selenium + Vitamin K",
        effect: "both",
        explanation: "Fish provides selenium which works synergistically with vitamin K in greens",
        bioavailabilityBoost: 200,
        engineerNote: "Pair fish with steamed broccoli - nutrient synergy at its best.",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Eggs",
    category: "Protein",
    pairsWith: [
      {
        food: "Vegetables (spinach, tomatoes)",
        nutrient: "Fat + Carotenoids",
        effect: "maximize-absorption",
        explanation: "Egg yolks help absorb fat-soluble vitamins from vegetables",
        bioavailabilityBoost: 300,
        engineerNote: "Scramble eggs with spinach - vitamin A absorption increases 3-fold!",
      },
      {
        food: "Whole grain toast",
        nutrient: "Protein + Complex carbs",
        effect: "both",
        explanation: "Balanced macro pairing for stable energy and satiety",
        bioavailabilityBoost: 120,
        engineerNote: "Classic breakfast combo keeps blood sugar stable for hours.",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Green Tea",
    category: "Beverage",
    pairsWith: [
      {
        food: "Lemon",
        nutrient: "Vitamin C + Catechins",
        effect: "maximize-absorption",
        explanation: "Vitamin C preserves catechins (antioxidants) during digestion",
        bioavailabilityBoost: 600,
        engineerNote: "Squeeze lemon in green tea - makes antioxidants 6x more bioavailable!",
      },
    ],
    avoidPairing: [
      {
        food: "Milk / Dairy",
        reason: "Milk proteins bind to catechins",
        impact: "Reduces antioxidant benefits by 25-30%",
      },
      {
        food: "Iron-rich meals",
        reason: "Tannins inhibit iron absorption",
        impact: "Drink tea between meals, not during",
      },
    ],
  },
  {
    ingredient: "Sweet Potato",
    category: "Starchy Vegetable",
    pairsWith: [
      {
        food: "Healthy fat (nuts, olive oil, avocado)",
        nutrient: "Fat + Beta-carotene",
        effect: "maximize-absorption",
        explanation: "Beta-carotene (Vitamin A precursor) needs fat to be absorbed",
        bioavailabilityBoost: 500,
        engineerNote: "Top your sweet potato with avocado - vitamin A absorption jumps 5x!",
      },
      {
        food: "Black beans",
        nutrient: "Complementary proteins",
        effect: "both",
        explanation: "Forms complete amino acid profile",
        bioavailabilityBoost: 140,
        engineerNote: "Sweet potato + black beans = plant-based protein complete!",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Garlic",
    category: "Allium",
    pairsWith: [
      {
        food: "Fish / Meats",
        nutrient: "Allicin + Selenium",
        effect: "minimize-inflammation",
        explanation: "Allicin's anti-inflammatory power amplified by selenium in animal proteins",
        bioavailabilityBoost: 200,
        engineerNote: "Crush garlic 10 mins before cooking to activate allicin - then pair with protein!",
      },
      {
        food: "Olive oil",
        nutrient: "Sulfur compounds + Polyphenols",
        effect: "minimize-inflammation",
        explanation: "Synergistic anti-inflammatory effect",
        bioavailabilityBoost: 180,
        engineerNote: "Garlic-infused olive oil = inflammation-fighting liquid gold.",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Broccoli / Kale",
    category: "Cruciferous",
    pairsWith: [
      {
        food: "Olive oil / Nuts",
        nutrient: "Fat + Vitamin K",
        effect: "maximize-absorption",
        explanation: "Vitamin K is fat-soluble - absorption increases dramatically with fat",
        bioavailabilityBoost: 450,
        engineerNote: "Sauté broccoli in olive oil - vitamin K bioavailability soars!",
      },
      {
        food: "Lemon juice",
        nutrient: "Vitamin C + Iron",
        effect: "maximize-absorption",
        explanation: "Boosts non-heme iron absorption from greens",
        bioavailabilityBoost: 280,
        engineerNote: "Squeeze lemon on steamed kale - iron becomes way more available.",
      },
    ],
    avoidPairing: [],
  },
  {
    ingredient: "Oats / Whole Grains",
    category: "Grain",
    pairsWith: [
      {
        food: "Berries / Vitamin C source",
        nutrient: "Vitamin C + Iron",
        effect: "maximize-absorption",
        explanation: "Helps absorb iron from fortified grains",
        bioavailabilityBoost: 250,
        engineerNote: "Top oatmeal with strawberries - iron absorption gets a major boost!",
      },
      {
        food: "Nuts / Seeds",
        nutrient: "Healthy fats + Fiber",
        effect: "both",
        explanation: "Slows digestion, stabilizes blood sugar, improves satiety",
        bioavailabilityBoost: 130,
        engineerNote: "Add almonds to oats - keeps you full and blood sugar steady.",
      },
    ],
    avoidPairing: [
      {
        food: "Tea/Coffee immediately after",
        reason: "Tannins block iron",
        impact: "Wait 1 hour before tea/coffee",
      },
    ],
  },
];

// Helper function to find pairings for an ingredient
export const findPairingsFor = (ingredient: string): FoodPairing | undefined => {
  return nutrientPairings.find(
    (pairing) => pairing.ingredient.toLowerCase().includes(ingredient.toLowerCase())
  );
};

// Helper function to get all matching ingredients from a food name
export const findMatchingPairings = (foodName: string): FoodPairing[] => {
  const lowerFood = foodName.toLowerCase();
  return nutrientPairings.filter((pairing) =>
    lowerFood.includes(pairing.ingredient.toLowerCase())
  );
};
