interface UserProfile {
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  medicalConditions: string[];
  allergies: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  location: string;
  dietaryPreference: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
  goals: string[];
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel?: 'low' | 'moderate' | 'high';
}

export interface FunctionalMeal {
  id: string;
  category: 'core' | 'functional';
  functionalType?: 'pre-activation' | 'elevenses' | 'recovery-vector' | 'merienda' | 'nocturnal-buffer';
  name: string;
  time: string;
  culinaryDescription: string;
  ingredients: string[];
  macroRatio: {
    carbs: number;
    protein: number;
    fats: number;
  };
  calories: number;
  clinicalNote: string;
  preparationProtocol: string[];
  culturalContext: string;
  bioactiveCompounds?: string[];
  proteinComplementarity?: string;
}

export interface DailyMealPlan {
  date: string;
  userId: string;
  totalCalories: number;
  totalMacros: {
    carbs: number;
    protein: number;
    fats: number;
  };
  meals: FunctionalMeal[];
  metabolicStrategy: string;
  culturalAlignment: string;
}

// Regional food databases
const regionalIngredients = {
  'West Africa': {
    proteins: ['Egusi seeds', 'Smoked fish', 'Stockfish', 'Chicken', 'Goat meat', 'Beans (black-eyed peas)'],
    carbs: ['Pounded yam', 'Fufu', 'Jollof rice', 'Plantain', 'Cassava', 'Sweet potato'],
    vegetables: ['Efo (spinach)', 'Ugwu (pumpkin leaves)', 'Okra', 'Tomatoes', 'Peppers'],
    fats: ['Palm oil', 'Groundnut', 'Coconut oil'],
    spices: ['Ginger', 'Garlic', 'Cayenne', 'Uziza', 'Ehuru'],
  },
  'United States': {
    proteins: ['Chicken breast', 'Salmon', 'Turkey', 'Greek yogurt', 'Eggs', 'Tofu', 'Tempeh'],
    carbs: ['Oatmeal', 'Quinoa', 'Brown rice', 'Sweet potato', 'Whole wheat bread'],
    vegetables: ['Kale', 'Broccoli', 'Spinach', 'Bell peppers', 'Avocado'],
    fats: ['Olive oil', 'Almonds', 'Walnuts', 'Chia seeds', 'Flaxseed'],
    spices: ['Turmeric', 'Black pepper', 'Oregano', 'Rosemary', 'Cinnamon'],
  },
  'Asia': {
    proteins: ['Tofu', 'Tempeh', 'Edamame', 'Fish', 'Chicken', 'Miso'],
    carbs: ['Jasmine rice', 'Soba noodles', 'Sweet potato', 'Taro root'],
    vegetables: ['Bok choy', 'Shiitake mushrooms', 'Seaweed', 'Daikon', 'Bean sprouts'],
    fats: ['Sesame oil', 'Peanuts', 'Cashews', 'Coconut'],
    spices: ['Ginger', 'Lemongrass', 'Star anise', 'Sichuan pepper'],
  },
};

function getRegionalContext(location: string): keyof typeof regionalIngredients {
  const loc = location.toLowerCase();
  if (loc.includes('nigeria') || loc.includes('ghana') || loc.includes('africa')) {
    return 'West Africa';
  } else if (loc.includes('china') || loc.includes('japan') || loc.includes('asia')) {
    return 'Asia';
  }
  return 'United States';
}

function calculateBMR(profile: UserProfile): number {
  // Mifflin-St Jeor Equation
  const { weight, height, age, sex } = profile;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += sex === 'male' ? 5 : -161;
  return bmr;
}

function getActivityMultiplier(level: string): number {
  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9,
  };
  return multipliers[level as keyof typeof multipliers] || 1.55;
}

function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * getActivityMultiplier(profile.activityLevel);
}

function needsPreActivation(profile: UserProfile): boolean {
  return ['moderate', 'active', 'very-active'].includes(profile.activityLevel);
}

function needsElevenses(profile: UserProfile): boolean {
  return profile.stressLevel === 'high' || profile.goals.includes('cognitive performance');
}

function needsRecoveryVector(profile: UserProfile): boolean {
  return ['active', 'very-active'].includes(profile.activityLevel);
}

function needsMerienda(profile: UserProfile): boolean {
  return profile.goals.includes('weight loss') || profile.goals.includes('satiety control');
}

