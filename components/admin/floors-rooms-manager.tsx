"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Trash2, Edit, BedDouble, Layers, ChevronRight, LayoutGrid, Users, Wifi, Tv, Wind, Wine, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Floor {
  id: number
  floor_number: number
  name?: string
  room_count?: number
}

interface Room {
  id: number
  room_number: string
  floor_id: number
  price_per_night: number
  capacity_adults: number
  room_name?: string
  is_active?: boolean
}

export function FloorsRoomsManager() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false)
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)

  // Forms
  const [newFloorData, setNewFloorData] = useState({ number: "", name: "" })
  const [newRoomData, setNewRoomData] = useState({
    number: "",
    price: "",
    adults: "2",
    name: "",
    image: "",
    amenities: { wifi: false, tv: false, ac: false, bar: false } as Record<string, boolean>
  })
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null)
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null)

  useEffect(() => {
    fetchFloorsAndRooms()
  }, [])

  const fetchFloorsAndRooms = async () => {
    setIsLoading(true)
    try {
      const [floorsRes, roomsRes] = await Promise.all([
        fetch("/api/admin/floors"),
        fetch("/api/admin/rooms"),
      ])

      if (floorsRes.ok && roomsRes.ok) {
        const floorsData = await floorsRes.json()
        const roomsData = await roomsRes.json()

        const validFloors = Array.isArray(floorsData.floors)
          ? floorsData.floors
          : Array.isArray(floorsData) ? floorsData : []

        const validRooms = Array.isArray(roomsData.rooms)
          ? roomsData.rooms
          : Array.isArray(roomsData) ? roomsData : []

        setFloors(validFloors.sort((a: Floor, b: Floor) => a.floor_number - b.floor_number))
        setRooms(validRooms)

        // Select first floor by default if available and none selected
        if (validFloors.length > 0 && selectedFloorId === null) {
          setSelectedFloorId(validFloors[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load floors and rooms")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFloor = async () => {
    if (!newFloorData.number) return
    try {
      const res = await fetch("/api/admin/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floor_number: parseInt(newFloorData.number),
          name: newFloorData.name
        }),
      })
      if (res.ok) {
        toast.success("Floor created")
        setIsAddFloorOpen(false)
        setNewFloorData({ number: "", name: "" })
        fetchFloorsAndRooms()
      } else {
        toast.error("Failed to create floor")
      }
    } catch (error) {
      toast.error("Error creating floor")
    }
  }

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewRoomData({ ...newRoomData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Amenities
  const toggleAmenity = (key: keyof typeof newRoomData.amenities) => {
    setNewRoomData({
      ...newRoomData,
      amenities: { ...newRoomData.amenities, [key]: !newRoomData.amenities[key] }
    })
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoomId(room.id)
    setNewRoomData({
      number: String(room.room_number || ""),
      price: String(room.price_per_night ?? ""),
      adults: String(room.capacity_adults ?? "2"),
      name: room.room_name || "",
      image: (room as any).image_url || "",
      amenities: {
        wifi: !!(room as any).has_wifi,
        tv: !!(room as any).has_tv,
        ac: !!(room as any).has_ac,
        bar: !!(room as any).has_bar
      }
    })
    setIsAddRoomOpen(true)
  }

  const handleAddRoomClick = () => {
    setEditingRoomId(null)
    setNewRoomData({
      number: "", price: "", adults: "2", name: "", image: "",
      amenities: { wifi: false, tv: false, ac: false, bar: false }
    })
    setIsAddRoomOpen(true)
  }

  const handleCreateOrUpdateRoom = async () => {
    if (!selectedFloorId || !newRoomData.number || !newRoomData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    const price = parseFloat(newRoomData.price)
    const guests = parseInt(newRoomData.adults)

    if (isNaN(price) || isNaN(guests)) {
      toast.error("Price and Guests must be valid numbers")
      return
    }

    try {
      const url = editingRoomId ? `/api/admin/rooms/${editingRoomId}` : "/api/admin/rooms"
      const method = editingRoomId ? "PUT" : "POST"

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floor_id: selectedFloorId,
          room_number: newRoomData.number,
          room_name: newRoomData.name || `Room ${newRoomData.number}`,
          price_per_night: parseFloat(newRoomData.price),
          max_guests: parseInt(newRoomData.adults),
          image_url: newRoomData.image,
          has_wifi: newRoomData.amenities.wifi,
          has_tv: newRoomData.amenities.tv,
          has_ac: newRoomData.amenities.ac,
          has_bar: newRoomData.amenities.bar,
        }),
      })

      if (res.ok) {
        toast.success(editingRoomId ? "Room updated" : "Room added successfully")
        setIsAddRoomOpen(false)
        setEditingRoomId(null)
        setNewRoomData({
          number: "", price: "", adults: "2", name: "", image: "",
          amenities: { wifi: false, tv: false, ac: false, bar: false }
        })
        fetchFloorsAndRooms()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save room")
        console.error("Save room error:", err)
      }
    } catch (error) {
      console.error("Internal save error:", error)
      toast.error("Error saving room")
    }
  }

  const handleDeleteRoom = async () => {
    if (!deleteRoomId) return
    try {
      await fetch(`/api/admin/rooms/${deleteRoomId}`, { method: "DELETE" })
      fetchFloorsAndRooms()
      toast.success("Room deleted")
    } catch (error) {
      toast.error("Failed to delete room")
    } finally {
      setDeleteRoomId(null)
    }
  }

  const filteredRooms = selectedFloorId
    ? rooms.filter(r => r.floor_id === selectedFloorId)
    : []

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading management interface...</div>

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px] items-start">
      {/* Sidebar: Floors List */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white rounded-xl border shadow-sm self-start">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between rounded-t-xl">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Layers className="h-4 w-4" /> Floors
          </h3>
          <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Floor</DialogTitle>
                <DialogDescription>Create a floor to group your rooms.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="floor-num">Floor Number</Label>
                  <Input
                    id="floor-num"
                    type="number"
                    value={newFloorData.number}
                    onChange={(e) => setNewFloorData({ ...newFloorData, number: e.target.value })}
                    placeholder="e.g. 1"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="floor-name">Floor Name (Optional)</Label>
                  <Input
                    id="floor-name"
                    value={newFloorData.name}
                    onChange={(e) => setNewFloorData({ ...newFloorData, name: e.target.value })}
                    placeholder="e.g. Ground Floor"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddFloor}>Create Floor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-2 space-y-1">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all cursor-pointer",
                selectedFloorId === floor.id
                  ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-1.5 h-1.5 rounded-full", selectedFloorId === floor.id ? "bg-blue-500" : "bg-gray-300")} />
                <span>{floor.name || `Floor ${floor.floor_number}`}</span>
              </div>

              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full transition-colors",
                selectedFloorId === floor.id ? "bg-white text-blue-700 shadow-sm" : "bg-gray-100 text-gray-500"
              )}>
                {rooms.filter(r => r.floor_id === floor.id).length}
              </span>
            </button>
          ))}
          {floors.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No floors yet.</div>
          )}
        </div>
      </div>

      {/* Main Content: Rooms Grid */}
      <div className="flex-1 w-full bg-white rounded-xl border shadow-sm min-h-[500px]">
        {selectedFloorId ? (
          <>
            <div className="p-6 border-b flex items-center justify-between bg-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  {floors.find(f => f.id === selectedFloorId)?.name || `Floor ${floors.find(f => f.id === selectedFloorId)?.floor_number}`}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredRooms.length} Rooms Available
                </p>
              </div>
              <Dialog open={isAddRoomOpen} onOpenChange={(open) => {
                setIsAddRoomOpen(open)
                if (!open) {
                  setEditingRoomId(null)
                  setNewRoomData({
                    number: "", price: "", adults: "2", name: "", image: "",
                    amenities: { wifi: false, tv: false, ac: false, bar: false }
                  })
                }
              }}>
                <Button onClick={handleAddRoomClick} className="bg-[#2671D9] hover:bg-[#1f5fc0] shadow-sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Room
                </Button>
                <DialogContent className="max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white" showCloseButton={false}>
                  <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center sticky top-0 z-10">
                    <div />
                    <DialogTitle className="text-lg font-bold text-gray-800">
                      {editingRoomId ? "Edit Room" : "Add Room"}
                    </DialogTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setIsAddRoomOpen(false)}>
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" /> Enter Room Name
                        </Label>
                        <Input
                          value={newRoomData.name}
                          onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })}
                          className="bg-gray-50 border-gray-200 h-11 focus:bg-white transition-all"
                          placeholder="e.g. Deluxe Ocean View"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" /> Room No.
                          </Label>
                          <Input
                            value={newRoomData.number}
                            onChange={e => setNewRoomData({ ...newRoomData, number: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-11 focus:bg-white transition-all"
                            placeholder="101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> Max Guests
                          </Label>
                          <Input
                            value={newRoomData.adults}
                            onChange={e => setNewRoomData({ ...newRoomData, adults: e.target.value })}
                            type="number"
                            className="bg-gray-50 border-gray-200 h-11 focus:bg-white transition-all"
                            placeholder="2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Enter Room Amount (₹)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">₹</span>
                          <Input
                            value={newRoomData.price}
                            onChange={e => setNewRoomData({ ...newRoomData, price: e.target.value })}
                            className="pl-8 bg-gray-50 border-gray-200 h-11 focus:bg-white transition-all font-medium"
                            placeholder="3000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Upload Image of the Room (Optional)</Label>
                        <div
                          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all relative group"
                          onClick={() => document.getElementById("room-image-upload")?.click()}
                        >
                          {newRoomData.image ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-sm">
                              <img src={newRoomData.image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                Change Image
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="h-6 w-6 text-blue-500" />
                              </div>
                              <p className="text-xs font-bold text-blue-500 uppercase">Add Image</p>
                              <p className="text-[10px] text-gray-400 mt-1">PNG or JPG up to 5MB</p>
                            </>
                          )}
                          <input
                            type="file"
                            id="room-image-upload"
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleImageUpload}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Add Amenities</Label>
                        <div className="flex gap-4 p-2 bg-gray-50/50 rounded-lg justify-between">
                          {[
                            { key: 'wifi', icon: Wifi, label: 'Wifi' },
                            { key: 'tv', icon: Tv, label: 'TV' },
                            { key: 'ac', icon: Wind, label: 'AC' },
                            { key: 'bar', icon: Wine, label: 'Bar' },
                          ].map(({ key, icon: Icon, label }) => (
                            <div key={key} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => toggleAmenity(key as keyof typeof newRoomData.amenities)}>
                              <Icon className={cn("h-5 w-5 transition-colors", newRoomData.amenities[key as keyof typeof newRoomData.amenities] ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600")} />
                              <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm",
                                newRoomData.amenities[key as keyof typeof newRoomData.amenities] ? "bg-blue-500 border-blue-500 scale-110" : "border-gray-200 bg-white group-hover:border-gray-300"
                              )}>
                                {newRoomData.amenities[key as keyof typeof newRoomData.amenities] && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-[10px] font-medium text-gray-500 uppercase">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t bg-gray-50 flex gap-3">
                    <Button variant="outline" className="flex-1 h-11 border-gray-200 hover:bg-gray-100 hover:text-gray-900" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                    <Button className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-200" onClick={handleCreateOrUpdateRoom}>
                      {editingRoomId ? "Update Room" : "Confirm Add"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="p-6">
              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <BedDouble className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="font-medium">No rooms on this floor yet.</p>
                  <Button variant="link" onClick={() => setIsAddRoomOpen(true)} className="text-blue-500">
                    Add your first room
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {filteredRooms.map(room => (
                    <Card key={room.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 bg-gray-200">
                        {/* Room Image */}
                        {/* We can fetch the specific room image logic here if it was passed, for now use placeholder or logic update to fetch room details including image */}
                        <img
                          src={(room as any).image_url || "/placeholder.svg?height=300&width=500"}
                          alt={room.room_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-black border-0 shadow-sm backdrop-blur-sm">
                            {room.room_number}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                          <div>
                            <h4 className="font-bold text-lg leading-tight">{room.room_name || `Room ${room.room_number}`}</h4>
                            <p className="text-sm opacity-90">{room.capacity_adults} Guests</p>
                          </div>
                          <p className="font-bold text-xl">₹{room.price_per_night}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-white flex justify-between items-center">
                        <div className="flex gap-2">
                          {(room as any).has_wifi && <Wifi className="h-4 w-4 text-gray-400" />}
                          {(room as any).has_tv && <Tv className="h-4 w-4 text-gray-400" />}
                          {(room as any).has_ac && <Wind className="h-4 w-4 text-gray-400" />}
                        </div>

                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100 rounded-full" onClick={() => handleEditRoom(room)}>
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 rounded-full" onClick={() => setDeleteRoomId(room.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Dialog open={!!deleteRoomId} onOpenChange={(open) => !open && setDeleteRoomId(null)}>
              <DialogContent className="max-w-sm rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-center pb-2">Delete Room?</DialogTitle>
                  <DialogDescription className="text-center">
                    Are you sure you want to delete this room? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 justify-center sm:justify-center mt-4">
                  <Button variant="outline" onClick={() => setDeleteRoomId(null)} className="flex-1">Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteRoom} className="flex-1 bg-red-600 hover:bg-red-700">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 min-h-[400px]">
            <div className="p-6 bg-gray-50 rounded-full mb-6 animate-pulse">
              <Layers className="h-10 w-10 opacity-30" />
            </div>
            <p className="text-xl font-medium text-gray-600">Select a floor to manage rooms</p>
            <p className="text-sm text-gray-400 mt-2">Choose a floor from the sidebar to view and add rooms.</p>
          </div>
        )}
      </div>
    </div>
  )
}
