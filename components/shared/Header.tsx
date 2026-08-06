"use client";

import { useState, useEffect } from "react";
import ProfileModal from "@/components/ui/ProfileModal";
import PaywallModal from "@/components/payments/PaywallModal";
import { motion } from "framer-motion";
import { Sun, Moon, Menu, X, LogIn, User, Coins } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const { user, credits, loading, signInWithGoogle, signOut, updateName, refreshCredits } = useAuth();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDarkMode(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  // ✅ أعد جلب الكريديتس عند العودة من الدفع
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      refreshCredits();
    }
  }, [refreshCredits]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const theme = newMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  if (!mounted) return null;

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "رحلاتي", href: "/trips" },
    { label: "الوجهات", href: "/destinations" },
    { label: "المدونة", href: "/blog" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="navbar fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg bg-white">
                  <Image
                    src="/logo.png"
                    alt="الرحّال"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[var(--color-primary-500)]">الرحّال</span>
                  <span className="text-[10px] -mt-1 text-[var(--text-muted)]">
                    Al-Rahhal
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-base font-medium rounded-lg transition-all text-[var(--text-secondary)] hover:bg-[var(--color-primary-500)]/5 hover:text-[var(--color-primary-500)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                aria-label={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-[var(--color-secondary-400)]" />
                ) : (
                  <Moon className="w-5 h-5 text-[var(--color-primary-500)]" />
                )}
              </button>

              {/* Auth Button */}
              {!loading && (
                <>
                  {user ? (
                    <>
                      {/* ✅ شارة الكريديتس (تفتح Paywall عند الضغط) */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsPaywallOpen(true)}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9944D]/10 border border-[#C9944D]/20 hover:bg-[#C9944D]/20 transition-all"
                      >
                        <Coins className="w-4 h-4 text-[#C9944D]" />
                        <span className="text-sm font-bold text-[#C9944D]">{credits}</span>
                        <span className="text-[10px] text-[#C9944D]/70">كريديت</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]"
                      >
                        <User className="w-4 h-4 text-[var(--color-primary-500)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {user.user_metadata?.full_name || user.email?.split("@")[0] || "مستخدم"}
                        </span>
                      </motion.button>

                      <ProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={user}
                        credits={credits}
                        onSignOut={signOut}
                        onUpdateName={updateName}
                        onRecharge={() => setIsPaywallOpen(true)}
                      />
                    </>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium btn-primary"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول</span>
                    </button>
                  )}
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-navbar)] backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--color-primary-500)]/5 hover:text-[var(--color-primary-500)]"
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsPaywallOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-[#C9944D]/10"
                >
                  <Coins className="w-5 h-5 text-[#C9944D]" />
                  <span className="font-bold text-[#C9944D]">{credits} رصيد الرحلات</span>
                  <span className="text-xs text-[#C9944D]/70 mr-auto">اضغط لإضافة رصيد رحلات</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* PaywallModal مشترك */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPaymentSuccess={() => {
          setIsPaywallOpen(false);
          refreshCredits(); // ✅ أعد الجلب بعد نجاح الدفع من المودال نفسه
        }}
        tripData={{ from: '', to: '', departureDate: '', returnDate: '' }}
      />
    </>
  );
}