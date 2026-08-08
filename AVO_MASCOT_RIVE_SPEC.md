# Avo Mascot — Rive Build Specification

A production brief for creating `avo_mascot.riv` in the [Rive editor](https://rive.app). Follow it exactly and the file will drop straight into MealOptimiza's existing mascot system — no code changes beyond swapping the renderer. Every **name in `code font` is a contract**: it must match character-for-character (case-sensitive), because the app addresses the state machine and its inputs by those literal strings.

> Who this is for: whoever builds the animation (you, or a Rive designer). No app-code knowledge needed — just match the names and behaviors below.

---

## 1. Goal

Replace the current flat, CSS-animated `mascot.png` with a rigged, state-machine-driven Rive character named **Avo** (the app's avocado mascot). The app already has a gesture system (`MascotContext` / `useMascot`) that fires gestures on real events — meal logged, page load, loading, errors, streak milestones. This `.riv` is the missing visual: it must expose one state machine whose inputs the app can drive.

**Deliverable:** a single file named exactly `avo_mascot.riv`, placed at:

```
public/assets/avo_mascot.riv
```

---

## 2. Character & canvas

- **Subject:** "Avo" — the same avocado mascot as the current `public/assets/mascot.png`. Keep it visually consistent (shape, palette, friendly face). Reference that PNG.
- **Artboard name:** `Avo`
- **Artboard size:** `512 × 512` (square; the app scales it down responsively).
- **Background:** transparent. No baked-in background fill.
- **Rig:** give Avo at least a body, a face (eyes for a blink), and **one arm/hand** that can move independently — the wave, thumbs-up, and clap all need a hand. Bones or nested-artboard rigging both fine; keep vector shape count modest for mobile performance.
- **Brand palette (match the app):** primary teal `#1f7a8c`, deep teal `#1a6273`, mint `#CCFBF1`, accent amber `#F59E0B`, ink `#1E293B`. Avo's body greens can stay as in the PNG.

---

## 3. Animations (timelines)

Create these seven timelines on the `Avo` artboard. Names are for your reference inside Rive; the **state machine** (Section 4) is what the app actually addresses, so these timeline names don't have to match the app — but keep them clear.

| Timeline | Length | Loop | What Avo does |
| :--- | :--- | :--- | :--- |
| `idle` | ~3–4 s | **Loop** | Gentle breathing sway; occasional slow blink. The resting state — calm, alive, not distracting. |
| `waving` | ~1.2 s | One-shot | Raises a hand and waves 2–3 times, then lowers it. Warm greeting. |
| `thumbsup` | ~0.8 s | One-shot | Quick thumbs-up + a happy eye squint / small bounce. Approving. |
| `clapping` | ~1.4 s | One-shot | A few celebratory claps with a small bounce. |
| `dancing` | ~1 s | **Loop** | Happy side-to-side dance with a bob. Reads as celebration; loops until stopped. |
| `running` | ~0.7 s | **Loop** | Eager on-the-spot run/jog with a forward lean and bob. Reads as "working / loading". |
| `scratching` | ~0.9 s | **Loop** | Confused head-scratch, small nervous shake. Reads as "something went wrong". Loops while the error persists. |

Design notes:
- Keep motion **transform-based and centered** so Avo never appears to drift off its spot.
- The three one-shots (`waving`, `thumbsup`, `clapping`) should **start and end on the same pose as `idle`'s first frame**, so the return to idle is seamless.
- Respect reduced-motion at the app layer (handled in code) — you don't need a separate still timeline.

---

## 4. State machine — `MascotState`

Create **one** state machine named exactly:

```
MascotState
```

### 4.1 Inputs (the contract)

Add exactly these inputs, with these exact names and types:

| Input name | Type | Purpose (app calls it when…) |
| :--- | :--- | :--- |
| `triggerWave` | **Trigger** | app loads, user logs in / onboards (greeting) |
| `triggerThumbsUp` | **Trigger** | a meal is logged, goal saved, macro calculated |
| `triggerClap` | **Trigger** | a task / daily goal completes |
| `isRunning` | **Boolean** | a background fetch / optimization is in progress (true = show, false = stop) |
| `isDancing` | **Boolean** | a streak milestone / reward celebration is on screen |
| `isError` | **Boolean** | an error or validation failure is active |

That's **3 triggers + 3 booleans**. Nothing else is required. (You may add extra inputs for internal wiring, but these six names must exist and behave as below.)

### 4.2 States & transitions

- **Default / entry state:** `idle` (plays the `idle` timeline, looping). Everything returns here.
- **One-shot gestures** — from **Any State**:
  - `triggerWave` → play `waving` → on finish, transition back to `idle`.
  - `triggerThumbsUp` → play `thumbsup` → on finish → `idle`.
  - `triggerClap` → play `clapping` → on finish → `idle`.
  - Use "exit time" / animation-complete transitions so they auto-return with no timer.
- **Persistent states** — driven by booleans:
  - `isRunning == true` → `running` (loop). When `false` → back to `idle`.
  - `isDancing == true` → `dancing` (loop). When `false` → `idle`.
  - `isError == true` → `scratching` (loop). When `false` → `idle`.
- **Priority (if two are active at once):** `isError` > `isRunning` > `isDancing` > one-shots > `idle`. (Errors should win visually.) Implement with transition ordering / guard conditions.
- A fired trigger while a persistent boolean is true may be ignored — that's fine and expected.

### 4.3 Behavior checklist

- On load with no input touched, Avo plays `idle` forever. ✅
- Firing `triggerWave` waves once, then idles. ✅
- Setting `isRunning = true` loops the run; `false` returns to idle. ✅
- Same for `isDancing` and `isError`. ✅
- No state ever "sticks" after its boolean goes false. ✅

---

## 5. Export

1. In Rive, use **Export → Runtime (.riv)** (binary), not the editor `.rev` source.
2. Include the `Avo` artboard and the `MascotState` machine.
3. Name the export **exactly** `avo_mascot.riv`.
4. Drop it at `public/assets/avo_mascot.riv` in the repo and commit it (it's a binary asset; commit it like the PNGs).
5. Also keep the editor source (`.rev`) somewhere in the repo or shared drive for future edits — e.g. `design/avo_mascot.rev`.

Keep the file lean (ideally well under ~200 KB): simple vectors, few bones, no huge embedded images.

---

## 6. How it connects to the app (reference — no action needed from the designer)

Once the file exists, the integration replaces the render in `src/app/components/Mascot.tsx` and maps the existing triggers to the inputs above. For context, the mapping is:

| App call (`useMascot()`) | Rive input action |
| :--- | :--- |
| `wave()` | `triggerWave.fire()` |
| `thumbsUp()` | `triggerThumbsUp.fire()` |
| `clap()` | `triggerClap.fire()` |
| `startRunning()` | `isRunning = true` |
| `dance()` | `isDancing = true` |
| `showError()` | `isError = true` |
| `stop()` | `isRunning = isDancing = isError = false` |

The gesture vocabulary already lives in `src/app/types/mascot.ts`; the triggers already fire on real events (greeting on Home load, thumbs-up on meal log, streak card, etc.). Nothing about those changes — only what draws the mascot.

Runtime package to add when wiring: `@rive-app/react-canvas` (`useRive`, `useStateMachineInput`). The CSS mascot stays as an automatic fallback for when the `.riv` is absent or fails to load.

---

## 7. Acceptance criteria

The file is done when all of these are true:

- [ ] File is named `avo_mascot.riv` and lives at `public/assets/avo_mascot.riv`.
- [ ] Artboard is named `Avo`, 512×512, transparent background.
- [ ] Exactly one state machine named `MascotState`.
- [ ] Inputs exist with exact names/types: `triggerWave`, `triggerThumbsUp`, `triggerClap` (Triggers); `isRunning`, `isDancing`, `isError` (Booleans).
- [ ] All seven behaviors work when tested in Rive's preview (toggle the booleans, fire the triggers): idle loops; each trigger plays once and returns to idle; each boolean loops while true and stops on false.
- [ ] Character visually matches Avo / `mascot.png`; on-brand palette; stays centered.
- [ ] Exported as binary `.riv`, lean file size.

Hand back the `.riv` (and ideally the `.rev` source) and the app can light it up.
