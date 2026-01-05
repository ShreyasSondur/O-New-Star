import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { generateDateRange } from "@/lib/availability"

// Get all admin blocks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room_id")

    let sql = `SELECT ab.*, r.room_name, r.room_number
               FROM admin_blocks ab
               JOIN rooms r ON ab.room_id = r.id
               ORDER BY ab.blocked_date DESC`
    const params: any[] = []

    if (roomId) {
      sql = `SELECT ab.*, r.room_name, r.room_number
             FROM admin_blocks ab
             JOIN rooms r ON ab.room_id = r.id
             WHERE ab.room_id = $1
             ORDER BY ab.blocked_date DESC`
      params.push(roomId)
    }

    const result = await query(sql, params)

    return NextResponse.json({ blocks: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching blocks:", error)
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 })
  }
}

// Create admin block
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { room_id, from_date, to_date, start_date, end_date, reason } = body

    const startDate = from_date || start_date
    const endDate = to_date || end_date

    if (!room_id || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`[v0] Blocking room ${room_id} from ${startDate} to ${endDate}`)

    // Generate all dates in range
    const dates = generateDateRange(startDate, endDate)

    // Insert blocks for each date
    const insertedBlocks = []
    for (const date of dates) {
      try {
        const result = await query(
          `INSERT INTO admin_blocks (room_id, blocked_date, reason)
           VALUES ($1, $2, $3)
           ON CONFLICT (room_id, blocked_date) DO NOTHING
           RETURNING *`,
          [room_id, date, reason || null],
        )

        if (result.rows.length > 0) {
          insertedBlocks.push(result.rows[0])
        }
      } catch (error) {
        console.error(`[v0] Error blocking date ${date}:`, error)
      }
    }

    console.log(`[v0] Successfully blocked ${insertedBlocks.length} dates`)
    return NextResponse.json({ blocks: insertedBlocks }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating blocks:", error)
    return NextResponse.json({ error: "Failed to create blocks" }, { status: 500 })
  }
}

// Delete block (unblock room)
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { room_id, unblock_now, unblock_date } = body

    if (!room_id) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 })
    }

    console.log(`[v0] Unblocking room ${room_id}, unblock_now: ${unblock_now}`)

    if (unblock_now) {
      const today = new Date().toISOString().split("T")[0]
      const result = await query(
        `DELETE FROM admin_blocks 
         WHERE room_id = $1 AND blocked_date >= $2
         RETURNING *`,
        [room_id, today],
      )
      console.log(`[v0] Removed ${result.rows.length} blocks`)
      return NextResponse.json({ success: true, removed: result.rows.length })
    } else if (unblock_date) {
      const result = await query(
        `DELETE FROM admin_blocks 
         WHERE room_id = $1 AND blocked_date >= $2
         RETURNING *`,
        [room_id, unblock_date],
      )
      console.log(`[v0] Removed ${result.rows.length} blocks from ${unblock_date}`)
      return NextResponse.json({ success: true, removed: result.rows.length })
    }

    return NextResponse.json({ error: "Invalid unblock parameters" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error deleting blocks:", error)
    return NextResponse.json({ error: "Failed to delete blocks" }, { status: 500 })
  }
}
