// Supabase Edge Function: send-order-email
// Dispatches transactional order confirmation emails via Mailgun
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { toEmail, toName, orderNumber, total, items, shippingAddress } = payload

    const mailgunKey = Deno.env.get("MAILGUN_API_KEY")
    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN")
    const mailgunRegion = Deno.env.get("MAILGUN_REGION") || "us"
    const sender = Deno.env.get("MAILGUN_SENDER") || `3legant Store <orders@${mailgunDomain}>`

    if (!mailgunKey || !mailgunDomain) {
      console.warn("Mailgun environment variables not set. Simulating email dispatch.")
      return new Response(
        JSON.stringify({ success: true, simulated: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const host = mailgunRegion === "eu" ? "api.eu.mailgun.net" : "api.mailgun.net"
    const endpoint = `https://${host}/v3/${mailgunDomain}/messages`

    const itemsHtml = (items || [])
      .map(
        (i: any) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${Number(i.price * i.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("")

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #141718;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Thank you for your order!</h1>
        <p style="color: #6c7275; margin-bottom: 24px;">Your order <strong>#${orderNumber}</strong> has been confirmed and is being prepared.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f3f5f7; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 24px;">
          <p style="font-size: 18px; font-weight: 600;">Total Paid: $${Number(total).toFixed(2)}</p>
        </div>

        <div style="background: #f3f5f7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #6c7275;">Delivery Address</h3>
          <p style="margin: 0;">${shippingAddress?.fullName || toName}</p>
          <p style="margin: 0;">${shippingAddress?.street || ""}</p>
          <p style="margin: 0;">${shippingAddress?.city || ""}, ${shippingAddress?.country || ""}</p>
        </div>

        <p style="font-size: 12px; color: #6c7275; text-align: center;">
          3legant Store • 234 Hai Trieu, Ho Chi Minh City, Viet Nam
        </p>
      </div>
    `

    const formData = new FormData()
    formData.append("from", sender)
    formData.append("to", `${toName} <${toEmail}>`)
    formData.append("subject", `Order Confirmation #${orderNumber} — 3legant`)
    formData.append("html", html)

    const authHeader = `Basic ${btoa(`api:${mailgunKey}`)}`
    const mgRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    })

    if (!mgRes.ok) {
      const errText = await mgRes.text()
      throw new Error(`Mailgun error: ${mgRes.status} ${errText}`)
    }

    const mgJson = await mgRes.json()
    return new Response(
      JSON.stringify({ success: true, mailgunId: mgJson.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
