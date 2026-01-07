"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoomCard } from "@/components/room-card"
import { SearchForm } from "@/components/search-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { BookingForm } from "@/components/booking-form"
import type { AvailableRoom } from "@/lib/types"

export default function RoomsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<AvailableRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null)

  const searchData = {
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    adults: Number(searchParams.get("adults") || "2"),
    children: Number(searchParams.get("children") || "0"),
  }

  useEffect(() => {
    if (searchData.checkIn && searchData.checkOut) {
      searchRooms()
    } else {
      setIsLoading(false)
    }
  }, [])

  const searchRooms = async () => {
    try {
      console.log("[v0] Searching for available rooms...")
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          adults: searchData.adults,
          children: searchData.children,
        }),
      })

      if (!res.ok) {
        console.error("[v0] Search failed:", res.statusText)
        toast.error("Failed to search rooms. Please check if DATABASE_URL is set.")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      console.log("[v0] Found rooms:", data.rooms.length)
      setRooms(data.rooms || [])
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error searching rooms:", error)
      toast.error("Failed to connect to database. Please add DATABASE_URL in Vars section.")
      setIsLoading(false)
    }
  }

  const calculateNights = () => {
    if (!searchData.checkIn || !searchData.checkOut) return 0
    const start = new Date(searchData.checkIn)
    const end = new Date(searchData.checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2671D9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for available rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2671D9]">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Results Section */}
      <div className="container mx-auto px-6 py-8">

        {/* Search Bar Section */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <SearchForm onSearch={(data) => {
            const params = new URLSearchParams()
            params.set("checkIn", data.checkIn)
            params.set("checkOut", data.checkOut)
            params.set("adults", data.adults.toString())
            params.set("children", data.children.toString())
            router.push(`/rooms?${params.toString()}`)
          }} />
        </div>

        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
            <p className="text-sm text-gray-500 mt-1">
              {searchData.checkIn && searchData.checkOut
                ? `${new Date(searchData.checkIn).toLocaleDateString()} - ${new Date(searchData.checkOut).toLocaleDateString()} • ${nights} night${nights > 1 ? "s" : ""} • ${searchData.adults} Guest${searchData.adults > 1 ? "s" : ""}`
                : "Select dates to view availability"}
            </p>
          </div>
        </div>

        {rooms.length === 0 ? (
          <Card className="p-12 text-center bg-gray-50/50 border-dashed">
            <p className="text-gray-600 text-lg font-medium">No rooms found.</p>
            <p className="text-gray-500 mt-2 text-sm">Try adjusting your dates or guest count.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                nights={nights}
                onBook={setSelectedRoom}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {selectedRoom && (
            <BookingForm
              room={selectedRoom}
              searchParams={searchData}
              onComplete={() => {
                setSelectedRoom(null)
                searchRooms()
              }}
              onCancel={() => setSelectedRoom(null)}
              onBookingSuccess={() => searchRooms()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
