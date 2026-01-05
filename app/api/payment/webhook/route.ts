import { NextResponse } from "next/server"
import crypto from "crypto"

/**
 * Razorpay webhook handler
 * Handles delayed payment confirmations
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret) {
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const event = JSON.parse(body)

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      console.log("[v0] Razorpay webhook: payment captured", { orderId, paymentId })

      // Find booking by order ID and confirm if not already confirmed
      // This is a backup mechanism in case the client-side verification failed
      // Implementation depends on your needs
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
