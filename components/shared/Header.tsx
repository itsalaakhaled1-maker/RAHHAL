"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Menu, X, Heart, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dark-mode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("dark-mode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) return null;

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "رحلاتي", href: "/trips" },
    { label: "الوجهات", href: "/destinations" },
    { label: "المدونة", href: "/blog" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${
        darkMode 
          ? "bg-gray-900/90 border-gray-800" 
          : "bg-white/90 border-gray-100"
      }`}
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
                <span className="text-xl font-bold text-ocean">الرحّال</span>
                <span className={`text-[10px] -mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
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
                className={`px-4 py-2 text-sm font-medium rounded-lg hover:bg-ocean/5 transition-all ${
                  darkMode 
                    ? "text-gray-400 hover:text-ocean" 
                    : "text-gray-600 hover:text-ocean"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                darkMode 
                  ? "text-gray-400 hover:bg-gray-800" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all ${
              darkMode 
                ? "text-gray-400 hover:bg-gray-800" 
                : "text-gray-500 hover:bg-gray-100"
            }`}>
              <Heart className="w-5 h-5" />
            </button>
            <button className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all ${
              darkMode 
                ? "text-gray-400 hover:bg-gray-800" 
                : "text-gray-500 hover:bg-gray-100"
            }`}>
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode 
                  ? "text-gray-400 hover:bg-gray-800" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
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
          className={`md:hidden border-t ${
            darkMode 
              ? "bg-gray-900 border-gray-800" 
              : "bg-white border-gray-100"
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium ${
                  darkMode 
                    ? "text-gray-300 hover:bg-ocean/5" 
                    : "text-gray-700 hover:bg-ocean/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}