"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Wifi, Tv, Wind, Wine, Check, ArrowRight } from "lucide-react"
import type { AvailableRoom } from "@/lib/types"
import { cn } from "@/lib/utils"

import Link from "next/link"

interface RoomCardProps {
  room: AvailableRoom
  nights: number
  checkIn: string
  checkOut: string
  adults: number
  children: number
}

export function RoomCard({ room, nights, checkIn, checkOut, adults, children }: RoomCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const totalPrice = room.total_price || (room.price_per_night * nights);

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-white rounded-2xl ring-1 ring-gray-100">
      {/* ... existing image and content sections ... */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={room.image_url || "/placeholder.svg?height=400&width=600"}
          alt={room.room_name}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-white/90 text-black shadow-sm backdrop-blur-md border-0 hover:bg-white date-badge">
            Room {room.room_number}
          </Badge>
          {room.floor_name && (
            <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-md border-0">
              {room.floor_name}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold tracking-tight drop-shadow-md">{room.room_name}</h3>
        </div>
      </div>

      <CardContent className="flex-grow p-6 space-y-6">
        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-gray-700">{room.max_guests} Guests Max</span>
          </div>
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <Check className="h-4 w-4" /> Available
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amenities included</p>
          <div className="flex flex-wrap gap-2">
            {room.has_wifi && (
              <Badge variant="outline" className="py-1.5 px-3 gap-1.5 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                <Wifi className="h-3.5 w-3.5" /> Fast Wifi
              </Badge>
            )}
            {room.has_tv && (
              <Badge variant="outline" className="py-1.5 px-3 gap-1.5 border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors">
                <Tv className="h-3.5 w-3.5" /> Smart TV
              </Badge>
            )}
            {room.has_ac && (
              <Badge variant="outline" className="py-1.5 px-3 gap-1.5 border-gray-200 text-gray-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-600 transition-colors">
                <Wind className="h-3.5 w-3.5" /> AC
              </Badge>
            )}
            {room.has_bar && (
              <Badge variant="outline" className="py-1.5 px-3 gap-1.5 border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors">
                <Wine className="h-3.5 w-3.5" /> Mini Bar
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <div className="p-6 pt-0 mt-auto">
        <div className="flex items-end justify-between mb-6 border-t pt-4 border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Price for {nights} night{nights > 1 ? 's' : ''}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">avg. per night</p>
            <p className="font-semibold text-gray-700">₹{room.price_per_night.toLocaleString()}</p>
          </div>
        </div>

        <Link
          href={`/book?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
          className="w-full block"
        >
          <Button
            className="w-full bg-[#2671D9] hover:bg-[#1f5fc0] h-12 text-base font-semibold shadow-blue-200 shadow-lg hover:shadow-blue-300 transition-all active:scale-[0.98]"
          >
            Book This Room <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
