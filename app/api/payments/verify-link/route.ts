// app/api/payments/verify-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const MAMO_BASE_URL = 'https://business.mamopay.com/manage_api/v1';
const MAMO_API_KEY = process.env.MAMO_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');
    const userId = searchParams.get('userId');

    if (!linkId || !userId) {
      return NextResponse.json({ error: 'Missing linkId or userId' }, { status: 400 });
    }

    // استدعاء Mamopay API للتحقق من الـ link
    const response = await fetch(`${MAMO_BASE_URL}/links/${linkId}`, {
      headers: {
        'Authorization': `Bearer ${MAMO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mamopay verify error:', errorText);
      return NextResponse.json({ error: 'Failed to verify with Mamopay' }, { status: 500 });
    }

    const linkData = await response.json();
    console.log('Mamopay link data:', JSON.stringify(linkData, null, 2));

    // ✅ التحقق من حالة الدفع — status داخل charges array!
    let isPaid = false;
    let chargeId = linkId;

    // الطريقة 1: charges array
    if (linkData.charges && Array.isArray(linkData.charges) && linkData.charges.length > 0) {
      const lastCharge = linkData.charges[linkData.charges.length - 1];
      if (lastCharge.status === 'captured' || lastCharge.status === 'paid') {
        isPaid = true;
        chargeId = lastCharge.id || linkId;
      }
    }

    // الطريقة 2: payment_status على مستوى الـ link
    if (!isPaid && (linkData.payment_status === 'paid' || linkData.payment_status === 'captured')) {
      isPaid = true;
    }

    // الطريقة 3: paid boolean
    if (!isPaid && linkData.paid === true) {
      isPaid = true;
    }

    // الطريقة 4: status على مستوى الـ link (نادر)
    if (!isPaid && (linkData.status === 'paid' || linkData.status === 'captured' || linkData.status === 'completed')) {
      isPaid = true;
    }

    console.log('isPaid:', isPaid, '| chargeId:', chargeId);

    if (!isPaid) {
      return NextResponse.json({ 
        success: false, 
        status: linkData.charges?.[0]?.status || linkData.status || 'unknown', 
        paid: false 
      });
    }

    // ✅ الدفع ناجح — أضف الكريديتس
    const supabase = createAdminClient();

    // تسجيل الدفع
    await supabase.from('user_payments').upsert({
      user_id: userId,
      transaction_id: chargeId,
      status: 'paid',
      amount: linkData.amount,
      currency: linkData.amount_currency || 'AED',
      paid_at: new Date().toISOString(),
      trip_id: linkData.reference || linkId,
    });

    // إضافة الكريديتس
    const { data: existing } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    const currentCredits = existing?.credits || 0;
    const newCredits = currentCredits + 10;

    await supabase.from('user_credits').upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString(),
    });

    console.log(`✅ Manual verify: Added 10 credits to ${userId}. Balance: ${newCredits}`);

    return NextResponse.json({ 
      success: true, 
      paid: true, 
      credits: newCredits 
    });

  } catch (error) {
    console.error('Verify-link error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}