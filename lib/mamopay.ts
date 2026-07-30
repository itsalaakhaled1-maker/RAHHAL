// lib/mamopay.ts

const response = await fetch(`${MAMO_BASE_URL}/links/links`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${MAMO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount,
    currency,
    description,
    link_type: 'standalone', // ✅ غيّر من inline لـ standalone
    return_url: returnUrl,
    failure_return_url: failureReturnUrl,
    metadata: {
      trip_id: tripId,
      user_id: userId,
    },
  }),
});