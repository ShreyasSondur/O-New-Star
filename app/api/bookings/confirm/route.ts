import { NextResponse } from "next/server"
import { transaction } from "@/lib/db"
import { generateDateRange } from "@/lib/availability"

/**
 * CRITICAL BOOKING CONFIRMATION
 * This is where double booking is prevented via database transaction
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, razorpayOrderId, razorpayPaymentId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    // Execute confirmation in a transaction
    const result = await transaction(async (client) => {
      // Get booking details
      const bookingResult = await client.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId])

      if (bookingResult.rows.length === 0) {
        throw new Error("Booking not found")
      }

      const booking = bookingResult.rows[0]

      if (booking.status === "CONFIRMED") {
        throw new Error("Booking already confirmed")
      }

      if (booking.status === "CANCELLED") {
        throw new Error("Booking was cancelled")
      }

      // Dates are already reserved during booking creation (PENDING state)
      // So we just confirm the status here.

      // Update booking status
      // If payment IDs are provided, mark as SUCCESS, otherwise mark as PENDING (for manual confirmation)
      const paymentStatus = razorpayOrderId && razorpayPaymentId ? 'SUCCESS' : 'PENDING'

      await client.query(
        `UPDATE bookings
         SET status = 'CONFIRMED',
             payment_status = $1,
             razorpay_order_id = $2,
             razorpay_payment_id = $3
         WHERE id = $4`,
        [paymentStatus, razorpayOrderId || null, razorpayPaymentId || null, bookingId],
      )

      return booking
    })

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      bookingId: result.id,
    })
  } catch (error: any) {
    console.error("[v0] Error confirming booking:", error)
    return NextResponse.json({ error: error.message || "Failed to confirm booking" }, { status: 500 })
  }
}
