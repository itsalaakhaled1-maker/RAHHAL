"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plane, Hotel, Utensils, Bus, ShoppingBag, Ticket, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, calculateNights } from "@/lib/utils";
import type { BudgetItem } from "@/types";

const defaultCategories = [
  { id: "flights", label: "الطيران", icon: "Plane", color: "#0288D1", percentage: 40 },
  { id: "hotels", label: "الإقامة", icon: "Hotel", color: "#00BCD4", percentage: 30 },
  { id: "food", label: "المطاعم", icon: "Utensils", color: "#FFD54F", percentage: 15 },
  { id: "transport", label: "التنقل", icon: "Bus", color: "#FF8A65", percentage: 8 },
  { id: "activities", label: "الأنشطة", icon: "Ticket", color: "#66BB6A", percentage: 5 },
  { id: "shopping", label: "التسوق", icon: "ShoppingBag", color: "#AB47BC", percentage: 2 },
];

const iconMap: Record<string, React.ElementType> = {
  Plane, Hotel, Utensils, Bus, Ticket, ShoppingBag,
};

export default function BudgetPlanner() {
  const { tripData, selectedFlight, selectedHotel, setBudgetItems, setCurrentStep } = useTripStore();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState(tripData.currency);

  const nights = calculateNights(tripData.departDate, tripData.returnDate);

  useEffect(() => {
    const initialItems: BudgetItem[] = defaultCategories.map((cat) => {
      let value = 0;
      if (cat.id === "flights" && selectedFlight) {
        value = selectedFlight.price * tripData.adults;
      } else if (cat.id === "hotels" && selectedHotel) {
        value = selectedHotel.totalPrice;
      } else {
        value = Math.round((tripData.budget * cat.percentage) / 100);
      }
      return {
        id: cat.id,
        label: cat.label,
        value,
        currency,
        icon: cat.icon,
        color: cat.color,
        percentage: cat.percentage,
      };
    });
    setItems(initialItems);
  }, []);

  useEffect(() => {
    const t = items.reduce((sum, item) => sum + item.value, 0);
    setTotal(t);
  }, [items]);

  const updateValue = (id: string, value: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const handleContinue = () => {
    setBudgetItems(items);
    setCurrentStep(4);
  };

  const remaining = tripData.budget - total;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مخطط الميزانية</h2>
          <p className="text-gray-500 mt-1">خصص ميزانيتك حسب احتياجاتك</p>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2 text-ocean font-bold hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          العودة للفنادق
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">الميزانية الكلية</p>
          <p className="text-2xl font-black text-gray-800">
            {formatCurrency(tripData.budget, currency)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">المصروفات</p>
          <p className="text-2xl font-black text-ocean">{formatCurrency(total, currency)}</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-card border ${remaining >= 0 ? "bg-success/5 border-success/20" : "bg-red-50 border-red-200"}`}>
          <p className="text-sm text-gray-500 mb-1">المتبقي</p>
          <p className={`text-2xl font-black ${remaining >= 0 ? "text-success" : "text-red-500"}`}>
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      {/* Budget Items */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] || DollarSign;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: item.color + "15" }}
                >
                  <Icon className="w-6 h-6" style={{ color: item.color }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">{item.label}</span>
                    <span className="font-black text-ocean">
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={tripData.budget}
                      value={item.value}
                      onChange={(e) => updateValue(item.id, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-100 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${(item.value / tripData.budget) * 100}%, #f3f4f6 ${(item.value / tripData.budget) * 100}%, #f3f4f6 100%)`,
                      }}
                    />
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateValue(item.id, parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-center outline-none focus:border-ocean"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        className="w-full mt-8 py-4 gradient-ocean text-white rounded-2xl font-bold text-lg shadow-lg shadow-ocean/25 hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        متابعة للخطة اليومية
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
