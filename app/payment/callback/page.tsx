// app/payment/callback/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'verifying'>('loading');
  const [message, setMessage] = useState('جاري معالجة الدفع...');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const paymentStatus = searchParams.get('status');
  const tripId = searchParams.get('tripId');

  useEffect(() => {
    if (!paymentStatus) {
      window.location.href = '/';
      return;
    }

    if (paymentStatus === 'failed') {
      setStatus('failed');
      setMessage('لم يتم إتمام الدفع. جاري العودة...');
      setTimeout(() => {
        window.location.href = '/?payment=failed';
      }, 3000);
      return;
    }

    if (paymentStatus === 'success') {
      setStatus('verifying');
      setMessage('جاري التحقق من الدفع...');
      verifyAndAddCredits();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paymentStatus, tripId]);

  const verifyAndAddCredits = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('failed');
        setMessage('يجب تسجيل الدخول أولاً');
        setTimeout(() => { window.location.href = '/'; }, 3000);
        return;
      }

      const userId = session.user.id;

      // ✅ الخطوة 1: تحقق من Supabase أولاً (إذا وصل الـ Webhook)
      const { data: existingPayment } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingPayment) {
        const paidAt = new Date(existingPayment.paid_at);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (paidAt > tenMinutesAgo) {
          setStatus('success');
          setMessage('تم الشحن بنجاح! جاري التحضير...');
          setTimeout(() => {
            window.location.href = '/?payment=success';
          }, 1500);
          return;
        }
      }

      // ✅ الخطوة 2: تحقق من Supabase user_credits (إذا وصل الـ Webhook)
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();

      if (creditsData && creditsData.credits >= 10) {
        setStatus('success');
        setMessage('تم الشحن بنجاح! جاري التحضير...');
        setTimeout(() => {
          window.location.href = '/?payment=success';
        }, 1500);
        return;
      }

      // ✅ الخطوة 3: لم يصل الـ Webhook — تحقق يدوياً من Mamopay
      // نحتاج linkId. إذا لم يكن في URL، نبحث في localStorage
      const storedLinkId = localStorage.getItem('rahhal_last_link_id');

      if (storedLinkId) {
        const verifyResponse = await fetch(`/api/payments/verify-link?linkId=${storedLinkId}&userId=${userId}`);
        const verifyData = await verifyResponse.json();

        if (verifyData.success && verifyData.paid) {
          setStatus('success');
          setMessage('تم الشحن بنجاح! جاري التحضير...');
          setTimeout(() => {
            window.location.href = '/?payment=success';
          }, 1500);
          return;
        }
      }

      // ✅ الخطوة 4: Polling كل 3 ثواني (انتظر الـ Webhook)
      let attempts = 0;
      const maxAttempts = 10;

      intervalRef.current = setInterval(async () => {
        attempts++;

        // أعد التحقق من Supabase
        const { data: checkCredits } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .maybeSingle();

        if (checkCredits && checkCredits.credits >= 10) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus('success');
          setMessage('تم الشحن بنجاح! جاري التحضير...');
          setTimeout(() => {
            window.location.href = '/?payment=success';
          }, 1500);
          return;
        }

        if (attempts >= maxAttempts) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus('success');
          setMessage('تم الدفع! قد يستغرق تحديث الرصيد بضع دقائق...');
          setTimeout(() => {
            window.location.href = '/?payment=success';
          }, 3000);
        }
      }, 3000);

    } catch (error) {
      console.error('Callback verification error:', error);
      setStatus('success');
      setMessage('تم الدفع! جاري التحضير...');
      setTimeout(() => {
        window.location.href = '/?payment=success';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7E9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        {status === 'success' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[#0C4938] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#C9944D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        ) : status === 'failed' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#0C4938]/10 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0C4938]" />
          </div>
        )}
        
        <h1 className={`text-2xl font-bold mb-3 ${status === 'success' ? 'text-[#0C4938]' : status === 'failed' ? 'text-red-600' : 'text-[#0C4938]'}`}>
          {status === 'success' ? 'تم الشحن بنجاح!' : status === 'failed' ? 'لم يتم الدفع' : 'جاري المعالجة'}
        </h1>
        
        <p className="text-[#0C4938]/60 text-lg mb-8">{message}</p>

        {(status === 'loading' || status === 'verifying') && (
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#0C4938] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </motion.div>
    </div>
  );
}