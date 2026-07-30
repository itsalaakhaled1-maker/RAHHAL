// app/api/payments/create-link/route.ts

export async function POST(request: NextRequest) {
  try {
    const { amount, description, tripId } = await request.json();
    
    const userId = 'test-user-id';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tryrahhal.com';
    
    console.log('Creating payment link with:', { amount, description, tripId, userId });
    
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'AED',
      description,
      tripId,
      userId,
      returnUrl: `${baseUrl}/?payment=success&tripId=${tripId}`,
      failureReturnUrl: `${baseUrl}/?payment=failed&tripId=${tripId}`,
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
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}