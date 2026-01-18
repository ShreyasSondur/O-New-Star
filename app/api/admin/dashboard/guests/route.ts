import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") || "today"
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let startDate = new Date(today)
        let endDate = new Date(today)

        if (filter === "today") {
            endDate.setDate(endDate.getDate() + 1)
        } else if (filter === "week") {
            endDate.setDate(endDate.getDate() + 7)
        } else if (filter === "month") {
            endDate.setMonth(endDate.getMonth() + 1)
        }

        const bookings = await db.booking.findMany({
            where: {
                check_in_date: {
                    gte: startDate,
                    lt: endDate
                }
            },
            include: {
                room: true
            },
            orderBy: {
                check_in_date: 'asc'
            }
        })

        const mappedGuests = bookings.map(booking => ({
            id: booking.id,
            name: booking.guest_name,
            email: booking.guest_email,
            phone: booking.guest_phone,
            roomNumber: booking.room?.room_number || "N/A",
            status: booking.status,
            date: booking.check_in_date.toISOString().split('T')[0],
            total_amount: booking.total_amount,
            guest_details: booking.guest_details
        }))

        return NextResponse.json({
            guests: mappedGuests
        })

    } catch (error) {
        console.error("Dashboard guests error:", error)
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 })
    }
}
