import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get all bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const roomId = searchParams.get("room_id")

    let sql = `SELECT 
                b.*,
                r.room_name,
                r.room_number
               FROM bookings b
               JOIN rooms r ON b.room_id = r.id
               WHERE 1=1`
    const params: any[] = []
    let paramCount = 1

    if (status) {
      sql += ` AND b.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    if (roomId) {
      sql += ` AND b.room_id = $${paramCount}`
      params.push(roomId)
      paramCount++
    }

    sql += ` ORDER BY b.created_at DESC`

    const result = await query(sql, params)

    return NextResponse.json({ bookings: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// Create admin booking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
      adminNotes,
      blocksAvailability,
    } = body

    if (!roomId || !checkIn || !checkOut || !adults || !guestName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get room details
    const roomResult = await query(`SELECT * FROM rooms WHERE id = $1`, [roomId])

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = roomResult.rows[0]

    // Calculate total
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = Number.parseFloat(room.price_per_night) * nights

    // Create booking
    const bookingResult = await query(
      `INSERT INTO bookings (
        room_id, guest_name, guest_email, guest_phone, guest_address,
        check_in_date, check_out_date, num_adults, num_children,
        total_amount, status, payment_status, is_admin_booking,
        blocks_availability, admin_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'CONFIRMED', 'SUCCESS', true, $11, $12)
      RETURNING *`,
      [
        roomId,
        guestName,
        guestEmail || "N/A",
        guestPhone || "N/A",
        guestAddress || null,
        checkIn,
        checkOut,
        adults,
        children || 0,
        totalAmount,
        blocksAvailability !== false,
        adminNotes || null,
      ],
    )

    const booking = bookingResult.rows[0]

    // If blocks availability, create booking dates
    if (blocksAvailability !== false) {
      const { generateDateRange } = await import("@/lib/availability")
      const dates = generateDateRange(checkIn, checkOut)

      for (const date of dates) {
        await query(
          `INSERT INTO booking_dates (booking_id, room_id, date)
           VALUES ($1, $2, $3)
           ON CONFLICT (room_id, date) DO NOTHING`,
          [booking.id, roomId, date],
        )
      }
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating admin booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
