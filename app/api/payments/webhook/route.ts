// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createHmac } from 'crypto';

const WEBHOOK_SECRET = process.env.MAMO_WEBHOOK_SECRET;

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    // ✅ التحقق من التوقيع
    const signature = request.headers.get('x-mamo-signature') || '';
    const payload = await request.text(); // ← text() وليس json()
    
    if (!WEBHOOK_SECRET) {
      console.error('MAMO_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const data = JSON.parse(payload);
    const { transaction_id, status, custom_data, amount, currency } = data;
    
    if (status === 'captured') {
      const supabase = createAdminClient();
      
      await supabase
        .from('user_payments')
        .upsert({
          user_id: custom_data?.user_id,
          transaction_id,
          status: 'paid',
          amount: amount, // ← المبلغ من Mamopay (بالفلس)
          currency: currency,
          paid_at: new Date().toISOString(),
          trip_id: custom_data?.trip_id,
          invoice_number: custom_data?.invoice_number,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}