import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Update floor
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, floor_number } = body

    const result = await query(
      `UPDATE floors 
       SET name = $1, floor_number = $2
       WHERE id = $3
       RETURNING *`,
      [name, floor_number, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Floor not found" }, { status: 404 })
    }

    return NextResponse.json({ floor: result.rows[0] })
  } catch (error: any) {
    console.error("[v0] Error updating floor:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Floor number already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update floor" }, { status: 500 })
  }
}

// Delete floor
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await query(`DELETE FROM floors WHERE id = $1 RETURNING *`, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Floor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting floor:", error)
    return NextResponse.json({ error: "Failed to delete floor" }, { status: 500 })
  }
}
