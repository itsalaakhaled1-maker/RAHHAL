// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mamopay';
import { createAdminClient } from '@/lib/supabase-admin'; // ✅ استخدم admin client

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId } = await request.json();
    
    // ✅ استخدم admin client بدل server client
    const supabase = createAdminClient();
    
    // ✅ جيب الـ user من الـ request (JWT token)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId: user.id,
      returnUrl: `${baseUrl}/?payment=success&transactionId={TRANSACTION_ID}`,
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