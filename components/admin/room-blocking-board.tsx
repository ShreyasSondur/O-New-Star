"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Lock, Ban } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Floor, Room } from "@/lib/types"
import { toast } from "react-toastify"

interface RoomWithBlockStatus extends Room {
  status: "available" | "booked" | "blocked"
  floor_name: string
}

export function RoomBlockingBoard() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<RoomWithBlockStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; room?: RoomWithBlockStatus }>({ open: false })
  const [unblockDialog, setUnblockDialog] = useState<{ open: boolean; room?: RoomWithBlockStatus }>({ open: false })

  const [blockForm, setBlockForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  })

  const [unblockNow, setUnblockNow] = useState(true)
  const [unblockDate, setUnblockDate] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("[v0] Fetching room blocking data...")
      const [floorsRes, roomsRes, blocksRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/floors"),
        fetch("/api/admin/rooms"),
        fetch("/api/admin/blocks"),
        fetch("/api/admin/bookings"),
      ])

      if (!floorsRes.ok || !roomsRes.ok || !blocksRes.ok || !bookingsRes.ok) {
        console.error("[v0] API Error: Failed to fetch room blocking data")
        toast.error("Failed to load data. Please check if DATABASE_URL is set in Vars.")
        setIsLoading(false)
        return
      }

      const floorsData = await floorsRes.json()
      const roomsData = await roomsRes.json()
      const blocksData = await blocksRes.json()
      const bookingsData = await bookingsRes.json()

      const floorsList = Array.isArray(floorsData.floors) ? floorsData.floors : floorsData
      const roomsList = Array.isArray(roomsData.rooms) ? roomsData.rooms : roomsData
      const blocksList = Array.isArray(blocksData.blocks) ? blocksData.blocks : blocksData
      const bookingsList = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : bookingsData

      const today = new Date().toISOString().split("T")[0]

      // Combine room data with status
      const roomsWithStatus: RoomWithBlockStatus[] = roomsList.map((room: Room) => {
        const floor = floorsList.find((f: Floor) => f.id === room.floor_id)

        // Check if blocked today
        const isBlocked = blocksList.some((block: any) => block.room_id === room.id && block.blocked_date === today)

        // Check if booked today
        const isBooked = bookingsList.some(
          (booking: any) =>
            booking.room_id === room.id &&
            booking.status === "CONFIRMED" &&
            booking.check_in_date <= today &&
            booking.check_out_date > today,
        )

        let status: "available" | "booked" | "blocked" = "available"
        if (isBlocked) status = "blocked"
        else if (isBooked) status = "booked"

        return {
          ...room,
          floor_name: floor?.name || "Unknown Floor",
          status,
        }
      })

      setFloors(floorsList)
      setRooms(roomsWithStatus)
      console.log("[v0] Successfully loaded room blocking data")
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast.error("Failed to connect to database. Please add DATABASE_URL in Vars section.")
      setIsLoading(false)
    }
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
        fetchData()
        setBlockDialog({ open: false })
        setBlockForm({ fromDate: "", toDate: "", reason: "" })
      }
    } catch (error) {
      console.error("[v0] Error blocking room:", error)
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
        fetchData()
        setUnblockDialog({ open: false })
        setUnblockNow(true)
        setUnblockDate("")
      }
    } catch (error) {
      console.error("[v0] Error unblocking room:", error)
    }
  }

  const getRoomsByFloor = (floorId: number) => {
    return rooms.filter((r) => r.floor_id === floorId)
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Room Status Board</h2>
        <p className="text-gray-600 mt-1">Block or unblock rooms for offline bookings or maintenance.</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-800"></div>
          <span className="text-sm font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-sm font-medium">Blocked</span>
        </div>
      </div>

      {/* Floors and Rooms */}
      <div className="space-y-6">
        {floors.map((floor) => {
          const floorRooms = getRoomsByFloor(floor.id)
          if (floorRooms.length === 0) return null

          return (
            <div key={floor.id}>
              <div className="flex items-center gap-2 mb-4">
                <Building2Icon className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-bold">{floor.name}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {floorRooms.map((room) => (
                  <Card
                    key={room.id}
                    className={cn(
                      "p-6 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                      room.status === "available" && "bg-white border-green-200",
                      room.status === "booked" && "bg-gray-800 text-white border-gray-700",
                      room.status === "blocked" && "bg-blue-400 text-white border-blue-500",
                    )}
                    onClick={() => {
                      if (room.status === "blocked") {
                        setUnblockDialog({ open: true, room })
                      } else if (room.status === "available") {
                        setBlockDialog({ open: true, room })
                      }
                    }}
                  >
                    {/* Status Icon */}
                    <div className="absolute top-2 right-2">
                      {room.status === "available" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {room.status === "booked" && <Lock className="h-5 w-5" />}
                      {room.status === "blocked" && <Ban className="h-5 w-5" />}
                    </div>

                    {/* Room Number */}
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{room.room_number}</div>
                      <div
                        className={cn(
                          "text-sm font-medium capitalize",
                          room.status === "available" && "text-green-600",
                        )}
                      >
                        {room.status}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Block Room Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={(open) => setBlockDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              <DialogTitle>Block Room {blockDialog.room?.room_number}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleBlockRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">From Date</Label>
                <Input
                  type="date"
                  value={blockForm.fromDate}
                  onChange={(e) => setBlockForm({ ...blockForm, fromDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">To Date</Label>
                <Input
                  type="date"
                  value={blockForm.toDate}
                  onChange={(e) => setBlockForm({ ...blockForm, toDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Reason / Note (Optional)
              </Label>
              <Textarea
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                placeholder="e.g. Maintenance required for AC unit"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setBlockDialog({ open: false })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800">
                <Ban className="h-4 w-4 mr-2" />
                Block Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unblock Room Dialog */}
      <Dialog open={unblockDialog.open} onOpenChange={(open) => setUnblockDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <DialogTitle>Unblock Room {unblockDialog.room?.room_number}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleUnblockRoom} className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Unblock Now</p>
                <p className="text-sm text-gray-600">Room becomes available immediately</p>
              </div>
              <Switch checked={unblockNow} onCheckedChange={setUnblockNow} />
            </div>

            {!unblockNow && (
              <div>
                <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Or Schedule Unblock Date
                </Label>
                <Input
                  type="date"
                  value={unblockDate}
                  onChange={(e) => setUnblockDate(e.target.value)}
                  required={!unblockNow}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setUnblockDialog({ open: false })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Unblock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
