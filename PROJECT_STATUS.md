# MealOptimizer — Project Status & Handoff Sheet

A nutrition & health app for Nigerians / West Africans managing medical conditions (diabetes, hypertension, etc.). Personalized meal plans, AI food-photo analysis, and a wellness suite (weight, hydration, sleep, symptoms, workouts, medications, reminders, goals, meal logs, achievements, and a secure Medical Vault).

Paste this into a new chat to continue development. It captures where the app stands and what's left to reach a professional standard.

_Last updated: 6 Aug 2026 — after Medical Vault, metadata/PWA, biometrics rewrite, bundle code-splitting, and the West African foods database. Live edge version: **57**._

---

## 1. Tech stack & infrastructure

- **Frontend:** Vite 6 + React 18 + TypeScript + Tailwind 4 + shadcn/ui + react-router v7 + `motion/react` (Framer Motion) + lucide-react.
- **Hosting:** GitHub repo `ogbansmart4u-ship-it/mealoptimizer` → auto-deploys to Vercel at `mealoptimizer-two.vercel.app`. SPA routing via `vercel.json` rewrite.
- **Deploy method (frontend):** The owner is not a developer. They deploy by editing/replacing files in the local repo folder, then GitHub Desktop → Commit → Push. Vercel rebuilds from source automatically (~1–2 min). Note: Vercel serves through a CDN, so after a deploy a plain reload may show a cached page — hard-refresh or add a `?cb=` query to confirm new HTML.
- **Backend:** Supabase project `jgbffgckrhiqshkogvia`. Edge function `make-server-ba6f1f45` (Hono + Deno), currently **version 56**. Deployed via the Supabase MCP `deploy_edge_function`.
- **Data storage:**
  - KV store table `kv_store_ba6f1f45` — profile, goals, meal logs, recipes, meal-plans, grocery-list, AI requests, and the universal collections store (`user:{id}:col:{name}:{itemId}`).
  - Relational tables with RLS — weight_logs, hydration_logs, sleep_logs, symptom_logs, workout_logs, medications, reminders, biometric_data, achievements, **medical_documents (new)**.
  - **Storage bucket (new):** private `medical-vault` bucket for medical files.
- **AI:** Google Gemini 2.5-flash for food-photo analysis, barcode lookup, and meal-plan generation. Key stored as Supabase edge secret `GEMINI_API_KEY`. All calls wrapped in a 45s timeout.

### Important backend note for whoever continues
The live edge function is a condensed rewrite maintained separately from the verbose copy on disk (`supabase/functions/server/index.tsx`), which has diverged and is out of date. **Always fetch the live source (`get_edge_function`) before editing, inject changes, and redeploy — never deploy from the disk copy.**

### Universal collections store
Generic per-account JSON store for models too rich for the narrow relational tables.
- Endpoints: `GET/POST /collections/:name`, `PUT/DELETE /collections/:name/:id`.
- Frontend helpers in `src/lib/api.ts`: `getCollection`, `createCollectionItem`, `updateCollectionItem`, `deleteCollectionItem`.
- Powers: custom reminders, recipe favorites, medications + dose history.

### Medical Vault store (new — v56)
Secure storage for sensitive medical documents (lab reports, prescriptions, scans, etc.).
- **Storage:** private bucket `medical-vault`, 15 MB limit, allowed types PDF / images / Word. RLS on `storage.objects` scopes every file to the owner's `<user-id>/…` folder.
- **Metadata table:** `public.medical_documents` (title, category, provider, notes, issued_date, file_path, file_name, mime_type, file_size) with per-user RLS on all four operations + auto `updated_at` trigger.
- **Endpoints:** `GET /medical-vault`, `POST /medical-vault/upload-url` (signed upload URL), `POST /medical-vault` (save metadata), `GET /medical-vault/:id/download-url` (~2 min signed link), `PUT /medical-vault/:id`, `DELETE /medical-vault/:id` (removes file + row). File bytes upload client→Storage directly, never through the function. Defense-in-depth: the edge function enforces user-id path scoping AND RLS enforces it independently.
- **Frontend helpers in `src/lib/api.ts`:** `getMedicalDocuments`, `uploadMedicalDocument`, `getMedicalDocumentDownloadUrl`, `updateMedicalDocument`, `deleteMedicalDocument` (+ `MedicalDocument` / `MedicalDocumentMeta` types).

---

## 2. What's DONE ✅

### Platform & foundation
- Migrated fully off Figma Make → live on GitHub + Vercel.
- Navigation fixed: bottom nav on every app screen; back arrows return to the previous screen; stranded pages wrapped in a shared layout.
- Error boundaries added (route-level + app-level).

