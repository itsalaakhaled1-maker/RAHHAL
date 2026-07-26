"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface TravelCardIntroProps {
  onClose: () => void;
}

// ✅ وجهات مقترحة حسب المنطقة (ذكية)
const getSuggestedDestination = () => {
  const hour = new Date().getHours();
  const destinations = [
    { city: "باريس", country: "فرنسا", tag: "رومانسي", temp: "18°C", image: "🗼" },
    { city: "طوكيو", country: "اليابان", tag: "مغامرة", temp: "22°C", image: "🗾" },
    { city: "ماليه", country: "المالديف", tag: "استرخاء", temp: "30°C", image: "🏝️" },
    { city: "إسطنبول", country: "تركيا", tag: "تاريخ", temp: "25°C", image: "🕌" },
    { city: "كيب تاون", country: "جنوب أفريقيا", tag: "طبيعة", temp: "20°C", image: "🦁" },
  ];
  
  // اختار حسب الوقت (صباح = مغامرة، مساء = رومانسي)
  const index = hour < 12 ? 1 : hour < 18 ? 0 : 2;
  return destinations[index];
};

export default function TravelCardIntro({ onClose }: TravelCardIntroProps) {
  const [show, setShow] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [destination] = useState(getSuggestedDestination());
  const router = useRouter();

  useEffect(() => {
    // تقليب تلقائي بعد 1.2 ثانية
    const flipTimer = setTimeout(() => setFlipped(true), 1200);
    // إغلاق تلقائي بعد 6 ثواني
    const closeTimer = setTimeout(() => handleClose(), 6000);
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
    // توجه للصفحة الرئيسية مع تعبئة الوجهة
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={handleClose}
        >
          {/* البطاقة 3D */}
          <motion.div
            initial={{ y: 300, scale: 0.5, rotateX: 45 }}
            animate={{ y: 0, scale: 1, rotateX: 0 }}
            exit={{ y: -300, scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-[340px] h-[420px] perspective-1000"
            onClick={(e) => e.stopPropagation()}
          >
            {/* الوجهة الداخلية (تقلب 3D) */}
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative w-full h-full preserve-3d"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* الوجه الأمامي */}
              <div
                className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-full h-full bg-[var(--color-primary-500)] relative flex flex-col items-center justify-center p-8">
                  {/* نمط خلفية */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-2 border-[var(--color-secondary-500)]" />
                    <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full border border-[var(--color-cream-100)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[var(--color-secondary-500)]/30" />
                  </div>
                  
                  {/* شعار */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[var(--color-cream-100)]" />
                    <span className="text-[var(--color-cream-100)] font-bold text-sm tracking-wider">الرحّال</span>
                  </div>

                  {/* محتوى الأمامي */}
                  <div className="text-center z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-20 h-20 rounded-2xl bg-[var(--color-cream-100)]/10 flex items-center justify-center mx-auto mb-6"
                    >
                      <Sparkles className="w-10 h-10 text-[var(--color-secondary-500)]" />
                    </motion.div>
                    <h2 className="text-[var(--color-cream-100)] text-2xl font-black mb-2">
                      وجهتك القادمة
                    </h2>
                    <p className="text-[var(--color-cream-100)]/60 text-sm">
                      تنتظرك...
                    </p>
                  </div>

                  {/* زخرفة سفلية */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-[var(--color-primary-600)]/30" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--color-secondary-500)]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">اضغط للاكتشاف</span>
                  </div>
                </div>
              </div>

              {/* الوجه الخلفي */}
              <div
                className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="w-full h-full bg-[var(--bg-primary)] relative flex flex-col">
                  {/* هيدر ذهبي */}
                  <div className="h-32 bg-[var(--color-primary-500)] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-secondary-500)]" />
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[var(--color-cream-100)]" />
                    </div>
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[var(--color-cream-100)]" />
                      <span className="text-[var(--color-cream-100)] font-bold text-sm">الرحّال</span>
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1.5, type: "spring" }}
                      className="absolute bottom-4 right-6 text-6xl"
                    >
                      {destination.image}
                    </motion.div>
                  </div>

                  {/* محتوى */}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[var(--color-secondary-500)]/10 text-[var(--color-secondary-500)] text-xs font-bold">
                        {destination.tag}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] text-xs font-bold">
                        {destination.temp}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black text-[var(--text-heading)] mb-1">
                      {destination.city}
                    </h3>
                    <p className="text-[var(--text-muted)] text-lg mb-6">
                      {destination.country}
                    </p>

                    <div className="mt-auto space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExplore}
                        className="w-full py-3.5 bg-[var(--color-primary-500)] text-[var(--color-cream-100)] rounded-2xl font-bold text-base shadow-lg shadow-[var(--color-primary-500)]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        اكتشف الرحلة
                      </motion.button>

                      <button
                        onClick={handleClose}
                        className="w-full py-2 text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
                      >
                        تخطي
                      </button>
                    </div>
                  </div>

                  {/* زخرفة */}
                  <div className="absolute top-32 right-4 w-2 h-16 rounded-full bg-[var(--color-secondary-500)]/20" />
                  <div className="absolute bottom-20 left-4 w-16 h-2 rounded-full bg-[var(--color-primary-500)]/10" />
                </div>
              </div>
            </motion.div>

            {/* تأثير توهج */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-4 rounded-[2rem] bg-[var(--color-primary-500)]/10 blur-2xl -z-10"
            />
          </motion.div>

          {/* زر إغلاق */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleClose}
            className="absolute top-8 left-8 w-10 h-10 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}