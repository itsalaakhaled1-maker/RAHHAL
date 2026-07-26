import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, days, budget, currency, travelers } = body;

    if (!city || !days || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // ✅ prompt أقوى يمنع التكرار ويحث على التنوع
    const prompt = `أنت مخطط رحلات سياحية محترف ومختص. أنشئ خطة يومية مفصلة ومتوازنة لرحلة إلى ${city} لمدة ${days} أيام.

الميزانية المتاحة: ${budget} ${currency || "USD"}.
عدد المسافرين: ${travelers || 1} ${travelers && travelers > 1 ? "أشخاص" : "شخص"}.

⚠️ قواعد صارمة جداً:
1. يجب أن تُنتج خطة لـ ${days} يوماً بالضبط — لا أكثر ولا أقل.
2. كل يوم يجب أن يبدأ بسطر: "اليوم [رقم]: [عنوان اليوم الفريد]"
3. يجب فصل كل يوم عن اليوم التالي بسطر فارغ.
4. ⚠️⚠️⚠️ لا تكرر أي نشاط بين الأيام — كل يوم يجب أن يكون مختلف تماماً عن اليوم السابق.
5. اقترح أماكن حقيقية ومشهورة في ${city} مع أسماء محددة.
6. حدد أوقات محددة لكل نشاط (HH:MM).
7. ⚠️⚠️⚠️ اليوم 1 يختلف عن اليوم 2 يختلف عن اليوم 3... وهكذا حتى اليوم ${days}.
8. لا تستخدم "استكشاف ${city}" كاسم نشاط — اذكر اسم المكان الحقيقي.
9. لا تستخدم "مطعم محلي" كاسم مطعم — اذكر اسم المطعم الحقيقي.

تنسيق كل نشاط:
- HH:MM | اسم النشاط المحدد | المكان الدقيق في ${city}

مثال على تنوع الأيام:
اليوم 1: وصول واستكشاف أولي
- 08:00 | الوصول إلى مطار ${city} | المطار الدولي
- 10:00 | زيارة برج التوائم | وسط المدينة
- 14:00 | غداء في مطعم Madam Kwan's | شارع بوكيت بينتانج
- 19:00 | عشاء في Jalan Alor | سوق الشارع الليلي

اليوم 2: المعالم التاريخية
- 09:00 | زيارة مسجد السلطان صلاح الدين | جالان بيردان
- 11:00 | جولة في كهوف باتو | باتو كيفز
- 14:00 | غداء في Restoran Rebung Chef Ismail | وسط المدينة
- 19:00 | عشاء في Atmosphere 360 | برج كوالالمبور

... وهكذا حتى اليوم ${days} — كل يوم مختلف تماماً.

أجب باللغة العربية الفصحى فقط.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    console.log("[AI Plan API] Using model:", MODEL_NAME, "for", days, "days");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          // ✅ tokens أكثر بكثير — 64000 كحد أقصى للـ flash
          maxOutputTokens: 64000,
          temperature: 0.7, // ✅ زيادة التنوع
          topP: 0.95,
        },
      }),
    });

    console.log("[AI Plan API] Gemini status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Plan API] Gemini error:", errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Content blocked by safety filters" },
        { status: 403 }
      );
    }

    // ✅ تحقق من finishReason
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      console.warn("[AI Plan API] Response truncated due to MAX_TOKENS!");
    }

    const planText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!planText) {
      console.error("[AI Plan API] No plan text in response:", data);
      return NextResponse.json(
        { error: "No plan generated", raw: data },
        { status: 500 }
      );
    }

    // ✅ تحقق من عدد الأيام في الـ response
    const dayMatches = [...planText.matchAll(/اليوم\s+(\d+)\s*[:：]/g)];
    const foundDays = new Set(dayMatches.map(m => parseInt(m[1])));
    const expectedDays = new Set(Array.from({ length: days }, (_, i) => i + 1));

    const missingDays = [...expectedDays].filter(d => !foundDays.has(d));
    const duplicateDays = [...foundDays].filter((d, i, arr) => arr.indexOf(d) !== i);

    console.log("[AI Plan API] Found days:", [...foundDays].sort((a, b) => a - b));
    console.log("[AI Plan API] Missing days:", missingDays);
    console.log("[AI Plan API] Duplicate days:", duplicateDays);
    console.log("[AI Plan API] Finish reason:", finishReason);

    return NextResponse.json({
      plan: planText,
      source: MODEL_NAME,
      days: days,
      foundDaysCount: foundDays.size,
      missingDays: missingDays.length > 0 ? missingDays : undefined,
      duplicateDays: duplicateDays.length > 0 ? duplicateDays : undefined,
      truncated: finishReason === "MAX_TOKENS",
    });

  } catch (error: any) {
    console.error("[AI Plan API] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}