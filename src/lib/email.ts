import { supabase } from "./supabase"

export interface OrderEmailPayload {
  toEmail: string
  toName: string
  orderNumber: string
  orderDate: string
  total: number
  subtotal: number
  deliveryFee: number
  discount: number
  paymentMethod: string
  items: Array<{
    name: string
    quantity: number
    price: number
    color?: string
  }>
  shippingAddress: {
    fullName: string
    street: string
    city: string
    country: string
    phone?: string
  }
}

/**
 * Dispatch an order confirmation email via Mailgun / Supabase Edge Functions.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<{ success: boolean; message?: string }> {
  try {
    // If Supabase functions are available, invoke the edge function
    if (supabase) {
      const { data, error } = await supabase.functions.invoke("send-order-email", {
        body: payload,
      })
      if (!error && data?.success) {
        console.info(`[Mailgun] Order confirmation sent for ${payload.orderNumber}`)
        return { success: true }
      }
    }

    // In local development or if edge function is not deployed yet, log the transactional email details
    console.info(`[Mailgun Transactional Simulation] Order #${payload.orderNumber} confirmation to ${payload.toEmail}:`, {
      itemsCount: payload.items.length,
      total: `$${payload.total.toFixed(2)}`,
      recipient: `${payload.toName} <${payload.toEmail}>`,
    })

    return { success: true, message: "Order email notification simulated/logged" }
  } catch (err: any) {
    console.warn("[Mailgun] Error dispatching order confirmation email:", err?.message || err)
    return { success: false, message: err?.message }
  }
}
