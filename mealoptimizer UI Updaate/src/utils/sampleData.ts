// Sample data generation for new users to explore features

export function initializeSampleData() {
  // Check if sample data has already been initialized
  const hasInitialized = localStorage.getItem('sampleDataInitialized');

  if (hasInitialized) {
    return; // Already has data
  }

  // Generate sample meal logs
  const sampleMealLogs = generateSampleMealLogs();
  if (!localStorage.getItem('mealLogs')) {
    localStorage.setItem('mealLogs', JSON.stringify(sampleMealLogs));
  }

  // Generate sample hydration data
  const sampleHydration = generateSampleHydration();
  if (!localStorage.getItem('hydrationData')) {
    localStorage.setItem('hydrationData', JSON.stringify(sampleHydration));
  }

  // Generate sample sleep data
  const sampleSleep = generateSampleSleep();
  if (!localStorage.getItem('sleepTrackerData')) {
    localStorage.setItem('sleepTrackerData', JSON.stringify(sampleSleep));
  }

  // Generate sample workout data
  const sampleWorkouts = generateSampleWorkouts();
  if (!localStorage.getItem('workoutLoggerData')) {
    localStorage.setItem('workoutLoggerData', JSON.stringify(sampleWorkouts));
  }

  // Generate sample goals
  const sampleGoals = generateSampleGoals();
  if (!localStorage.getItem('goalsData')) {
    localStorage.setItem('goalsData', JSON.stringify(sampleGoals));
  }

  // Mark as initialized
  localStorage.setItem('sampleDataInitialized', 'true');
}

function generateSampleMealLogs() {
  const meals = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Breakfast
    meals.push({
      id: `meal-${i}-breakfast`,
      mealName: i === 0 ? 'Akamu & Moi Moi' : 'Oatmeal with Fruits',
      mealType: 'breakfast',
      timestamp: new Date(date.setHours(8, 0, 0)).toISOString(),
      date: date.toISOString().split('T')[0],
      calories: 350,
      protein: 12,
      carbs: 45,
      fats: 8,
      notes: 'Sample meal log - feel free to edit or delete',
    });

    // Lunch
    meals.push({
      id: `meal-${i}-lunch`,
      mealName: i === 0 ? 'Jollof Rice with Grilled Chicken' : 'Chicken Salad',
      mealType: 'lunch',
      timestamp: new Date(date.setHours(13, 0, 0)).toISOString(),
      date: date.toISOString().split('T')[0],
      calories: 550,
      protein: 35,
      carbs: 60,
      fats: 15,
      notes: 'Sample meal log',
    });

    // Dinner
    meals.push({
      id: `meal-${i}-dinner`,
      mealName: i === 0 ? 'Efo Riro with Poundo' : 'Grilled Fish with Vegetables',
      mealType: 'dinner',
      timestamp: new Date(date.setHours(19, 0, 0)).toISOString(),
      date: date.toISOString().split('T')[0],
      calories: 450,
      protein: 28,
      carbs: 40,
      fats: 18,
      notes: 'Sample meal log',
    });
  }

  return meals;
}

function generateSampleHydration() {
  const logs = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const time = new Date(now);
    time.setHours(8 + i * 2, 0, 0, 0);
    logs.push({
      id: `hydration-${i}`,
      amount: [250, 500, 350, 400, 300, 500, 250, 300][i],
      timestamp: time.toISOString(),
      type: i % 3 === 0 ? 'water' : 'other',
    });
  }

  return {
    totalIntake: 2850,
    logs,
    date: now.toISOString().split('T')[0],
  };
}

function generateSampleSleep() {
  const sessions = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const bedtime = new Date(date.setHours(22, 30, 0));
    const wakeup = new Date(date.setHours(6, 30, 0));
    wakeup.setDate(wakeup.getDate() + 1);

    const totalMinutes = 480; // 8 hours

    sessions.push({
      id: `sleep-${i}`,
      date: date.toISOString().split('T')[0],
      bedtime: bedtime.toISOString(),
      wakeTime: wakeup.toISOString(),
      totalMinutes,
      quality: [8, 7, 6, 9, 8, 7, 8][i % 7],
      stages: {
        light: 220,
        deep: 140,
        rem: 100,
        awake: 20,
      },
      notes: i === 0 ? 'Felt refreshed' : '',
    });
  }

  return sessions;
}

function generateSampleWorkouts() {
  const workouts = [];
  const now = new Date();
  const types = ['cardio', 'strength', 'yoga', 'walking', 'cycling'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    if (i % 2 === 0) {
      // Rest day every other day
      workouts.push({
        id: `workout-${i}`,
        date: date.toISOString().split('T')[0],
        restDay: true,
        notes: 'Sample rest day',
      });
    } else {
      workouts.push({
        id: `workout-${i}`,
        date: date.toISOString().split('T')[0],
        type: types[i % types.length],
        duration: 30 + (i * 5),
        calories: 200 + (i * 30),
        heartRate: {
          average: 130 + (i * 5),
          max: 160 + (i * 5),
        },
        notes: 'Sample workout - Great session!',
        restDay: false,
      });
    }
  }

  return workouts;
}

function generateSampleGoals() {
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + 30);

  return [
    {
      id: 'goal-1',
      title: 'Drink 8 glasses of water daily',
      description: 'Stay hydrated throughout the day',
      category: 'hydration',
      targetValue: 2000,
      currentValue: 1500,
      unit: 'ml',
      deadline: future.toISOString().split('T')[0],
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'goal-2',
      title: 'Exercise 3 times per week',
      description: 'Build a consistent workout routine',
      category: 'fitness',
      targetValue: 3,
      currentValue: 2,
      unit: 'sessions',
      deadline: future.toISOString().split('T')[0],
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'goal-3',
      title: 'Get 8 hours of sleep',
      description: 'Improve sleep quality and duration',
      category: 'sleep',
      targetValue: 8,
      currentValue: 7,
      unit: 'hours',
      deadline: future.toISOString().split('T')[0],
      completed: false,
      createdAt: now.toISOString(),
    },
  ];
}

// Function to clear all sample data
export function clearSampleData() {
  const keysToRemove = [
    'sampleDataInitialized',
    'mealLogs',
    'hydrationData',
    'sleepTrackerData',
    'workoutLoggerData',
    'goalsData',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
}

// Check if user is using sample data
export function isUsingSampleData() {
  return localStorage.getItem('sampleDataInitialized') === 'true';
}
