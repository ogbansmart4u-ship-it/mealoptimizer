# MealOptimizer — Design Guidelines

Adapted from the *Complete Mobile App UI/UX & High-Retention Design Master Blueprint*
(Malewicz 8pt / Red-Square method + Roe/Isenberg retention principles), tailored to this
React + Tailwind 4 web / PWA app. This is the reference for all UI work — build the
foundation (grid, type, colour, components) right before polishing individual screens.

Design tokens live in `src/styles/theme.css`. Prefer tokens/Tailwind utilities over
hardcoded hex values.

---

## 1. Core philosophy
- **Usability over art.** Structural clarity and function first; polish later.
- **Master layout first.** Animations and custom components don't rescue a broken grid or hierarchy.
- **Constraint-driven.** One font system, a small colour set, strict spacing. Fewer choices = less friction.

## 2. Spacing — the 8pt grid
Every padding, margin and gap is a multiple of **8** (use **4** only for micro-spacing).
Tailwind's default scale already maps to this — use it:

| Purpose | Value | Tailwind |
|---|---|---|
| Micro (icon↔label, title↔subtitle) | 4 / 8px | `gap-1` `gap-2` `p-1` `p-2` |
| Component (card padding, field padding, list gaps) | 16 / 24px | `p-4` `p-6` `gap-4` `gap-6` |
| Layout (screen margins, section breaks) | 32 / 48px | `px-8` `mb-8` `mb-12` |

- **Screen side margins:** aim for 32px (`px-8`). Many screens currently use `px-6` (24px) — acceptable, but prefer `px-8` for new work.
- Avoid off-grid values (`p-5` = 20px, `p-7` = 28px) unless there's a real reason.

## 3. Typography
- **Fonts (already loaded):** Manrope for headings (h1–h4), Inter for body/UI. Keep to these two; don't add more families.
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700). No Light/Thin.
- **Minimum size:** 12px for any text, except bottom-tab labels (10px OK).

Type scale (target):

| Role | Size / Line | Weight | Use |
|---|---|---|---|
| Display | 32 / 40 | Bold | Onboarding titles, hero |
| Section title | 24 / 32 | Bold/Semibold | Screen headings, modal titles |
| Card / item heading | 16 / 24 | Semibold | List items, card titles |
| Body | 14 / 20 | Regular/Medium | Paragraphs, inputs |
| Caption / label | 12 / 16 | Medium | Field labels, timestamps |
| Tab label | 10 / 12 | Medium | Bottom nav |

> Note: the app's base font is currently 18px on mobile (a deliberate readability choice), so Tailwind text sizes render a bit larger than the raw pt values above. Keep the **hierarchy and weights** consistent; don't chase exact pixel parity.

## 4. Colour
Tokens in `theme.css`. **Never use pure `#000`** for text — use `--ink` (`#1E293B`) / `text-foreground`.

| Token | Value | Tailwind | Use |
|---|---|---|---|
| Primary accent | `#1f7a8c` (Deep Teal) | `text-primary` `bg-primary` | Primary buttons, active states, key focus |
| Secondary accent | `#F59E0B` (Amber) | `bg-secondary-accent` `text-warning` | Badges, alerts, notifications, streaks |
| Success | `#10B981` | `text-success` | Positive states (in-range, completed) |
| Danger | `#EF4444` | `text-danger` | Destructive actions, high alerts |
| Background | `#F7F9F8` | `bg-background` | App base |
| Card | `#FFFFFF` | `bg-card` | Surfaces |
| Text (ink) | `#1E293B` | `text-foreground` / `text-ink` | Body text |
| Border | `#E2E8F0` | `border-border` | Dividers, outlines |

- **WCAG AA:** normal text (<18px) ≥ 4.5:1 contrast; large text / UI ≥ 3:1.
- **Known inconsistency to fix:** the codebase has TWO teals — `#1f7a8c` (most screens, PWA theme-colour, favicon) and `#0F766E` (the `--primary` token + newer Login/Landing). **Canonical primary = `#1f7a8c`.** Migrate `#0F766E`/`#115E59` and the `--primary` token to the teal set over time so buttons and accents match everywhere.

## 5. Components
- **Nav header:** ~60px tall; page title + back chevron + up to 2 action icons.
- **Bottom tab bar:** ~64px; 2–5 items; **line icon when inactive, filled when active**; 10px labels; each item ≥44×44px touch target.
- **Inputs:** 44–48px tall; 12px label with an 8px gap above the field; radius 8–12px; 16px left/right padding; visible focus ring (`--ring`).
- **Buttons:** 48–56px tall; primary = solid teal (or subtle top-left→bottom-right gradient), 16px bold centred label; secondary = 20% teal tint or neutral outline.
- **Touch targets:** every interactive element ≥ 44×44px, including icon buttons (pad the container, don't clip to the glyph).
- **Cards / nested radius:** inner radius = outer radius − inner padding (e.g. card `rounded-2xl`=16 with `p-1` image → image `rounded-xl`=12).

## 6. Motion & micro-interactions (web-appropriate)
- Page/tab transitions: subtle slide + spring (Framer `motion/react` is already used) — respect `prefers-reduced-motion`.
- Loading: prefer skeletons or animated progress ("Analyzing…") over a bare spinner where practical.
- Tap feedback: global `active:scale-97` is already in place. Keep it.
- Haptics: **web has no iOS haptics.** On Android/Chrome, `navigator.vibrate(10)` gives light feedback on key actions — use sparingly, feature-detect first.
- Out of scope for web: native iOS/Android **home & lock-screen widgets** (WidgetKit) and **Metal/WebGL shader** effects from the blueprint. Revisit only if the app is packaged natively (Capacitor).

## 7. Iconography
- **One set:** the app uses **lucide-react** — keep it; don't mix in other icon libraries.
- Inactive nav = line icon; active = filled (lucide supports `fill` / filled variants).
- Maintain ≥44px touch boxes around icons.

## 8. QA checklist (before shipping a screen)
1. **Grid audit:** 32px side margins; 8/16px internal gaps; nothing off-grid.
2. **Touch targets:** every button/icon ≥ 44×44px.
3. **Contrast:** text passes WCAG AA against its background (check teal-on-white, amber, grays).
4. **Real content:** test with long strings / empty states; no clipped or overflowing text (see the 360px responsive method in PROJECT_STATUS.md §5).
5. **Colour consistency:** teal is `#1f7a8c`, one icon set, tokens not hardcoded hex.
6. **Benchmark:** compare flows against Mobbin / 60fps / Spotted in Prod for polish.

## 9. Out of scope / optional (from the blueprint)
- **Mascot / character anchor** — a brand-differentiation investment (commission art, generate pose variants). Optional; nice for splash/empty states later.
- **Native widgets & shaders** — not available to a React PWA (see §6).
