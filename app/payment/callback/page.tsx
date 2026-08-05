// app/payment/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('جاري معالجة الدفع...');

  const paymentStatus = searchParams.get('status');

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
      setStatus('success');
      setMessage('تم شحن الكريديتس بنجاح! جاري التحضير...');
      setTimeout(() => {
        window.location.href = '/?payment=success';
      }, 2000);
    }
  }, [paymentStatus]);

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

        {status === 'loading' && (
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