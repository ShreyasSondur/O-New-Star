import { NextResponse } from "next/server"
import { transaction } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    // Cancel booking in transaction
    await transaction(async (client) => {
      // Update booking status
      const result = await client.query(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE id = $1
         RETURNING *`,
        [bookingId],
      )

      if (result.rows.length === 0) {
        throw new Error("Booking not found")
      }

      // Delete booking dates (makes room available immediately)
      await client.query(`DELETE FROM booking_dates WHERE booking_id = $1`, [bookingId])
    })

    return NextResponse.json({ success: true, message: "Booking cancelled successfully" })
  } catch (error: any) {
    console.error("[v0] Error cancelling booking:", error)
    return NextResponse.json({ error: error.message || "Failed to cancel booking" }, { status: 500 })
  }
}
