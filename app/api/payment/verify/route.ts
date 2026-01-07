import { NextResponse } from "next/server"
import { verifyRazorpaySignature } from "@/lib/razorpay"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body

    // Check if Razorpay is configured
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    // If Razorpay is not configured, allow booking confirmation without payment verification
    if (!razorpayKeySecret) {
      // Confirm booking directly without payment verification
      const confirmResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            razorpayOrderId: null,
            razorpayPaymentId: null,
          }),
        },
      )

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || "Failed to confirm booking")
      }

      const confirmData = await confirmResponse.json()

      return NextResponse.json({
        success: true,
        message: "Booking confirmed (payment gateway not configured)",
        bookingId: confirmData.bookingId,
      })
    }

    // Razorpay is configured - verify payment
    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Confirm booking (this will lock the dates)
    const confirmResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpayOrderId,
          razorpayPaymentId,
        }),
      },
    )

    if (!confirmResponse.ok) {
      const error = await confirmResponse.json()
      throw new Error(error.error || "Failed to confirm booking")
    }

    const confirmData = await confirmResponse.json()

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
      bookingId: confirmData.bookingId,
    })
  } catch (error: any) {
    console.error("[v0] Error verifying payment:", error)
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 })
  }
}
