"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, Lock, Ban, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Floor, Room } from "@/lib/types"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface RoomWithBlockStatus extends Room {
  status: "available" | "booked" | "blocked"
  floor_name: string
  booking_info?: any
  block_info?: any
}

export function RoomBlockingBoard() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<RoomWithBlockStatus[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Date Selection - Initialize with undefined to avoid hydration mismatch
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Initialize date on client only
  useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  // Dialogs
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; room?: RoomWithBlockStatus }>({ open: false })
  const [unblockDialog, setUnblockDialog] = useState<{ open: boolean; room?: RoomWithBlockStatus }>({ open: false })
  const [cancelBookingDialog, setCancelBookingDialog] = useState<{ open: boolean; room?: RoomWithBlockStatus }>({ open: false })

  const [blockForm, setBlockForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  })

  // Unblock
  const [unblockNow, setUnblockNow] = useState(true)
  const [unblockDate, setUnblockDate] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  // Recalculate statuses when date or data changes
  useEffect(() => {
    if (!isLoading) {
      calculateStatuses()
    }
  }, [selectedDate, blocks, bookings, floors])

  const fetchData = async () => {
    try {
      const [floorsRes, roomsRes, blocksRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/floors"),
        fetch("/api/admin/rooms"),
        fetch("/api/admin/blocks"),
        fetch("/api/admin/bookings"),
      ])

      if (floorsRes.ok && roomsRes.ok && blocksRes.ok && bookingsRes.ok) {
        const floorsData = await floorsRes.json()
        const roomsData = await roomsRes.json()
        const blocksData = await blocksRes.json()
        const bookingsData = await bookingsRes.json()

        setFloors(Array.isArray(floorsData.floors) ? floorsData.floors : floorsData)
        setRooms(Array.isArray(roomsData.rooms) ? roomsData.rooms : roomsData) // Raw rooms
        setBlocks(Array.isArray(blocksData.blocks) ? blocksData.blocks : blocksData)
        setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : bookingsData)

        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
      setIsLoading(false)
    }
  }

  const calculateStatuses = () => {
    if (!selectedDate) return
    const dateStr = format(selectedDate, "yyyy-MM-dd")

    const normalizeDate = (d: any) => {
      if (!d) return ""
      try {
        if (d instanceof Date) return format(d, "yyyy-MM-dd")
        if (typeof d === "string") return d.split("T")[0]
        return format(new Date(d), "yyyy-MM-dd")
      } catch (e) {
        return ""
      }
    }

    setRooms(prevRooms => prevRooms.map(room => {
      const floor = floors.find(f => f.id === room.floor_id)

      // Check Block
      const block = blocks.find((b: any) => b.room_id === room.id && normalizeDate(b.blocked_date) === dateStr)

      // Check Booking
      const booking = bookings.find((b: any) => {
        const checkIn = normalizeDate(b.check_in_date)
        const checkOut = normalizeDate(b.check_out_date)

        return b.room_id === room.id &&
          (b.status === 'CONFIRMED' || b.status === "PENDING") &&
          checkIn <= dateStr &&
          checkOut > dateStr
      })

      let status: "available" | "booked" | "blocked" = "available"
      if (block) status = "blocked"
      else if (booking) status = "booked"

      return {
        ...room,
        floor_name: floor?.name || floor?.floor_number?.toString() || "Unknown",
        status,
        block_info: block,
        booking_info: booking
      }
    }))
  }

  const handleBlockRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockDialog.room) return

    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: blockDialog.room.id,
          from_date: blockForm.fromDate,
          to_date: blockForm.toDate,
          reason: blockForm.reason,
        }),
      })

      if (res.ok) {
        // Optimistic update or refetch
        const newBlocks = await (await fetch("/api/admin/blocks")).json()
        setBlocks(newBlocks.blocks || [])
        setBlockDialog({ open: false })
        setBlockForm({ fromDate: "", toDate: "", reason: "" })
        toast.success("Room blocked")
      }
    } catch (error) {
      toast.error("Failed to block room")
    }
  }

  const handleUnblockRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unblockDialog.room) return

    try {
      const res = await fetch("/api/admin/blocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: unblockDialog.room.id,
          unblock_now: unblockNow,
          unblock_date: unblockNow ? null : unblockDate,
        }),
      })

      if (res.ok) {
        const newBlocks = await (await fetch("/api/admin/blocks")).json()
        setBlocks(newBlocks.blocks || [])
        setUnblockDialog({ open: false })
        toast.success("Room unblocked")
      }
    } catch (error) {
      toast.error("Failed to unblock room")
    }
  }

  const handleCancelBooking = async () => {
    if (!cancelBookingDialog.room || !cancelBookingDialog.room.booking_info) return

    try {
      // Use the generic cancel endpoint or create a specific admin one
      // Since there is no dedicated admin cancel, we use the booking ID to delete it
      const bookingId = cancelBookingDialog.room.booking_info.id

      const res = await fetch(`/api/bookings/cancel`, {
        method: "POST", // Using POST as per standard Next.js API generic handler usually, or DELETE if specific
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      if (res.ok) {
        setCancelBookingDialog({ open: false })
        toast.success("Booking cancelled & room unblocked")
        fetchData() // Refresh board
      } else {
        throw new Error("Failed to cancel")
      }
    } catch (error) {
      toast.error("Failed to cancel booking")
    }
  }

  const getRoomsByFloor = (floorId: number) => {
    return rooms.filter((r) => r.floor_id === floorId)
  }

  if (isLoading || !selectedDate) return <div className="text-center py-12">Loading board...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Room Blocking</h2>
          <p className="text-gray-600 mt-1">Select a date to manage room availability.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() - 1)
            setSelectedDate(d)
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() + 1)
            setSelectedDate(d)
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-900"></div>
          <span>Booked (Guest)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-500"></div>
          <span>Blocked (Admin)</span>
        </div>
      </div>

      <div className="space-y-8">
        {floors.map((floor) => {
          const floorRooms = getRoomsByFloor(floor.id)
          if (floorRooms.length === 0) return null

          return (
            <div key={floor.id} className="bg-white/50 rounded-xl p-6 border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                {floor.name || `Floor ${floor.floor_number}`}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {floorRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => {
                      if (room.status === 'blocked') setUnblockDialog({ open: true, room })
                      else if (room.status === 'available') {
                        // Pre-fill block form
                        setBlockForm({
                          fromDate: format(selectedDate, "yyyy-MM-dd"),
                          toDate: format(selectedDate, "yyyy-MM-dd"),
                          reason: ""
                        })
                        setBlockDialog({ open: true, room })
                      } else if (room.status === 'booked') {
                        setCancelBookingDialog({ open: true, room })
                      }
                    }}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 group",
                      room.status === 'available' && "bg-white border-green-100 hover:border-green-300",
                      room.status === 'booked' && "bg-gray-900 border-gray-900 text-white",
                      room.status === 'blocked' && "bg-red-50 border-red-200 hover:border-red-300"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg">{room.room_number}</span>
                      {room.status === 'booked' && <Lock className="h-4 w-4 opacity-50" />}
                      {room.status === 'blocked' && <Ban className="h-4 w-4 text-red-500" />}
                      {room.status === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100" />}
                    </div>
                    <div className="text-xs truncate opacity-80">
                      {room.status === 'booked' && (room.booking_info?.guest_name || "Guest")}
                      {room.status === 'blocked' && "Maintenance"}
                      {room.status === 'available' && "Available"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Block Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={open => setBlockDialog({ ...blockDialog, open })}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-slate-950 p-6 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
            <div className="relative z-10 bg-white/10 p-3 rounded-full mb-3 backdrop-blur-sm border border-white/10">
              <Ban className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="relative z-10 text-xl font-bold">Block Room {blockDialog.room?.room_number}</DialogTitle>
            <p className="relative z-10 text-slate-400 text-sm mt-1">Set a temporary restriction for this room.</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleBlockRoom} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-gray-200 h-11 bg-gray-50/50 hover:bg-white hover:border-blue-500 transition-colors",
                          !blockForm.fromDate && "text-muted-foreground"
                        )}
                      >
                        {blockForm.fromDate ? (
                          format(new Date(blockForm.fromDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={blockForm.fromDate ? new Date(blockForm.fromDate) : undefined}
                        onSelect={(date) => setBlockForm({ ...blockForm, fromDate: date ? format(date, "yyyy-MM-dd") : "" })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-gray-200 h-11 bg-gray-50/50 hover:bg-white hover:border-blue-500 transition-colors",
                          !blockForm.toDate && "text-muted-foreground"
                        )}
                      >
                        {blockForm.toDate ? (
                          format(new Date(blockForm.toDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={blockForm.toDate ? new Date(blockForm.toDate) : undefined}
                        onSelect={(date) => setBlockForm({ ...blockForm, toDate: date ? format(date, "yyyy-MM-dd") : "" })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</Label>
                <Textarea
                  value={blockForm.reason}
                  onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="e.g. Maintenance, Painting, or Reserved for VIP"
                  className="resize-none bg-gray-50 border-gray-200 focus:border-blue-500 transition-all min-h-[80px]"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setBlockDialog({ open: false })} className="h-11 border-gray-200">Cancel</Button>
                <Button type="submit" className="h-11 bg-slate-950 hover:bg-slate-900 text-white shadow-lg shadow-slate-950/20">
                  Block Room
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unblock Dialog */}
      <Dialog open={unblockDialog.open} onOpenChange={open => setUnblockDialog({ ...unblockDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock Room {unblockDialog.room?.room_number}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">Are you sure you want to unblock this room?</p>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded mb-4">
              <span className="text-sm font-medium">Unblock Immediately</span>
              <Switch checked={unblockNow} onCheckedChange={setUnblockNow} />
            </div>
            {!unblockNow && (
              <Input type="date" value={unblockDate} onChange={e => setUnblockDate(e.target.value)} />
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUnblockRoom}>Confirm Unblock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog (Unblock User Booking) */}
      <Dialog open={cancelBookingDialog.open} onOpenChange={open => setCancelBookingDialog({ ...cancelBookingDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking / Unblock Room</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 text-sm">
              <strong>Warning:</strong> This room is currently booked by a guest.
            </div>
            <p className="text-gray-600 mb-2">
              <strong>Guest:</strong> {cancelBookingDialog.room?.booking_info?.guest_name}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Dates:</strong> {cancelBookingDialog.room?.booking_info?.check_in_date} to {cancelBookingDialog.room?.booking_info?.check_out_date}
            </p>
            <p className="text-sm text-gray-500">
              Unblocking this room will <strong>cancel the guest's booking</strong> immediately.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBookingDialog({ open: false })}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancelBooking}>Confirm Cancel & Unblock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
