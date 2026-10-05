export const PAYSTACK_PUBLIC_KEY = 'pk_test_7ca2c1410331a41bef68ab5297fddf025676ef65'
export const PAYSTACK_SECRET_KEY = 'sk_test_46510994026e659b84971642064de053d30cf8c0'
export const PAYSTACK_CURRENCY = 'NGN'
export const PAYSTACK_EXCHANGE_RATE = 1500 // 1 USD = 1,500 NGN
export const PAYSTACK_CALLBACK_URL = 'https://3legant-storefront.vercel.app/paystack-callback.html'

export interface PaystackInitParams {
  email: string
  amountUSD: number
  reference: string
  fullName?: string
}

export interface PaystackInitResult {
  success: boolean
  authorizationUrl?: string
  accessCode?: string
  reference: string
  error?: string
}

export interface PaystackVerifyResult {
  verified: boolean
  status: string
  amount?: number
  customer?: any
  error?: string
}

/**
 * Initializes a new transaction on Paystack to retrieve the secure checkout authorization URL.
 */
export async function initializePaystackCheckout(
  params: PaystackInitParams
): Promise<PaystackInitResult> {
  try {
    // Paystack amounts are in subunit (kobo for NGN). Minimum is 10,000 kobo (100 NGN).
    const computedKobo = Math.round(params.amountUSD * PAYSTACK_EXCHANGE_RATE * 100)
    const amountInSubunits = Math.max(computedKobo, 10000)

    const payload = {
      email: params.email.trim().toLowerCase(),
      amount: amountInSubunits,
      currency: PAYSTACK_CURRENCY,
      reference: params.reference,
      callback_url: PAYSTACK_CALLBACK_URL,
      metadata: {
        customer_name: params.fullName || '',
        platform: '3legant_mobile_app',
        amount_usd: params.amountUSD,
      },
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (data.status && data.data?.authorization_url) {
      return {
        success: true,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: params.reference,
      }
    }

    return {
      success: false,
      reference: params.reference,
      error: data.message || 'Failed to initialize Paystack transaction',
    }
  } catch (err: any) {
    console.error('[Paystack] Initialization error:', err)
    return {
      success: false,
      reference: params.reference,
      error: err?.message || 'Network error connecting to Paystack',
    }
  }
}

/**
 * Verifies a transaction on Paystack after the customer has interacted with the gateway.
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackVerifyResult> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.status && data.data?.status === 'success') {
      return {
        verified: true,
        status: 'success',
        amount: data.data.amount,
        customer: data.data.customer,
      }
    }

    return {
      verified: false,
      status: data.data?.status || 'incomplete',
      error: data.data?.gateway_response || data.message || 'Payment not verified',
    }
  } catch (err: any) {
    console.error('[Paystack] Verification error:', err)
    return {
      verified: false,
      status: 'error',
      error: err?.message || 'Failed to verify transaction',
    }
  }
}
