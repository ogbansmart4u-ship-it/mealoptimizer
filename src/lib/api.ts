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
  let backendProfile: any = {};
  try {
    backendProfile = await apiCall('/auth/profile');
  } catch (err) {
    console.warn('Backend /auth/profile fetch deferred:', err);
  }

  // Merge with official Supabase Auth user_metadata to guarantee 100% data persistence
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata) {
      return {
        ...user.user_metadata,
        ...(backendProfile || {}),
        name: backendProfile?.name || user.user_metadata?.name,
        age: backendProfile?.age ?? user.user_metadata?.age,
        weight: backendProfile?.weight ?? user.user_metadata?.weight,
        height: backendProfile?.height ?? user.user_metadata?.height,
        bmi: backendProfile?.bmi ?? user.user_metadata?.bmi,
        bloodPressure: backendProfile?.bloodPressure ?? user.user_metadata?.bloodPressure,
        systolic: backendProfile?.systolic ?? user.user_metadata?.systolic,
        diastolic: backendProfile?.diastolic ?? user.user_metadata?.diastolic,
        medicalCondition: backendProfile?.medicalCondition || backendProfile?.medical_condition || user.user_metadata?.medicalCondition || user.user_metadata?.medical_condition,
        gender: backendProfile?.gender || user.user_metadata?.gender,
        location: backendProfile?.location || user.user_metadata?.location,
        profilePicture: backendProfile?.profilePicture || user.user_metadata?.profilePicture || '',
      };
    }
  } catch (err) {
    console.warn('Supabase auth metadata check deferred:', err);
  }

  return backendProfile;
}

export async function updateUserProfile(profileData: {
  name?: string;
  age?: number;
  bmi?: number;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  systolic?: number;
  diastolic?: number;
  medicalCondition?: string;
  location?: string;
  profilePicture?: string;
  medications?: string;
  allergies?: string;
  gender?: string;
  plan?: string;
  isPro?: boolean;
}) {
  // 1. Direct Cloud Sync: Write permanently to Supabase Auth cloud user_metadata
  try {
    await supabase.auth.updateUser({
      data: {
        ...profileData,
        medical_condition: profileData.medicalCondition,
      },
    });
  } catch (authErr) {
    console.warn('Direct Supabase Auth update notice:', authErr);
  }

  // 2. Secondary Sync: Write to backend database API
  try {
    return await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (apiErr) {
    console.warn('Backend API /auth/profile sync deferred:', apiErr);
    return { success: true, ...profileData };
  }
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

export async function deleteGoal(goalId: string) {
  return apiCall(`/goals/${goalId}`, {
    method: 'DELETE',
  });
}

// ============================================
// MEAL LOGS API (Optimistic Offline-First & Resilient)
// ============================================

import { setSecureItem, getSecureItem } from '../utils/secureStorage';

const MEAL_LOGS_STORAGE_KEY = 'mealoptimiza_meal_logs';

export async function getMealLogs() {
  let localLogs: any[] = [];
  try {
    const encryptedLogs = await getSecureItem<any[]>(MEAL_LOGS_STORAGE_KEY);
    if (encryptedLogs && Array.isArray(encryptedLogs)) {
      localLogs = encryptedLogs;
    } else {
      const raw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY) || localStorage.getItem('mealoptimizer_meal_logs');
      if (raw) localLogs = JSON.parse(raw);
    }
  } catch {}

  try {
    const remoteLogs = await apiCall('/logs');
    if (Array.isArray(remoteLogs) && remoteLogs.length > 0) {
      const map = new Map<string, any>();
      localLogs.forEach((l) => map.set(l.id, l));
      remoteLogs.forEach((l) => map.set(l.id, l));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.date + ' ' + (b.time || '12:00')).getTime() - new Date(a.date + ' ' + (a.time || '12:00')).getTime()
      );
      await setSecureItem(MEAL_LOGS_STORAGE_KEY, merged);
      localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    /* Safe fallback to local logs when offline or guest */
  }
  return localLogs;
}

