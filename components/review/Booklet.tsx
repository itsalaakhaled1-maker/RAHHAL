"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Plane, Hotel, DollarSign, CalendarDays, Users, MapPin, Clock, X, Printer } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatCurrency, formatDate, calculateNights } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

export default function Booklet({ onClose }: Props) {
  const { tripData, selectedFlight, selectedHotel, dailyPlans, budgetItems } = useTripStore();
  const printRef = useRef<HTMLDivElement>(null);

  const nights = calculateNights(tripData.departDate, tripData.returnDate);
  const totalCost = budgetItems.reduce((sum, item) => sum + item.value, 0);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى السماح بفتح النوافذ المنبثقة للطباعة");
      return;
    }

    let styles = "";
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            styles += rule.cssText + "\n";
          }
        } catch {}
      }
    } catch {
      console.warn("Could not gather all styles");
    }

    const content = printRef.current?.innerHTML || "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>كتيب الرحلة — ${tripData.to}</title>
        <style>
          ${styles}
          @media print {
            @page { margin: 15mm; size: A4; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { background: white !important; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; break-before: page; }
            .shadow-lg, .shadow-2xl, .shadow-card, .shadow-card-lg { box-shadow: none !important; }
            .gradient-hakim { background: var(--color-primary-500) !important; }
          }
          body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; direction: rtl; }
          .print-wrapper { max-width: 210mm; margin: 0 auto; padding: 10mm; }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${content}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            }, 600);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-surface)] rounded-3xl shadow-card-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] no-print">
          <h2 className="text-xl font-bold text-[var(--text-heading)]">كتيب الرحلة</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="w-10 h-10 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] hover:text-white transition-all"
              title="طباعة"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-all"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booklet Content */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-8 print:p-0 bg-[var(--bg-surface)]">
          {/* Cover */}
          <div className="text-center mb-12 print:mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-500)] flex items-center justify-center mx-auto mb-4 shadow-card">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[var(--text-heading)] mb-2">كتيب الرحلة</h1>
            <p className="text-xl text-[var(--color-primary-500)] font-bold">
              {tripData.from} → {tripData.to}
            </p>
            <p className="text-[var(--text-muted)] mt-2">
              {formatDate(tripData.departDate)} - {formatDate(tripData.returnDate)}
            </p>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-4 gap-4 mb-12 print:mb-8">
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
              <Users className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="font-bold text-[var(--text-primary)]">{tripData.adults + tripData.children}</p>
              <p className="text-xs text-[var(--text-muted)]">مسافر</p>
            </div>
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
              <CalendarDays className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="font-bold text-[var(--text-primary)]">{nights}</p>
              <p className="text-xs text-[var(--text-muted)]">ليلة</p>
            </div>
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
              <MapPin className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="font-bold text-[var(--text-primary)]">{dailyPlans.length}</p>
              <p className="text-xs text-[var(--text-muted)]">يوم</p>
            </div>
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
              <DollarSign className="w-6 h-6 text-[var(--color-primary-500)] mx-auto mb-2" />
              <p className="font-bold text-[var(--color-primary-500)]">{formatCurrency(totalCost, tripData.currency)}</p>
              <p className="text-xs text-[var(--text-muted)]">التكلفة</p>
            </div>
          </div>

          {/* Flight */}
          {selectedFlight && (
            <div className="mb-8 print:mb-6">
              <h2 className="text-xl font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-[var(--color-primary-500)]" />
                تفاصيل الرحلة
              </h2>
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-[var(--text-primary)]">{selectedFlight.airline}</p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {selectedFlight.fromCode} → {selectedFlight.toCode}
                    </p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {selectedFlight.departureTime} - {selectedFlight.arrivalTime} | {selectedFlight.duration}
                    </p>
                  </div>
                  <p className="text-xl font-black text-[var(--color-primary-500)]">
                    {formatCurrency(selectedFlight.price * tripData.adults, selectedFlight.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hotel */}
          {selectedHotel && (
            <div className="mb-8 print:mb-6">
              <h2 className="text-xl font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-[var(--color-primary-500)]" />
                تفاصيل الإقامة
              </h2>
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-[var(--text-primary)]">{selectedHotel.name}</p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {selectedHotel.stars} نجوم | {nights} ليلة
                    </p>
                    <p className="text-[var(--text-muted)] text-sm">{selectedHotel.area}</p>
                  </div>
                  <p className="text-xl font-black text-[var(--color-primary-500)]">
                    {formatCurrency(selectedHotel.totalPrice, selectedHotel.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Daily Plan */}
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--color-primary-500)]" />
              الخطة اليومية
            </h2>
            <div className="space-y-6">
              {dailyPlans.map((day, idx) => (
                <div
                  key={day.day}
                  className={`border-r-2 border-[var(--color-primary-500)]/20 pr-6 ${idx > 0 ? "page-break pt-6" : ""}`}
                >
                  <h3 className="font-bold text-[var(--text-primary)] mb-3">
                    اليوم {day.day}: {day.title}
                  </h3>
                  <div className="space-y-3">
                    {day.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-16 text-sm font-bold text-[var(--color-primary-500)] text-left">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-primary)]">{activity.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {activity.place} | {activity.duration}
                            {activity.cost > 0 && ` | ${formatCurrency(activity.cost, activity.currency)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          {budgetItems.length > 0 && (
            <div className="mb-8 print:mb-6">
              <h2 className="text-xl font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--color-primary-500)]" />
                تفاصيل الميزانية
              </h2>
              <div className="space-y-2">
                {budgetItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatCurrency(item.value, item.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3">
                  <span className="font-bold text-[var(--text-primary)] text-lg">الإجمالي</span>
                  <span className="text-2xl font-black text-[var(--color-primary-500)]">
                    {formatCurrency(totalCost, tripData.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-[var(--text-muted)] text-sm">
              تم إنشاء هذا الكتيب بواسطة الرحّال | Al-Rahhal
            </p>
            <p className="text-[var(--text-muted)] text-xs mt-1">
              {new Date().toLocaleDateString("ar-SA")}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}