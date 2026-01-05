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

      // Generate all dates that need to be locked
      const dates = generateDateRange(booking.check_in_date, booking.check_out_date)

      // Try to insert booking dates (this will fail if dates are already taken)
      for (const date of dates) {
        try {
          await client.query(
            `INSERT INTO booking_dates (booking_id, room_id, date)
             VALUES ($1, $2, $3)`,
            [bookingId, booking.room_id, date],
          )
        } catch (error: any) {
          // Unique constraint violation = double booking attempt
          if (error.code === "23505") {
            throw new Error("Room is no longer available for selected dates")
          }
          throw error
        }
      }

      // Update booking status
      await client.query(
        `UPDATE bookings
         SET status = 'CONFIRMED',
             payment_status = 'SUCCESS',
             razorpay_order_id = $1,
             razorpay_payment_id = $2
         WHERE id = $3`,
        [razorpayOrderId || null, razorpayPaymentId || null, bookingId],
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
