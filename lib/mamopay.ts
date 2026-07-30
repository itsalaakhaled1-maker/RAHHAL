// lib/mamopay.ts

const MAMO_BASE_URL = 'https://business.mamopay.com/manage_api/v1';
const MAMO_API_KEY = process.env.MAMO_API_KEY;

export async function createPaymentLink({...}) {
  // ... نفس الكود ...
}

export async function verifyPayment(transactionId: string) {
  const response = await fetch(`${MAMO_BASE_URL}/charges/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${MAMO_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
}