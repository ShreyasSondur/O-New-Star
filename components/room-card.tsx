"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Wifi, Tv, AirVent, Wine } from "lucide-react"
import type { AvailableRoom } from "@/lib/types"

interface RoomCardProps {
  room: AvailableRoom
  nights: number
  onBook: (room: AvailableRoom) => void
}

export function RoomCard({ room, nights, onBook }: RoomCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        {room.image_url ? (
          <img src={room.image_url || "/placeholder.svg"} alt={room.room_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        {room.floor_name && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {room.floor_name}
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-balance">{room.room_name}</CardTitle>
            <CardDescription>Room {room.room_number}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">₹{room.total_price?.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              ₹{Number.parseFloat(room.price_per_night.toString()).toLocaleString()}/night
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Up to {room.max_guests} guests</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.has_wifi && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              WiFi
            </Badge>
          )}
          {room.has_tv && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tv className="h-3 w-3" />
              TV
            </Badge>
          )}
          {room.has_ac && (
            <Badge variant="outline" className="flex items-center gap-1">
              <AirVent className="h-3 w-3" />
              AC
            </Badge>
          )}
          {room.has_bar && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wine className="h-3 w-3" />
              Bar
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{nights} nights total</p>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={() => onBook(room)}>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  )
}
