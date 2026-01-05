"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import type { Floor } from "@/lib/types"

export function FloorsManager() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", floor_number: "" })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchFloors()
  }, [])

  const fetchFloors = async () => {
    try {
      const res = await fetch("/api/admin/floors")
      const data = await res.json()
      setFloors(data.floors || [])
    } catch (error) {
      toast.error("Failed to load floors")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.floor_number) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const url = editingId ? `/api/admin/floors/${editingId}` : "/api/admin/floors"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          floor_number: Number.parseInt(formData.floor_number),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success(editingId ? "Floor updated" : "Floor created")
      setFormData({ name: "", floor_number: "" })
      setEditingId(null)
      fetchFloors()
    } catch (error: any) {
      toast.error(error.message || "Failed to save floor")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this floor? All rooms on this floor will be unassigned.")) return

    try {
      const res = await fetch(`/api/admin/floors/${id}`, { method: "DELETE" })

      if (!res.ok) throw new Error()

      toast.success("Floor deleted")
      fetchFloors()
    } catch (error) {
      toast.error("Failed to delete floor")
    }
  }

  const handleEdit = (floor: Floor) => {
    setFormData({ name: floor.name, floor_number: floor.floor_number.toString() })
    setEditingId(floor.id)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Floor" : "Add New Floor"}</CardTitle>
          <CardDescription>Create floors to organize your rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Floor Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ground Floor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor_number">Floor Number</Label>
                <Input
                  id="floor_number"
                  type="number"
                  placeholder="e.g., 0"
                  value={formData.floor_number}
                  onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? "Update Floor" : "Add Floor"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ name: "", floor_number: "" })
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Floors</CardTitle>
        </CardHeader>
        <CardContent>
          {floors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No floors created yet</p>
          ) : (
            <div className="space-y-2">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition"
                >
                  <div>
                    <p className="font-medium">{floor.name}</p>
                    <p className="text-sm text-muted-foreground">Floor #{floor.floor_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(floor)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(floor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
