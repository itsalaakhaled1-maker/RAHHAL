"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Sun, ChevronLeft, ChevronRight, Loader2, Sparkles, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { DayPlan, Activity } from "@/types";

export default function DailyPlan() {
  const { tripData, dailyPlans, setDailyPlans, setCurrentStep } = useTripStore();
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const days = calculateDays(tripData.departDate, tripData.returnDate);

  useEffect(() => {
    if (dailyPlans && dailyPlans.length > 0) {
      setPlans(dailyPlans);
      setLoading(false);
    } else {
      generatePlan();
    }
  }, [dailyPlans]);

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: tripData.to,
          days,
          budget: tripData.budget,
          currency: tripData.currency,
          travelers: (tripData.adults || 1) + (tripData.children || 0),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // ✅ تحقق من truncated
      if (data.truncated) {
        console.warn("[DailyPlan] API response was truncated! Some days may be missing.");
      }

      let parsedPlans: DayPlan[];

      if (data.plan && typeof data.plan === "string") {
        parsedPlans = parseTextPlan(data.plan, days, tripData.to, tripData.currency);
      } else {
        throw new Error("No plan data received");
      }

      // ✅ تحقق من عدد الأيام
      if (parsedPlans.length !== days) {
        console.warn(`[DailyPlan] Expected ${days} days, got ${parsedPlans.length}`);
      }

      // ✅ تحقق من التنوع
      const allActivityNames = parsedPlans.flatMap(p => p.activities.map(a => a.name));
      const uniqueActivities = new Set(allActivityNames);
      console.log(`[DailyPlan] Total activities: ${allActivityNames.length}, Unique: ${uniqueActivities.size}`);

      setPlans(parsedPlans);
      setDailyPlans(parsedPlans);

    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
      // ❌ لا تستخدم fallback تلقائياً — اعرض الخطأ للمستخدم
    } finally {
      setLoading(false);
    }
  }, [tripData, days, setDailyPlans]);

  const parseTextPlan = (text: string, totalDays: number, city: string, currency: string): DayPlan[] => {
    const plans: DayPlan[] = [];
    
    // regex أقوى
    const dayRegex = /(?:^|\n\s*\n)\s*اليوم\s+(\d+)\s*[:：]\s*([^\n]+)/gim;
    const dayMatches = [...text.matchAll(dayRegex)];
    
    console.log(`[DailyPlan] Found ${dayMatches.length} days in response`);

    if (dayMatches.length === 0) {
      console.warn("[DailyPlan] No day matches found");
      return createGenericPlan(totalDays, city, currency);
    }

    const seenDays = new Set<number>();
    const seenActivities = new Set<string>(); // ✅ تتبع الأنشطة المكررة
    
    for (const match of dayMatches) {
      const dayNum = parseInt(match[1]);
      
      if (seenDays.has(dayNum)) continue;
      seenDays.add(dayNum);

      if (dayNum < 1 || dayNum > totalDays) continue;

      const startIdx = match.index || 0;
      const endIdx = dayMatches.find(m => parseInt(m[1]) === dayNum + 1)?.index || text.length;
      const dayText = text.slice(startIdx, endIdx).trim();

      const lines = dayText.split("\n").map(l => l.trim()).filter(Boolean);
      const title = match[2].trim() || `يوم ${dayNum} في ${city}`;

      const activities: Activity[] = [];
      let activityId = 0;

      for (const line of lines.slice(1)) {
        const activitiesFromLine = parseActivityLine(line, currency, activityId, dayNum - 1, city);
        if (activitiesFromLine) {
          for (const act of activitiesFromLine) {
            // ✅ رفض الأنشطة المكررة بين الأيام (ما عدا الوجبات)
            const activityKey = `${act.name}|${act.place}`;
            const isMeal = act.name.includes("عشاء") || act.name.includes("غداء") || act.name.includes("فطور") || act.name.includes("إفطار");
            if (seenActivities.has(activityKey) && !isMeal) {
              console.warn(`[DailyPlan] Skipping duplicate activity: ${act.name} at ${act.place}`);
              continue;
            }
            if (!isMeal) seenActivities.add(activityKey);
            activities.push(act);
          }
          activityId += activitiesFromLine.length;
        }
      }

      // ✅ لو يوم فاضي أو فيه أنشطة قليلة، أضف fallback متنوع
      if (activities.length < 2) {
        console.warn(`[DailyPlan] Day ${dayNum} has too few activities, adding varied fallback`);
        const fallbackActs = generateVariedFallback(dayNum, city, currency, seenActivities);
        activities.push(...fallbackActs);
      }

      const date = new Date(tripData.departDate);
      date.setDate(date.getDate() + (dayNum - 1));

      plans.push({
        day: dayNum,
        date: date.toISOString().split("T")[0],
        title,
        weather: "☀️ 28°C مشمس",
        activities,
      });
    }

    // أضف أيام ناقصة مع fallback متنوع
    for (let i = 1; i <= totalDays; i++) {
      if (!seenDays.has(i)) {
        console.warn(`[DailyPlan] Adding missing day ${i} with varied fallback`);
        const date = new Date(tripData.departDate);
        date.setDate(date.getDate() + (i - 1));
        
        plans.push({
          day: i,
          date: date.toISOString().split("T")[0],
          title: `يوم ${i} في ${city}`,
          weather: "☀️ 28°C مشمس",
          activities: generateVariedFallback(i, city, currency, seenActivities),
        });
      }
    }

    plans.sort((a, b) => a.day - b.day);
    return plans;
  };

  // ✅ أنشطة fallback متنوعة حسب رقم اليوم
  function generateVariedFallback(dayNum: number, city: string, currency: string, seenActivities: Set<string>): Activity[] {
    const variedActivities: Activity[] = [];
    
    const morningActivities = [
      { name: `جولة في حديقة ${city} الوطنية`, place: `حديقة ${city} الوطنية` },
      { name: `زيارة المتحف الوطني`, place: `المتحف الوطني في ${city}` },
      { name: `جولة في سوق ${city} التقليدي`, place: `سوق ${city} القديم` },
      { name: `زيارة برج ${city} الشهير`, place: `برج ${city}` },
      { name: `جولة في حديقة الحيوان`, place: `حديقة حيوان ${city}` },
      { name: `زيارة المسجد الكبير`, place: `المسجد الكبير في ${city}` },
      { name: `جولة في شارع التسوق الرئيسي`, place: `شارع التسوق الرئيسي` },
      { name: `زيارة قصر الثقافة`, place: `قصر الثقافة في ${city}` },
      { name: `جولة في الحديقة المائية`, place: `الحديقة المائية` },
      { name: `زيارة المعرض العلمي`, place: `المعرض العلمي في ${city}` },
    ];
    
    const afternoonActivities = [
      { name: `زيارة معرض الفنون`, place: `معرض الفنون في ${city}` },
      { name: `جولة في الحديقة النباتية`, place: `الحديقة النباتية` },
      { name: `زيارة قلعة ${city} التاريخية`, place: `قلعة ${city}` },
      { name: `جولة في مركز التسوق`, place: `مركز التسوق الرئيسي` },
      { name: `زيارة حوض الأسماك`, place: `حوض أسماك ${city}` },
      { name: `جولة في حديقة الملاهي`, place: `حديقة الملاهي` },
      { name: `زيارة المكتبة الوطنية`, place: `المكتبة الوطنية` },
      { name: `جولة في المنتزه البحري`, place: `المنتزه البحري` },
      { name: `زيارة مركز الفنون`, place: `مركز الفنون في ${city}` },
      { name: `جولة في الغابة المحمية`, place: `الغابة المحمية` },
    ];
    
    const eveningActivities = [
      { name: `عشاء في مطعم ${city} الشهير`, place: `مطعم ${city} الشهير` },
      { name: `عشاء في سوق الليل`, place: `سوق الليل في ${city}` },
      { name: `عشاء في المطعم العائم`, place: `المطعم العائم` },
      { name: `عشاء في المطعم الدوار`, place: `المطعم الدوار` },
      { name: `عشاء في مطعم الشاطئ`, place: `مطعم الشاطئ` },
      { name: `عشاء في المطعم التقليدي`, place: `المطعم التقليدي` },
    ];
    
    const morning = morningActivities[dayNum % morningActivities.length];
    const afternoon = afternoonActivities[dayNum % afternoonActivities.length];
    const evening = eveningActivities[dayNum % eveningActivities.length];
    
    variedActivities.push(
      { id: `act-${dayNum}-0`, time: "10:00", name: morning.name, place: morning.place, type: "معالم", duration: "2 س", cost: 0, currency, icon: "fa-mosque" },
      { id: `act-${dayNum}-1`, time: "14:00", name: afternoon.name, place: afternoon.place, type: "معالم", duration: "2 س", cost: 0, currency, icon: "fa-mosque" },
      { id: `act-${dayNum}-2`, time: "19:00", name: evening.name, place: evening.place, type: "طعام", duration: "1.5 س", cost: 0, currency, icon: "fa-utensils" },
    );
    
    return variedActivities;
  }

  const parseActivityLine = (
    line: string,
    currency: string,
    id: number,
    dayIndex: number,
    city: string
  ): Activity[] | null => {
    const skipPatterns = [
      /^[#*]+/,
      /أهلاً بك/i,
      /إليك الخطة/i,
      /التكلفة اليومية/i,
      /التكلفة الإجمالية/i,
      /^-{3,}$/,
    ];
    if (skipPatterns.some(p => p.test(line))) return null;

    let trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return null;

    trimmed = trimmed.replace(/\*+/g, "").trim();
    if (!trimmed) return null;

    const hasTime = /^\d{1,2}[:]\d{2}/.test(trimmed);
    const hasBullet = /^[-•]\s*/.test(trimmed);
    if (!hasTime && !hasBullet) return null;

    trimmed = trimmed.replace(/^[-•]\s*/, "").trim();

    const splitPatterns = [
      /الغداء المقترح\s*[:：]\s*/i,
      /العشاء المقترح\s*[:：]\s*/i,
      /المقترح\s*[:：]\s*/i,
      /طعام مقترح\s*[:：]\s*/i,
    ];

    for (const pattern of splitPatterns) {
      if (pattern.test(trimmed)) {
        const parts = trimmed.split(pattern);
        if (parts.length >= 2) {
          const firstPart = parts[0].trim();
          const secondPart = parts[1].trim();
          const firstActivity = buildActivity(firstPart, currency, id, dayIndex, city);
          const secondActivity = buildActivity(secondPart, currency, id + 1, dayIndex, city);
          const result: Activity[] = [];
          if (firstActivity) result.push(firstActivity);
          if (secondActivity) {
            secondActivity.type = "طعام";
            result.push(secondActivity);
          }
          return result.length > 0 ? result : null;
        }
      }
    }

    const activity = buildActivity(trimmed, currency, id, dayIndex, city);
    return activity ? [activity] : null;
  };

  const buildActivity = (
    text: string,
    currency: string,
    id: number,
    dayIndex: number,
    city: string
  ): Activity | null => {
    let trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return null;

    const timeMatch = trimmed.match(/^(\d{1,2}[:]\d{2})\s*/);
    const time = timeMatch ? timeMatch[1] : getDefaultTime(id);

    trimmed = trimmed.replace(/^(\d{1,2}[:]\d{2})\s*/, "").trim();

    let type = "معالم";
    const lower = trimmed.toLowerCase();
    if (lower.includes("فطور") || lower.includes("إفطار") || lower.includes("غداء") || lower.includes("عشاء") || lower.includes("طعام") || lower.includes("مطعم") || lower.includes("كابوريا") || lower.includes("لوبستر") || lower.includes("إيطالي")) {
      type = "طعام";
    } else if (lower.includes("تسوق") || lower.includes("سوق") || lower.includes("مول")) {
      type = "تسوق";
    } else if (lower.includes("راحة") || lower.includes("استرخاء") || lower.includes("شاطئ")) {
      type = "راحة";
    } else if (lower.includes("تنقل") || lower.includes("مواصلات") || lower.includes("مترو") || lower.includes("ركوب") || lower.includes("عبارة")) {
      type = "تنقل";
    }

    let name = trimmed;
    let place = city;

    const inMatch = trimmed.match(/(.+?)\s+(?:في|at)\s+(.+)/i);
    if (inMatch) {
      name = inMatch[1].trim();
      place = inMatch[2].trim();
    }

    name = name
      .replace(/^جولة\s*[:：]\s*/i, "جولة: ")
      .replace(/^زيارة\s*[:：]\s*/i, "زيارة ")
      .replace(/^الصباح[:：]\s*/i, "")
      .replace(/^الظهر[:：]\s*/i, "")
      .replace(/^المساء[:：]\s*/i, "")
      .trim();

    if (name.length < 2) return null;

    return {
      id: `act-${dayIndex}-${id}`,
      time,
      name: name.length > 3 ? name : "نشاط",
      place,
      type,
      duration: type === "طعام" ? "1.5 س" : "2 س",
      cost: 0,
      currency,
      icon: type === "طعام" ? "fa-utensils" : type === "تسوق" ? "fa-shopping-bag" : type === "تنقل" ? "fa-ship" : "fa-mosque",
    };
  };

  const getDefaultTime = (index: number): string => {
    const times = ["08:00", "10:00", "12:00", "14:00", "16:00", "19:00", "21:00"];
    return times[index % times.length];
  };

  const createGenericPlan = (totalDays: number, city: string, currency: string): DayPlan[] => {
    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(tripData.departDate);
      date.setDate(date.getDate() + i);
      return {
        day: i + 1,
        date: date.toISOString().split("T")[0],
        title: `يوم ${i + 1} في ${city}`,
        weather: "☀️ 28°C مشمس",
        activities: generateVariedFallback(i + 1, city, currency, new Set()),
      };
    });
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      time: "12:00",
      name: "نشاط جديد",
      place: "المكان",
      type: "معالم",
      duration: "1 س",
      cost: 0,
      currency: tripData.currency,
      icon: "fa-mosque",
    };
    const updated = [...plans];
    updated[dayIndex].activities.push(newActivity);
    setPlans(updated);
    setDailyPlans(updated);
  };

  const removeActivity = (dayIndex: number, activityId: string) => {
    const updated = [...plans];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((a) => a.id !== activityId);
    setPlans(updated);
    setDailyPlans(updated);
  };

  const updateActivity = (dayIndex: number, activityId: string, field: keyof Activity, value: any) => {
    const updated = [...plans];
    const activity = updated[dayIndex].activities.find((a) => a.id === activityId);
    if (activity) {
      (activity as any)[field] = value;
      setPlans(updated);
      setDailyPlans(updated);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-[var(--color-primary-500)] animate-spin mb-4" />
        <p className="text-[var(--text-muted)] font-medium">جاري إنشاء خطتك اليومية بالذكاء الاصطناعي...</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-muted)]">
          <Sparkles className="w-4 h-4" />
          <span>Gemini يخطط لرحلتك</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-heading)]">الخطة اليومية</h2>
          <p className="text-[var(--text-muted)] mt-1">{tripData.to} | {days} أيام</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-xl font-bold hover:bg-[var(--color-primary-500)] hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4" />
            إعادة التخطيط
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-2 text-[var(--color-primary-500)] font-bold hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-2xl flex items-center gap-3 text-[var(--color-danger)]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {plans.map((plan, index) => (
          <button
            key={plan.day}
            onClick={() => setActiveDay(index)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeDay === index
                ? "bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/25"
                : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            }`}
          >
            <div className="flex flex-col items-center">
              <span>اليوم {plan.day}</span>
              <span className="text-xs opacity-70">{formatDate(plan.date)}</span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {plans[activeDay] && (
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="search-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-heading)]">{plans[activeDay].title}</h3>
                  <p className="text-[var(--text-muted)] mt-1">{formatDate(plans[activeDay].date)}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)]/5 rounded-xl">
                  <Sun className="w-5 h-5 text-[var(--color-secondary-500)]" />
                  <span className="font-bold text-[var(--text-secondary)]">{plans[activeDay].weather}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {plans[activeDay].activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="search-card p-5 group hover:shadow-card-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center text-[var(--color-primary-500)] font-bold text-sm">
                        {activity.time}
                      </div>
                      <div className="w-0.5 h-full bg-[var(--border-subtle)] mt-2" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {editingActivity === activity.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={activity.name}
                                onChange={(e) => updateActivity(activeDay, activity.id, "name", e.target.value)}
                                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary-500)]"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={activity.place}
                                  onChange={(e) => updateActivity(activeDay, activity.id, "place", e.target.value)}
                                  className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary-500)]"
                                  placeholder="المكان"
                                />
                                <input
                                  type="number"
                                  value={activity.cost}
                                  onChange={(e) => updateActivity(activeDay, activity.id, "cost", parseInt(e.target.value) || 0)}
                                  className="w-24 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary-500)]"
                                  placeholder="التكلفة"
                                />
                              </div>
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-bold"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-bold text-[var(--text-primary)] text-lg">{activity.name}</h4>
                              <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {activity.place}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {activity.duration}
                                </span>
                                {activity.cost > 0 && (
                                  <span className="text-[var(--color-primary-500)] font-bold">
                                    {formatCurrency(activity.cost, activity.currency)}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingActivity(activity.id)}
                            className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--color-primary-500)] hover:text-white transition-all"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeActivity(activeDay, activity.id)}
                            className="w-8 h-8 rounded-lg bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => addActivity(activeDay)}
                className="w-full py-4 border-2 border-dashed border-[var(--border-medium)] rounded-2xl text-[var(--text-muted)] font-bold hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة نشاط
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCurrentStep(5)}
        className="w-full mt-8 py-4 bg-[var(--color-primary-500)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--color-primary-500)]/25 hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        مراجعة الرحلة
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}