export async function createMealLog(logData: any) {
  const logWithId = {
    ...logData,
    id: logData.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: logData.createdAt || new Date().toISOString(),
  };

  // 1. Instantly write to encrypted local storage vault
  try {
    const raw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY) || localStorage.getItem('mealoptimizer_meal_logs') || '[]';
    const current = JSON.parse(raw);
    const updated = [logWithId, ...current.filter((l: any) => l.id !== logWithId.id)];
    await setSecureItem(MEAL_LOGS_STORAGE_KEY, updated);
    localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('mealoptimizer_meal_logs', JSON.stringify(updated));
  } catch (err) {
    console.warn('Local storage write warning:', err);
  }

  // 2. Background non-blocking remote sync
  try {
    const result = await apiCall('/logs', {
      method: 'POST',
      body: JSON.stringify(logWithId),
    });
    return result || logWithId;
  } catch {
    // Return local log so UI succeeds smoothly
    return logWithId;
  }
}

export async function deleteMealLog(logId: string) {
  try {
    const raw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY) || localStorage.getItem('mealoptimizer_meal_logs') || '[]';
    const current = JSON.parse(raw);
    const updated = current.filter((l: any) => l.id !== logId);
    localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('mealoptimizer_meal_logs', JSON.stringify(updated));
  } catch {}

  try {
    await apiCall(`/logs/${logId}`, { method: 'DELETE' });
  } catch {}
  return { success: true };
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
  voiceWhisper?: string;
  userHint?: string;
}) {
  return apiCall('/ai/analyze-food', {
    method: 'POST',
    body: JSON.stringify({
      imageBase64,
      userContext,
      voiceWhisper: userContext.voiceWhisper || userContext.userHint || '',
    }),
  });
}

export async function generateMealPlan(days: number, preferences: string) {
  return apiCall('/ai/generate-meal-plan', {
    method: 'POST',
    body: JSON.stringify({ days, preferences }),
  });
}

