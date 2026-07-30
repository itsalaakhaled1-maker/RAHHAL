// app/api/payments/create-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const MAMO_BASE_URL = 'https://business.mamopay.com/manage_api/v1';
const MAMO_API_KEY = process.env.MAMO_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId, userId } = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    // ✅ Mamo API — Create Payment Link
    const response = await fetch(`${MAMO_BASE_URL}/links/links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAMO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'AED',
        description,
        link_type: 'inline',
        return_url: `${baseUrl}/?payment=success&tripId=${tripId}`,
        failure_return_url: `${baseUrl}/?payment=failed&tripId=${tripId}`,
        metadata: {
          trip_id: tripId,
          user_id: userId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mamo API error:', errorText);
      throw new Error(`Mamo API error: ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      paymentLinkUrl: data.url || data.payment_url || data.link_url,
      paymentLinkId: data.id,
    });
  } catch (error) {
    console.error('Payment link creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}