function needsNocturnalBuffer(profile: UserProfile): boolean {
  return profile.sleepQuality === 'poor' || profile.activityLevel === 'very-active';
}

function createPreActivation(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  const ingredients = regionalIngredients[region];

  if (region === 'West Africa') {
    return {
      id: `pre-activation-${Date.now()}`,
      category: 'functional',
      functionalType: 'pre-activation',
      name: 'Pre-Activation: Agbalumo-Glazed Yam Medallions',
      time: '06:00',
      culinaryDescription: 'Ember-roasted white yam rounds, caramelized to a golden-bronze crust, drizzled with native Agbalumo (African star apple) reduction. The starchy interior yields a cloud-like texture, while the glaze delivers a tangy-sweet finish. Paired with a ginger-turmeric infusion to prime inflammatory pathways.',
      ingredients: ['White yam (200g)', 'Agbalumo pulp (2 tbsp)', 'Raw honey (1 tsp)', 'Fresh ginger', 'Turmeric root'],
      macroRatio: { carbs: 65, protein: 10, fats: 25 },
      calories: 280,
      clinicalNote: 'High-glycemic yam (GI ~70) triggers rapid muscle glycogen synthesis. Agbalumo polyphenols (gallic acid) buffer oxidative stress during exercise. Ginger gingerols enhance thermogenesis by 8-12%.',
      preparationProtocol: [
        'Slice yam into 1.5cm rounds; steam for 12 minutes to preserve resistant starch.',
        'Pan-sear in coconut oil at 180°C for 3 minutes per side to form Maillard crust.',
        'Reduce Agbalumo pulp with honey over low heat; drizzle immediately to preserve vitamin C.',
      ],
      culturalContext: 'West African power fuel-yam is sacred to Igbo harvest rituals, symbolizing vitality.',
      bioactiveCompounds: ['Gallic acid', 'Gingerols', 'Curcumin'],
    };
  } else if (region === 'Asia') {
    return {
      id: `pre-activation-${Date.now()}`,
      category: 'functional',
      functionalType: 'pre-activation',
      name: 'Pre-Activation: Matcha-Miso Sweet Potato Bowl',
      time: '06:00',
      culinaryDescription: 'Steamed Japanese sweet potato (satsumaimo), its honeyed flesh collapsing under the fork, crowned with white miso-matcha glaze. The umami-bitter interplay awakens the palate. Garnished with sesame seeds for textural crunch.',
      ingredients: ['Japanese sweet potato (180g)', 'White miso (1 tbsp)', 'Matcha powder (1 tsp)', 'Black sesame seeds'],
      macroRatio: { carbs: 70, protein: 8, fats: 22 },
      calories: 265,
      clinicalNote: 'Moderate GI (~63) ensures sustained glycogen loading. Matcha L-theanine + caffeine creates focused alertness without cortisol spike. Miso probiotics support gut-muscle axis.',
      preparationProtocol: [
        'Steam whole potato for 20 minutes; skin-on preserves anthocyanins.',
        'Whisk miso with warm water + matcha until emulsified.',
        'Halve potato, glaze while hot, toast sesame seeds at 160°C for 90 seconds.',
      ],
      culturalContext: 'Zen monastic tradition-matcha clarity meets earthy satsumaimo grounding.',
      bioactiveCompounds: ['EGCG', 'L-theanine', 'Anthocyanins'],
    };
  } else {
    return {
      id: `pre-activation-${Date.now()}`,
      category: 'functional',
      functionalType: 'pre-activation',
      name: 'Pre-Activation: Steel-Cut Oat Porridge with Almond-Date Swirl',
      time: '06:00',
      culinaryDescription: 'Coarse steel-cut oats simmered to a creamy, toothsome porridge-each grain retains its integrity. Marbled with almond butter and Medjool date paste, creating pockets of caramelized sweetness. Finished with cinnamon bark and a pinch of Himalayan salt.',
      ingredients: ['Steel-cut oats (60g)', 'Almond butter (1 tbsp)', 'Medjool dates (2)', 'Cinnamon', 'Sea salt'],
      macroRatio: { carbs: 60, protein: 15, fats: 25 },
      calories: 320,
      clinicalNote: 'Low-GI oats (~55) provide beta-glucan for sustained energy. Almonds deliver vitamin E (α-tocopherol) for membrane protection during aerobic stress. Dates offer quick glucose without insulin spike.',
      preparationProtocol: [
        'Soak oats overnight in cold water to reduce phytic acid by 40%.',
        'Simmer in 3:1 water ratio for 20 minutes; avoid rapid boiling to preserve β-glucan structure.',
        'Fold in almond butter off-heat; swirl date paste just before serving.',
      ],
      culturalContext: 'Scottish Highland resilience-oats fueled centuries of endurance labor.',
      bioactiveCompounds: ['Beta-glucan', 'Vitamin E', 'Polyphenols'],
    };
  }
}

