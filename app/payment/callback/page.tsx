// app/payment/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'verifying'>('loading');
  const [message, setMessage] = useState('جاري معالجة الدفع...');

  const paymentStatus = searchParams.get('status');
  const tripId = searchParams.get('tripId');

  useEffect(() => {
    if (!paymentStatus) {
      router.replace('/');
      return;
    }

    if (paymentStatus === 'failed') {
      setStatus('failed');
      setMessage('لم يتم إتمام الدفع. جاري العودة...');
      
      // ✅ العودة للصفحة الرئيسية بعد 3 ثواني
      setTimeout(() => {
        router.replace('/?payment=failed');
      }, 3000);
      return;
    }

    if (paymentStatus === 'success') {
      setStatus('verifying');
      setMessage('جاري التحقق من الدفع...');
      verifyPayment();
    }
  }, [paymentStatus, router]);

  const verifyPayment = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('failed');
        setMessage('يجب تسجيل الدخول أولاً');
        setTimeout(() => router.replace('/'), 3000);
        return;
      }

      // ✅ تحقق من حالة الدفع في Supabase (الـ webhook يحدثها)
      // ننتظر قليلاً لأن الـ webhook قد يتأخر
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkPayment = async (): Promise<boolean> => {
        const { data: payment } = await supabase
          .from('user_payments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'paid')
          .order('paid_at', { ascending: false })
          .limit(1)
          .single();

        if (payment) {
          return true;
        }

        // ✅ بديل: تحقق عبر API إذا لم يُحدث الـ webhook بعد
        if (tripId) {
          try {
            const verifyResponse = await fetch(`/api/payments/verify?transactionId=${tripId}`);
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              return true;
            }
          } catch (e) {
            console.error('Verify API error:', e);
          }
        }

        return false;
      };

      // ✅ محاولة متكررة (polling) كل 2 ثانية
      const interval = setInterval(async () => {
        attempts++;
        const found = await checkPayment();

        if (found) {
          clearInterval(interval);
          setStatus('success');
          setMessage('تم الدفع بنجاح! جاري تحضير رحلتك...');
          
          // ✅ استعادة بيانات الرحلة من sessionStorage
          const pendingTrip = sessionStorage.getItem('rahhal_pending_trip');
          
          // ✅ الانتقال للصفحة الرئيسية مع إشارة النجاح
          // بيانات الرحلة محفوظة في Zustand (persist) أو sessionStorage
          setTimeout(() => {
            sessionStorage.setItem('rahhal_payment_success', 'true');
            router.replace('/?payment=success');
          }, 2000);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('failed');
          setMessage('تعذر التحقق من الدفع. تواصل مع الدعم.');
          setTimeout(() => router.replace('/?payment=failed'), 3000);
        }
      }, 2000);

      // تنظيف
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('حدث خطأ في التحقق من الدفع');
      setTimeout(() => router.replace('/?payment=failed'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-[#0C4938] flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-[#C9944D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        );
      case 'failed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        );
      default:
        return (
          <div className="w-20 h-20 rounded-full bg-[#0C4938]/10 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0C4938]" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-[#0C4938]';
      case 'failed': return 'text-red-600';
      default: return 'text-[#0C4938]';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7E9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        {getStatusIcon()}
        
        <h1 className={`text-2xl font-bold mb-3 ${getStatusColor()}`} style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
          {status === 'success' ? 'تم الدفع بنجاح!' : 
           status === 'failed' ? 'لم يتم الدفع' : 
           'جاري المعالجة'}
        </h1>
        
        <p className="text-[#0C4938]/60 text-lg mb-8" style={{ fontFamily: 'Manrope' }}>
          {message}
        </p>

        {status === 'loading' || status === 'verifying' ? (
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : null}

        {status === 'failed' && (
          <button
            onClick={() => router.replace('/')}
            className="mt-4 px-6 py-3 bg-[#0C4938] text-white rounded-xl font-bold hover:bg-[#0C4938]/90 transition-colors"
          >
            العودة للرئيسية
          </button>
        )}
      </motion.div>
    </div>
  );
}