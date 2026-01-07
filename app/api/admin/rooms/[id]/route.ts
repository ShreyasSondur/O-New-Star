import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Update room
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const result = await query(
      `UPDATE rooms 
       SET floor_id = $1, room_name = $2, room_number = $3, price_per_night = $4,
           max_guests = $5, is_active = $6, image_url = $7, has_wifi = $8,
           has_tv = $9, has_ac = $10, has_bar = $11
       WHERE id = $12
       RETURNING *`,
      [
        floor_id || null,
        room_name,
        room_number,
        price_per_night,
        max_guests,
        is_active === undefined ? true : is_active,
        image_url || null,
        has_wifi,
        has_tv,
        has_ac,
        has_bar,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ room: result.rows[0] })
  } catch (error: any) {
    console.error("[v0] Error updating room:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Room number already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update room: " + (error.message || String(error)) }, { status: 500 })
  }
}

// Delete room
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting room:", error)
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}
