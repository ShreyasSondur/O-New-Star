import { query } from "./db"
import type { AvailableRoom } from "./types"

/**
 * AVAILABILITY ENGINE
 * This is the heart of the system - it guarantees no double booking
 */

// Generate array of dates between start and end (inclusive)
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Don't include checkout date in range
  const current = new Date(start)
  while (current < end) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// Calculate number of nights
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get available rooms for a date range
 * A room is available ONLY if:
 * 1. It is active
 * 2. It can accommodate the number of guests
 * 3. It has NO bookings in the date range
 * 4. It has NO admin blocks in the date range
 */
export async function getAvailableRooms(
  checkIn: string,
  checkOut: string,
  adults: number,
  children = 0,
): Promise<AvailableRoom[]> {
  const totalGuests = adults + children
  const dates = generateDateRange(checkIn, checkOut)
  const nights = calculateNights(checkIn, checkOut)

  // Get all active rooms that can accommodate guests
  const roomsResult = await query(
    `SELECT r.*, f.name as floor_name
     FROM rooms r
     LEFT JOIN floors f ON r.floor_id = f.id
     WHERE r.is_active = true
     AND r.max_guests >= $1
     ORDER BY r.room_number`,
    [totalGuests],
  )

  const rooms = roomsResult.rows
  const availableRooms: AvailableRoom[] = []

  // For each room, check if it's available for ALL dates
  for (const room of rooms) {
    let isAvailable = true

    // Check if room has any bookings in date range
    for (const date of dates) {
      // Check booking_dates table
      const bookingCheck = await query(
        `SELECT 1 FROM booking_dates
         WHERE room_id = $1 AND date = $2
         LIMIT 1`,
        [room.id, date],
      )

      // Check admin_blocks table
      const blockCheck = await query(
        `SELECT 1 FROM admin_blocks
         WHERE room_id = $1 AND blocked_date = $2
         LIMIT 1`,
        [room.id, date],
      )

      if (bookingCheck.rows.length > 0 || blockCheck.rows.length > 0) {
        isAvailable = false
        break
      }
    }

    if (isAvailable) {
      availableRooms.push({
        ...room,
        total_price: Number.parseFloat(room.price_per_night) * nights,
      })
    }
  }

  return availableRooms
}

/**
 * Check if a specific room is available for a date range
 * Used before creating a booking
 */
export async function isRoomAvailable(roomId: number, checkIn: string, checkOut: string): Promise<boolean> {
  const dates = generateDateRange(checkIn, checkOut)

  for (const date of dates) {
    // Check booking_dates
    const bookingCheck = await query(
      `SELECT 1 FROM booking_dates
       WHERE room_id = $1 AND date = $2
       LIMIT 1`,
      [roomId, date],
    )

    // Check admin_blocks
    const blockCheck = await query(
      `SELECT 1 FROM admin_blocks
       WHERE room_id = $1 AND blocked_date = $2
       LIMIT 1`,
      [roomId, date],
    )

    if (bookingCheck.rows.length > 0 || blockCheck.rows.length > 0) {
      return false
    }
  }

  return true
}