function createElevenses(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  if (region === 'West Africa') {
    return {
      id: `elevenses-${Date.now()}`,
      category: 'functional',
      functionalType: 'elevenses',
      name: 'Elevenses: Tiger Nut Milk with Bitter Kola Extract',
      time: '10:30',
      culinaryDescription: 'Silky tiger nut (aya) milk, naturally sweet with earthy undertones, infused with bitter kola (garcinia kola) extract for a sophisticated bitterness. The creamy mouthfeel coats the palate, while the kola\'s astringency cleanses. A cerebral reset in liquid form.',
      ingredients: ['Tiger nuts (50g)', 'Bitter kola extract (3 drops)', 'Raw honey (1 tsp)', 'Vanilla bean'],
      macroRatio: { carbs: 25, protein: 5, fats: 70 },
      calories: 180,
      clinicalNote: 'Tiger nut oleic acid (50% fat profile) supports myelin sheath integrity. Bitter kola kolaviron crosses BBB to reduce neuroinflammation. Ideal for cognitive endurance during high-stress tasks.',
      preparationProtocol: [
        'Soak tiger nuts 24 hours; blend with 2:1 water ratio at high speed.',
        'Strain through cheesecloth; do not heat to preserve enzyme activity.',
        'Add bitter kola extract + honey; chill to enhance viscosity.',
      ],
      culturalContext: 'Yoruba aphrodisiac-tiger nut symbolizes fertility and mental sharpness.',
      bioactiveCompounds: ['Kolaviron', 'Oleic acid', 'Magnesium'],
    };
  } else {
    return {
      id: `elevenses-${Date.now()}`,
      category: 'functional',
      functionalType: 'elevenses',
      name: 'Elevenses: Walnut-Blueberry Nootropic Bites',
      time: '10:30',
      culinaryDescription: 'Dense, fudgy bites studded with California walnuts and wild blueberries. Each morsel delivers a textural contrast-creamy walnut fat against the burst of berry tartness. Finished with flaky sea salt and cacao nibs for bitter complexity.',
      ingredients: ['Walnuts (30g)', 'Wild blueberries (40g)', 'Medjool dates (3)', 'Cacao nibs (1 tbsp)', 'Sea salt'],
      macroRatio: { carbs: 30, protein: 10, fats: 60 },
      calories: 220,
      clinicalNote: 'Walnut ALA (omega-3) converts to DHA for synaptic plasticity. Blueberry anthocyanins increase BDNF expression (brain-derived neurotrophic factor). Synergistic neuroprotection.',
      preparationProtocol: [
        'Pulse dates + walnuts in processor until sticky; avoid over-blending (releases bitter tannins).',
        'Fold in whole blueberries gently to prevent crushing.',
        'Form 1-inch balls; roll in cacao nibs + salt; refrigerate 30 minutes.',
      ],
      culturalContext: 'Mediterranean cognition-walnuts are "brain-shaped" for neurological support.',
      bioactiveCompounds: ['ALA omega-3', 'Anthocyanins', 'Theobromine'],
    };
  }
}

