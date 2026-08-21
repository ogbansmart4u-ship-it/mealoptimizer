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

export async function searchFoods(query = '', category = ''): Promise<FoodItem[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  const qs = params.toString();
  const data = await apiCall(`/foods${qs ? `?${qs}` : ''}`);
  return data.items ?? [];
}

// Create a custom food (private to the user). Accepts snake_case or camelCase keys.
export async function createFood(food: Record<string, any>): Promise<FoodItem> {
  const result = await apiCall('/foods', { method: 'POST', body: JSON.stringify(food) });
  return result.item;
}

export async function deleteFood(id: string): Promise<void> {
  await apiCall(`/foods/${id}`, { method: 'DELETE' });
}