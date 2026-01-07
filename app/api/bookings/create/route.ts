import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { isRoomAvailable, calculateNights } from "@/lib/availability"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, checkIn, checkOut, adults, children, guestName, guestEmail, guestPhone, guestAddress } = body

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !adults || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check room exists and is active
    const roomResult = await query(`SELECT * FROM rooms WHERE id = $1 AND is_active = true`, [roomId])

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found or inactive" }, { status: 404 })
    }

    const room = roomResult.rows[0]

    // Validate guest capacity
    const totalGuests = adults + (children || 0)
    if (totalGuests > room.max_guests) {
      return NextResponse.json({ error: "Too many guests for this room" }, { status: 400 })
    }

    // Re-check availability (critical!)
    const available = await isRoomAvailable(roomId, checkIn, checkOut)

    if (!available) {
      return NextResponse.json({ error: "Room is no longer available for selected dates" }, { status: 409 })
    }

    // Calculate total amount
    const nights = calculateNights(checkIn, checkOut)
    const totalAmount = Number.parseFloat(room.price_per_night) * nights

    // Use transaction to ensure booking and dates are created together
    const booking = await transaction(async (client) => {
      // 1. Create Booking
      const bookingResult = await client.query(
        `INSERT INTO bookings (
          room_id, guest_name, guest_email, guest_phone, guest_address,
          check_in_date, check_out_date, num_adults, num_children,
          total_amount, status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', 'PENDING')
        RETURNING *`,
        [
          roomId,
          guestName,
          guestEmail,
          guestPhone,
          guestAddress || null,
          checkIn,
          checkOut,
          adults,
          children || 0,
          totalAmount,
        ],
      )

      const newBooking = bookingResult.rows[0]

      // 2. Insert Booking Dates (Block the room)
      const { generateDateRange } = await import("@/lib/availability")
      const dates = generateDateRange(checkIn, checkOut)

      for (const date of dates) {
        try {
          await client.query(
            `INSERT INTO booking_dates (booking_id, room_id, date)
             VALUES ($1, $2, $3)`,
            [newBooking.id, roomId, date],
          )
        } catch (error: any) {
          if (error.code === "23505") {
            throw new Error("Room is no longer available for selected dates")
          }
          throw error
        }
      }

      return newBooking
    })

    return NextResponse.json({
      booking: {
        id: booking.id,
        roomId: booking.room_id,
        roomName: room.room_name,
        roomNumber: room.room_number,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        adults: booking.num_adults,
        children: booking.num_children,
        totalAmount: booking.total_amount,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        status: booking.status,
      },
    })

    // Send Confirmation Email
    const { sendEmail, generateBookingEmailHtml } = await import("@/lib/email")
    await sendEmail({
      to: guestEmail,
      subject: `Booking Confirmed #${booking.id} - O New Star Hotel`,
      html: generateBookingEmailHtml({
        id: booking.id,
        guestName: guestName,
        roomName: room.room_name,
        roomNumber: room.room_number,
        checkIn: checkIn,
        checkOut: checkOut,
        totalAmount: totalAmount,
      })
    })

    return NextResponse.json({
      booking: {
        id: booking.id,
        roomId: booking.room_id,
        roomName: room.room_name,
        roomNumber: room.room_number,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        adults: booking.num_adults,
        children: booking.num_children,
        totalAmount: booking.total_amount,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        status: booking.status,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
