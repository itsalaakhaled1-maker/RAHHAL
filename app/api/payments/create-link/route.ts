// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mamopay';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId, userId, origin } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId. User must be authenticated.' },
        { status: 401 }
      );
    }
    
    const baseUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId,
      returnUrl: `${baseUrl}/payment/callback?status=success&tripId=${tripId}`,
      failureReturnUrl: `${baseUrl}/payment/callback?status=failed&tripId=${tripId}`,
    });

    const linkId = paymentLink.id || paymentLink.link_id || paymentLink.payment_link_id;

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLink.url || paymentLink.payment_url || paymentLink.link_url,
      paymentLinkId: linkId,
      tripId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}