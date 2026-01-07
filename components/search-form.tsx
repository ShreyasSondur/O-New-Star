"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Users, Search } from "lucide-react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchFormProps {
  onSearch: (data: { checkIn: string; checkOut: string; adults: number; children: number }) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const [formData, setFormData] = useState({
    adults: "2",
    children: "0",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!date.from || !date.to) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    if (!formData.adults || Number.parseInt(formData.adults) < 1) {
      toast.error("At least one adult is required")
      return
    }

    onSearch({
      checkIn: format(date.from, "yyyy-MM-dd"),
      checkOut: format(date.to, "yyyy-MM-dd"),
      adults: Number.parseInt(formData.adults),
      children: Number.parseInt(formData.children) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Check In */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Check In</Label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 border-gray-300",
                    !date.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#2671D9]" />
                  {date.from ? format(date.from, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date.from}
                  onSelect={(newDate: Date | undefined) => {
                    setDate(prev => ({ ...prev, from: newDate }))
                    // If check-out is before new check-in, reset check-out
                    if (date.to && newDate && date.to < newDate) {
                      setDate(prev => ({ from: newDate, to: undefined }))
                    }
                  }}
                  disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Check Out */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Check Out</Label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 border-gray-300",
                    !date.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#2671D9]" />
                  {date.to ? format(date.to, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date.to}
                  onSelect={(newDate: Date | undefined) => setDate(prev => ({ ...prev, to: newDate }))}
                  disabled={(d: Date) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    (date.from ? d <= date.from : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guests (Adults) */}
        <div className="space-y-2">
          <Label htmlFor="adults" className="text-sm font-medium text-gray-700">
            Adults
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
            Children
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
