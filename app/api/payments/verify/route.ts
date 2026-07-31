// app/api/payments/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/mamopay';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    const transaction = await verifyPayment(transactionId);
    
    if (transaction.status === 'captured') {
      const supabase = createAdminClient();
      
      await supabase
        .from('user_payments')
        .upsert({
          user_id: transaction.custom_data?.user_id,
          transaction_id: transactionId,
          status: 'paid',
          amount: transaction.amount,
          currency: transaction.currency,
          paid_at: new Date().toISOString(),
          trip_id: transaction.custom_data?.trip_id,
          invoice_number: transaction.custom_data?.invoice_number,
        });

      return NextResponse.json({ 
        success: true, 
        status: 'paid',
        invoiceNumber: transaction.custom_data?.invoice_number,
      });
    }

    return NextResponse.json({ success: false, status: transaction.status });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}