import { supabase, getAccessToken } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45`;

// Helper to make authenticated API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  if (!token) {
    console.warn('No access token available for API call');
    throw new Error('Not authenticated');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`Making API call to ${endpoint}`, { 
    hasToken: !!token,
    tokenLength: token.length,
    tokenPreview: `${token.substring(0, 15)}...`
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`API response from ${endpoint}:`, { 
    status: response.status, 
    ok: response.ok,
    statusText: response.statusText
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`API error from ${endpoint}:`, error);
    
    // For 401 errors, throw but DON'T automatically sign out
    // Let the calling code decide what to do
    throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Helper for unauthenticated API calls (like signup)
async function unauthenticatedApiCall(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTHENTICATION API
// ============================================

export async function signUp(userData: {
  email: string;
  password: string;
  name: string;
  age: number;
  bmi: number;
  medicalCondition: string;
  location: string;
}) {
  return unauthenticatedApiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getUserProfile() {
  return apiCall('/auth/profile');
}

export async function updateUserProfile(profileData: {
  name: string;
  age: number;
  bmi: number;
  medicalCondition: string;
  location: string;
  profilePicture?: string;
}) {
  return apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// ============================================
// GOALS API
// ============================================

export async function getGoals() {
  return apiCall('/goals');
}

export async function createGoal(goalData: any) {
  return apiCall('/goals', {
    method: 'POST',
    body: JSON.stringify(goalData),
  });
}

export async function updateGoal(goalId: string, goalData: any) {
  return apiCall(`/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(goalData),
  });
}

// ============================================
// MEAL LOGS API
// ============================================

export async function getMealLogs() {
  return apiCall('/logs');
}

export async function createMealLog(logData: any) {
  return apiCall('/logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

export async function deleteMealLog(logId: string) {
  return apiCall(`/logs/${logId}`, { method: 'DELETE' });
}

// ============================================
// RECIPES API
// ============================================

export async function getRecipes() {
  return apiCall('/recipes');
}

export async function createRecipe(recipeData: any) {
  return apiCall('/recipes', {
    method: 'POST',
    body: JSON.stringify(recipeData),
  });
}

// ============================================
// GEMINI AI API
// ============================================

export async function analyzeFoodImage(imageBase64: string, userContext: {
  medicalCondition: string;
  age: number;
  bmi: number;
  location: string;
}) {
  return apiCall('/ai/analyze-food', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, userContext }),
  });
}

export async function generateMealPlan(days: number, preferences: string) {
  return apiCall('/ai/generate-meal-plan', {
    method: 'POST',
    body: JSON.stringify({ days, preferences }),
  });
}

export async function generateSingleMeal(mealType: string, currentGoal: string) {
  return apiCall('/ai/generate-single-meal', {
    method: 'POST',
    body: JSON.stringify({ mealType, currentGoal }),
  });
}

// ============================================
// WEIGHT API
// ============================================

export async function getWeightLogs() {
  const data = await apiCall('/weight');
  return data.items;
}

export async function createWeightLog(data: any) {
  const result = await apiCall('/weight', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateWeightLog(id: string, data: any) {
  const result = await apiCall(`/weight/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteWeightLog(id: string) {
  return apiCall(`/weight/${id}`, { method: 'DELETE' });
}

// ============================================
// HYDRATION API
// ============================================

export async function getHydrationLogs() {
  const data = await apiCall('/hydration');
  return data.items;
}

export async function createHydrationLog(data: any) {
  const result = await apiCall('/hydration', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateHydrationLog(id: string, data: any) {
  const result = await apiCall(`/hydration/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteHydrationLog(id: string) {
  return apiCall(`/hydration/${id}`, { method: 'DELETE' });
}

// ============================================
// SLEEP API
// ============================================

export async function getSleepLogs() {
  const data = await apiCall('/sleep');
  return data.items;
}

export async function createSleepLog(data: any) {
  const result = await apiCall('/sleep', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateSleepLog(id: string, data: any) {
  const result = await apiCall(`/sleep/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteSleepLog(id: string) {
  return apiCall(`/sleep/${id}`, { method: 'DELETE' });
}

// ============================================
// SYMPTOMS API
// ============================================

export async function getSymptomLogs() {
  const data = await apiCall('/symptoms');
  return data.items;
}

export async function createSymptomLog(data: any) {
  const result = await apiCall('/symptoms', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateSymptomLog(id: string, data: any) {
  const result = await apiCall(`/symptoms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteSymptomLog(id: string) {
  return apiCall(`/symptoms/${id}`, { method: 'DELETE' });
}

// ============================================
// WORKOUTS API
// ============================================

export async function getWorkoutLogs() {
  const data = await apiCall('/workouts');
  return data.items;
}

export async function createWorkoutLog(data: any) {
  const result = await apiCall('/workouts', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateWorkoutLog(id: string, data: any) {
  const result = await apiCall(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteWorkoutLog(id: string) {
  return apiCall(`/workouts/${id}`, { method: 'DELETE' });
}

// ============================================
// MEDICATIONS API
// ============================================

export async function getMedications() {
  const data = await apiCall('/medications');
  return data.items;
}

export async function createMedication(data: any) {
  const result = await apiCall('/medications', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateMedication(id: string, data: any) {
  const result = await apiCall(`/medications/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteMedication(id: string) {
  return apiCall(`/medications/${id}`, { method: 'DELETE' });
}

// ============================================
// REMINDERS API
// ============================================

export async function getReminders() {
  const data = await apiCall('/reminders');
  return data.items;
}

export async function createReminder(data: any) {
  const result = await apiCall('/reminders', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateReminder(id: string, data: any) {
  const result = await apiCall(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteReminder(id: string) {
  return apiCall(`/reminders/${id}`, { method: 'DELETE' });
}

// ============================================
// BIOMETRICS API
// ============================================

export async function getBiometrics() {
  const data = await apiCall('/biometrics');
  return data.items;
}

export async function createBiometric(data: any) {
  const result = await apiCall('/biometrics', { method: 'POST', body: JSON.stringify(data) });
  return result.item;
}

export async function updateBiometric(id: string, data: any) {
  const result = await apiCall(`/biometrics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return result.item;
}

export async function deleteBiometric(id: string) {
  return apiCall(`/biometrics/${id}`, { method: 'DELETE' });
}

// ============================================
// ACHIEVEMENTS API
// ============================================

export async function getAchievements() {
  const data = await apiCall('/achievements');
  return data.items;
}

export async function unlockAchievement(achievementKey: string) {
  const result = await apiCall('/achievements/unlock', {
    method: 'POST',
    body: JSON.stringify({ achievementKey }),
  });
  return result.item;
}