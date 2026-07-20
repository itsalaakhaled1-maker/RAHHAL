const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateTripPlan(params: {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  interests?: string[];
}) {
  try {
    const { destination, days, budget, currency, interests } = params;

    const prompt = `أنت مخطط رحلات محترف. أنشئ خطة يومية مفصلة لرحلة إلى ${destination} لمدة ${days} أيام.
الميزانية المتاحة: ${budget} ${currency}.
${interests?.length ? `الاهتمامات: ${interests.join(", ")}` : ""}

قدم الخطة بالتنسيق التالي لكل يوم:
- اليوم [رقم]: [عنوان]
- الصباح: [نشاط]
- الظهر: [نشاط + مطعم مقترح]
- المساء: [نشاط + عشاء مقترح]
- تقدير التكلفة اليومية

أجب باللغة العربية فقط.`;

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("AI Plan error:", error);
    throw error;
  }
}