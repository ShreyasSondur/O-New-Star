import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createRazorpayOrder } from "@/lib/razorpay"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    // Get booking details
    const bookingResult = await query(`SELECT * FROM bookings WHERE id = $1`, [bookingId])

    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = bookingResult.rows[0]

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 })
    }

    // Backend determines the amount (never trust client)
    const amount = Number.parseFloat(booking.total_amount)

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, `booking_${bookingId}`)

    // Store order ID in booking
    await query(
      `UPDATE bookings
       SET razorpay_order_id = $1
       WHERE id = $2`,
      [order.id, bookingId],
    )

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      // Razorpay public key ID is safe to expose - it's designed to be public
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error("[v0] Error creating payment order:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 })
  }
}
