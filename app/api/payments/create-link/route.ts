// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mamopay';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId } = await request.json();
    
    // ✅ احصل على المستخدم الحقيقي من Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    const userEmail = user.email;
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'ضيف الرحّال';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    // ✅ تحويل المبلغ من درهم إلى فلس (×100)
    const amountInFils = Math.round(amount * 100);
    
    console.log('Creating payment link:', {
      amountInFils,
      description,
      tripId,
      userId,
      userEmail,
      userName,
    });
    
    const paymentLink = await createPaymentLink({
      amount: amountInFils, // ← بالفلس!
      currency: 'AED',
      description,
      tripId,
      userId,
      userEmail,
      userName,
      returnUrl: `${baseUrl}/?payment=success&tripId=${tripId}`,
      failureReturnUrl: `${baseUrl}/?payment=failed&tripId=${tripId}`,
    });

    console.log('Mamo response:', paymentLink);

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLink.url || paymentLink.payment_url || paymentLink.link_url,
      paymentLinkId: paymentLink.id,
      invoiceNumber: paymentLink.invoice_number,
    });
  } catch (error: any) {
    console.error('Payment link creation failed:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}