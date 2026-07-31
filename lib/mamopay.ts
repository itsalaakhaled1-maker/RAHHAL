// lib/mamopay.ts

const MAMO_BASE_URL = 'https://business.mamopay.com/manage_api/v1';
const MAMO_API_KEY = process.env.MAMO_API_KEY;

export async function createPaymentLink({
  amount,
  currency = 'AED',
  description,
  tripId,
  userId,
  userEmail,
  userName,
  returnUrl,
  failureReturnUrl,
}: {
  amount: number; // ← بالفلس! (مثلاً 900 = 9 دراهم)
  currency?: string;
  description: string;
  tripId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  returnUrl: string;
  failureReturnUrl: string;
}) {
  // ✅ توليد رقم فاتورة فريد
  const invoiceNumber = `RH-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  const response = await fetch(`${MAMO_BASE_URL}/links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MAMO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: description,
      description,
      active: true,
      return_url: returnUrl,
      failure_return_url: failureReturnUrl,
      amount, // ← يجب أن يكون بالفلس (×100)
      amount_currency: currency,
      link_type: 'standalone',
      enable_tabby: false,
      enable_message: false,
      enable_tips: false,
      save_card: 'off',
      enable_customer_details: true, // ← مفعل الآن
      enable_quantity: false,
      enable_qr_code: false,
      send_customer_receipt: true, // ← أرسل إيصال للعميل
      // ✅ أضفنا invoice_number
      invoice_number: invoiceNumber,
      // ✅ أضفنا بيانات العميل
      customer_email: userEmail,
      customer_name: userName,
      custom_data: {
        trip_id: tripId,
        user_id: userId,
        invoice_number: invoiceNumber,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Mamo API error:', error);
    throw new Error(`Mamo API error: ${error}`);
  }

  return response.json();
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