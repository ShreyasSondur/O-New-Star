"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Building2, CheckCircle2, Lock, Calendar, Users, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  bookedBlocked: number
  occupancyRate?: number
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
    occupancyRate: 0,
  })
  const [guestList, setGuestList] = useState<any[]>([])
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">("week")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [filter, page])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Parallel Fetch for efficiency
      const [statsRes, guestsRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch(`/api/admin/dashboard/guests?filter=${filter}&page=${page}&limit=10`)
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json()
        setGuestList(guestsData.guests)
        if (guestsData.pagination) {
          setTotalPages(guestsData.pagination.totalPages)
        }
      }

    } catch (error) {
      console.error("Dashboard fetch error:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Calendar className="h-4 w-4" />
            <p>{new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(["today", "week", "month", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize cursor-pointer",
                filter === f ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Total Rooms</p>
              <h4 className="text-3xl font-bold mt-2">{stats.totalRooms}</h4>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Available</p>
              <h4 className="text-3xl font-bold mt-2">{stats.availableRooms}</h4>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Occupied</p>
              <h4 className="text-3xl font-bold mt-2">{stats.bookedBlocked}</h4>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Occupancy Rate</p>
              <h4 className="text-3xl font-bold mt-2">{stats.occupancyRate || 0}%</h4>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Guest List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold capitalize">{filter}s Guests</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchData()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading data...</div>
          ) : guestList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No guests found for this period.</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-medium text-gray-500">Guest Name</th>
                    <th className="py-3 px-4 font-medium text-gray-500">Room</th>
                    <th className="py-3 px-4 font-medium text-gray-500">Check In</th>
                    <th className="py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="py-3 px-4 font-medium text-gray-500 text-right">Amount</th>
                    <th className="py-3 px-4 font-medium text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guestList.map((guest) => (
                    <tr key={guest.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="py-4 px-4 font-semibold text-gray-900">{guest.name}</td>
                      <td className="py-4 px-4 text-gray-600">Room {guest.roomNumber}</td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(guest.date)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={guest.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                          {guest.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-700">₹{Number(guest.total_amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <GuestDetailsDialog guest={guest} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

function GuestDetailsDialog({ guest }: { guest: any }) {
  const details = guest.guest_details as any[] || []

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Booking ID: {guest.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Primary Contact</h4>
            <div className="text-sm text-gray-600">
              <p>Name: {guest.name}</p>
              <p>Email: {guest.email}</p>
              <p>Phone: {guest.phone}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Guest List ({details.length})</h4>
            {details.length > 0 ? (
              <div className="space-y-2">
                {details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">{d.name}</span>
                    <div className="text-gray-500 text-xs flex gap-3">
                      <span>Age: {d.age}</span>
                      <span className="capitalize">Sex: {d.gender}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional guest details recorded.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
