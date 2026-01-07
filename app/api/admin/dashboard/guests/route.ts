import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") || "today" // today, week, month

        const db = await getDb()
        const today = new Date().toISOString().split('T')[0]

        let dateCondition = ""
        let params: any[] = []

        if (filter === "today") {
            dateCondition = "check_in_date = $1"
            params = [today]
        } else if (filter === "week") {
            // Upcoming week
            dateCondition = "check_in_date >= $1 AND check_in_date <= $1::date + INTERVAL '7 days'"
            params = [today]
        } else if (filter === "month") {
            // Upcoming month
            dateCondition = "check_in_date >= $1 AND check_in_date <= $1::date + INTERVAL '30 days'"
            params = [today]
        }

        // Fetch guests checking in based on filter
        const query = `
      SELECT 
        b.id,
        b.guest_name as name,
        b.room_id,
        r.room_number as "roomNumber",
        b.status,
        to_char(b.check_in_date, 'YYYY-MM-DD') as date,
        b.total_amount
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE ${dateCondition}
      ORDER BY b.check_in_date ASC
    `

        const result = await db.query(query, params)

        return NextResponse.json({
            guests: result.rows
        })

    } catch (error) {
        console.error("Dashboard guests error:", error)
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 })
    }
}
