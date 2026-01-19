import { query } from "./db"
import type { AvailableRoom } from "./types"
import { parse, isValid, differenceInCalendarDays, addDays, format } from "date-fns"

/**
 * AVAILABILITY ENGINE
 * This is the heart of the system - it guarantees no double booking
 */

/**
 * Robustly parses a date string. Supports various formats if needed,
 * but primarily expects ISO (yyyy-MM-dd).
 * Returns null if invalid.
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // Try standard ISO first
  let date = new Date(dateStr)

  // If invalid, try manual parsing for common formats if strictly needed,
  // but for this app, we should enforce ISO from the frontend.
  // However, `new Date()` can be inconsistent across environments.

  if (!isValid(date)) {
    // Fallback: try parsing assuming yyyy-MM-dd if simple new Date failed
    // numeric check
    const parts = dateStr.split(/[-/]/)
    if (parts.length === 3) {
      date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    }
  }

  return isValid(date) ? date : null
}

// Generate array of dates between start and end (inclusive)
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = parseDate(startDate)
  const end = parseDate(endDate)

  if (!start || !end || start >= end) return []

  // Don't include checkout date in range for booking logic (nights)
  let current = start
  while (current < end) {
    dates.push(format(current, "yyyy-MM-dd"))
    current = addDays(current, 1)
  }

  return dates
}

// Calculate number of nights
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = parseDate(checkIn)
  const end = parseDate(checkOut)

  if (!start || !end) return 0

  const diffDays = differenceInCalendarDays(end, start)
  return diffDays > 0 ? diffDays : 0
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
  const nights = calculateNights(checkIn, checkOut)

  // Optimization: Single Query to find rooms that are NOT booked or blocked
  // Logic: 
  // 1. Find rooms matching guest capacity and active status
  // 2. EXCLUDE rooms that have an entry in 'booking_dates' or 'admin_blocks' for the requested range.

  // Note: We use 'checkIn <= date < checkOut' logic.
  // In our DB, 'booking_dates' stores individual occupied dates.

  // Postgres Date Range Overlap Logic:
  // We need to check if ANY row in booking_dates/admin_blocks has a date between checkIn (inclusive) and checkOut (exclusive).

  const queryText = `
    SELECT 
      r.id, r.room_name, r.room_number, r.price_per_night, r.max_guests, r.image_url, 
      r.has_wifi, r.has_tv, r.has_ac, r.has_bar,
      f.name as floor_name
    FROM rooms r
    LEFT JOIN floors f ON r.floor_id = f.id
    WHERE r.is_active = true
      AND r.max_guests >= $1
      AND r.id NOT IN (
        SELECT room_id FROM booking_dates 
        WHERE date >= $2 AND date < $3
      )
      AND r.id NOT IN (
        SELECT room_id FROM admin_blocks 
        WHERE blocked_date >= $2 AND blocked_date < $3
      )
    ORDER BY r.price_per_night ASC
  `

  const result = await query(queryText, [totalGuests, checkIn, checkOut])

  return result.rows.map(room => ({
    ...room,
    total_price: Number(room.price_per_night) * nights
  }))
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
