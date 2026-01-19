import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") || "today"
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let startDate: Date
        let endDate: Date

        // Define exact ranges
        if (filter === "today") {
            startDate = new Date(today)
            endDate = new Date(today)
            endDate.setDate(endDate.getDate() + 1)
        } else if (filter === "week") {
            startDate = new Date(today)
            // Start of week (Sunday) ? Or just next 7 days? 
            // "week" in dashboard context usually means "Upcoming Week" or "This Week"
            // Preserving original logic: from today to +7 days
            endDate = new Date(today)
            endDate.setDate(endDate.getDate() + 7)
        } else if (filter === "month") {
            startDate = new Date(today)
            endDate = new Date(today)
            endDate.setMonth(endDate.getMonth() + 1)
        } else {
            // Default fallback
            startDate = new Date(today)
            endDate = new Date(today)
            endDate.setDate(endDate.getDate() + 1)
        }

        const whereClause = {
            check_in_date: {
                gte: startDate,
                lt: endDate
            }
        }

        // Parallel fetch: Count and Data
        const [totalCount, bookings] = await Promise.all([
            db.booking.count({ where: whereClause }),
            db.booking.findMany({
                where: whereClause,
                include: {
                    room: true
                },
                orderBy: {
                    check_in_date: 'asc'
                },
                take: limit,
                skip: skip
            })
        ])

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
            guests: mappedGuests,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        })

    } catch (error) {
        console.error("Dashboard guests error:", error)
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 })
    }
}
