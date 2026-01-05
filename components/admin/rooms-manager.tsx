"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit2, Wifi, Tv, AirVent, Wine } from "lucide-react"
import { toast } from "sonner"
import type { Floor } from "@/lib/types"

export function RoomsManager() {
  const [rooms, setRooms] = useState<any[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    floor_id: "",
    room_name: "",
    room_number: "",
    price_per_night: "",
    max_guests: "",
    is_active: true,
    image_url: "",
    has_wifi: false,
    has_tv: false,
    has_ac: false,
    has_bar: false,
  })

  useEffect(() => {
    fetchRooms()
    fetchFloors()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms")
      const data = await res.json()
      setRooms(data.rooms || [])
    } catch (error) {
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const fetchFloors = async () => {
    try {
      const res = await fetch("/api/admin/floors")
      const data = await res.json()
      setFloors(data.floors || [])
    } catch (error) {
      console.error("Failed to load floors")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.room_name || !formData.room_number || !formData.price_per_night || !formData.max_guests) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const url = editingId ? `/api/admin/rooms/${editingId}` : "/api/admin/rooms"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          floor_id: formData.floor_id ? Number.parseInt(formData.floor_id) : null,
          price_per_night: Number.parseFloat(formData.price_per_night),
          max_guests: Number.parseInt(formData.max_guests),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success(editingId ? "Room updated" : "Room created")
      resetForm()
      fetchRooms()
    } catch (error: any) {
      toast.error(error.message || "Failed to save room")
    }
  }

  const resetForm = () => {
    setFormData({
      floor_id: "",
      room_name: "",
      room_number: "",
      price_per_night: "",
      max_guests: "",
      is_active: true,
      image_url: "",
      has_wifi: false,
      has_tv: false,
      has_ac: false,
      has_bar: false,
    })
    setEditingId(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this room? All bookings for this room will be lost.")) return

    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" })

      if (!res.ok) throw new Error()

      toast.success("Room deleted")
      fetchRooms()
    } catch (error) {
      toast.error("Failed to delete room")
    }
  }

  const handleEdit = (room: any) => {
    setFormData({
      floor_id: room.floor_id?.toString() || "",
      room_name: room.room_name,
      room_number: room.room_number,
      price_per_night: room.price_per_night.toString(),
      max_guests: room.max_guests.toString(),
      is_active: room.is_active,
      image_url: room.image_url || "",
      has_wifi: room.has_wifi,
      has_tv: room.has_tv,
      has_ac: room.has_ac,
      has_bar: room.has_bar,
    })
    setEditingId(room.id)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Room" : "Add New Room"}</CardTitle>
          <CardDescription>Create and manage hotel rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="room_name">Room Name *</Label>
                <Input
                  id="room_name"
                  placeholder="e.g., Deluxe AC Room"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  placeholder="e.g., 101"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2500"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests">Max Guests *</Label>
                <Input
                  id="max_guests"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Select
                  value={formData.floor_id}
                  onValueChange={(value) => setFormData({ ...formData, floor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id.toString()}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <Label htmlFor="wifi" className="cursor-pointer">
                      WiFi
                    </Label>
                  </div>
                  <Switch
                    id="wifi"
                    checked={formData.has_wifi}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_wifi: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    <Label htmlFor="tv" className="cursor-pointer">
                      TV
                    </Label>
                  </div>
                  <Switch
                    id="tv"
                    checked={formData.has_tv}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_tv: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AirVent className="h-4 w-4" />
                    <Label htmlFor="ac" className="cursor-pointer">
                      AC
                    </Label>
                  </div>
                  <Switch
                    id="ac"
                    checked={formData.has_ac}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_ac: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wine className="h-4 w-4" />
                    <Label htmlFor="bar" className="cursor-pointer">
                      Bar
                    </Label>
                  </div>
                  <Switch
                    id="bar"
                    checked={formData.has_bar}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_bar: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="active" className="cursor-pointer">
                Room Active
              </Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? "Update Room" : "Add Room"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rooms created yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.id} className={room.is_active ? "" : "opacity-60"}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{room.room_name}</CardTitle>
                        <CardDescription>Room {room.room_number}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">₹{room.price_per_night}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Guests:</span>
                      <span>{room.max_guests}</span>
                    </div>
                    {room.floor_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span>{room.floor_name}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {room.has_wifi && <Wifi className="h-4 w-4 text-muted-foreground" />}
                      {room.has_tv && <Tv className="h-4 w-4 text-muted-foreground" />}
                      {room.has_ac && <AirVent className="h-4 w-4 text-muted-foreground" />}
                      {room.has_bar && <Wine className="h-4 w-4 text-muted-foreground" />}
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
