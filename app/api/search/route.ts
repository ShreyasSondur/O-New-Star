import { NextResponse } from "next/server"
import { getAvailableRooms } from "@/lib/availability"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { checkIn, checkOut, adults, children } = body

    // Validate dates
    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "Check-in and check-out dates are required" }, { status: 400 })
    }

    if (!adults || adults < 1) {
      return NextResponse.json({ error: "At least one adult is required" }, { status: 400 })
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 })
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Get available rooms
    const availableRooms = await getAvailableRooms(checkIn, checkOut, adults, children || 0)

    return NextResponse.json({
      rooms: availableRooms,
      searchParams: { checkIn, checkOut, adults, children: children || 0 },
    })
  } catch (error) {
    console.error("Error searching rooms:", error)
    return NextResponse.json({ error: "Failed to search rooms" }, { status: 500 })
  }
}
