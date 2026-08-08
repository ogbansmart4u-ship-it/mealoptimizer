# MealOptimizer — Handoff & Continuation Sheet

_Last updated: 8 Aug 2026. Paste this into a new chat to continue development from where we stopped. A living, more granular version also lives in `PROJECT_STATUS.md` in the repo._

---

## 0. Session update — 8 Aug 2026 (mascot system, real Food Calendar, quick-log & food-analysis fixes)

Frontend-only session (no edge-function changes; live edge version still **59**). All work committed & pushed to `main` → deployed on Vercel.

### Brand mascot "Avo" — introduced app-wide
- **Asset:** `public/assets/mascot.png` — the final, cleaned, truly-transparent, tightly-cropped mascot (404×550). The uploaded original had a checkerboard baked in as real pixels + a 1px dark edge line; both were removed programmatically (edge flood-fill + auto-crop). **Two dead files remain in `public/assets/` and should be deleted** (OneDrive blocked overwrite): `mascot-running.png` (baked checkerboard) and `mascot-avo.png` (had the stray line). Only `mascot.png` is referenced.
- **New reusable components** (all use a plain `<img src="/assets/mascot.png">`, NOT next/image — the app is Vite, not Next):
  - `src/app/components/MealOptimizingLoader.tsx` — big block loader (mascot + message + progress bar). Used on PlanMeal (meal generating) and AddMealLog (food-photo analysis).
  - `src/app/components/MascotEmptyState.tsx` — friendly empty-state block (title/subtitle/action props).
  - `src/app/components/MascotLoader.tsx` — compact bobbing-mascot loader for popups/loading screens.
  - `src/app/components/celebrate.tsx` — `celebrate(message, sub?)` mascot-branded sonner toast for success moments.
