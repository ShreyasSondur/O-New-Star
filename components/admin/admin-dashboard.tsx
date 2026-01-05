"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Building2, CheckCircle2, Lock, Calendar, Users, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  bookedBlocked: number
}

interface TodayGuest {
  id: number
  name: string
  bookingId: string
  roomNumber: string
  status: "Checked In" | "Pending" | "Checking Out"
}

interface UpcomingGuest {
  id: number
  name: string
  roomNumber: string
  status: string
  date: string
  bookingType?: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    bookedBlocked: 0,
  })
  const [todayGuests, setTodayGuests] = useState<TodayGuest[]>([])
  const [upcomingGuests, setUpcomingGuests] = useState<UpcomingGuest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log("[v0] Fetching dashboard data...")
      // Fetch stats
      const roomsRes = await fetch("/api/admin/rooms")
      const bookingsRes = await fetch("/api/admin/bookings")

      if (!roomsRes.ok || !bookingsRes.ok) {
        console.error("[v0] API Error: Failed to fetch dashboard data")
        toast.error("Failed to load data. Please check if DATABASE_URL is set in Vars.")
        setIsLoading(false)
        return
      }

      const roomsData = await roomsRes.json()
      const bookingsData = await bookingsRes.json()

      const rooms = Array.isArray(roomsData.rooms) ? roomsData.rooms : roomsData
      const bookings = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : bookingsData

      const totalRooms = rooms.length
      const today = new Date().toISOString().split("T")[0]

      // Calculate available rooms (simplified for now)
      const bookedToday = bookings.filter(
        (b: any) => b.status === "CONFIRMED" && b.check_in_date <= today && b.check_out_date > today,
      ).length

      setStats({
        totalRooms,
        availableRooms: totalRooms - bookedToday,
        bookedBlocked: bookedToday,
      })

      // Mock today's guests (you'll replace with real data)
      setTodayGuests([
        { id: 1, name: "Rajesh Jenkins", bookingId: "#0821", roomNumber: "104", status: "Checked In" },
        { id: 2, name: "Anita Sharma", bookingId: "#0822", roomNumber: "202", status: "Pending" },
        { id: 3, name: "Manoj Das", bookingId: "#0823", roomNumber: "101", status: "Checking Out" },
        { id: 4, name: "Sunita Kumar", bookingId: "#0830", roomNumber: "305", status: "Checked In" },
      ])

      // Mock upcoming guests
      setUpcomingGuests([
        { id: 1, name: "Mr. Rahul Verma", roomNumber: "204", status: "Confirmed", date: "TOMORROW, 25 OCT" },
        { id: 2, name: "Mrs. Priya Singh", roomNumber: "105", status: "Pending Payment", date: "TOMORROW, 25 OCT" },
        {
          id: 3,
          name: "Global Corp Team",
          roomNumber: "301-305",
          status: "Group Booking",
          date: "SATURDAY, 26 OCT",
          bookingType: "Group Booking",
        },
      ])

      console.log("[v0] Successfully loaded dashboard data")
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Dashboard data fetch error:", error)
      toast.error("Failed to connect to database. Please add DATABASE_URL in Vars section.")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600 mt-1">Daily operations overview for Ō New Star Hotel.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Total Rooms</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.totalRooms}</p>
                <span className="text-sm text-green-600 font-medium">↑ 100%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-green-100 rounded-full">
            <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Rooms Available</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.availableRooms}</p>
                <span className="text-sm text-gray-600 font-medium">Ready for check-in</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-blue-100 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(stats.availableRooms / stats.totalRooms) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Booked / Blocked</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.bookedBlocked}</p>
                <span className="text-sm text-orange-600 font-medium">High Occupancy</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-purple-100 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${(stats.bookedBlocked / stats.totalRooms) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Guests */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Today's Guests</h3>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Guest Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Room No
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayGuests.map((guest, idx) => (
                  <tr key={guest.id} className="border-b last:border-0">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                            idx === 0 && "bg-blue-100 text-blue-600",
                            idx === 1 && "bg-purple-100 text-purple-600",
                            idx === 2 && "bg-pink-100 text-pink-600",
                            idx === 3 && "bg-cyan-100 text-cyan-600",
                          )}
                        >
                          {guest.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold">{guest.name}</p>
                          <p className="text-sm text-gray-500">{guest.bookingId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold">{guest.roomNumber}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          guest.status === "Checked In"
                            ? "default"
                            : guest.status === "Pending"
                              ? "secondary"
                              : "outline"
                        }
                        className={cn(
                          guest.status === "Checked In" && "bg-green-100 text-green-700 hover:bg-green-100",
                          guest.status === "Pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                        )}
                      >
                        {guest.status} ✓
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="hover:bg-gray-100 p-2 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="w-full mt-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border">
            Show More Guests →
          </button>
        </Card>

        {/* Upcoming Guests */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Upcoming Guests</h3>

          <div className="space-y-4">
            {upcomingGuests.map((guest, idx) => (
              <div key={guest.id}>
                {(idx === 0 || upcomingGuests[idx - 1].date !== guest.date) && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 uppercase tracking-wide">
                    <Calendar className="h-3 w-3" />
                    {guest.date}
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{guest.name}</p>
                    <p className="text-xs text-gray-500">Room {guest.roomNumber}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 text-xs",
                        guest.status === "Confirmed" && "border-green-200 text-green-700",
                        guest.status === "Pending Payment" && "border-orange-200 text-orange-700",
                        guest.bookingType === "Group Booking" && "border-blue-200 text-blue-700",
                      )}
                    >
                      {guest.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View Calendar
          </Button>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
