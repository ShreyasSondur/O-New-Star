"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X, Calendar, User, Phone, Mail } from "lucide-react"
import { toast } from "sonner"
import type { Room } from "@/lib/types"

interface Booking {
  id: number
  room_id: number
  room_name: string
  room_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  num_adults: number
  num_children: number
  total_amount: number
  status: string
  payment_status: string
  is_admin_booking: boolean
  blocks_availability: boolean
  admin_notes?: string
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestAddress: "",
    adminNotes: "",
    blocksAvailability: true,
  })

  useEffect(() => {
    fetchBookings()
    fetchRooms()
  }, [])

  const fetchBookings = async (status?: string) => {
    try {
      let url = "/api/admin/bookings"
      if (status && status !== "all") {
        url += `?status=${status.toUpperCase()}`
      }

      const res = await fetch(url)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms")
      const data = await res.json()
      setRooms(data.rooms?.filter((r: Room) => r.is_active) || [])
    } catch (error) {
      console.error("Failed to load rooms")
    }
  }

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    fetchBookings(value)
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.roomId || !formData.checkIn || !formData.checkOut || !formData.guestName) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: Number.parseInt(formData.roomId),
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          adults: Number.parseInt(formData.adults),
          children: Number.parseInt(formData.children),
          guestName: formData.guestName,
          guestEmail: formData.guestEmail || null,
          guestPhone: formData.guestPhone || null,
          guestAddress: formData.guestAddress || null,
          adminNotes: formData.adminNotes || null,
          blocksAvailability: formData.blocksAvailability,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success("Booking created successfully")
      setShowCreateDialog(false)
      resetForm()
      fetchBookings(statusFilter)
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking")
    }
  }

  const resetForm = () => {
    setFormData({
      roomId: "",
      checkIn: "",
      checkOut: "",
      adults: "1",
      children: "0",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      guestAddress: "",
      adminNotes: "",
      blocksAvailability: true,
    })
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel this booking? The room will become available immediately.")) return

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success("Booking cancelled")
      fetchBookings(statusFilter)
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      CONFIRMED: "default",
      PENDING: "secondary",
      CANCELLED: "destructive",
    }

    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Manage Bookings</CardTitle>
              <CardDescription>View and manage all bookings</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-balance">Create Admin Booking</DialogTitle>
                    <DialogDescription className="text-balance">
                      Create a booking manually (offline booking, phone booking, etc.)
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="room">Room *</Label>
                      <Select
                        value={formData.roomId}
                        onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              Room {room.room_number} - {room.room_name} (₹{room.price_per_night}/night)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Check-in Date *</Label>
                        <Input
                          id="checkIn"
                          type="date"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkOut">Check-out Date *</Label>
                        <Input
                          id="checkOut"
                          type="date"
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults *</Label>
                        <Input
                          id="adults"
                          type="number"
                          min="1"
                          value={formData.adults}
                          onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">Children</Label>
                        <Input
                          id="children"
                          type="number"
                          min="0"
                          value={formData.children}
                          onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guestName">Guest Name *</Label>
                      <Input
                        id="guestName"
                        placeholder="Enter guest name"
                        value={formData.guestName}
                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="guestEmail">Guest Email</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          placeholder="guest@email.com"
                          value={formData.guestEmail}
                          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guestPhone">Guest Phone</Label>
                        <Input
                          id="guestPhone"
                          type="tel"
                          placeholder="+91 1234567890"
                          value={formData.guestPhone}
                          onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guestAddress">Guest Address</Label>
                      <Textarea
                        id="guestAddress"
                        placeholder="Enter guest address"
                        value={formData.guestAddress}
                        onChange={(e) => setFormData({ ...formData, guestAddress: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminNotes">Admin Notes</Label>
                      <Textarea
                        id="adminNotes"
                        placeholder="Internal notes about this booking"
                        value={formData.adminNotes}
                        onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label htmlFor="blocksAvailability" className="cursor-pointer font-medium">
                          Block Availability
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          If enabled, room won't be available to guests for these dates
                        </p>
                      </div>
                      <Switch
                        id="blocksAvailability"
                        checked={formData.blocksAvailability}
                        onCheckedChange={(checked) => setFormData({ ...formData, blocksAvailability: checked })}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Create Booking
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardContent className="pt-6">
          {bookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bookings found</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">
                            Booking #{booking.id} - Room {booking.room_number}
                          </h4>
                          {getStatusBadge(booking.status)}
                          {booking.is_admin_booking && <Badge variant="outline">Admin Booking</Badge>}
                          {booking.is_admin_booking && !booking.blocks_availability && (
                            <Badge variant="secondary">Non-blocking</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.guest_name}</span>
                          </div>
                          {booking.guest_email && booking.guest_email !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{booking.guest_email}</span>
                            </div>
                          )}
                          {booking.guest_phone && booking.guest_phone !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.guest_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                              {new Date(booking.check_out_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {booking.num_adults} Adult{booking.num_adults !== 1 ? "s" : ""}
                            {booking.num_children > 0 &&
                              `, ${booking.num_children} Child${booking.num_children !== 1 ? "ren" : ""}`}
                          </span>
                          <span className="font-semibold">
                            ₹{Number.parseFloat(booking.total_amount.toString()).toLocaleString()}
                          </span>
                        </div>

                        {booking.admin_notes && (
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            <strong>Notes:</strong> {booking.admin_notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {booking.status !== "CANCELLED" && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
