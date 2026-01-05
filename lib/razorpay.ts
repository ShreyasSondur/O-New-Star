import crypto from "crypto"

export interface RazorpayOrderData {
  id: string
  amount: number
  currency: string
}

/**
 * Create Razorpay order
 * Backend creates the order with the correct amount
 */
export async function createRazorpayOrder(amount: number, receiptId: string): Promise<RazorpayOrderData> {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay credentials not configured")
  }

  // Amount in paise (smallest currency unit)
  const amountInPaise = Math.round(amount * 100)

  const orderData = {
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId,
  }

  const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("[v0] Razorpay order creation failed:", error)
    throw new Error("Failed to create Razorpay order")
  }

  const order = await response.json()
  return order
}

/**
 * Verify Razorpay payment signature
 * This prevents payment fraud
 */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

  if (!razorpayKeySecret) {
    throw new Error("Razorpay secret not configured")
  }

  const body = orderId + "|" + paymentId
  const expectedSignature = crypto.createHmac("sha256", razorpayKeySecret).update(body).digest("hex")

  return expectedSignature === signature
}
