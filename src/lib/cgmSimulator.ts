/**
 * cgmSimulator.ts - Continuous Glucose Monitor (CGM) Trace & Clinical Biomarker Engine
 * Computes 24-hour continuous sensor curves, Time in Range (TIR), and A/B meal spike simulations.
 */

export interface CGMDataPoint {
  time: string;
  timestamp: string;
  hour: number;
  minute: number;
  glucose: number; // in mg/dL (Unshielded)
  glucoseShielded: number; // in mg/dL (Fiber & Resistant Starch Shielded)
  isMealEvent?: boolean;
  mealName?: string;
  mealEmoji?: string;
  targetMin: number; // 70 mg/dL
  targetMax: number; // 140 mg/dL
}

export interface CGMSummaryMetrics {
  meanGlucose: number;
  timeInRangePercent: number; // TIR 70-140 mg/dL (Target >70%)
  timeAboveRangePercent: number; // TAR >140 mg/dL (Target <25%)
  timeBelowRangePercent: number; // TBR <70 mg/dL (Target <4%)
  estimatedA1c: number; // (Mean + 46.7) / 28.7
  glycemicVariabilityCV: number; // (SD / Mean) * 100 (Target <36%)
  highestGlucose: number;
  lowestGlucose: number;
  spikesDetectedCount: number;
  sensorHealth: "optimal" | "elevated" | "stable";
}

export interface SimulatedMealEvent {
  hour: number;
  minute: number;
  name: string;
  emoji: string;
  carbsGrams: number;
  fiberGrams: number;
}

export const DEFAULT_MEAL_EVENTS: SimulatedMealEvent[] = [
  {
    hour: 8,
    minute: 30,
    name: "Akamu & Steamed Moi Moi",
    emoji: "🥣",
    carbsGrams: 48,
    fiberGrams: 9,
  },
  {
    hour: 13,
    minute: 15,
    name: "Jollof Rice & Fried Plantain",
    emoji: "🍛",
    carbsGrams: 72,
    fiberGrams: 4,
  },
  {
    hour: 19,
    minute: 30,
    name: "Pounded Yam with Egusi Soup",
    emoji: "🍲",
    carbsGrams: 80,
    fiberGrams: 6,
  },
];

/**
 * Generates 24-hour continuous sensor data (96 samples at 15-minute intervals)
 */
export function generate24HourCGMTrace(
  meals: SimulatedMealEvent[] = DEFAULT_MEAL_EVENTS
): { points: CGMDataPoint[]; metrics: CGMSummaryMetrics } {
  const points: CGMDataPoint[] = [];
  const BASELINE_FASTING = 88; // normal fasting baseline in mg/dL

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const timeInMinutes = h * 60 + m;

      // 1. Base circadian baseline with subtle dawn phenomenon rise (5:00 - 7:30 AM)
      let base = BASELINE_FASTING;
      if (h >= 5 && h <= 7) {
        base += 8 * Math.sin(((h - 5) / 2) * Math.PI); // dawn rise
      } else if (h >= 0 && h <= 4) {
        base -= 4; // deep sleep drop
      }

      // Add slight physiological jitter (+-2 mg/dL)
      const jitter = Math.sin(timeInMinutes * 0.1) * 2;
      let unshieldedGlucose = base + jitter;
      let shieldedGlucose = base + jitter;

      let mealMatched: SimulatedMealEvent | undefined;

      // 2. Compute meal postprandial glucose excursions
      for (const meal of meals) {
        const mealTimeInMinutes = meal.hour * 60 + meal.minute;
        const delta = timeInMinutes - mealTimeInMinutes;

        // Check if this exact 15-minute slot is the meal event
        if (delta >= 0 && delta < 15) {
          mealMatched = meal;
        }

        // Postprandial glucose curve window (0 to 180 minutes post-meal)
        if (delta >= 0 && delta <= 180) {
          // Unshielded Swallow/Carb Curve: Rapid peak at 45-60 mins, slower clearance
          const peakUnshieldedDelta = (meal.carbsGrams * 1.15) - (meal.fiberGrams * 0.5);
          const unshieldedCurve =
            Math.sin((delta / 180) * Math.PI) * Math.pow(Math.E, -delta / 140) * peakUnshieldedDelta * 2.2;

          // Shielded Curve (Avo's Veg-first & Resistant Starch): Lower peak (35% reduction), faster return
          const peakShieldedDelta = (meal.carbsGrams * 0.72) - (meal.fiberGrams * 1.4);
          const shieldedCurve =
            Math.sin((delta / 180) * Math.PI) * Math.pow(Math.E, -delta / 110) * peakShieldedDelta * 1.5;

          unshieldedGlucose += Math.max(0, unshieldedCurve);
          shieldedGlucose += Math.max(0, shieldedCurve);
        }
      }

      points.push({
        time: timeStr,
        timestamp: `${timeStr}`,
        hour: h,
        minute: m,
        glucose: Math.round(unshieldedGlucose),
        glucoseShielded: Math.round(shieldedGlucose),
        isMealEvent: Boolean(mealMatched),
        mealName: mealMatched?.name,
        mealEmoji: mealMatched?.emoji,
        targetMin: 70,
        targetMax: 140,
      });
    }
  }

  // 3. Compute Clinical ADA / EASD Biomarkers
  const glucoseValues = points.map((p) => p.glucoseShielded);
  const total = glucoseValues.length;

  const sum = glucoseValues.reduce((a, b) => a + b, 0);
  const mean = sum / total;

  // Standard Deviation
  const variance = glucoseValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / total;
  const sd = Math.sqrt(variance);
  const cv = (sd / mean) * 100; // Glycemic variability

  // Time in Range (70–140 mg/dL)
  const inRangeCount = glucoseValues.filter((g) => g >= 70 && g <= 140).length;
  const aboveRangeCount = glucoseValues.filter((g) => g > 140).length;
  const belowRangeCount = glucoseValues.filter((g) => g < 70).length;

  // Estimated A1c formula: (mean_glucose + 46.7) / 28.7
  const eA1c = (mean + 46.7) / 28.7;

  // Spikes detected: count peaks where unshielded > 140
  const unshieldedOver140 = points.filter((p) => p.glucose > 140).length;

  const metrics: CGMSummaryMetrics = {
    meanGlucose: Math.round(mean),
    timeInRangePercent: Math.round((inRangeCount / total) * 100),
    timeAboveRangePercent: Math.round((aboveRangeCount / total) * 100),
    timeBelowRangePercent: Math.round((belowRangeCount / total) * 100),
    estimatedA1c: parseFloat(eA1c.toFixed(1)),
    glycemicVariabilityCV: parseFloat(cv.toFixed(1)),
    highestGlucose: Math.max(...glucoseValues),
    lowestGlucose: Math.min(...glucoseValues),
    spikesDetectedCount: Math.max(1, Math.round(unshieldedOver140 / 4)),
    sensorHealth: mean < 110 && cv < 30 ? "optimal" : mean < 130 ? "stable" : "elevated",
  };

  return { points, metrics };
}
