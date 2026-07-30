// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const WEBHOOK_SECRET = process.env.MAMO_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { transaction_id, status, custom_data } = payload; // ✅ custom_data
    
    if (status === 'captured') {
      const supabase = createAdminClient();
      
      await supabase
        .from('user_payments')
        .upsert({
          user_id: custom_data?.user_id,
          transaction_id,
          status: 'paid',
          amount: payload.amount,
          currency: payload.currency,
          paid_at: new Date().toISOString(),
          trip_id: custom_data?.trip_id,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}