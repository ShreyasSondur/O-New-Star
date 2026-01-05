"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Search } from "lucide-react"
import { toast } from "sonner"

interface SearchFormProps {
  onSearch: (data: { checkIn: string; checkOut: string; adults: number; children: number }) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.checkIn || !formData.checkOut) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    if (!formData.adults || Number.parseInt(formData.adults) < 1) {
      toast.error("At least one adult is required")
      return
    }

    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    onSearch({
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: Number.parseInt(formData.adults),
      children: Number.parseInt(formData.children) || 0,
    })
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Check In */}
        <div className="space-y-2">
          <Label htmlFor="checkIn" className="text-sm font-medium text-gray-700">
            Check In
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2671D9]" />
            <Input
              id="checkIn"
              type="date"
              min={today}
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              className="pl-10 bg-white border-gray-300 h-10"
              placeholder="Select date"
            />
          </div>
        </div>

        {/* Check Out */}
        <div className="space-y-2">
          <Label htmlFor="checkOut" className="text-sm font-medium text-gray-700">
            Check Out
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2671D9]" />
            <Input
              id="checkOut"
              type="date"
              min={formData.checkIn || today}
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              className="pl-10 bg-white border-gray-300 h-10"
              placeholder="Select date"
            />
          </div>
        </div>

        {/* Guests (Adults) */}
        <div className="space-y-2">
          <Label htmlFor="adults" className="text-sm font-medium text-gray-700">
            Guests
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2671D9]" />
            <Input
              id="adults"
              type="number"
              min="1"
              max="10"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
              className="pl-10 bg-white border-gray-300 h-10"
              placeholder="2 Adults"
            />
          </div>
        </div>

        {/* Guest 2A (Children) */}
        <div className="space-y-2">
          <Label htmlFor="children" className="text-sm font-medium text-gray-700">
            Guest 2A
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2671D9]" />
            <Input
              id="children"
              type="number"
              min="0"
              max="10"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: e.target.value })}
              className="pl-10 bg-white border-gray-300 h-10"
              placeholder="0 Children"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 bg-[#2671D9] hover:bg-[#1f5fc0] text-white font-medium text-base">
        <Search className="h-5 w-5 mr-2" />
        Search Available Rooms
      </Button>
    </form>
  )
}
