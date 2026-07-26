import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[AI Plan API] Request body:", body);

    const { city, days, budget, currency, travelers } = body;

    if (!city || !days || !budget) {
      return NextResponse.json(
        { error: "Missing required fields: city, days, budget" },
        { status: 400 }
      );
    }

    // ✅ نموذج أحدث + tokens أكثر
    const prompt = `أنت مخطط رحلات سياحية محترف ومختص. أنشئ خطة يومية مفصلة ومتوازنة لرحلة إلى ${city} لمدة ${days} أيام.

الميزانية المتاحة: ${budget} ${currency || "USD"}.
عدد المسافرين: ${travelers || 1} ${travelers && travelers > 1 ? "أشخاص" : "شخص"}.

⚠️ قواعد صارمة:
1. يجب أن تُنتج خطة لـ ${days} يوماً بالضبط — لا أكثر ولا أقل.
2. كل يوم يجب أن يبدأ بسطر: "اليوم [رقم]: [عنوان اليوم]"
3. يجب فصل كل يوم عن اليوم التالي بسطر فارغ.
4. لا تكرر أنشطة بين الأيام — كل يوم يجب أن يكون فريداً.
5. اقترح أماكن حقيقية ومشهورة في ${city}.
6. حدد أوقات محددة لكل نشاط (HH:MM).

تنسيق كل نشاط:
- HH:MM | اسم النشاط | المكان الدقيق في ${city}

تنسيق كل يوم:
اليوم 1: [عنوان اليوم]
- 08:00 | [نشاط] | [المكان]
- 10:00 | [نشاط] | [المكان]
- 12:00 | الغداء: [اسم المطعم] | [المكان]
- 14:00 | [نشاط] | [المكان]
- 19:00 | العشاء: [اسم المطعم] | [المكان]

اليوم 2: [عنوان اليوم]
... وهكذا حتى اليوم ${days}

أجب باللغة العربية الفصحى فقط.`;

    console.log("[AI Plan API] Calling Gemini...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: Math.min(8000, days * 300), // ✅ 300 token/يوم كحد أدنى
            temperature: 0.5, // ✅ أقل randomness
            topP: 0.95,
          },
        }),
      }
    );

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
    console.log("[AI Plan API] Gemini response keys:", Object.keys(data));

    // Check for safety blocks
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Content blocked by safety filters" },
        { status: 403 }
      );
    }

    const planText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!planText) {
      console.error("[AI Plan API] No plan text in response:", data);
      return NextResponse.json(
        { error: "No plan generated", raw: data },
        { status: 500 }
      );
    }

    // ✅ Validate: check if all days are present
    const dayMatches = [...planText.matchAll(/اليوم\s+(\d+)/g)];
    const foundDays = new Set(dayMatches.map(m => parseInt(m[1])));
    const expectedDays = new Set(Array.from({ length: days }, (_, i) => i + 1));

    const missingDays = [...expectedDays].filter(d => !foundDays.has(d));
    const duplicateDays = [...foundDays].filter((d, i, arr) => arr.indexOf(d) !== i);

    if (missingDays.length > 0) {
      console.warn("[AI Plan API] Missing days:", missingDays);
    }
    if (duplicateDays.length > 0) {
      console.warn("[AI Plan API] Duplicate days:", duplicateDays);
    }

    return NextResponse.json({
      plan: planText,
      source: "gemini",
      days: days,
      missingDays: missingDays.length > 0 ? missingDays : undefined,
      duplicateDays: duplicateDays.length > 0 ? duplicateDays : undefined,
    });

  } catch (error: any) {
    console.error("[AI Plan API] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", stack: error.stack },
      { status: 500 }
    );
  }
}