"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogIn, X } from "lucide-react";
import { useState } from "react";

interface AuthGuardProps {
  user: any;
  children: React.ReactNode;
  onSignIn: () => void;
}

export default function AuthGuard({ user, children, onSignIn }: AuthGuardProps) {
  const [showModal, setShowModal] = useState(false);

  // If user is logged in, show content
  if (user) {
    return <>{children}</>;
  }

  // If user is not logged in, show the guarded view with modal trigger
  return (
    <>
      {/* Blurred/locked content preview */}
      <div className="relative">
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with login prompt */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-ocean text-white rounded-xl shadow-lg hover:bg-ocean-dark transition-all font-medium"
          >
            <Lock className="w-5 h-5" />
            <span>تسجيل الدخول للوصول</span>
          </motion.button>
        </div>
      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="pointer-events-auto w-full max-w-sm mx-4"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-ocean/10 dark:bg-ocean/20 mx-auto mb-4 flex items-center justify-center"
                  >
                    <Lock className="w-8 h-8 text-ocean" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    هذه الميزة متاحة فقط للأعضاء
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    قم بتسجيل الدخول باستخدام حساب Google للوصول إلى رحلاتك وحفظ تفضيلاتك
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowModal(false);
                      onSignIn();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ocean text-white hover:bg-ocean-dark transition-all font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول بـ Google</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}