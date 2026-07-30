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
      
      // ✅ جيب الـ session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const tripId = `trip_${Date.now()}`;
      
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          amount: 9.00,
          description: `خطة سفر إلى ${tripData.to} - ${calculateDays()} أيام`,
          tripId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setPaymentUrl(data.paymentLinkUrl);
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const transactionId = urlParams.get('transactionId');
    
    if (paymentStatus === 'success' && transactionId) {
      verifyPaymentOnServer(transactionId).then((success) => {
        if (success) {
          onPaymentSuccess();
          window.history.replaceState({}, '', '/');
        }
      });
    }
  }, []);

  const verifyPaymentOnServer = async (transactionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payments/verify?transactionId=${transactionId}`);
      const data = await response.json();
      return data.success === true;
    } catch (err) {
      console.error('Payment verification failed:', err);
      return false;
    }
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C4938]"></div>
            <span className="mr-3 text-[#0C4938]" style={{ fontFamily: 'Manrope' }}>جاري تحضير الدفع...</span>
          </div>
        ) : paymentUrl ? (
          <div className="w-full h-[400px] rounded-xl overflow-hidden border-2 border-[#0C4938]/10">
            <iframe
              src={paymentUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="payment"
              title="Mamo Payment"
            />
          </div>
        ) : null}

        <p className="text-center mt-4 text-xs text-[#0C4938]/40" style={{ fontFamily: 'Manrope' }}>
          الدفع آمن ومشفّر عبر Mamo Pay. لا يتم حفظ بيانات بطاقتك.
        </p>
      </div>
    </div>
  );
}