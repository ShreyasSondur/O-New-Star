import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get all floors
export async function GET() {
  try {
    const result = await query(`SELECT * FROM floors ORDER BY floor_number ASC`)

    return NextResponse.json({ floors: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching floors:", error)
    return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 })
  }
}

// Create new floor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, floor_number } = body

    if (!name || floor_number === undefined) {
      return NextResponse.json({ error: "Name and floor number are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO floors (name, floor_number)
       VALUES ($1, $2)
       RETURNING *`,
      [name, floor_number],
    )

    return NextResponse.json({ floor: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating floor:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Floor number already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create floor" }, { status: 500 })
  }
}
