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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      onPaymentSuccess();
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const tripId = `trip_${Date.now()}`;
      const days = calculateDays();
      
      // ✅ Mamo Checkout URL (جرب هذا)
      const baseUrl = window.location.origin;
      
      // طريقة 1: Mamo Checkout
      const checkoutUrl = `https://checkout.mamopay.com/pay` +
        `?amount=9.00` +
        `&currency=AED` +
        `&description=${encodeURIComponent(`خطة سفر إلى ${tripData.to} - ${days} أيام`)}` +
        `&public_key=pk_4c131874-d69d-489e-b786-a75427302094` +
        `&return_url=${encodeURIComponent(`${baseUrl}/?payment=success&tripId=${tripId}`)}` +
        `&failure_return_url=${encodeURIComponent(`${baseUrl}/?payment=failed&tripId=${tripId}`)}` +
        `&metadata[trip_id]=${tripId}` +
        `&metadata[user_id]=${session.user.id}`;

      // افتح في نافذة جديدة
      window.open(checkoutUrl, '_blank', 'width=600,height=700');
      
    } catch (err) {
      setError('حدث خطأ في إنشاء رابط الدفع. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!tripData.departureDate || !tripData.returnDate) return 0;
    const dep = new Date(tripData.departureDate);
    const ret = new Date(tripData.returnDate);
    return Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#FDF7E9] rounded-2xl p-8 shadow-2xl border border-[#C9944D]/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0C4938]/50 hover:text-[#0C4938] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#C9944D] to-[#0C4938] rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">٩</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0C4938] mb-2" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
            فقط ٩ دراهم
          </h2>
          <p className="text-[#0C4938]/70 text-lg" style={{ fontFamily: 'Manrope' }}>
            واحصل على خطّة سفرك الكاملة
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            'البحث عن الرحلات والفنادق',
            'تقدير الميزانية',
            'خطة يومية كاملة بالتفصيل',
            'تعديل الخطة عدة مرات',
            'حفظ الرحلة ومشاركتها',
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
              <div className="w-6 h-6 bg-[#0C4938] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#C9944D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0C4938] font-medium" style={{ fontFamily: 'Manrope' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* ✅ زر الدفع بدل iframe */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-[#0C4938] text-white rounded-2xl font-bold text-lg hover:bg-[#0C4938]/90 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري التحضير...
            </>
          ) : (
            <>
              ادفع ٩ دراهم
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </>
          )}
        </button>

        <p className="text-center mt-4 text-xs text-[#0C4938]/40" style={{ fontFamily: 'Manrope' }}>
          الدفع آمن ومشفّر عبر Mamo Pay. لا يتم حفظ بيانات بطاقتك.
        </p>
      </div>
    </div>
  );
}