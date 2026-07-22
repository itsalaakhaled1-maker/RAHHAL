"use client";

import Link from "next/link";
import { Plane, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ocean/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-ocean" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">رحال</p>
              <p className="text-xs text-gray-500">
                © 2026 HAKIM. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>

          {/* Center: Made with love */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>صنع بـ</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>من قبل شركة حكيم</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-ocean transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-ocean transition-colors"
            >
              الشروط والأحكام
            </Link>
            <Link
              href="/refund"
              className="text-sm text-gray-400 hover:text-ocean transition-colors"
            >
              سياسة الاسترداد
            </Link>
            <Link
              href="/trip"
              className="text-sm text-gray-400 hover:text-ocean transition-colors"
            >
              ابدأ رحلة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}