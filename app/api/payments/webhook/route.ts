// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const WEBHOOK_AUTH_HEADER = process.env.MAMO_WEBHOOK_SECRET || 'authentication header';

export async function POST(request: NextRequest) {
  try {
    // التحقق من auth header (Mamo يرسل header اسمه "authentication header")
    const authHeader = request.headers.get('authentication header');
    
    if (authHeader !== WEBHOOK_AUTH_HEADER) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const { transaction_id, status, metadata } = payload;
    
    if (status === 'completed' || status === 'success' || status === 'captured') {
      const supabase = createClient();
      
      await supabase
        .from('user_payments')
        .upsert({
          user_id: metadata.user_id,
          transaction_id,
          status: 'paid',
          amount: payload.amount,
          currency: payload.currency,
          paid_at: new Date().toISOString(),
          trip_id: metadata.trip_id,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}