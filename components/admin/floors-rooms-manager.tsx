"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Wifi, Tv, Wind, Wine, Users, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Floor, Room } from "@/lib/types"
import { toast } from "@/components/ui/toast"

export function FloorsRoomsManager() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedFloor, setSelectedFloor] = useState<string>("all")
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false)
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Floor form state
  const [floorForm, setFloorForm] = useState({ name: "", floor_number: "" })

  // Room form state
  const [roomForm, setRoomForm] = useState({
    room_name: "",
    room_number: "",
    price_per_night: "",
    max_guests: "",
    image_url: "",
    has_wifi: false,
    has_tv: false,
    has_ac: false,
    has_bar: false,
    floor_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("[v0] Fetching floors and rooms data...")
      const [floorsRes, roomsRes] = await Promise.all([fetch("/api/admin/floors"), fetch("/api/admin/rooms")])

      if (!floorsRes.ok || !roomsRes.ok) {
        console.error("[v0] API Error: Floors or Rooms fetch failed")
        toast.error("Failed to load data. Please check if DATABASE_URL is set in Vars.")
        setIsLoading(false)
        return
      }

      const floorsData = await floorsRes.json()
      const roomsData = await roomsRes.json()

      setFloors(Array.isArray(floorsData.floors) ? floorsData.floors : floorsData)
      setRooms(Array.isArray(roomsData.rooms) ? roomsData.rooms : roomsData)
      console.log("[v0] Successfully loaded floors and rooms")
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast.error("Failed to connect to database. Please add DATABASE_URL in Vars section.")
      setIsLoading(false)
    }
  }

  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(floorForm),
      })
      if (res.ok) {
        fetchData()
        setIsAddFloorOpen(false)
        setFloorForm({ name: "", floor_number: "" })
      }
    } catch (error) {
      console.error("[v0] Error adding floor:", error)
    }
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...roomForm,
          price_per_night: Number.parseFloat(roomForm.price_per_night),
          max_guests: Number.parseInt(roomForm.max_guests),
          floor_id: Number.parseInt(roomForm.floor_id),
        }),
      })
      if (res.ok) {
        fetchData()
        setIsAddRoomOpen(false)
        setRoomForm({
          room_name: "",
          room_number: "",
          price_per_night: "",
          max_guests: "",
          image_url: "",
          has_wifi: false,
          has_tv: false,
          has_ac: false,
          has_bar: false,
          floor_id: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding room:", error)
    }
  }

  const handleDeleteFloor = async (id: number) => {
    if (!confirm("Delete this floor? All rooms on this floor will also be deleted.")) return
    try {
      await fetch(`/api/admin/floors/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting floor:", error)
    }
  }

  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Delete this room?")) return
    try {
      await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting room:", error)
    }
  }

  const filteredRooms =
    selectedFloor === "all" ? rooms : rooms.filter((r) => r.floor_id === Number.parseInt(selectedFloor))

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Floors & Rooms</h2>
        <p className="text-gray-600 mt-1">Manage floors, rooms, and configure base prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floors Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Floors</h3>
            <Button onClick={() => setIsAddFloorOpen(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-1" />
              Add Floor
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 text-xs text-gray-600 uppercase tracking-wide pb-2 border-b">
              <div>Name</div>
              <div className="text-center">Rooms</div>
              <div className="text-right">Actions</div>
            </div>

            {floors.map((floor) => {
              const roomCount = rooms.filter((r) => r.floor_id === floor.id).length
              return (
                <div key={floor.id} className="grid grid-cols-3 items-center py-3 border-b last:border-0">
                  <div className="font-medium">{floor.name}</div>
                  <div className="text-center text-sm text-gray-600">{roomCount} Rooms</div>
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Pencil className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => handleDeleteFloor(floor.id)} className="p-2 hover:bg-gray-100 rounded">
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Rooms Panel */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold">Rooms</h3>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id.toString()}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={() => setIsAddRoomOpen(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-1" />
              Add Room
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={room.image_url || "/placeholder.svg?height=160&width=280"}
                    alt={room.room_name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={room.is_active ? "default" : "secondary"}
                      className={room.is_active ? "bg-green-500" : "bg-gray-500"}
                    >
                      {room.is_active ? "● Available" : "● Booked"}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-bold">
                    {room.room_number}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-sm uppercase text-gray-600 mb-1">{room.room_name}</h4>
                  <p className="text-2xl font-bold mb-3">
                    ₹ {room.price_per_night.toLocaleString()}{" "}
                    <span className="text-sm text-gray-500 font-normal">/ night</span>
                  </p>

                  <div className="flex items-center gap-3 mb-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">{room.max_guests} Guests</span>
                    </div>
                    {room.has_wifi && <Wifi className="h-4 w-4" />}
                    {room.has_tv && <Tv className="h-4 w-4" />}
                    {room.has_ac && <Wind className="h-4 w-4" />}
                    {room.has_bar && <Wine className="h-4 w-4" />}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Block
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Floor Dialog */}
      <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Floor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFloor} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enter Floor Name</Label>
              <Input
                value={floorForm.name}
                onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                placeholder="e.g., Ground Floor"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enter Floor Number</Label>
              <Input
                type="number"
                value={floorForm.floor_number}
                onChange={(e) => setFloorForm({ ...floorForm, floor_number: e.target.value })}
                placeholder="e.g., 0"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddFloorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Confirm Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enter Room Name</Label>
              <Input
                value={roomForm.room_name}
                onChange={(e) => setRoomForm({ ...roomForm, room_name: e.target.value })}
                placeholder="e.g., Deluxe Room"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enter Room Number</Label>
              <Input
                value={roomForm.room_number}
                onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                placeholder="e.g., 101"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Enter Room Amount</Label>
              <Input
                type="number"
                value={roomForm.price_per_night}
                onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })}
                placeholder="e.g., 3500"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Enter Number of Guests Allowed
              </Label>
              <Input
                type="number"
                value={roomForm.max_guests}
                onChange={(e) => setRoomForm({ ...roomForm, max_guests: e.target.value })}
                placeholder="e.g., 2"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Select Floor</Label>
              <select
                value={roomForm.floor_id}
                onChange={(e) => setRoomForm({ ...roomForm, floor_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select a floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Upload Image of the Room (Optional)
              </Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Add image in PNG or JPG format</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3 block">
                Add Amenities
              </Label>
              <div className="flex gap-6">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Wifi className="h-6 w-6 text-gray-600" />
                  <Checkbox
                    checked={roomForm.has_wifi}
                    onCheckedChange={(checked) => setRoomForm({ ...roomForm, has_wifi: checked as boolean })}
                  />
                </label>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Tv className="h-6 w-6 text-gray-600" />
                  <Checkbox
                    checked={roomForm.has_tv}
                    onCheckedChange={(checked) => setRoomForm({ ...roomForm, has_tv: checked as boolean })}
                  />
                </label>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Wind className="h-6 w-6 text-gray-600" />
                  <Checkbox
                    checked={roomForm.has_ac}
                    onCheckedChange={(checked) => setRoomForm({ ...roomForm, has_ac: checked as boolean })}
                  />
                </label>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Wine className="h-6 w-6 text-gray-600" />
                  <Checkbox
                    checked={roomForm.has_bar}
                    onCheckedChange={(checked) => setRoomForm({ ...roomForm, has_bar: checked as boolean })}
                  />
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddRoomOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Confirm Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
