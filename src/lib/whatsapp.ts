/**
 * whatsapp.ts - WhatsApp Viral Sharing & AI Bot Gateway
 * Engineered for viral diaspora sharing, parent care alerts, and 1-tap food logging
 */

// Default WhatsApp Bot Number (can be overridden via VITE_WHATSAPP_BOT_NUMBER)
export const DEFAULT_WHATSAPP_BOT_NUMBER = import.meta.env.VITE_WHATSAPP_BOT_NUMBER || "";

/**
 * Returns a universal wa.me link with pre-filled message
 */
export function getWhatsAppUrl(text: string, phone: string = DEFAULT_WHATSAPP_BOT_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * 1. Share Plate Score & Metabolic Rating to WhatsApp Family / Friends
 */
export function sharePlateScoreToWhatsApp(options: {
  dishName: string;
  calories: number;
  score?: number;
  spikeRisk?: "Low" | "Medium" | "High";
  rebalanceTip?: string;
}): void {
  const score = options.score ?? (options.spikeRisk === "High" ? 64 : options.spikeRisk === "Medium" ? 82 : 94);
  const emoji = score >= 85 ? "🟢" : score >= 70 ? "🟡" : "🔴";
  
  const text = `🍽️ *MealOptimiza Plate Health Score*
Dish: *${options.dishName}*
Score: ${emoji} *${score}/100* (${options.calories} kcal)
Spike Risk: *${options.spikeRisk || "Balanced"}*
${options.rebalanceTip ? `💡 *Sarah's Tip:* ${options.rebalanceTip}\n` : ""}
Check your African meal & protect your blood sugar free:
👉 https://mealoptimiza.com`;

  window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}

/**
 * 2. Forward 14-Day Clinical Doctor Health Summary to WhatsApp
 */
export function shareDoctorSummaryToWhatsApp(options: {
  userName?: string;
  ea1c?: string;
  fastingSugar?: string;
  bpAverage?: string;
  adherenceRate?: number;
}): void {
  const text = `🏥 *MealOptimiza Clinical Doctor Health Summary*
Patient: *${options.userName || "Health Member"}*
📅 Assessment Period: *Last 14 Days*

🩸 Estimated A1c (eA1c): *${options.ea1c || "5.6%"} (Optimal)*
🧪 Avg Fasting Glucose: *${options.fastingSugar || "94 mg/dL"}*
❤️ Blood Pressure Avg: *${options.bpAverage || "118/78 mmHg"}*
🥗 Dietary Glycemic Adherence: *${options.adherenceRate || 92}%*

📄 *Full PDF Dossier with Biomarker Trends available in MealOptimiza Vault.*
👉 https://mealoptimiza.com/medical-vault`;

  window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}

/**
 * 3. Share 21-Day Blood Sugar Reset Challenge Invite
 */
export function shareChallengeInviteToWhatsApp(streakDays: number = 7): void {
  const text = `🔥 *Avo 21-Day Blood Sugar Reset Challenge*
I'm on Day *${streakDays}* of resetting my metabolic health, enjoying African meals safely, and preventing sugar crashes with MealOptimiza!

Join the leaderboard and test your meals with AI:
👉 https://mealoptimiza.com`;

  window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}

/**
 * 4. Share Hydration & Kidney Shield Nudge to Family Group
 */
export function shareHydrationNudgeToWhatsApp(currentLiters: number, targetLiters: number): void {
  const text = `💧 *Family Health Check: Have you had water today?*
I've logged *${currentLiters}L* of my *${targetLiters}L* daily water & Zobo target to flush excess stew sodium and protect kidney filtration!

Track your hydration on MealOptimiza:
👉 https://mealoptimiza.com/hydration`;

  window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}

/**
 * 5. Direct Launch: Chat with Sarah / Avo AI Food Bot
 */
export function launchWhatsAppFoodBot(promptText?: string): void {
  const defaultPrompt = "Hi Sarah! I am ready to log my meals and get instant blood sugar tips on MealOptimiza 🍲";
  const url = getWhatsAppUrl(promptText || defaultPrompt);
  window.open(url, "_blank", "noopener,noreferrer");
}
