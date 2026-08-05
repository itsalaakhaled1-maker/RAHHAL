// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { transaction_id, status, custom_data, amount, currency } = payload;
    
    if (status === 'captured') {
      const supabase = createAdminClient();
      const userId = custom_data?.user_id;
      
      if (!userId) {
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      }

      // ✅ تسجيل الدفع
      await supabase
        .from('user_payments')
        .upsert({
          user_id: userId,
          transaction_id,
          status: 'paid',
          amount: amount,
          currency: currency,
          paid_at: new Date().toISOString(),
          trip_id: custom_data?.trip_id,
        });

      // ✅ إضافة/تحديث الكريديتس (10 كريديتس لكل دفع)
      const { data: existing } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();

      const currentCredits = existing?.credits || 0;
      const newCredits = currentCredits + 10; // ← 10 كريديتس لكل شحن

      await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}