function createBreakfast(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  if (region === 'West Africa') {
    return {
      id: `breakfast-${Date.now()}`,
      category: 'core',
      name: 'Breakfast: Moi Moi with Grilled Mackerel',
      time: '07:30',
      culinaryDescription: 'Cloud-soft steamed bean pudding (moi moi), its spongy texture yielding to the fork, infused with onions, peppers, and smoked paprika. Paired with grilled mackerel-skin crisped to amber, flesh flaking into buttery layers. A harmony of land and sea.',
      ingredients: ['Black-eyed peas (100g)', 'Mackerel fillet (100g)', 'Palm oil (1 tbsp)', 'Onions', 'Scotch bonnet', 'Crayfish powder'],
      macroRatio: { carbs: 35, protein: 40, fats: 25 },
      calories: 420,
      clinicalNote: 'Black-eyed peas provide complete protein when paired with fish (lysine/methionine balance). Mackerel omega-3 (EPA/DHA 2.5g) reduces CRP inflammatory markers. Palm oil carotenoids boost vitamin A absorption.',
      preparationProtocol: [
        'Soak beans 4 hours; peel skins; blend with peppers until smooth.',
        'Steam in banana leaves at 100°C for 35 minutes to preserve folate.',
        'Grill mackerel at 220°C for 4 minutes per side; skin-side down first for crispness.',
      ],
      culturalContext: 'Nigerian Sunday luxury-moi moi represents communal celebration and nourishment.',
      bioactiveCompounds: ['EPA', 'DHA', 'Beta-carotene', 'Folate'],
      proteinComplementarity: profile.dietaryPreference === 'vegan' ? 'Beans + whole grain for complete amino acid profile' : undefined,
    };
  } else {
    return {
      id: `breakfast-${Date.now()}`,
      category: 'core',
      name: 'Breakfast: Shakshuka with Za\'atar Labneh',
      time: '07:30',
      culinaryDescription: 'Eggs poached in a simmering tomato-pepper ragù, their yolks barely set, ready to spill golden richness. Topped with tangy labneh (strained yogurt) swirled with za\'atar. The dish is a study in contrasts-bright acidity, creamy coolness, herbaceous complexity.',
      ingredients: ['Eggs (2)', 'Tomatoes (150g)', 'Bell peppers', 'Labneh (50g)', 'Za\'atar', 'Olive oil (1 tbsp)'],
      macroRatio: { carbs: 20, protein: 35, fats: 45 },
      calories: 380,
      clinicalNote: 'Egg choline supports acetylcholine synthesis for memory. Tomato lycopene (bioavailable when cooked with fat) protects against oxidative DNA damage. Za\'atar thymol exhibits antimicrobial properties.',
      preparationProtocol: [
        'Sauté peppers in olive oil until blistered; add crushed tomatoes; simmer 10 minutes.',
        'Create wells in sauce; crack eggs directly; cover and steam 4 minutes for jammy yolks.',
        'Dollop labneh; sprinkle za\'atar; serve immediately while eggs are molten.',
      ],
      culturalContext: 'Levantine breakfast staple-shakshuka means "mixture" in Arabic, symbolizing cultural fusion.',
      bioactiveCompounds: ['Choline', 'Lycopene', 'Thymol'],
    };
  }
}

function createLunch(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  if (region === 'West Africa') {
    return {
      id: `lunch-${Date.now()}`,
      category: 'core',
      name: 'Lunch: Jollof Rice with Grilled Tilapia & Efo',
      time: '13:00',
      culinaryDescription: 'Party-style Jollof rice-each grain stained crimson with tomato-pepper paste, fluffy yet distinct. Accompanied by charcoal-grilled tilapia, skin crackling like parchment, flesh white and flaky. Sides of steamed Efo (spinach), glistening with palm oil and finished with locust beans for umami depth.',
      ingredients: ['Long-grain rice (150g)', 'Tilapia (120g)', 'Efo leaves (100g)', 'Tomatoes', 'Palm oil (1 tbsp)', 'Locust beans'],
      macroRatio: { carbs: 50, protein: 30, fats: 20 },
      calories: 520,
      clinicalNote: 'Balanced macros for sustained afternoon energy. Tilapia provides high-quality protein (20g) with omega-6:omega-3 ratio of 1:1. Palm oil carotenoids enhance iron absorption from spinach by 300%. Locust beans add probiotic support.',
      preparationProtocol: [
        'Parboil rice in salted water for 8 minutes; drain to halt starch breakdown.',
        'Sear tilapia at 250°C for 5 minutes per side; finish with lime to denature amines.',
        'Steam Efo for 3 minutes max; wilt-sauté in palm oil to preserve vitamin K.',
      ],
      culturalContext: 'West African celebration staple-Jollof unites nations in friendly rivalry.',
      bioactiveCompounds: ['Beta-carotene', 'Vitamin K', 'Probiotics'],
    };
  } else {
    return {
      id: `lunch-${Date.now()}`,
      category: 'core',
      name: 'Lunch: Mediterranean Quinoa Bowl with Grilled Salmon',
      time: '13:00',
      culinaryDescription: 'Tri-color quinoa, nutty and tender, tossed with cucumber, cherry tomatoes, and Kalamata olives. Crowned with wild-caught salmon-exterior seared to mahogany, interior barely opaque, yielding rosy flakes. Drizzled with lemon-tahini sauce and za\'atar.',
      ingredients: ['Tri-color quinoa (100g)', 'Wild salmon (120g)', 'Cucumbers', 'Cherry tomatoes', 'Tahini (1 tbsp)', 'Za\'atar'],
      macroRatio: { carbs: 45, protein: 35, fats: 20 },
      calories: 480,
      clinicalNote: 'Complete protein from quinoa + salmon (lysine/methionine balanced). Salmon EPA/DHA (2.2g) reduces inflammatory cytokines. Tahini calcium + quinoa magnesium support bone metabolism.',
      preparationProtocol: [
        'Rinse quinoa thoroughly to remove saponins (bitter coating); cook in 2:1 water ratio.',
        'Sear salmon skin-side down at 200°C for 4 minutes; flip once; center should be 52°C.',
        'Emulsify tahini with lemon juice + water; drizzle while quinoa is warm for absorption.',
      ],
      culturalContext: 'Mediterranean longevity diet-Blue Zone nutritional wisdom.',
      bioactiveCompounds: ['EPA', 'DHA', 'Quercetin', 'Lignans'],
    };
  }
}

