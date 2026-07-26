"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plane, Hotel, Utensils, Bus, ShoppingBag, Ticket, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, calculateNights } from "@/lib/utils";
import type { BudgetItem } from "@/types";

const defaultCategories = [
  { id: "flights", label: "الطيران", icon: "Plane", color: "#0C4938", percentage: 40 },
  { id: "hotels", label: "الإقامة", icon: "Hotel", color: "#C9944D", percentage: 30 },
  { id: "food", label: "المطاعم", icon: "Utensils", color: "#4A7C6F", percentage: 15 },
  { id: "transport", label: "التنقل", icon: "Bus", color: "#D79B44", percentage: 8 },
  { id: "activities", label: "الأنشطة", icon: "Ticket", color: "#2E7D52", percentage: 5 },
  { id: "shopping", label: "التسوق", icon: "ShoppingBag", color: "#876031", percentage: 2 },
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
          <h2 className="text-2xl font-bold text-[var(--text-heading)]">مخطط الميزانية</h2>
          <p className="text-[var(--text-muted)] mt-1">خصص ميزانيتك حسب احتياجاتك</p>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2 text-[var(--color-primary-500)] font-bold hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          العودة للفنادق
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">الميزانية الكلية</p>
          <p className="text-2xl font-black text-[var(--text-heading)]">
            {formatCurrency(tripData.budget, currency)}
          </p>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">المصروفات</p>
          <p className="text-2xl font-black text-[var(--color-primary-500)]">{formatCurrency(total, currency)}</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-card border ${remaining >= 0 ? "bg-[var(--color-success)]/5 border-[var(--color-success)]/20" : "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/20"}`}>
          <p className="text-sm text-[var(--text-muted)] mb-1">المتبقي</p>
          <p className={`text-2xl font-black ${remaining >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
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
              className="bg-[var(--bg-surface)] rounded-2xl p-5 shadow-card border border-[var(--border-subtle)]"
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
                    <span className="font-bold text-[var(--text-heading)]">{item.label}</span>
                    <span className="font-black text-[var(--color-primary-500)]">
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
                      className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${(item.value / tripData.budget) * 100}%, var(--bg-secondary) ${(item.value / tripData.budget) * 100}%, var(--bg-secondary) 100%)`,
                      }}
                    />
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateValue(item.id, parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-xl text-sm font-bold text-center outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
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
        className="w-full mt-8 py-4 btn-primary text-white rounded-2xl font-bold text-lg shadow-gold hover:shadow-card-lg transition-all flex items-center justify-center gap-3"
      >
        متابعة للخطة اليومية
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}