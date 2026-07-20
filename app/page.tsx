"use client";

import { motion } from "framer-motion";
import { Plane, MapPin, Shield, Sparkles } from "lucide-react";
import FlightSearch from "@/components/flights/FlightSearch";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean/10 text-ocean rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              خطط رحلتك بذكاء مع الذكاء الاصطناعي
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              اكتشف العالم
              <br />
              <span className="text-ocean">بطريقتك</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-ocean/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-ocean" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}