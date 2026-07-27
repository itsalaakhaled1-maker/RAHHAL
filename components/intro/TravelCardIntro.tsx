"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, X, MapPin, Calendar, Clock, Armchair, QrCode, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface TravelCardIntroProps {
  onClose: () => void;
}

const getSuggestedDestination = () => {
  const hour = new Date().getHours();
  const destinations = [
    { city: "باريس", code: "CDG", country: "فرنسا", date: "15 أغسطس", gate: "A12", seat: "14F", temp: "18°C", image: "🗼" },
    { city: "طوكيو", code: "NRT", country: "اليابان", date: "22 سبتمبر", gate: "B7", seat: "8A", temp: "22°C", image: "🗾" },
    { city: "ماليه", code: "MLE", country: "المالديف", date: "10 أكتوبر", gate: "C3", seat: "2K", temp: "30°C", image: "🏝️" },
    { city: "إسطنبول", code: "IST", country: "تركيا", date: "5 نوفمبر", gate: "D15", seat: "22C", temp: "25°C", image: "🕌" },
  ];
  return destinations[hour % destinations.length];
};

export default function TravelCardIntro({ onClose }: TravelCardIntroProps) {
  const [show, setShow] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [destination] = useState(getSuggestedDestination());
  const router = useRouter();

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 1500);
    const closeTimer = setTimeout(() => handleClose(), 7000);
    return () => {
      clearTimeout(flipTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 500);
  };

  const handleExplore = () => {
    handleClose();
    router.push(`/?to=${destination.city}`);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 400, rotateX: 60, scale: 0.6 }}
            animate={{ y: 0, rotateX: 0, scale: 1 }}
            exit={{ y: -400, rotateX: -60, scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
            className="relative w-[380px] perspective-1000"
            onClick={(e) => e.stopPropagation()}
          >
            {/* التذكرة 3D */}
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full preserve-3d"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* ═══════════════════════════════════════
                  الوجه الأمامي — شكل التذكرة الخارجي
                  ═══════════════════════════════════════ */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-full bg-[var(--color-primary-500)] rounded-3xl overflow-hidden shadow-2xl">
                  {/* الشريط العلوي */}
                  <div className="h-3 bg-[var(--color-secondary-500)]" />
                  
                  {/* المحتوى */}
                  <div className="p-8 pt-10 pb-12 relative">
                    {/* ثقوب التذكرة */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50" />
                    
                    {/* الخط المنقط */}
                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-[var(--color-cream-100)]/20" />

                    {/* الشعار */}
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-cream-100)]/10 flex items-center justify-center">
                          <Plane className="w-5 h-5 text-[var(--color-cream-100)]" />
                        </div>
                        <div>
                          <p className="text-[var(--color-cream-100)] font-black text-lg leading-none">الرحّال</p>
                          <p className="text-[var(--color-cream-100)]/40 text-[10px] tracking-widest">AL-RAHHAL</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--color-secondary-500)] font-bold text-sm">BOARDING PASS</p>
                        <p className="text-[var(--color-cream-100)]/30 text-[10px]">FIRST CLASS</p>
                      </div>
                    </div>

                    {/* الوجهة المخفية */}
                    <div className="text-center py-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[var(--color-cream-100)]/30 text-sm mb-2"
                      >
                        وجهتك القادمة
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="text-7xl mb-4"
                      >
                        {destination.image}
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 text-[var(--color-cream-100)]/50">
                        <span className="h-px w-12 bg-[var(--color-cream-100)]/20" />
                        <span className="text-xs">اضغط للكشف</span>
                        <span className="h-px w-12 bg-[var(--color-cream-100)]/20" />
                      </div>
                    </div>

                    {/* الشريط السفلي */}
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[var(--color-cream-100)]/40 text-xs">
                        <QrCode className="w-4 h-4" />
                        <span>QR-7829</span>
                      </div>
                      <div className="text-[var(--color-secondary-500)] text-xs font-bold">
                        {destination.code}
                      </div>
                    </div>
                  </div>

                  {/* الشريط السفلي */}
                  <div className="h-3 bg-[var(--color-secondary-500)]" />
                </div>
              </div>

              {/* ═══════════════════════════════════════
                  الوجه الخلفي — تفاصيل الرحلة
                  ═══════════════════════════════════════ */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="w-full bg-[var(--bg-primary)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-subtle)]">
                  {/* الشريط العلوي */}
                  <div className="h-3 bg-[var(--color-primary-500)]" />

                  <div className="p-6 relative">
                    {/* ثقوب */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50" />
                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-[var(--border-subtle)]" />

                    {/* هيدر */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-[var(--color-primary-500)]" />
                        <span className="text-[var(--text-heading)] font-black text-sm">الرحّال</span>
                      </div>
                      <span className="text-[var(--color-secondary-500)] text-xs font-bold tracking-wider">BOARDING PASS</span>
                    </div>

                    {/* من → إلى */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <p className="text-3xl font-black text-[var(--text-heading)]">DXB</p>
                        <p className="text-[var(--text-muted)] text-xs">دبي</p>
                      </div>
                      <div className="flex-1 mx-4 flex flex-col items-center">
                        <div className="w-full h-px bg-[var(--border-medium)] relative">
                          <Plane className="w-4 h-4 text-[var(--color-primary-500)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg]" />
                        </div>
                        <p className="text-[var(--color-secondary-500)] text-[10px] mt-1 font-bold">DIRECT</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-[var(--text-heading)]">{destination.code}</p>
                        <p className="text-[var(--text-muted)] text-xs">{destination.city}</p>
                      </div>
                    </div>

                    {/* التفاصيل */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                        <Calendar className="w-3 h-3 text-[var(--color-primary-500)] mx-auto mb-1" />
                        <p className="text-[var(--text-heading)] font-bold text-xs">{destination.date}</p>
                        <p className="text-[var(--text-muted)] text-[9px]">التاريخ</p>
                      </div>
                      <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                        <Clock className="w-3 h-3 text-[var(--color-primary-500)] mx-auto mb-1" />
                        <p className="text-[var(--text-heading)] font-bold text-xs">10:30</p>
                        <p className="text-[var(--text-muted)] text-[9px]">الإقلاع</p>
                      </div>
                      <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                        <MapPin className="w-3 h-3 text-[var(--color-primary-500)] mx-auto mb-1" />
                        <p className="text-[var(--text-heading)] font-bold text-xs">{destination.gate}</p>
                        <p className="text-[var(--text-muted)] text-[9px]">البوابة</p>
                      </div>
                      <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-xl">
                        <Armchair className="w-3 h-3 text-[var(--color-primary-500)] mx-auto mb-1" />
                        <p className="text-[var(--text-heading)] font-bold text-xs">{destination.seat}</p>
                        <p className="text-[var(--text-muted)] text-[9px]">المقعد</p>
                      </div>
                    </div>

                    {/* باركود وهمي */}
                    <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--bg-secondary)] rounded-xl">
                      <div className="flex-1 flex items-end gap-[2px] h-10">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-[var(--text-heading)]"
                            style={{
                              width: Math.random() > 0.5 ? "2px" : "3px",
                              height: `${40 + Math.random() * 30}%`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text-heading)] font-bold text-xs">QR-7829</p>
                        <p className="text-[var(--text-muted)] text-[9px]">رقم الرحلة</p>
                      </div>
                    </div>

                    {/* زر الاكتشاف */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExplore}
                      className="w-full py-3 bg-[var(--color-primary-500)] text-[var(--color-cream-100)] rounded-2xl font-bold text-sm shadow-lg shadow-[var(--color-primary-500)]/20 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      احجز هذه الرحلة
                    </motion.button>

                    <button
                      onClick={handleClose}
                      className="w-full py-2 mt-2 text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors"
                    >
                      تخطي
                    </button>
                  </div>

                  {/* الشريط السفلي */}
                  <div className="h-3 bg-[var(--color-primary-500)]" />
                </div>
              </div>
            </motion.div>

            {/* توهج خلفي */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-8 rounded-[3rem] bg-[var(--color-primary-500)]/10 blur-3xl -z-10"
            />
          </motion.div>

          {/* زر إغلاق */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}