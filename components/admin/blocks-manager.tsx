"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Room } from "@/lib/types"

export function BlocksManager() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    room_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  useEffect(() => {
    fetchBlocks()
    fetchRooms()
  }, [])

  const fetchBlocks = async () => {
    try {
      const res = await fetch("/api/admin/blocks")
      const data = await res.json()
      setBlocks(data.blocks || [])
    } catch (error) {
      toast.error("Failed to load blocks")
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms")
      const data = await res.json()
      setRooms(data.rooms || [])
    } catch (error) {
      console.error("Failed to load rooms")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.room_id || !formData.start_date || !formData.end_date) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: Number.parseInt(formData.room_id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      const data = await res.json()
      toast.success(`Blocked ${data.blocks.length} dates`)
      setFormData({ room_id: "", start_date: "", end_date: "", reason: "" })
      fetchBlocks()
    } catch (error: any) {
      toast.error(error.message || "Failed to create blocks")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this block?")) return

    try {
      const res = await fetch(`/api/admin/blocks?id=${id}`, { method: "DELETE" })

      if (!res.ok) throw new Error()

      toast.success("Block removed")
      fetchBlocks()
    } catch (error) {
      toast.error("Failed to remove block")
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Block Room Dates</CardTitle>
          <CardDescription>Prevent rooms from being booked on specific dates</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.room_number} - {room.room_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Maintenance, Owner use"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Block Dates
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          {blocks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active blocks</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition"
                >
                  <div>
                    <p className="font-medium">
                      Room {block.room_number} - {block.room_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(block.blocked_date).toLocaleDateString()}</p>
                    {block.reason && <p className="text-sm text-muted-foreground mt-1">{block.reason}</p>}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(block.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
