// app/api/payments/create-link/route.ts (مؤقت — للاختبار فقط)

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId } = await request.json();
    
    // ✅ مؤقت — تجاوز Auth للاختبار
    const userId = 'test-user-id';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId,
      returnUrl: `${baseUrl}/?payment=success&tripId=${tripId}`,
      failureReturnUrl: `${baseUrl}/?payment=failed&tripId=${tripId}`,
    });

    return NextResponse.json({
      success: true,
      paymentLinkUrl: paymentLink.url || paymentLink.payment_url || paymentLink.link_url,
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