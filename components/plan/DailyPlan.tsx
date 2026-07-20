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
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      if (data.days && Array.isArray(data.days) && data.days.length > 0) {
        setPlans(data.days);
        setDailyPlans(data.days);
      } else if (data.plan && typeof data.plan === "string") {
        const parsedPlans = parseTextPlan(data.plan, days, tripData.to, tripData.currency);
        setPlans(parsedPlans);
        setDailyPlans(parsedPlans);
      } else {
        throw new Error("No plan data received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
      const fallback = generateFallbackPlan(days, tripData.to, tripData.currency);
      setPlans(fallback);
      setDailyPlans(fallback);
    } finally {
      setLoading(false);
    }
  }, [tripData, days, setDailyPlans]);

  const parseTextPlan = (text: string, totalDays: number, city: string, currency: string): DayPlan[] => {
    const plans: DayPlan[] = [];
    const dayRegex = /(?:اليوم|Day)\s*[#]?(\d+)[:\s-]+/gi;
    const dayMatches = [...text.matchAll(dayRegex)];

    if (dayMatches.length === 0) {
      return createGenericPlan(totalDays, city, currency);
    }

    for (let i = 0; i < totalDays; i++) {
      const match = dayMatches[i];
      const startIdx = match ? match.index : 0;
      const endIdx = dayMatches[i + 1] ? dayMatches[i + 1].index : text.length;
      const dayText = text.slice(startIdx, endIdx);

      const lines = dayText.split("\n").map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0] || `يوم ${i + 1} في ${city}`;
      const title = titleLine.replace(/(?:اليوم|Day)\s*[#]?\d+[:\s-]+/i, "").trim() || `يوم ${i + 1}`;

      const activities: Activity[] = [];
      let activityId = 0;

      for (const line of lines.slice(1)) {
        const activitiesFromLine = parseActivityLine(line, currency, activityId, i, city);
        if (activitiesFromLine) {
          activities.push(...activitiesFromLine);
          activityId += activitiesFromLine.length;
        }
      }

      const date = new Date(tripData.departDate);
      date.setDate(date.getDate() + i);

      plans.push({
        day: i + 1,
        date: date.toISOString().split("T")[0],
        title,
        weather: "☀️ 28°C مشمس",
        activities,
      });
    }
    return plans;
  };

  const parseActivityLine = (
    line: string,
    currency: string,
    id: number,
    dayIndex: number,
    city: string
  ): Activity[] | null => {
    // Skip headers, intros, and cost summaries
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

    // Strip ALL markdown asterisks
    trimmed = trimmed.replace(/\*+/g, "").trim();
    if (!trimmed) return null;

    // Must start with a time OR bullet OR be a valid activity line
    const hasTime = /^\d{1,2}[:]\d{2}/.test(trimmed);
    const hasBullet = /^[-•]\s*/.test(trimmed);
    if (!hasTime && !hasBullet) return null;

    // Remove bullet prefix if present
    trimmed = trimmed.replace(/^[-•]\s*/, "").trim();

    // FIX #2: Split combined activities (e.g. "Tour. Lunch suggestion: ...")
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

    // Remove time from text
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

    // Clean up common prefixes
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
        activities: [],
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
        <Loader2 className="w-12 h-12 text-ocean animate-spin mb-4" />
        <p className="text-gray-500 font-medium">جاري إنشاء خطتك اليومية بالذكاء الاصطناعي...</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
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
          <h2 className="text-2xl font-bold text-gray-800">الخطة اليومية</h2>
          <p className="text-gray-500 mt-1">{tripData.to} | {days} أيام</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-ocean/10 text-ocean rounded-xl font-bold hover:bg-ocean hover:text-white transition-all"
          >
            <Sparkles className="w-4 h-4" />
            إعادة التخطيط
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-2 text-ocean font-bold hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error} — تم استخدام خطة افتراضية</span>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {plans.map((plan, index) => (
          <button
            key={plan.day}
            onClick={() => setActiveDay(index)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeDay === index
                ? "bg-ocean text-white shadow-lg shadow-ocean/25"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
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
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{plans[activeDay].title}</h3>
                  <p className="text-gray-500 mt-1">{formatDate(plans[activeDay].date)}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-ocean/5 rounded-xl">
                  <Sun className="w-5 h-5 text-warning" />
                  <span className="font-bold text-gray-700">{plans[activeDay].weather}</span>
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
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 group hover:shadow-card-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="w-12 h-12 rounded-xl bg-ocean/10 flex items-center justify-center text-ocean font-bold text-sm">
                        {activity.time}
                      </div>
                      <div className="w-0.5 h-full bg-gray-100 mt-2" />
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
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-ocean"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={activity.place}
                                  onChange={(e) => updateActivity(activeDay, activity.id, "place", e.target.value)}
                                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-ocean"
                                  placeholder="المكان"
                                />
                                <input
                                  type="number"
                                  value={activity.cost}
                                  onChange={(e) => updateActivity(activeDay, activity.id, "cost", parseInt(e.target.value) || 0)}
                                  className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-ocean"
                                  placeholder="التكلفة"
                                />
                              </div>
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-4 py-2 bg-ocean text-white rounded-xl text-sm font-bold"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-bold text-gray-800 text-lg">{activity.name}</h4>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {activity.place}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {activity.duration}
                                </span>
                                {activity.cost > 0 && (
                                  <span className="text-ocean font-bold">
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
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-ocean hover:text-white transition-all"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeActivity(activeDay, activity.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
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
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-ocean hover:text-ocean transition-all flex items-center justify-center gap-2"
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
        className="w-full mt-8 py-4 gradient-ocean text-white rounded-2xl font-bold text-lg shadow-lg shadow-ocean/25 hover:shadow-xl transition-all flex items-center justify-center gap-3"
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

function generateFallbackPlan(days: number, city: string, currency: string): DayPlan[] {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
    title: `يوم ${i + 1} في ${city}`,
    weather: "☀️ 28°C مشمس",
    activities: [],
  }));
}