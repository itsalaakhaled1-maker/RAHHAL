// lib/mamopay.ts

const MAMO_BASE_URL = process.env.MAMO_BASE_URL || 'https://business.mamopay.com/manage_api/v1';
const MAMO_API_KEY = process.env.MAMO_API_KEY;

export async function createPaymentLink({
  amount,
  currency = 'AED',
  description,
  tripId,
  userId,
  returnUrl,
  failureReturnUrl,
}: {
  amount: number;
  currency?: string;
  description: string;
  tripId: string;
  userId: string;
  returnUrl: string;
  failureReturnUrl: string;
}) {
  // ✅ جرب endpoint مختلف
  const response = await fetch(`${MAMO_BASE_URL}/payment-links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MAMO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      description,
      link_type: 'inline',
      return_url: returnUrl,
      failure_return_url: failureReturnUrl,
      metadata: {
        trip_id: tripId,
        user_id: userId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mamo API error: ${error}`);
  }

  return response.json();
}

export async function verifyPayment(transactionId: string) {
  const response = await fetch(`${MAMO_BASE_URL}/transactions/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${MAMO_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
}