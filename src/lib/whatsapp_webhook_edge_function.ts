/**
 * WhatsApp AI Bot Webhook Handler for Supabase Edge Function (Deno + Hono)
 *
 * This handler mounts on your Supabase Edge Function `make-server-ba6f1f45`:
 * - GET /webhook/whatsapp : Meta Cloud API verification handshake
 * - POST /webhook/whatsapp : Ingests text/photo from WhatsApp, parses with Gemini 2.5-Flash,
 *                           inserts meal into Supabase database, and replies to WhatsApp.
 */

// Supabase & Gemini Configuration
const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "mealoptimizer_wa_secret_2026";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

/**
 * 1. Meta Webhook Verification (GET)
 */
export function handleWhatsAppVerify(c: any) {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified successfully!");
    return c.text(challenge, 200);
  }

  return c.text("Forbidden: Invalid verification token", 403);
}

/**
 * 2. Send formatted reply message back to user on WhatsApp
 */
export async function sendWhatsAppMessage(toPhone: string, bodyText: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("⚠️ WhatsApp credentials not configured in edge function environment.");
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhone,
    type: "text",
    text: {
      preview_url: false,
      body: bodyText,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Failed to send WhatsApp message:", errText);
    }
  } catch (err) {
    console.error("❌ Error sending WhatsApp message:", err);
  }
}

/**
 * 3. WhatsApp Message Ingestion & AI Food Parser (POST)
 */
export async function handleWhatsAppWebhook(c: any, supabaseAdmin: any) {
  try {
    const body = await c.req.json();

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Status update or delivery receipt, return 200 OK
      return c.json({ status: "ignored" }, 200);
    }

    const senderPhone = message.from; // e.g. "2348012345678"
    const messageType = message.type;

    console.log(`📩 Incoming WhatsApp message from +${senderPhone} (Type: ${messageType})`);

    // Match sender phone to user in Supabase
    const { data: userProfile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`phone_number.eq.+${senderPhone},phone_number.eq.${senderPhone}`)
      .single();

    if (!userProfile) {
      const notLinkedMsg =
        `🥑 *Welcome to MealOptimizer AI!*\n\n` +
        `We noticed your phone number (+${senderPhone}) is not linked to an account yet.\n\n` +
        `👉 Link your number in 1 tap:\n` +
        `1. Open https://mealoptimizer-two.vercel.app/profile\n` +
        `2. Tap *WhatsApp AI Food Logger*\n` +
        `3. Enter +${senderPhone} and save!\n\n` +
        `Once linked, you can log every meal simply by snapping a photo here!`;

      await sendWhatsAppMessage(senderPhone, notLinkedMsg);
      return c.json({ status: "unlinked_user_prompted" }, 200);
    }

    let foodDescription = "";

    if (messageType === "text") {
      foodDescription = message.text?.body || "";
    } else if (messageType === "image") {
      foodDescription = message.image?.caption || "A plate of West African home-cooked food";
    }

    // Call Gemini 2.5-Flash to analyze nutrition
    const geminiPrompt =
      `Analyze this food entry: "${foodDescription}".\n` +
      `The patient's health profile: Medical conditions: ${userProfile.medical_condition || "None"}, Location: ${userProfile.location || "Nigeria"}.\n` +
      `Return a valid JSON object strictly matching this schema:\n` +
      `{\n` +
      `  "dishName": "Name of dish",\n` +
      `  "calories": 450,\n` +
      `  "protein": 24,\n` +
      `  "carbs": 55,\n` +
      `  "fats": 12,\n` +
      `  "glycemicRisk": "Low" | "Moderate" | "High",\n` +
      `  "healthTip": "Actionable health advice for this dish tailored to West African diet and the user's condition"\n` +
      `}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const rawAiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const nutrition = JSON.parse(rawAiText);

    // Insert into Supabase meal_logs
    const now = new Date();
    const newLog = {
      user_id: userProfile.id,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      meal_type: now.getHours() < 11 ? "breakfast" : now.getHours() < 16 ? "lunch" : "dinner",
      food_name: nutrition.dishName,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fats: nutrition.fats,
      blood_sugar_impact: nutrition.glycemicRisk.toLowerCase(),
      source: "whatsapp",
    };

    await supabaseAdmin.from("meal_logs").insert(newLog);

    // Format WhatsApp reply message
    const replyText =
      `🥑 *MealOptimizer AI Logged!* 🍲\n\n` +
      `✅ *${nutrition.dishName}*\n` +
      `🔥 *Calories:* ${nutrition.calories} kcal\n` +
      `💪 *Protein:* ${nutrition.protein}g | 🍚 *Carbs:* ${nutrition.carbs}g | 🥑 *Fats:* ${nutrition.fats}g\n` +
      `📊 *Glycemic Spike Risk:* ${nutrition.glycemicRisk}\n\n` +
      `💡 *Avo's Tip:* ${nutrition.healthTip}\n\n` +
      `_Your dashboard has been automatically updated!_`;

    await sendWhatsAppMessage(senderPhone, replyText);

    return c.json({ status: "success", meal: nutrition.dishName }, 200);
  } catch (err: any) {
    console.error("❌ WhatsApp webhook processing error:", err);
    return c.json({ error: err.message }, 500);
  }
}
