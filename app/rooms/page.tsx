"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, Tv, Wind, Wine, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Room {
  id: number
  room_name: string
  room_number: string
  price_per_night: number
  max_guests: number
  image_url: string | null
  has_wifi: boolean
  has_tv: boolean
  has_ac: boolean
  has_bar: boolean
  total_price: number
}

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchData, setSearchData] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    adults: searchParams.get("adults") || "2",
    children: searchParams.get("children") || "0",
  })

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
          adults: Number.parseInt(searchData.adults),
          children: Number.parseInt(searchData.children) || 0,
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
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Rooms</h1>
          <p className="text-gray-600">
            {searchData.checkIn && searchData.checkOut
              ? `${new Date(searchData.checkIn).toLocaleDateString()} - ${new Date(searchData.checkOut).toLocaleDateString()} • ${nights} night${nights > 1 ? "s" : ""} • ${searchData.adults} adult${Number.parseInt(searchData.adults) > 1 ? "s" : ""}${Number.parseInt(searchData.children) > 0 ? ` • ${searchData.children} child${Number.parseInt(searchData.children) > 1 ? "ren" : ""}` : ""}`
              : "Please select your dates to see available rooms"}
          </p>
        </div>

        {rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 text-lg">No rooms available for the selected dates.</p>
            <p className="text-gray-500 mt-2">Please try different dates or contact us directly.</p>
            <Link href="/">
              <Button className="mt-6 bg-[#2671D9] hover:bg-[#1f5fc0]">Search Again</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img
                    src={room.image_url || "/placeholder.svg?height=192&width=384"}
                    alt={room.room_name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-white text-gray-900">Room {room.room_number}</Badge>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{room.room_name}</h3>

                  <div className="flex items-center gap-4 mb-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{room.max_guests} Guests</span>
                    </div>
                    {room.has_wifi && <Wifi className="h-4 w-4" title="WiFi" />}
                    {room.has_tv && <Tv className="h-4 w-4" title="TV" />}
                    {room.has_ac && <Wind className="h-4 w-4" title="AC" />}
                    {room.has_bar && <Wine className="h-4 w-4" title="Mini Bar" />}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">₹{room.price_per_night.toLocaleString()} / night</p>
                        <p className="text-2xl font-bold text-gray-900">₹{room.total_price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          Total for {nights} night{nights > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <Button className="w-full bg-[#2671D9] hover:bg-[#1f5fc0]">Book Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
