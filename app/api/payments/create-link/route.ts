// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mamopay';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId } = await request.json();
    
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId: user.id,
      returnUrl: `${baseUrl}/?payment=success&transactionId={TRANSACTION_ID}`, // Mamo بيستبدل {TRANSACTION_ID}
      failureReturnUrl: `${baseUrl}/?payment=failed&trip_id=${tripId}`,
    });

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
    });
  } catch (error) {
    console.error('Payment link creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}