### Real per-account backend data (no more fake/local seed)
- Goals, Meal Logs.
- Wellness endpoints: hydration, sleep, symptoms, workouts, weight, reminders, biometrics, medications, achievements.
- Reminders (full weekly schedule via collections store; mirrors to device for notifications).
- Recipe favorites (catalog stays built-in; favorites persist per account).
- Medication Tracker (medication list + dose-taken history).
- **Medical Vault — secure documents, backend + UI (new).** Upload / list / view (signed link) / delete, backed by the private bucket + metadata table.
- **Medical Vault biomarkers now persist per-account (new).** Moved off `localStorage` to the universal collections store (`biomarkers`); load / add / delete, with icon/color/status derived at render so stored data stays JSON-safe. No mock seed.
- **West African foods database (new — backend/data layer).** `public.foods` table (per-serving nutrition + local portions + sodium/potassium + GI) with RLS: curated public foods readable by all, custom foods per-user. Seeded ~54 Nigerian/West African foods across 8 categories. Edge endpoints `GET /foods?q=&category=` (search name + aliases), `POST /foods` (custom), `DELETE /foods/:id`. Helpers in `api.ts`: `searchFoods`, `createFood`, `deleteFood` (+ `FoodItem` type). **Food-search logging UI DONE:** the Add-Meal-Log dialog now has a "Search Food Database" method — search by name/alias, pick servings, and it prefills the meal form (macros scaled) and saves through the existing `createMealLog` path. _Remaining (optional): store a `food_id` reference on meal logs; user custom-food management screen._

### Features
- AI Food Analyzer working with real Gemini analysis (tightened prompt, numeric cleanup, timeout handling).
- Biometrics "Bio-Digital Twin" page carries an honest "Simulated preview" badge (data still simulated — see below).

### App metadata / branding (new)
- `index.html`: real title ("MealOptimizer — Personalized Nutrition for Your Health"), removed `noindex, nofollow` → now `index, follow`, added description, theme-color, Apple web-app tags, and Open Graph / Twitter cards.
- Added a real branded **favicon.svg** in `public/` (previously none).

### Backend hardening (new)
- `set_updated_at` trigger function pinned to an empty `search_path` (fixes the mutable-search-path advisor introduced with the new table).

### UI/UX
- Header style unified; Home entrance/tap animations; consistency pass.
- Mobile responsiveness fixed & verified at 360px on: Home 7-day row, Reminders day-chips, Recipe cards, Health quick-links. Global guard against sideways scrolling.

---

## 3. What's LEFT to reach "professional" 🔧

### A. Data & features still incomplete
- **Biometrics dashboard — now real (manual entry).** Rewrote `BiometricDashboard.tsx` off the mock generators onto the `/biometrics` table: add readings (glucose, heart rate, blood pressure, steps, calories, SpO2) with date/time, latest-value cards, a real glucose trend chart, a delete-able readings list, and honest empty states. _Remaining: optional wearable sync (Apple Health / Google Fit) for automatic import._ Needs real wearable integration (Apple Health / Google Fit) or manual-entry wiring to a real endpoint.
- **Confirm remaining pages are fully wired, not local:** Personalization, Achievements display, meal-plan history, grocery-list flows.