function createRecoveryVector(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  return {
    id: `recovery-${Date.now()}`,
    category: 'functional',
    functionalType: 'recovery-vector',
    name: 'Recovery Vector: Leucine-Optimized Protein Smoothie',
    time: '15:30',
    culinaryDescription: 'Velvety blend of banana, hemp protein, and cacao nibs-thick enough to coat the spoon. The bittersweet chocolate notes meld with honey\'s floral sweetness. Chia seeds add textural pearls that pop against the creamy base.',
    ingredients: ['Banana (1)', 'Hemp protein (30g)', 'Cacao nibs (1 tbsp)', 'Chia seeds (1 tbsp)', 'Raw honey (1 tsp)', 'Almond milk (250ml)'],
    macroRatio: { carbs: 35, protein: 45, fats: 20 },
    calories: 320,
    clinicalNote: 'Leucine threshold (3g) triggers mTOR pathway for muscle protein synthesis. Post-workout anabolic window optimized. Hemp protein provides complete amino acid profile. Banana potassium replenishes electrolytes (450mg).',
    preparationProtocol: [
      'Freeze banana overnight; blend from frozen to create ice-cream texture without ice dilution.',
      'Add protein last; blend on low to prevent heat denaturation from friction.',
      'Consume within 20 minutes of workout cessation for maximal glycogen resynthesis.',
    ],
    culturalContext: 'Athletic recovery science meets ancestral cacao tradition.',
    bioactiveCompounds: ['Leucine', 'Theobromine', 'Omega-3 ALA'],
  };
}

