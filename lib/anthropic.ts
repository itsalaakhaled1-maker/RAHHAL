const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateTripPlan(params: {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travelers?: number;
  interests?: string[];
  travelClass?: string;
}) {
  try {
    const { destination, days, budget, currency, travelers, interests, travelClass } = params;

    const prompt = `أنت مخطط رحلات سياحية محترف ومختص. أنشئ خطة يومية مفصلة ومتوازنة لرحلة إلى ${destination} لمدة ${days} أيام.

الميزانية المتاحة: ${budget} ${currency}.
عدد المسافرين: ${travelers || 1} ${travelers && travelers > 1 ? "أشخاص" : "شخص"}.
${travelClass ? `درجة السفر: ${travelClass}.` : ""}
${interests?.length ? `الاهتمامات الخاصة: ${interests.join(", ")}.` : ""}

متطلبات الخطة:
- وزّع الأنشطة بذكاء بين الأيام مع مراعاة التنقل والراحة.
- اقترح أماكن حقيقية ومشهورة في ${destination}.
- حدد أوقات محددة لكل نشاط (صباح/ظهر/مساء).
- اقترح مطاعم محلية مشهورة للغداء والعشاء.
- قدّر التكلفة التقريبية لكل نشاط بالـ ${currency}.
- اقترح وسائل النقل بين الأماكن.
- خذ بعين الاعتبار الطقس والموسم.

قدم الخطة بالتنسيق التالي لكل يوم:

اليوم [رقم]: [عنوان يوم مميز]
- [الوقت] | [اسم النشاط] | [المكان] | [التكلفة التقريبية ${currency}]
- [الوقت] | [اسم النشاط] | [المكان] | [التكلفة التقريبية ${currency}]
- [الوقت] | الغداء: [اسم المطعم] | [نوع الأكل] | [التكلفة التقريبية ${currency}]
- [الوقت] | [اسم النشاط] | [المكان] | [التكلفة التقريبية ${currency}]
- [الوقت] | العشاء: [اسم المطعم] | [نوع الأكل] | [التكلفة التقريبية ${currency}]
التكلفة اليومية التقريبية: [المبلغ] ${currency}
نصيحة اليوم: [نصيحة ذكية]

في النهاية:
التكلفة الإجمالية التقريبية: [المبلغ] ${currency}
نصائح عامة: [3 نصائح مهمة]

أجب باللغة العربية الفصحى فقط. لا تستخدم أي لغة أخرى.`;

    // ✅ تغيير النموذج إلى gemini-2.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 64000, // ✅ زيادة للـ 65K
            temperature: 0.7,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Check for safety blocks
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      throw new Error("Content blocked by safety filters");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("AI Plan error:", error);
    throw error;
  }
}