"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface TravelCardIntroProps {
  onClose: () => void;
}

const getSuggestedDestination = () => {
  const destinations = [
    { city: "باريس", code: "CDG", country: "فرنسا", date: "15 أغسطس", gate: "A12", seat: "14F", flight: "RH-101" },
    { city: "طوكيو", code: "NRT", country: "اليابان", date: "22 سبتمبر", gate: "B7", seat: "8A", flight: "RH-205" },
    { city: "ماليه", code: "MLE", country: "المالديف", date: "10 أكتوبر", gate: "C3", seat: "2K", flight: "RH-308" },
    { city: "إسطنبول", code: "IST", country: "تركيا", date: "5 نوفمبر", gate: "D15", seat: "22C", flight: "RH-412" },
    { city: "نيويورك", code: "JFK", country: "أمريكا", date: "20 ديسمبر", gate: "E9", seat: "5B", flight: "RH-555" },
    { city: "لندن", code: "LHR", country: "بريطانيا", date: "8 يناير", gate: "F4", seat: "12A", flight: "RH-777" },
  ];
  return destinations[Math.floor(Math.random() * destinations.length)];
};

export default function TravelCardIntro({ onClose }: TravelCardIntroProps) {
  const [show, setShow] = useState(true);
  const [destination] = useState(getSuggestedDestination());
  const router = useRouter();

  useEffect(() => {
    const closeTimer = setTimeout(() => handleClose(), 10000);
    return () => clearTimeout(closeTimer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 700);
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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          {/* التذكرة — تدخل من اليسار وتخرج من اليمين */}
          <motion.div
            initial={{ x: -800, opacity: 0, rotateY: -15 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            exit={{ x: 800, opacity: 0, rotateY: 15 }}
            transition={{ 
              type: "spring", 
              stiffness: 80, 
              damping: 18,
              mass: 1.2
            }}
            className="relative w-full max-w-[720px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════════════════════════════════════
                التذكرة — متجاوبة: عمودية على الهاتف، أفقية على الديسكتوب
                ═══════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row w-full rounded-2xl overflow-hidden shadow-2xl bg-[#F5F5F0]">
              
              {/* ═══════════════════════════════════════
                  الجزء الأيسر — الجسم الرئيسي (أبيض/كريمي)
                  ═══════════════════════════════════════ */}
              <div className="flex-1 relative p-5 md:p-7 flex flex-col justify-between overflow-hidden min-h-[280px] md:min-h-0">
                
                {/* خلفية خريطة العالم النقطية */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                  <svg viewBox="0 0 600 300" className="w-full h-full" fill="currentColor">
                    {/* أمريكا الشمالية */}
                    <circle cx="80" cy="80" r="2" />
                    <circle cx="95" cy="75" r="1.5" />
                    <circle cx="110" cy="85" r="2" />
                    <circle cx="120" cy="70" r="1.5" />
                    <circle cx="90" cy="95" r="1.5" />
                    <circle cx="105" cy="100" r="2" />
                    <circle cx="130" cy="90" r="1.5" />
                    <circle cx="140" cy="80" r="2" />
                    <circle cx="85" cy="110" r="1.5" />
                    <circle cx="100" cy="115" r="2" />
                    <circle cx="115" cy="105" r="1.5" />
                    <circle cx="125" cy="120" r="2" />
                    
                    {/* أوروبا */}
                    <circle cx="280" cy="70" r="2" />
                    <circle cx="295" cy="65" r="1.5" />
                    <circle cx="310" cy="75" r="2" />
                    <circle cx="290" cy="85" r="1.5" />
                    <circle cx="305" cy="90" r="2" />
                    <circle cx="320" cy="80" r="1.5" />
                    <circle cx="275" cy="95" r="1.5" />
                    <circle cx="300" cy="100" r="2" />
                    <circle cx="315" cy="95" r="1.5" />
                    
                    {/* آسيا */}
                    <circle cx="420" cy="80" r="2" />
                    <circle cx="440" cy="75" r="1.5" />
                    <circle cx="460" cy="85" r="2" />
                    <circle cx="430" cy="95" r="1.5" />
                    <circle cx="450" cy="100" r="2" />
                    <circle cx="470" cy="90" r="1.5" />
                    <circle cx="480" cy="105" r="2" />
                    <circle cx="440" cy="110" r="1.5" />
                    <circle cx="460" cy="115" r="2" />
                    
                    {/* أفريقيا */}
                    <circle cx="290" cy="150" r="2" />
                    <circle cx="305" cy="145" r="1.5" />
                    <circle cx="320" cy="155" r="2" />
                    <circle cx="300" cy="165" r="1.5" />
                    <circle cx="315" cy="170" r="2" />
                    <circle cx="295" cy="180" r="1.5" />
                    <circle cx="310" cy="185" r="2" />
                    
                    {/* أستراليا */}
                    <circle cx="500" cy="180" r="2" />
                    <circle cx="515" cy="175" r="1.5" />
                    <circle cx="525" cy="185" r="2" />
                    <circle cx="510" cy="195" r="1.5" />
                    
                    {/* أمريكا الجنوبية */}
                    <circle cx="130" cy="170" r="2" />
                    <circle cx="145" cy="165" r="1.5" />
                    <circle cx="140" cy="180" r="2" />
                    <circle cx="155" cy="175" r="1.5" />
                    <circle cx="150" cy="190" r="2" />
                  </svg>
                </div>

                {/* الهيدر العلوي */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#0C4938] flex items-center justify-center">
                      <Plane className="w-3.5 h-3.5 text-[#FDF7E9]" />
                    </div>
                    <div>
                      <p className="text-[#0C4938] font-black text-xs leading-none">الرحّال</p>
                      <p className="text-[#0C4938]/40 text-[7px] tracking-[0.2em]">AL-RAHHAL AIR</p>
                    </div>
                  </div>
                  <p className="text-[#0C4938]/30 text-[10px] font-medium tracking-wider">تذكرة صعود</p>
                </div>

                {/* المدن الكبيرة — المنتصف */}
                <div className="flex items-center justify-center gap-3 md:gap-5 relative z-10 my-3 md:my-1">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <p className="text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight leading-none">دبي</p>
                    <p className="text-[#0C4938]/50 text-xs font-bold text-center mt-1">DXB</p>
                  </motion.div>
                  
                  <div className="flex flex-col items-center px-2">
                    <div className="w-16 md:w-20 h-px bg-[#C9944D] relative">
                      <Plane className="w-5 h-5 text-[#0C4938] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg]" />
                    </div>
                    <p className="text-[#C9944D] text-[9px] mt-1 font-bold tracking-[0.15em]">مباشر</p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <p className="text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight leading-none">{destination.city}</p>
                    <p className="text-[#0C4938]/50 text-xs font-bold text-center mt-1">{destination.code}</p>
                  </motion.div>
                </div>

                {/* التفاصيل السفلية — 4 أعمدة على الديسكتوب، 2 على الهاتف */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
                  <div>
                    <p className="text-[#999] text-[8px] uppercase tracking-[0.15em] mb-1 font-medium">المسافر</p>
                    <p className="text-[#1a1a1a] font-bold text-[13px]">ضيف الرحّال</p>
                  </div>
                  <div>
                    <p className="text-[#999] text-[8px] uppercase tracking-[0.15em] mb-1 font-medium">الرحلة</p>
                    <p className="text-[#1a1a1a] font-bold text-[13px]">{destination.flight}</p>
                  </div>
                  <div>
                    <p className="text-[#999] text-[8px] uppercase tracking-[0.15em] mb-1 font-medium">المقعد</p>
                    <p className="text-[#1a1a1a] font-bold text-[13px]">{destination.seat}</p>
                  </div>
                  <div>
                    <p className="text-[#999] text-[8px] uppercase tracking-[0.15em] mb-1 font-medium">البوابة</p>
                    <p className="text-[#0C4938] font-bold text-[13px]">{destination.gate}</p>
                  </div>
                </div>

                {/* باركود رأسي على اليسار — مخفي على الهاتف */}
                <div className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 flex-col items-center gap-[1px] h-32">
                  {Array.from({ length: 45 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-[#1a1a1a]"
                      style={{
                        width: i % 7 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1.5px",
                        height: "100%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ═══════════════════════════════════════
                  الخط المنقط — فاصل التذكرة
                  ═══════════════════════════════════════ */}
              <div className="hidden md:flex w-6 relative flex-col items-center justify-between py-1 bg-[#F5F5F0]">
                <div className="w-5 h-5 rounded-full bg-black/40 -mt-2.5" />
                <div className="flex-1 w-px border-l border-dashed border-[#ccc] my-1" />
                <div className="w-5 h-5 rounded-full bg-black/40 -mb-2.5" />
              </div>

              {/* ═══════════════════════════════════════
                  الجزء الأيمن — الجزء المقصوص (أخضر HAKIM)
                  ═══════════════════════════════════════ */}
              <div className="w-full md:w-36 bg-[#0C4938] p-4 md:p-5 flex flex-row md:flex-col items-center justify-between md:justify-between relative overflow-hidden">
                
                {/* زخرفة خلفية */}
                <div className="absolute inset-0 opacity-[0.08]">
                  <div className="absolute top-3 right-3 w-16 h-16 rounded-full border border-[#FDF7E9]" />
                  <div className="absolute bottom-6 left-1 w-10 h-10 rounded-full border border-[#C9944D]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#FDF7E9]/50" />
                </div>

                {/* هيدر */}
                <div className="hidden md:block text-center relative z-10">
                  <p className="text-[#FDF7E9]/40 text-[7px] tracking-[0.2em]">BOARDING PASS</p>
                </div>

                {/* التفاصيل — أفقية على الهاتف، رأسية على الديسكتوب */}
                <div className="flex md:flex-col items-center justify-around md:justify-center gap-4 md:gap-4 w-full relative z-10">
                  <div className="text-center">
                    <p className="text-[#FDF7E9]/40 text-[8px] mb-0.5 tracking-wider">البوابة</p>
                    <p className="text-[#C9944D] font-black text-xl">{destination.gate}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[#FDF7E9]/40 text-[8px] mb-0.5 tracking-wider">المقعد</p>
                    <p className="text-[#FDF7E9] font-black text-2xl">{destination.seat}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[#FDF7E9]/40 text-[8px] mb-0.5 tracking-wider">الرحلة</p>
                    <p className="text-[#FDF7E9] font-bold text-sm">{destination.flight}</p>
                  </div>
                </div>

                {/* باركود صغير — مخفي على الهاتف */}
                <div className="hidden md:block w-full relative z-10">
                  <div className="flex items-end justify-center gap-[2px] h-6">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#FDF7E9]"
                        style={{
                          width: "1.5px",
                          height: `${50 + Math.random() * 50}%`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[#FDF7E9]/30 text-[6px] text-center mt-1 font-mono tracking-wider">
                    {destination.flight}-DXB-{destination.code}
                  </p>
                </div>

                {/* زر الاكتشاف */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExplore}
                  className="w-auto md:w-full py-2 px-4 md:px-0 mt-0 md:mt-3 bg-[#C9944D] text-[#FDF7E9] rounded-xl font-bold text-[11px] shadow-lg shadow-black/20 flex items-center justify-center gap-1.5 relative z-10"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden md:inline">اكتشف</span>
                  <span className="md:hidden">اكتشف {destination.city}</span>
                </motion.button>
              </div>
            </div>

            {/* توهج خلفي */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-6 rounded-3xl bg-[#0C4938]/15 blur-2xl -z-10"
            />
          </motion.div>

          {/* زر إغلاق */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-8 md:left-8 md:right-auto w-9 h-9 rounded-full bg-[#F5F5F0]/90 backdrop-blur flex items-center justify-center text-[#999] hover:text-[#1a1a1a] transition-colors shadow-lg border border-[#eee]"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}