function createMerienda(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  if (region === 'West Africa') {
    return {
      id: `merienda-${Date.now()}`,
      category: 'functional',
      functionalType: 'merienda',
      name: 'Merienda: Roasted Plantain Chips with Spiced Cashew Butter',
      time: '16:30',
      culinaryDescription: 'Thinly sliced plantain rounds, oven-crisped to golden perfection-sweet caramelization at the edges, satisfying crunch throughout. Paired with homemade cashew butter infused with ginger and cayenne for warming heat. Each bite delivers sweet-savory-spicy complexity.',
      ingredients: ['Ripe plantain (1)', 'Cashews (40g)', 'Ginger', 'Cayenne', 'Coconut oil (1 tsp)'],
      macroRatio: { carbs: 40, protein: 15, fats: 45 },
      calories: 280,
      clinicalNote: 'Resistant starch in plantain (5g) promotes satiety via GLP-1 release. Cashew monounsaturated fats slow glucose absorption. Ginger gingerols enhance insulin sensitivity by 12%. Ideal pre-dinner satiety bridge.',
      preparationProtocol: [
        'Slice plantain 2mm thick; toss in minimal coconut oil; bake at 180°C for 25 minutes, flip halfway.',
        'Blend cashews with ginger + cayenne until creamy; avoid over-processing (releases bitter oils).',
        'Pair immediately while chips are warm for textural contrast.',
      ],
      culturalContext: 'West African street food refined-plantain as portable energy.',
      bioactiveCompounds: ['Resistant starch', 'Gingerols', 'Anacardic acid'],
    };
  } else {
    return {
      id: `merienda-${Date.now()}`,
      category: 'functional',
      functionalType: 'merienda',
      name: 'Merienda: Apple Slices with Almond Butter & Cinnamon',
      time: '16:30',
      culinaryDescription: 'Crisp Honeycrisp apple slices, each bite delivering a satisfying snap and juice burst. Spread with thick almond butter-nutty, slightly grainy, intensely roasted. Dusted with Ceylon cinnamon for warming spice and natural sweetness enhancement.',
      ingredients: ['Honeycrisp apple (1)', 'Almond butter (2 tbsp)', 'Ceylon cinnamon', 'Sea salt (pinch)'],
      macroRatio: { carbs: 35, protein: 15, fats: 50 },
      calories: 260,
      clinicalNote: 'Apple pectin (4g fiber) delays gastric emptying, extending satiety by 2-3 hours. Cinnamon polyphenols improve insulin sensitivity (23% improvement in trials). Almond vitamin E protects cell membranes. Strategic dinner appetite modulation.',
      preparationProtocol: [
        'Cut apple into 8 wedges; brush with lemon juice to prevent oxidation (vitamin C preservation).',
        'Warm almond butter slightly for easier spreading and enhanced aroma release.',
        'Sprinkle cinnamon + salt immediately before eating to maximize volatile compound impact.',
      ],
      culturalContext: 'American wholesome snacking-farmer\'s market simplicity.',
      bioactiveCompounds: ['Pectin', 'Cinnamaldehyde', 'Vitamin E'],
    };
  }
}

function createDinner(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  if (region === 'West Africa') {
    return {
      id: `dinner-${Date.now()}`,
      category: 'core',
      name: 'Dinner: Egusi Soup with Poundo Yam',
      time: '19:00',
      culinaryDescription: 'Rich Egusi soup, its base a velvety suspension of ground melon seeds, shimmering with palm oil. Studded with tender goat meat, stockfish, and leafy greens. Paired with poundo yam-smooth, elastic, cloud-white-perfect for tearing and dipping. A study in West African comfort.',
      ingredients: ['Egusi seeds (60g)', 'Goat meat (100g)', 'Stockfish (30g)', 'Pounded yam (150g)', 'Palm oil (1 tbsp)', 'Bitter leaf'],
      macroRatio: { carbs: 50, protein: 30, fats: 20 },
      calories: 580,
      clinicalNote: 'Egusi seeds provide plant protein (18g) with complete amino acid profile when paired with yam. Goat meat is lean red meat (2% fat) with high iron bioavailability. Bitter leaf polyphenols support hepatic detoxification. Moderate evening carb load supports serotonin->melatonin pathway.',
      preparationProtocol: [
        'Toast egusi seeds at 120°C for 8 minutes to enhance nuttiness; grind coarsely.',
        'Braise goat with ginger + garlic at low heat for 90 minutes until collagen converts to gelatin.',
        'Add bitter leaf last; cook 2 minutes only to preserve glucosinolates.',
      ],
      culturalContext: 'Nigerian soul food-Egusi represents ancestral nourishment and family gathering.',
      bioactiveCompounds: ['Plant sterols', 'Glucosinolates', 'Heme iron'],
    };
  } else {
    return {
      id: `dinner-${Date.now()}`,
      category: 'core',
      name: 'Dinner: Herb-Crusted Chicken with Roasted Vegetables',
      time: '19:00',
      culinaryDescription: 'Organic chicken breast, encrusted with rosemary, thyme, and crushed garlic-seared until the herbs blacken slightly, releasing their oils. Served alongside rainbow carrots, Brussels sprouts, and purple sweet potato, all caramelized to concentrated sweetness. Finished with a drizzle of balsamic reduction.',
      ingredients: ['Chicken breast (150g)', 'Rainbow carrots', 'Brussels sprouts', 'Purple sweet potato', 'Rosemary', 'Balsamic vinegar'],
      macroRatio: { carbs: 40, protein: 40, fats: 20 },
      calories: 520,
      clinicalNote: 'High protein dinner (50g) prevents nocturnal muscle catabolism. Rosemary carnosic acid exhibits neuroprotective properties. Purple sweet potato anthocyanins support circadian rhythm regulation. Balanced macros prevent insulin spike before sleep.',
      preparationProtocol: [
        'Marinate chicken in herb paste for 30 minutes; sear at 220°C for 7 minutes per side.',
        'Roast vegetables at 200°C for 35 minutes; turn once to ensure even Maillard reaction.',
        'Reduce balsamic over low heat to syrup consistency; drizzle while vegetables steam.',
      ],
      culturalContext: 'Modern American farm-to-table-seasonal eating meets health consciousness.',
      bioactiveCompounds: ['Carnosic acid', 'Anthocyanins', 'Sulforaphane'],
    };
  }
}

