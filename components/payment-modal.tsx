"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  bookingId: number
  amount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  onSuccess: () => void
}

export function PaymentModal({
  open,
  onClose,
  bookingId,
  amount,
  guestName,
  guestEmail,
  guestPhone,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway not loaded. Please try again.")
      return
    }

    try {
      setLoading(true)

      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      if (!orderRes.ok) {
        const error = await orderRes.json()
        throw new Error(error.error || "Failed to create order")
      }

      const orderData = await orderRes.json()

      // Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Hotel Booking",
        description: `Booking #${bookingId}`,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone,
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              const error = await verifyRes.json()
              throw new Error(error.error || "Payment verification failed")
            }

            toast.success("Payment successful! Booking confirmed.")
            onSuccess()
          } catch (error: any) {
            console.error("[v0] Payment verification error:", error)
            toast.error(error.message || "Payment verification failed")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      toast.error(error.message || "Failed to initiate payment")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-balance">Complete Payment</DialogTitle>
          <DialogDescription className="text-balance">
            You're about to pay ₹{amount.toLocaleString()} for your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-medium">#{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guest Name:</span>
              <span className="font-medium">{guestName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="text-xl font-bold">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          <Button className="w-full" onClick={handlePayment} disabled={loading || !razorpayLoaded}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with Razorpay"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground text-balance">
            Your booking will be confirmed only after successful payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
