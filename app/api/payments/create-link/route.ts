// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mamopay';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId, origin } = await request.json();
    
    const userId = 'test-user-id';

    // ✅ استخدم origin من الـ frontend
    const baseUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    console.log('Creating payment link with:', { amount, description, tripId, userId, baseUrl });
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId,
      // ✅ تعديل: returnUrl يذهب لصفحة الـ callback
      returnUrl: `${baseUrl}/payment/callback?status=success&tripId=${tripId}`,
      failureReturnUrl: `${baseUrl}/payment/callback?status=failed&tripId=${tripId}`,
    });

    console.log('Mamo response:', paymentLink);

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLink.url || paymentLink.payment_url || paymentLink.link_url,
      paymentLinkId: paymentLink.id,
    });
  } catch (error: any) {
    console.error('Payment link creation failed:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}