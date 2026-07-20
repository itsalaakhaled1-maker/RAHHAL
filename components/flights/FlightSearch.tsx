"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Users, Calendar, ArrowRightLeft, ChevronDown } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRouter } from "next/navigation";
import { getIataCode } from "@/lib/iata";

const currencies = [
  { code: "AED", label: "درهم إماراتي", symbol: "AED" },
  { code: "USD", label: "دولار أمريكي", symbol: "$" },
  { code: "EUR", label: "يورو", symbol: "€" },
  { code: "SAR", label: "ريال سعودي", symbol: "SAR" },
  { code: "TRY", label: "ليرة تركية", symbol: "₺" },
];

const travelClasses = [
  { value: "ECONOMY", label: "السياحية" },
  { value: "PREMIUM_ECONOMY", label: "السياحية المميزة" },
  { value: "BUSINESS", label: "رجال الأعمال" },
  { value: "FIRST", label: "الأولى" },
];

export default function FlightSearch() {
  const router = useRouter();
  const { tripData, setTripData, setCurrentStep } = useTripStore();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tripData.from.trim()) newErrors.from = "أدخل مدينة المغادرة";
    if (!tripData.to.trim()) newErrors.to = "أدخل مدينة الوصول";
    if (!tripData.departDate) newErrors.departDate = "اختر تاريخ المغادرة";
    if (tripType === "roundtrip" && !tripData.returnDate) newErrors.returnDate = "اختر تاريخ العودة";
    if (tripData.budget <= 0) newErrors.budget = "أدخل الميزانية";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validate()) return;

    setTripData({ tripType });

    const fromIata = getIataCode(tripData.from);
    const toIata = getIataCode(tripData.to);

    console.log(`[FlightSearch] Converting: "${tripData.from}" → "${fromIata}", "${tripData.to}" → "${toIata}"`);

    const params = new URLSearchParams({
      from: fromIata,
      to: toIata,
      depart: tripData.departDate,
      return: tripData.returnDate || tripData.departDate,
      adults: String(tripData.adults),
      budget: String(tripData.budget),
      currency: tripData.currency,
    });

    router.push(`/trip?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Trip Type Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg inline-flex gap-1 border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setTripType("roundtrip")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tripType === "roundtrip"
                ? "bg-ocean text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            ذهاب وعودة
          </button>
          <button
            onClick={() => setTripType("oneway")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tripType === "oneway"
                ? "bg-ocean text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            ذهاب فقط
          </button>
        </div>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 dark:border-gray-700/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* From */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">من</label>
            <div className="relative">
              <Plane className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean" />
              <input
                type="text"
                placeholder="مدينة المغادرة (مثال: دبي)"
                value={tripData.from}
                onChange={(e) => {
                  setTripData({ from: e.target.value });
                  setErrors((prev) => ({ ...prev, from: "" }));
                }}
                className={`w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-2xl text-gray-800 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none ${
                  errors.from ? "border-red-300 dark:border-red-500" : "border-gray-100 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
          </div>

          {/* Swap Button */}
          <div className="hidden md:flex md:col-span-1 items-end justify-center pb-3">
            <button
              onClick={() => {
                const temp = tripData.from;
                setTripData({ from: tripData.to, to: temp });
              }}
              className="w-10 h-10 rounded-xl bg-ocean/10 dark:bg-ocean/20 flex items-center justify-center text-ocean hover:bg-ocean hover:text-white transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">إلى</label>
            <div className="relative">
              <Plane className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean rotate-90" />
              <input
                type="text"
                placeholder="مدينة الوصول (مثال: نيويورك)"
                value={tripData.to}
                onChange={(e) => {
                  setTripData({ to: e.target.value });
                  setErrors((prev) => ({ ...prev, to: "" }));
                }}
                className={`w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-2xl text-gray-800 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none ${
                  errors.to ? "border-red-300 dark:border-red-500" : "border-gray-100 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
          </div>

          {/* Depart Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">المغادرة</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean" />
              <input
                type="date"
                value={tripData.departDate}
                onChange={(e) => {
                  setTripData({ departDate: e.target.value });
                  setErrors((prev) => ({ ...prev, departDate: "" }));
                }}
                className={`w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none ${
                  errors.departDate ? "border-red-300 dark:border-red-500" : "border-gray-100 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.departDate && <p className="text-red-500 text-xs mt-1">{errors.departDate}</p>}
          </div>

          {/* Return Date */}
          {tripType === "roundtrip" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">العودة</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean" />
                <input
                  type="date"
                  value={tripData.returnDate}
                  onChange={(e) => {
                    setTripData({ returnDate: e.target.value });
                    setErrors((prev) => ({ ...prev, returnDate: "" }));
                  }}
                  className={`w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none ${
                    errors.returnDate ? "border-red-300 dark:border-red-500" : "border-gray-100 dark:border-gray-600"
                  }`}
                />
              </div>
              {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>}
            </div>
          )}
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Passengers */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">المسافرين</label>
            <div className="relative">
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean" />
              <select
                value={tripData.adults}
                onChange={(e) => setTripData({ adults: parseInt(e.target.value) })}
                className="w-full pr-10 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n} className="dark:bg-gray-700 dark:text-white">
                    {n} {n === 1 ? "بالغ" : "بالغين"}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">درجة السفر</label>
            <div className="relative">
              <select
                value={tripData.travelClass}
                onChange={(e) => setTripData({ travelClass: e.target.value })}
                className="w-full pr-4 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none appearance-none"
              >
                {travelClasses.map((c) => (
                  <option key={c.value} value={c.value} className="dark:bg-gray-700 dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">العملة</label>
            <div className="relative">
              <select
                value={tripData.currency}
                onChange={(e) => setTripData({ currency: e.target.value })}
                className="w-full pr-4 pl-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none appearance-none"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code} className="dark:bg-gray-700 dark:text-white">
                    {c.symbol} — {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الميزانية المتوقعة</label>
            <div className="relative">
              <input
                type="number"
                placeholder="5000"
                value={tripData.budget || ""}
                onChange={(e) => {
                  setTripData({ budget: parseInt(e.target.value) || 0 });
                  setErrors((prev) => ({ ...prev, budget: "" }));
                }}
                className={`w-full pr-4 pl-16 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-2xl text-gray-800 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-ocean focus:ring-4 focus:ring-ocean/10 transition-all outline-none ${
                  errors.budget ? "border-red-300 dark:border-red-500" : "border-gray-100 dark:border-gray-600"
                }`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">
                {tripData.currency}
              </span>
            </div>
            {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="w-full mt-6 py-4 bg-ocean text-white rounded-2xl font-bold text-lg shadow-lg shadow-ocean/25 hover:shadow-xl hover:shadow-ocean/30 transition-all flex items-center justify-center gap-3"
        >
          <Plane className="w-6 h-6" />
          ابحث عن الرحلة
        </motion.button>
      </motion.div>
    </div>
  );
}