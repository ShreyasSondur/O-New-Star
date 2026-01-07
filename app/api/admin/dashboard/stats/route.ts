import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0]


        // 1. Total Rooms
        const totalRoomsResult = await query(`SELECT COUNT(*) as count FROM rooms`)
        const totalRooms = parseInt(totalRoomsResult.rows[0].count)

        // 2. Booked Rooms (Active for the given date)
        const bookedRoomsResult = await query(
            `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'CONFIRMED' 
      AND check_in_date <= $1 
      AND check_out_date > $1
      `,
            [dateParam]
        )
        const bookedRooms = parseInt(bookedRoomsResult.rows[0].count)

        // 3. Blocked Rooms (Active for the given date)
        const blockedRoomsResult = await query(
            `
      SELECT COUNT(DISTINCT room_id) as count 
      FROM admin_blocks 
      WHERE blocked_date = $1
      `,
            [dateParam]
        )
        const blockedRooms = parseInt(blockedRoomsResult.rows[0].count)

        // 4. Available Rooms and Occupancy
        const occupiedResult = await query(
            `
        SELECT COUNT(DISTINCT room_id) as count
        FROM (
            SELECT room_id FROM bookings 
            WHERE status = 'CONFIRMED' AND check_in_date <= $1 AND check_out_date > $1
            UNION
            SELECT room_id FROM admin_blocks WHERE blocked_date = $1
        ) as occupied
        `,
            [dateParam]
        )
        const occupiedCount = parseInt(occupiedResult.rows[0].count)
        const availableRooms = totalRooms - occupiedCount

        return NextResponse.json({
            totalRooms,
            availableRooms,
            bookedBlocked: occupiedCount,
            occupancyRate: totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0
        })

    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
