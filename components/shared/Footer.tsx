"use client";

import Link from "next/link";
import { Plane, Heart, Send, MessageSquare, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

export default function Footer() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("feedback").insert({
        user_id: user?.id || null,
        message: message.trim(),
        email: user?.email || null,
      });

      setMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#0C4938] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#C9944D]/30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-6 h-6 text-[#C9944D]" />
              </motion.div>
              <div>
                <p className="font-bold text-sm">شكراً لك!</p>
                <p className="text-xs text-white/80">لقد وصلتنا رسالتك، وسوف نتحقق منها بإذن الله</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-[var(--color-primary-900)] text-[var(--text-secondary)] py-8 border-t border-[var(--color-primary-800)]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Feedback Section */}
          <div 
            id="feedback-section" 
            className="mb-8 bg-[var(--color-primary-800)]/30 rounded-2xl p-6 border border-[var(--color-primary-700)]/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#C9944D]" />
              <h3 className="text-lg font-bold text-[var(--text-inverse)]">للشكاوي والاقتراحات</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              نسعد بسماع رأيك! اكتب رسالتك وسنرد عليك في أقرب وقت
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={3}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface)]/10 border border-[var(--color-primary-700)]/50 text-[var(--text-inverse)] placeholder:text-[var(--text-muted)] focus:border-[#C9944D] focus:ring-2 focus:ring-[#C9944D]/20 outline-none resize-none text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="px-6 py-3 bg-[#C9944D] text-white rounded-xl font-bold text-sm hover:bg-[#C9944D]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-fit self-end"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Logo & Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-500)]/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-[var(--color-primary-500)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-inverse)]">رحال</p>
                <p className="text-xs text-[var(--text-muted)]">
                  © 2026 HAKIM. جميع الحقوق محفوظة.
                </p>
              </div>
            </div>

            {/* Center: HAKIM Link */}
            <a
              href="https://www.hakim1.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--color-primary-500)] transition-colors"
            >
              <span>من حكيم</span>
              <span className="font-bold text-[var(--color-primary-500)]">by HAKIM</span>
              <span className="text-xs">™</span>
            </a>

            {/* Right: Links */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
              <Link
                href="/privacy"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                الشروط والأحكام
              </Link>
              <Link
                href="/refund"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                سياسة الاسترداد
              </Link>
              <Link
                href="/trip"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary-500)] transition-colors"
              >
                ابدأ رحلة
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}