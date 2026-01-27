"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { Calendar, Users, Wifi, Tv, AirVent, Wine, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import type { AvailableRoom } from "@/lib/types"
import { calculateNights } from "@/lib/availability"

interface BookingFormProps {
  room: AvailableRoom
  searchParams: { checkIn: string; checkOut: string; adults: number; children: number }
  onComplete: () => void
  onCancel: () => void
  onBookingSuccess?: () => void
}

export function BookingForm({ room, searchParams, onComplete, onCancel, onBookingSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestAddress: "",
  })
  const [numExtraBeds, setNumExtraBeds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut)
  const baseAmount = Number.parseFloat(room.price_per_night.toString()) * nights
  const extraBedCharge = numExtraBeds * 200 * nights
  const totalAmount = baseAmount + extraBedCharge

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)

    try {
      // Create booking
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          adults: searchParams.adults,
          children: searchParams.children,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          guestAddress: formData.guestAddress,
          numExtraBeds: numExtraBeds, // Send to API
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      const data = await res.json()
      setBookingId(data.booking.id)
      setShowPayment(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    setBookingConfirmed(true)
    // Notify parent immediately so it can refresh the room list in the background
    if (onBookingSuccess) {
      onBookingSuccess()
    }
  }

  if (bookingConfirmed) {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-balance">Booking Confirmed!</CardTitle>
          <CardDescription className="text-balance">Your room has been successfully booked</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-medium">#{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room:</span>
              <span className="font-medium">
                {room.room_number} - {room.room_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in:</span>
              <span className="font-medium">{new Date(searchParams.checkIn).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out:</span>
              <span className="font-medium">{new Date(searchParams.checkOut).toLocaleDateString()}</span>
            </div>
            {numExtraBeds > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extra Beds:</span>
                <span className="font-medium">{numExtraBeds}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Paid:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-balance">
            A confirmation email has been sent to {formData.guestEmail}
          </p>

          <Button onClick={onComplete} className="w-full">
            Book Another Room
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Complete Your Booking</CardTitle>
          <CardDescription className="text-balance">Enter your details to proceed</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Room Summary */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-balance">{room.room_name}</h3>
                <p className="text-sm text-muted-foreground">Room {room.room_number}</p>
              </div>
              {room.floor_name && <Badge variant="secondary">{room.floor_name}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Check-in</p>
                  <p className="font-medium">{new Date(searchParams.checkIn).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Check-out</p>
                  <p className="font-medium">{new Date(searchParams.checkOut).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {searchParams.adults} Adult{searchParams.adults !== 1 ? "s" : ""}
                {searchParams.children > 0 &&
                  `, ${searchParams.children} Child${searchParams.children !== 1 ? "ren" : ""}`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
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

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="extraBed"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={numExtraBeds > 0}
                    onChange={(e) => setNumExtraBeds(e.target.checked ? 1 : 0)}
                  />
                  <Label htmlFor="extraBed" className="cursor-pointer">
                    Add Extra Mattress (+₹200/night)
                  </Label>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    ₹{Number.parseFloat(room.price_per_night.toString()).toLocaleString()} × {nights} night
                    {nights !== 1 ? "s" : ""}
                  </p>
                  {numExtraBeds > 0 && (
                    <p className="text-sm text-muted-foreground">
                      + ₹200 × {nights} (Extra Bed)
                    </p>
                  )}
                  <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Full Name *</Label>
              <Input
                id="guestName"
                placeholder="Enter your full name"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email Address *</Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone Number *</Label>
              <Input
                id="guestPhone"
                type="tel"
                placeholder="+91 1234567890"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestAddress">Address (Optional)</Label>
              <Textarea
                id="guestAddress"
                placeholder="Enter your address"
                value={formData.guestAddress}
                onChange={(e) => setFormData({ ...formData, guestAddress: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {bookingId && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          bookingId={bookingId}
          amount={totalAmount}
          guestName={formData.guestName}
          guestEmail={formData.guestEmail}
          guestPhone={formData.guestPhone}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