export async function generateSingleMeal(
  mealType: string,
  currentGoal: string,
  budget?: number | string,
  exclude?: string[], // meal names already shown, so the AI serves something different
) {
  const b = budget === undefined || budget === null || `${budget}`.trim() === '' ? undefined : Number(budget);
  const ex = Array.isArray(exclude) ? exclude.filter(Boolean).slice(-15) : undefined;
  return apiCall('/ai/generate-single-meal', {
    method: 'POST',
    body: JSON.stringify({ mealType, currentGoal, budget: b, exclude: ex && ex.length ? ex : undefined }),
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

// ============================================
// UNIVERSAL COLLECTIONS API
// Stores full JSON objects per account (no fixed schema).
// Used for richer models that don't fit the narrow relational tables
// (e.g. custom reminders, recipe favorites, medications).
// ============================================

export async function getCollection(name: string) {
  const data = await apiCall(`/collections/${name}`);
  return data.items as any[];
}

export async function createCollectionItem(name: string, item: any) {
  const result = await apiCall(`/collections/${name}`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return result.item;
}

export async function updateCollectionItem(name: string, id: string, patch: any) {
  const result = await apiCall(`/collections/${name}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return result.item;
}

export async function deleteCollectionItem(name: string, id: string) {
  return apiCall(`/collections/${name}/${id}`, { method: 'DELETE' });
}

// ============================================
// MEDICAL VAULT API (secure documents)
// Files live in a private Storage bucket ('medical-vault'); this table
// stores only metadata. Bytes upload straight to Storage via a signed URL,
// never through the edge function.
// ============================================

export interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  provider: string | null;
  notes: string | null;
  issued_date: string | null; // 'YYYY-MM-DD'
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalDocumentMeta {
  title: string;
  category?: string;
  provider?: string;
  notes?: string;
  issuedDate?: string; // 'YYYY-MM-DD'
}

const MEDVAULT_BUCKET = 'medical-vault';

export async function getMedicalDocuments(): Promise<MedicalDocument[]> {
  const data = await apiCall('/medical-vault');
  return data.items ?? [];
}

// Upload a file + save its metadata in one call.
export async function uploadMedicalDocument(
  file: File,
  meta: MedicalDocumentMeta,
): Promise<MedicalDocument> {
  // 1) get a signed upload URL scoped to this user's folder
  const { path, token } = await apiCall('/medical-vault/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name }),
  });

  // 2) upload the raw file straight to Storage using the signed token
  const { error: upErr } = await supabase.storage
    .from(MEDVAULT_BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type || undefined });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  // 3) save the metadata row
  const result = await apiCall('/medical-vault', {
    method: 'POST',
    body: JSON.stringify({
      title: meta.title,
      category: meta.category ?? null,
      provider: meta.provider ?? null,
      notes: meta.notes ?? null,
      issuedDate: meta.issuedDate ?? null,
      filePath: path,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }),
  });
  return result.item;
}

// Short-lived (~2 min) URL to view/download a document's file.
export async function getMedicalDocumentDownloadUrl(id: string): Promise<string> {
  const data = await apiCall(`/medical-vault/${id}/download-url`);
  return data.url;
}

export async function updateMedicalDocument(
  id: string,
  patch: Partial<MedicalDocumentMeta>,
): Promise<MedicalDocument> {
  const result = await apiCall(`/medical-vault/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return result.item;
}

export async function deleteMedicalDocument(id: string): Promise<void> {
  await apiCall(`/medical-vault/${id}`, { method: 'DELETE' });
}

// ============================================
// FOODS DATABASE API
// Curated West African foods (public) + a user's own custom foods.
// Nutrition is per serving; local portions in serving_label.
// ============================================

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[] | null;
  category: string | null;
  serving_label: string | null;
  serving_grams: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
  potassium_mg: number | null;
  glycemic_index: number | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

import { AFRICAN_FOOD_DATABASE } from '../app/data/africanFoodDatabase';

export async function searchFoods(query = '', category = ''): Promise<FoodItem[]> {
  const q = query.toLowerCase().trim();
  const cat = category.toLowerCase().trim();

  // 1. Search built-in Master African Food Database
  const localMatched: FoodItem[] = AFRICAN_FOOD_DATABASE.filter((dish) => {
    const matchesQuery =
      !q ||
      dish.name.toLowerCase().includes(q) ||
      dish.region.toLowerCase().includes(q) ||
      dish.country.toLowerCase().includes(q) ||
      dish.aliases?.some((a) => a.toLowerCase().includes(q));

    const matchesCat = !cat || dish.category.toLowerCase().includes(cat);

    return matchesQuery && matchesCat;
  }).map((dish) => ({
    id: dish.id,
    name: dish.name,
    aliases: dish.aliases || null,
    category: dish.category,
    serving_label: dish.serving_label,
    serving_grams: dish.serving_grams,
    calories: dish.calories,
    protein_g: dish.protein_g,
    carbs_g: dish.carbs_g,
    fat_g: dish.fat_g,
    fiber_g: dish.fiber_g,
    sodium_mg: null,
    potassium_mg: null,
    glycemic_index: dish.glycemic_index,
    is_public: true,
    created_by: null,
    created_at: new Date().toISOString(),
  }));

  // 2. Try remote API to merge user's custom foods
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    const qs = params.toString();
    const data = await apiCall(`/foods${qs ? `?${qs}` : ''}`);
    const remoteItems: FoodItem[] = data.items ?? [];

    if (remoteItems.length > 0) {
      const map = new Map<string, FoodItem>();
      localMatched.forEach((item) => map.set(item.name.toLowerCase(), item));
      remoteItems.forEach((item) => map.set(item.name.toLowerCase(), item));
      return Array.from(map.values());
    }
  } catch {
    /* Fallback directly to localMatched */
  }

  return localMatched;
}

// Create a custom food (private to the user). Accepts snake_case or camelCase keys.
export async function createFood(food: Record<string, any>): Promise<FoodItem> {
  const result = await apiCall('/foods', { method: 'POST', body: JSON.stringify(food) });
  return result.item;
}

export async function deleteFood(id: string): Promise<void> {
  await apiCall(`/foods/${id}`, { method: 'DELETE' });
}