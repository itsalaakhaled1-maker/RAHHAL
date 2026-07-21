"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, LogOut, Edit3, Check } from "lucide-react";
import { useState } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email?: string | null;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  onSignOut: () => void;
  onUpdateName: (name: string) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onSignOut, onUpdateName }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || "");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateName(newName.trim());
      setIsEditing(false);
    }
  };

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    onSignOut();
    setShowLogoutConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
          />

          {/* Profile Modal - Centered with flex */}
          <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="pointer-events-auto w-full max-w-md mx-auto my-auto"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                {/* Close Button - Top Right */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="relative bg-ocean p-6 text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center border-4 border-white/30"
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-center"
                  >
                    {user?.user_metadata?.full_name || "مستخدم"}
                  </motion.h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      الاسم
                    </label>
                    {isEditing ? (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ocean focus:border-transparent"
                          placeholder="اكتب اسمك"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <span className="text-gray-900 dark:text-white font-medium">
                          {user?.user_metadata?.full_name || "لم يتم تحديد الاسم"}
                        </span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all text-gray-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      البريد الإلكتروني
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Mail className="w-5 h-5 text-ocean" />
                      <span className="text-gray-900 dark:text-white text-sm">
                        {user?.email || "غير متوفر"}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Logout Confirm Modal - Also Centered */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"
                  onClick={() => setShowLogoutConfirm(false)}
                />
                <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    className="pointer-events-auto w-full max-w-sm mx-4"
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4 flex items-center justify-center"
                      >
                        <LogOut className="w-8 h-8 text-red-500" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        تسجيل الخروج
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        هل أنت متأكد من رغبتك في تسجيل الخروج؟
                      </p>
                      
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowLogoutConfirm(false)}
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium"
                        >
                          لا، البقاء
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={confirmSignOut}
                          className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all font-medium"
                        >
                          نعم، خروج
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}