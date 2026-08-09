// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));
    
    const { transaction_id, status, custom_data, amount, currency } = payload;
    
    if (status === 'captured') {
      const supabase = createAdminClient();
      const userId = custom_data?.user_id;
      
      if (!userId) {
        console.error('Webhook: Missing user_id in custom_data');
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      }

      console.log(`Webhook: Processing payment for user ${userId}`);

      // ✅ تسجيل الدفع
      const { error: paymentError } = await supabase
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

      if (paymentError) {
        console.error('Webhook: Payment insert error:', paymentError);
      }

      // ✅ إضافة/تحديث الكريديتس (1 كريديتس لكل دفع)
      const { data: existing } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();

      const currentCredits = existing?.credits || 0;
      const newCredits = currentCredits + 1;

      const { error: creditsError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          updated_at: new Date().toISOString(),
        });

      if (creditsError) {
        console.error('Webhook: Credits upsert error:', creditsError);
        return NextResponse.json({ error: creditsError.message }, { status: 500 });
      }

      console.log(`Webhook: Added 1 credits to user ${userId}. New balance: ${newCredits}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}