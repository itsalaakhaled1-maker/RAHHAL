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

      const tripId = `trip_${Date.now()}`;
      
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          amount: 9.00,
          description: `خطة سفر إلى ${tripData.to}`,
          tripId,
          userId: session.user.id,
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      onPaymentSuccess();
      window.history.replaceState({}, '', '/');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#FDF7E9] rounded-2xl p-8 shadow-2xl border border-[#C9944D]/20">
        {/* ... نفس الـ UI ... */}
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C4938]"></div>
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
      </div>
    </div>
  );
}