- **Empty states using MascotEmptyState (9):** Logs, MedicationTracker, Reminders, MyMealPlans, GroceryList (wrapped in white card for contrast), Medications, Achievements, Recipe, GlucoseInsights. _(BiometricDashboard skipped — it has dark-mode theming the component doesn't handle.)_
- **Loading states using MascotLoader:** MyMealPlans, MealPlanView, ScanBarcode, MedicalVault (docs + biomarkers). _(Auth screens intentionally left on plain spinners.)_
- **Strategic placements:** Home greeting header (small Avo beside "Good morning, {name}"); StreakCard (Avo shows only when streak > 0); CelebrationAnimation (goal completed — Avo replaces the trophy); AchievementNotification (Avo accent); meal-logged celebration toast (Home quick-log + AddMealLog); Home water card + HydrationTracker (Avo appears when the daily water goal is reached).

### Feature fixes this session
- **Food Calendar → real data.** The Home "Food Calendar" was a static hardcoded 7-day "nutrition blueprint" (with a misleading "Auto-updates daily" badge). Rebuilt as **"This Week's Meals"**: a live Mon–Sun strip from the user's real meal logs (`getMealLogs`, UTC-keyed to match how logs store `date`), tiles show 🍽️ + count when a day has logs, tapping a day navigates to `/logs` with that date preselected, badge now shows the real week range. "View All" (previously a dead button) now opens `/logs`. **Note:** the old `nutritionBlueprintCalendar` array + Meal Prescription / Post-Meal dialogs are now unreferenced dead code in `Home.tsx` (harmless; can be removed later). Chosen source is meal *logs* (dated) not meal *plans* (plans carry only a `createdAt`, no day assignment).
- **Quick Log Meal (Home) was decorative — now works.** The preset meal buttons and "Custom Entry" had no onClick. Presets now log a real meal via `createMealLog` (with macros + glycemic impact) and toast; "Custom Entry" navigates to `/logs` with `{ state: { openAdd: true } }` and Logs auto-opens the Add Meal dialog. Added a `quickLogging` guard against double-submits.
- **Camera "Analyze Food" was a mock** (always returned "Jollof Rice with Chicken"). Now calls the real `analyzeFoodImage` (`/ai/analyze-food`, same Gemini endpoint Home uses) with the user's profile + location context, prefills the form from `data.analysis`, shows the mascot loader while analyzing, and falls back to manual entry on error.
- **Logs date/open-dialog navigation:** `Logs.tsx` now honors `location.state.date` (preselect day) and `location.state.openAdd` (auto-open Add Meal), used by the calendar tiles and quick-log Custom Entry.

### Known cautions added this session
- **Verification gap:** the assistant's sandbox can't finish `npm install`, so changes are validated with an esbuild **parse** check only — this catches syntax errors but NOT runtime issues. One such bug shipped and broke production: a temporal-dead-zone crash ("Cannot access 'as' before initialization") from using `weekLogs` before its declaration in `Home.tsx`; fixed by moving the declaration up. **Recommend getting a real `npm run build` (or a Vercel build check) working before pushing.**
- **Recurring `git`/OneDrive lock:** committing sometimes fails with "A lock file already exists" — delete `.git/index.lock` via File Explorer (paste the `.git` path in the address bar) then retry. The sandbox cannot delete it (OneDrive permissions).
- **Stale-chunk on deploy:** blank/old page right after a deploy is CDN cache — hard-refresh (`Ctrl+Shift+R`) or `?cb=`. Worth adding cache-control headers on `index.html` in `vercel.json` to stop this recurring.

---

MealOptimizer is a nutrition & health app for Nigerians / West Africans managing medical conditions (diabetes, hypertension, etc.): personalized meal plans, AI food-photo analysis, a curated West African food database, and a wellness suite (weight, hydration, sleep, symptoms, workouts, medications, reminders, goals, meal logs, achievements, biometrics, a secure Medical Vault, glucose insights, and a doctor report).

---

## 1. Tech stack & infrastructure

- **Frontend:** Vite 6 + React 18 + TypeScript + Tailwind 4 + shadcn/ui + react-router v7 + `motion/react` (Framer Motion) + lucide-react.
- **Hosting:** GitHub repo `ogbansmart4u-ship-it/mealoptimizer` → auto-deploys to Vercel at `mealoptimizer-two.vercel.app`. SPA routing via `vercel.json`.
- **Deploy method (owner is not a developer):** edit files in the local repo folder → GitHub Desktop → Commit → Push → Vercel rebuilds (~1–2 min). Vercel serves via CDN, so after a deploy a plain reload may show a cached page briefly — hard-refresh or add `?cb=` to confirm.
- **Backend:** Supabase project `jgbffgckrhiqshkogvia`. Edge function `make-server-ba6f1f45` (Hono + Deno), **currently version 59**. Deploy via Supabase MCP `deploy_edge_function`.
- **AI:** Google Gemini 2.5-flash (food-photo analysis, meal-plan generation, barcode AI fallback). Key = Supabase edge secret `GEMINI_API_KEY`. All calls wrapped in a 45s timeout.

### CRITICAL backend rule
The live edge function is a condensed rewrite maintained separately from the verbose on-disk copy (`supabase/functions/server/index.tsx`), which is out of date. **Always `get_edge_function` to fetch live source first, inject changes, then `deploy_edge_function`** — never deploy from the disk copy. Confirm `ACTIVE` + version bump after.

### Data storage
- **KV store** `kv_store_ba6f1f45` — profile, goals, meal logs, recipes, meal-plans, grocery-list, AI requests, and the universal collections store (`user:{id}:col:{name}:{itemId}`).
- **Relational tables (RLS, per-user):** weight_logs, hydration_logs, sleep_logs, symptom_logs, workout_logs, medications, reminders, biometric_data, achievements, **medical_documents**, **foods**.
- **Storage bucket:** private **`medical-vault`** (15 MB limit; PDF/images/Word) with path-scoped RLS (`<user-id>/…`).

### Frontend API helpers (`src/lib/api.ts`)
`apiCall` wrapper + helpers for goals, logs, recipes, weight, hydration, sleep, symptoms, workouts, medications, reminders, biometrics, achievements; the universal **collections** store (`getCollection`/`createCollectionItem`/`updateCollectionItem`/`deleteCollectionItem`); **Medical Vault** (`getMedicalDocuments`/`uploadMedicalDocument`/`getMedicalDocumentDownloadUrl`/`updateMedicalDocument`/`deleteMedicalDocument`); **Foods** (`searchFoods`/`createFood`/`deleteFood`); budget-aware `generateSingleMeal(mealType, goal, budget)`.

---

## 2. What's DONE ✅ (this build)

### Backend / data
- **Medical Vault** — private storage bucket + `medical_documents` table (RLS) + edge endpoints (`GET/POST /medical-vault`, `POST /medical-vault/upload-url`, `GET /medical-vault/:id/download-url`, `PUT/DELETE`). Files upload client→Storage via signed URL; defense-in-depth (edge path-scoping + RLS). `set_updated_at` trigger hardened (`search_path`).
- **West African foods database** — `public.foods` (per-serving nutrition + local portions + sodium/potassium + GI), RLS (curated public + per-user custom). Seeded ~54 foods across 8 categories. Endpoints `GET /foods?q=&category=`, `POST /foods`, `DELETE /foods/:id`.
- **Budget meal plans** — `/ai/generate-single-meal` accepts optional Naira `budget`, prompts for affordable in-season local ingredients, returns `estimatedCostNaira`.
- **Barcode → OpenFoodFacts** — `/barcode/:barcode` queries the real product DB first, AI estimate only as fallback, tags each result with `source`.

### Features
- **Medical Vault UI** — upload / list / view (signed link) / delete documents; biomarkers moved off `localStorage` to the collections store (load/add/delete, no mock seed).
- **Biometrics dashboard** — rewritten from simulated to real manual entry (glucose, heart rate, blood pressure, steps, calories, SpO2) with latest-value cards, glucose trend chart, readings list, empty states.
- **Meal ↔ glucose insights** — `/glucose-insights`: matches meals to post-meal glucose readings, ranks foods by average spike; linked from the biometrics dashboard.
- **Doctor report** — `/health-report`: print-optimized ("Save as PDF") summary of patient details, glucose (+avg), BP, weight, medications, recent meals. Entry point on the Health page.
- **Food-search logging** — the Add-Meal-Log dialog has a "Search Food Database" method (search by name/alias, pick servings, prefills macros, saves via `createMealLog`).
- **Medication–food interaction flags** — curated rules module `src/app/data/medicationInteractions.ts` (warfarin+vitamin-K greens, ACE/ARB & K-sparing + potassium, BP meds + sodium, statin+grapefruit, metformin+alcohol, levothyroxine, antibiotic+calcium, iron+tea, MAOI+tyramine). Shown in the meal dialog against the user's active meds (nutrient-aware + name-keyword).
- **Streaks** — `StreakCard` (daily logging streak: current + longest + 7-day dots) on Home and Achievements.
- **Home Water Tracker** — was static (`useState(5)`); now persisted per calendar day (`localStorage` `water-glasses-YYYY-MM-DD`), auto-resets daily, adds toward the 8-glass goal, rolls over on refocus. **Market Update** rotates through 12 location-aware tips by day-of-year.

### Platform / quality
- **Code-splitting** — all routes `React.lazy` + Suspense; `vite.config.ts` `manualChunks` vendor split. Initial JS 1,708 kB → ~162 kB (52 kB gz). Recharts loads only on chart pages.
- **Stale-chunk auto-recovery** — `vite:preloadError` + `RouteErrorBoundary` reload once (10s guard) after a deploy renames chunks.
- **Service worker REMOVED** (reliability) — was causing "won't load / won't refresh". `main.tsx` no longer registers one and unregisters+clears caches; `public/sw.js` self-destructs to clean existing installs. Plus a **self-heal watchdog** inline in `index.html`. Trade-off: no offline/install prompt (app is online-first). Manifest + icons remain.
- **App metadata / PWA groundwork** — real title, description, `index,follow`, favicon, theme-color, Apple tags, OG/Twitter, `manifest.webmanifest`, 192/512 icons.
- **Design foundation** — `DESIGN_GUIDELINES.md` (8pt grid, type scale, colour, components, motion, a11y, QA) adapted from the uploaded blueprint. Tokens added to `theme.css`: `secondary-accent` (amber `#F59E0B`), `success`/`warning`/`danger`/`ink`. **Brand teal unified to `#1f7a8c`** (was split with `#0F766E`).
- **Motion & micro-interactions** — subtle route cross-fade (opacity-only, reduced-motion aware); light tap haptics (`navigator.vibrate`, Android/Chrome); **safe-area** padding on the bottom nav.
- **Loading skeletons** — `SkeletonLoader` applied on Biometric Dashboard, Glucose Insights, Grocery List, Hydration, Sleep, Symptoms, Weight (compact rows); Goals already had them.
- **Bottom-nav badges** unified to one red notification colour (were arbitrary orange/yellow/red).
- Earlier foundation (prior builds): off Figma Make → GitHub+Vercel; bottom nav everywhere; error boundaries; real per-account wellness data; AI food analyzer; 360px responsive fixes; navigation/back fixes.

---

## 3. Way forward / what's LEFT 🔧

### Immediate checkpoint (recommended first)
- **Deploy the latest batch and verify live.** Several recent UI changes (skeletons, water tracker, badge fix, SW removal) were validated with esbuild parse but NOT a full `vite build` (the assistant's sandbox kept failing to finish `npm install` this session). After deploy, do an in-browser review at 360px across key screens and confirm no regressions. When possible, also run a full local `vite build` once to be certain.

### Multi-language (curated, in progress)
- Decision: **curated page-by-page** (not machine translation — safest for medical content). Done: `LanguageContext` supports en/es/fr/yo/ig/ha/**pcm (Nigerian Pidgin)**; BottomNav + full Login + full Landing translated. **Way forward:** wire `t()` through remaining pages in batches (SignUp → Home → Health → Profile → trackers). Pattern: `import { useLanguage }`, `const { t } = useLanguage()`, replace hardcoded text with `t('key')`, add keys to `LanguageContext.tsx` (all 7 languages; use double-quoted values for strings containing apostrophes).

### UI polish (per `DESIGN_GUIDELINES.md`)
- Per-screen spacing/typography audits; empty-state pass; roll skeletons to any remaining data pages (Medication Tracker, Logs, Recipe if applicable).
- Optional custom **mascot** for splash/empty states (needs commissioned art).

### Data & features
- Biometrics: optional **wearable sync** (Apple Health / Google Fit) — currently manual entry only.
- Medical Vault: let users **save barcode/AI corrections** into the custom `foods` table; store a `food_id` reference on meal logs for richer analysis.
- Meal ↔ glucose: surface sodium/potassium prominently for hypertension; medication-dose adherence streaks.

### Quality & reliability (deferred)
- **Automated tests + CI** (none yet).
- **Error monitoring** (e.g., Sentry) + basic analytics.
- Audit RLS on every table; enable Supabase **Auth leaked-password protection** (advisor warning).
- Resolve the condensed-vs-disk edge-function divergence (make disk the source of truth).

### Suggested next priorities (in order)
1. Deploy + live verification checkpoint.
2. Continue curated translations (SignUp, Home, Health).
3. Per-screen UI polish (spacing/typography, empty states).
4. Tests + error monitoring.
5. Wearable biometrics; barcode/food corrections saving.

---

## 4. Known cautions
- **No service worker anymore** — intentional (reliability). Don't re-add offline caching without a robust update strategy.
- **Two docs:** `HANDOFF.md` (this, high-level) and `PROJECT_STATUS.md` (granular, per-change). Keep both updated.
- **Edge deploys:** always fetch live source first (see §1 CRITICAL rule); current live version is **59**.
- **Verification method:** responsiveness via a 360px iframe measuring `scrollWidth` vs `clientWidth`; frontend "is it live?" via hard-refresh/`?cb=` and matching asset hashes to a local `vite build`; backend via `get_advisors` after DDL.
