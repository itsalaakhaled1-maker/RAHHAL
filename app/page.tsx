"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plane, MapPin, Shield, Sparkles } from "lucide-react";
import FlightSearch from "@/components/flights/FlightSearch";

const TravelCardIntro = dynamic(() => import("@/components/intro/TravelCardIntro"), {
  ssr: false,
});

export default function Home() {
  // ✅ تظهر في كل refresh — بدون localStorage
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {showIntro && <TravelCardIntro onClose={() => setShowIntro(false)} />}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 hero-section">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              خطط رحلتك بذكاء مع الذكاء الاصطناعي
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-heading)] mb-6 leading-tight">
              اكتشف العالم
              <br />
              <span className="text-gradient">بطريقتك</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              خطط رحلتك الكاملة من الطيران إلى الإقامة والميزانية والخطة اليومية في مكان واحد
            </p>
          </motion.div>

          <FlightSearch />

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              { icon: Plane, title: "رحلات حقيقية", desc: "أسعار فورية من Google Flights" },
              { icon: MapPin, title: "فنادق موثوقة", desc: "أفضل الفنادق من Booking.com" },
              { icon: Shield, title: "تخطيط ذكي", desc: "خطط يومية مولدة بالذكاء الاصطناعي" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="search-card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-[var(--color-primary-500)]" />
                </div>
                <h3 className="font-bold text-[var(--text-heading)] mb-2">{feature.title}</h3>
                <p className="text-[var(--text-muted)] text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}