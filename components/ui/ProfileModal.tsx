"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, LogOut, Edit3, Check, Coins, Zap } from "lucide-react";
import { useState } from "react";
import Portal from "@/components/ui/Portal";

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
  credits: number;
  onSignOut: () => void;
  onUpdateName: (name: string) => void;
  onRecharge?: () => void; // ✅ إضافة: فتح نافذة الشحن
}

export default function ProfileModal({ isOpen, onClose, user, credits, onSignOut, onUpdateName, onRecharge }: ProfileModalProps) {
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

  const handleRecharge = () => {
    onClose(); // أغلق الملف الشخصي
    if (onRecharge) onRecharge(); // افتح نافذة الشحن
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={onClose}
            />

            {/* Profile Modal */}
            <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="pointer-events-auto w-full max-w-md mx-auto my-auto"
              >
                <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card-lg border border-[var(--border-subtle)] overflow-hidden relative">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Header */}
                  <div className="relative bg-[var(--color-primary-500)] p-6 text-white">
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
                    {/* ✅ قسم الكريديتس + زر الشحن */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-gradient-to-br from-[#C9944D]/10 to-[#0C4938]/5 rounded-xl p-4 border border-[#C9944D]/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#C9944D]/20 flex items-center justify-center">
                            <Coins className="w-6 h-6 text-[#C9944D]" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">رصيد الكريديتس</p>
                            <p className="text-2xl font-black text-[#0C4938]">{credits} <span className="text-sm font-medium">كريديت</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-muted)]">كل رحلة = 10 كريديت</p>
                          <p className="text-xs text-[var(--text-muted)]">الكريديتس لا تنتهي</p>
                        </div>
                      </div>

                      {/* ✅ زر الشحن */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRecharge}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0C4938] text-white font-bold hover:bg-[#0C4938]/90 transition-all shadow-lg"
                      >
                        <Zap className="w-5 h-5 text-[#C9944D]" />
                        <span>اشحن 10 كريديتس (٣ دراهم)</span>
                      </motion.button>
                    </motion.div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--text-muted)]">
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
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none"
                            placeholder="اكتب اسمك"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="w-10 h-10 rounded-lg bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white flex items-center justify-center transition-all"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]"
                        >
                          <span className="text-[var(--text-primary)] font-medium">
                            {user?.user_metadata?.full_name || "لم يتم تحديد الاسم"}
                          </span>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="w-8 h-8 rounded-lg hover:bg-[var(--bg-surface-elevated)] flex items-center justify-center transition-all text-[var(--text-muted)]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--text-muted)]">
                        البريد الإلكتروني
                      </label>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                        <Mail className="w-5 h-5 text-[var(--color-primary-500)]" />
                        <span className="text-[var(--text-primary)] text-sm">
                          {user?.email || "غير متوفر"}
                        </span>
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 transition-all font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Logout Confirm Modal */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center"
                    onClick={() => setShowLogoutConfirm(false)}
                  />
                  <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 50 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="pointer-events-auto w-full max-w-sm mx-4"
                    >
                      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card-lg border border-[var(--border-subtle)] p-6 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                          className="w-16 h-16 rounded-full bg-[var(--color-danger)]/10 mx-auto mb-4 flex items-center justify-center"
                        >
                          <LogOut className="w-8 h-8 text-[var(--color-danger)]" />
                        </motion.div>

                        <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">
                          تسجيل الخروج
                        </h3>
                        <p className="text-[var(--text-muted)] mb-6">
                          هل أنت متأكد من رغبتك في تسجيل الخروج؟
                        </p>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] transition-all font-medium"
                          >
                            لا، البقاء
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={confirmSignOut}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/80 text-white transition-all font-medium"
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
        </Portal>
      )}
    </AnimatePresence>
  );
}