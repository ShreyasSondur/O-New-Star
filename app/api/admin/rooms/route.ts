import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get all rooms with floor info
export async function GET() {
  try {
    const result = await query(
      `SELECT r.*, f.name as floor_name, f.floor_number
       FROM rooms r
       LEFT JOIN floors f ON r.floor_id = f.id
       ORDER BY r.room_number ASC`,
    )

    return NextResponse.json({ rooms: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

// Create new room
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      floor_id,
      room_name,
      room_number,
      price_per_night,
      max_guests,
      is_active,
      image_url,
      has_wifi,
      has_tv,
      has_ac,
      has_bar,
    } = body

    if (!room_name || !room_number || !price_per_night || !max_guests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO rooms (
        floor_id, room_name, room_number, price_per_night, max_guests,
        is_active, image_url, has_wifi, has_tv, has_ac, has_bar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        floor_id || null,
        room_name,
        room_number,
        price_per_night,
        max_guests,
        is_active !== false,
        image_url || null,
        has_wifi || false,
        has_tv || false,
        has_ac || false,
        has_bar || false,
      ],
    )

    return NextResponse.json({ room: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating room:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Room number already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
