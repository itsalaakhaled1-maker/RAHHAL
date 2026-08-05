// components/payments/PaywallModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  tripData: {
    from: string;
    to: string;
    departureDate: string;
    returnDate: string;
  };
}

export default function PaywallModal({ isOpen, onClose, onPaymentSuccess, tripData }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !paymentUrl) {
      createPaymentLink();
    }
  }, [isOpen]);

  const createPaymentLink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const newTripId = `credits_${Date.now()}`;
      
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 3.00, // ← 3 دراهم = 10 كريديتس (غيّر المبلغ كما تريد)
          description: 'شحن 10 كريديتس - الرحّال',
          tripId: newTripId,
          userId: session.user.id, // ✅ أرسل userId الحقيقي
          origin: window.location.origin,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // ✅ خزّن linkId للتحقق لاحقاً
      if (data.paymentLinkId) {
        localStorage.setItem('rahhal_last_link_id', data.paymentLinkId);
      }
      
      setPaymentUrl(data.paymentLinkUrl);
    } catch (err) {
      setError('حدث خطأ في إنشاء رابط الدفع. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentUrl) return;
    window.location.href = paymentUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#FDF7E9] rounded-2xl p-8 shadow-2xl border border-[#C9944D]/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#0C4938]/50 hover:text-[#0C4938]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#C9944D] to-[#0C4938] rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">١٠</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0C4938] mb-2">اشحن 10 كريديتس</h2>
          <p className="text-[#0C4938]/70 text-lg">واحصل على خطّة سفرك الكاملة</p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            'كل رحلة تكلف 10 كريديتس',
            'الكريديتس لا تنتهي الصلاحية',
            'استخدمها في أي وقت',
            'خطّة يومية كاملة بالتفصيل',
            'تعديل الخطة عدة مرات',
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
              <div className="w-6 h-6 bg-[#0C4938] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#C9944D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0C4938] font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C4938]"></div>
            <span className="mr-3 text-[#0C4938]">جاري تحضير الدفع...</span>
          </div>
        ) : paymentUrl ? (
          <button onClick={handlePayment} className="w-full py-4 bg-[#0C4938] text-white rounded-2xl font-bold text-lg hover:bg-[#0C4938]/90 transition-all flex items-center justify-center gap-3 shadow-lg">
            <span>اشحن الآن (٣ دراهم)</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        ) : null}

        <p className="text-center mt-4 text-xs text-[#0C4938]/40">الدفع آمن ومشفّر عبر Mamo Pay.</p>
      </div>
    </div>
  );
}