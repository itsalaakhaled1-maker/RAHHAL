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

    const prompt = `أنت مخطط رحلات محترف. أنشئ خطة يومية مفصلة لرحلة إلى ${city} لمدة ${days} أيام.
الميزانية المتاحة: ${budget} ${currency || "USD"}.
${travelers ? `عدد المسافرين: ${travelers}` : ""}

قدم الخطة بالتنسيق التالي لكل يوم:
اليوم 1: [عنوان اليوم]
- الصباح: [نشاط]
- الظهر: [نشاط + مطعم مقترح]
- المساء: [نشاط + عشاء مقترح]
- التكلفة اليومية: [المبلغ]

أجب باللغة العربية فقط.`;

    console.log("[AI Plan API] Calling Gemini...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
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

    const planText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!planText) {
      console.error("[AI Plan API] No plan text in response:", data);
      return NextResponse.json(
        { error: "No plan generated", raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: planText, source: "gemini" });

  } catch (error: any) {
    console.error("[AI Plan API] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", stack: error.stack },
      { status: 500 }
    );
  }
}