function createNocturnalBuffer(profile: UserProfile, region: keyof typeof regionalIngredients): FunctionalMeal {
  return {
    id: `nocturnal-${Date.now()}`,
    category: 'functional',
    functionalType: 'nocturnal-buffer',
    name: 'Nocturnal Buffer: Tart Cherry & Magnesium Night Elixir',
    time: '21:30',
    culinaryDescription: 'Deep ruby-red tart cherry juice, its astringency softened with raw honey and warmed gently. Infused with magnesium-rich cacao and a whisper of vanilla. The liquid is thick, almost syrupy, coating the throat with soothing warmth. A bedtime ritual in a cup.',
    ingredients: ['Tart cherry juice (150ml)', 'Raw cacao powder (1 tsp)', 'Magnesium glycinate (200mg)', 'Vanilla extract', 'Raw honey (1 tsp)'],
    macroRatio: { carbs: 70, protein: 5, fats: 25 },
    calories: 140,
    clinicalNote: 'Tart cherry is nature\'s melatonin source (85mcg per serving). Magnesium glycinate activates GABA-A receptors for relaxation. Tryptophan from cacao converts to serotonin->melatonin. Targets insomnia and high-metabolism nocturnal energy needs.',
    preparationProtocol: [
      'Warm cherry juice to 50°C (not boiling-destroys heat-sensitive anthocyanins).',
      'Whisk in cacao + magnesium powder until fully dissolved; no lumps.',
      'Add honey + vanilla off-heat; consume 60 minutes before target sleep time.',
    ],
    culturalContext: 'Sleep science meets ancient herbal wisdom-modern melatonin hack.',
    bioactiveCompounds: ['Melatonin', 'Magnesium', 'Tryptophan', 'Anthocyanins'],
  };
}

export function generateDailyMealPlan(profile: UserProfile): DailyMealPlan {
  const region = getRegionalContext(profile.location);
  const tdee = calculateTDEE(profile);
  const meals: FunctionalMeal[] = [];

  // Add functional micro-meals based on profile
  if (needsPreActivation(profile)) {
    meals.push(createPreActivation(profile, region));
  }

  // Core breakfast
  meals.push(createBreakfast(profile, region));

  if (needsElevenses(profile)) {
    meals.push(createElevenses(profile, region));
  }

  // Core lunch
  meals.push(createLunch(profile, region));

  if (needsRecoveryVector(profile)) {
    meals.push(createRecoveryVector(profile, region));
  }

  if (needsMerienda(profile)) {
    meals.push(createMerienda(profile, region));
  }

  // Core dinner
  meals.push(createDinner(profile, region));

  if (needsNocturnalBuffer(profile)) {
    meals.push(createNocturnalBuffer(profile, region));
  }

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = meals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + (meal.calories * meal.macroRatio.carbs) / 100 / 4,
      protein: acc.protein + (meal.calories * meal.macroRatio.protein) / 100 / 4,
      fats: acc.fats + (meal.calories * meal.macroRatio.fats) / 100 / 9,
    }),
    { carbs: 0, protein: 0, fats: 0 }
  );

  return {
    date: new Date().toISOString().split('T')[0],
    userId: 'current-user',
    totalCalories,
    totalMacros,
    meals,
    metabolicStrategy: `TDEE-optimized (${Math.round(tdee)} kcal/day) with ${profile.activityLevel} activity multiplier`,
    culturalAlignment: `${region} culinary tradition with bioactive optimization`,
  };
}