### B. Mobile / UI polish
- **Full responsive sweep across every page at phone + tablet widths** (only a handful of pages verified so far). ← _next up_
- Touch animations: many effects are hover-based (don't fire on phones); decide whether to add tap-based animations. (Pending owner decision.)
- Add loading skeletons and empty-state designs; consistent spacing/typography scale.
- Accessibility: focus states, color contrast, aria labels, tap-target sizes.

### C. Quality & reliability
- No automated tests yet — add unit/integration tests + basic CI.
- ~~Reduce the frontend bundle (~1.7 MB) via code-splitting~~ **DONE.** All routes are `React.lazy` (Suspense fallback at the router root in `routes.tsx`); `vite.config.ts` `manualChunks` splits leaf vendors (charts/recharts, supabase, radix, motion, icons). Initial JS chunk dropped from 1,708 kB (452 kB gz) to ~162 kB (52 kB gz); recharts (~400 kB) now loads only on the biometrics page. No more >500 kB chunk warning.
- Error monitoring (e.g., Sentry) and basic analytics.
- Verify RLS on every table; audit input validation on the edge function.
- Enable Supabase Auth leaked-password protection (advisor warning; one toggle in Auth settings).
- Resolve the condensed-vs-disk edge-function divergence (make disk the source of truth again).

### D. Product & distribution
- **PWA — installable + offline (new/done).** `public/manifest.webmanifest` (standalone, theme/bg colors, 192/512 + maskable PNG icons), linked from `index.html`; `public/sw.js` service worker (network-first navigations with offline shell fallback, cache-first hashed assets, cross-origin API always live), registered in `main.tsx` for production only. _Remaining: push notifications (reminders still use the browser Notification API only)._
- Onboarding polish; profile completeness prompts; data export.
- Medical disclaimer + reviewed Privacy Policy / Terms (pages exist; content should be reviewed).
- Optional: package as a native app via Capacitor for the app stores.

### E. Nice-to-have / growth
- Streaks & richer achievements; adherence insights from dose/meal history.
- Smarter meal-plan personalization tied to logged data.
- Multi-language (English + local languages).

---

## 4. Suggested next priorities (in order)

1. ~~Full responsive sweep~~ — DONE (all 40 routes checked at 360px; fixed Weight input rows + Symptoms filter wrap).
2. ~~Move biomarkers to real backend storage~~ — DONE (collections store).
3. ~~PWA manifest + service worker~~ — DONE (installable + offline shell).
4. ~~Real biometrics dashboard (manual entry)~~ — DONE. (Wearable sync still optional.)
5. ~~Bundle splitting~~ DONE. Remaining: automated tests + error monitoring (Sentry). ← _next_

---

## 5. How verification is done (so a new assistant can reproduce)

- **Responsiveness:** load the live page inside a 360px-wide viewport via the Chrome browser tools and measure `scrollWidth` vs `clientWidth` (page-level and inside cards, since cards use `overflow-hidden` and clip content without scrolling the page).
- **Backend deploys:** fetch live edge source → inject → `deploy_edge_function` → confirm `ACTIVE` + version bump. Run `get_advisors` after DDL.
- **Frontend "is it live?":** hard-refresh or add `?cb=` (CDN caches). Confirm the deployed asset hashes match a local `vite build` of the same source, and/or check the tab title / meta tags.
- **Local build check:** copy the repo to a scratch dir, `npm install`, `npm run build` — Vercel runs `vite build`, so a green local build means a green deploy.

---

## 6. Competitive roadmap (vs Yazio)

Yazio is a polished, general-purpose calorie/macro tracker: 4M+ item food database, real barcode scanner, deep intermittent-fasting integration, 2,900+ recipes, AI photo logging, Apple Health / Google Fit sync — but Western-centric and condition-agnostic. MealOptimizer already beats it on Medical Vault, medication + dose tracking, symptom logging, a glucose/biometrics dashboard, and its West African + medical-condition focus. The strategy is NOT to out-track Yazio generically, but to win on the two things it ignores: **local food** and **medical management**. Yazio's one clear edge today is data accuracy (curated DB vs our Gemini estimates) — closing that is priority #1 below.

Prioritized features, each addressing a pain point Yazio doesn't solve for this audience:

1. **West African food database** — DONE (data layer). Fixes accuracy + local coverage + offline. Next: search/logging UI, and let AI photo analysis map to real DB entries the user can correct and save.
2. **Condition-first nutrient tracking** — **meal → post-meal glucose correlation view DONE** (`GlucoseInsights.tsx`, route `/glucose-insights`, linked from the biometrics dashboard): matches each meal to glucose readings 30 min–3 h afterwards vs a pre-meal baseline, ranks foods by average spike, with empty/insufficient-data states and a not-medical-advice disclaimer. Remaining: surface sodium/potassium prominently for hypertension; store per-food carbs/GI on meal logs for richer analysis.
3. **Doctor-ready report** — DONE (`HealthReport.tsx`, route `/health-report`, entry point on the Health page grid). Print-optimized page (native "Print / Save as PDF", `@media print` hides chrome; works on mobile) aggregating patient details, glucose readings + average, blood pressure, latest weight, medications, and recent meals — no PDF dependency added. Remaining (optional): attach the generated report into the Medical Vault, include the glucose-impact ranking.
4. **Medication–food awareness** — flag interactions/timing (metformin, warfarin + vitamin-K greens, antihypertensives + high-sodium dishes) using a curated rules table.
5. **Local, affordable meal plans** — extend AI plans to respect local market ingredients, seasonality, and a Naira budget.
6. **Real barcode DB** — swap the Gemini-guess flow for OpenFoodFacts, AI fallback only; save user corrections.
7. **Streaks/adherence + local languages** (Yoruba, Hausa, Igbo, Pidgin).

Top 3 (foods UI #1, meal-to-glucose correlation #2, doctor report #3) — all DONE. Next candidates: medication–food interaction flags (#4), local/affordable AI meal plans (#5), OpenFoodFacts barcode (#6), streaks + local languages (#7).
