"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Lock, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { createOrder } from "@/actions/create-order"
import { verifyPayment } from "@/actions/verify-payment"
import type { AvailableRoom } from "@/lib/types"

interface CheckoutFormProps {
    room: AvailableRoom
    checkIn: string
    checkOut: string
    nights: number
    totalAmount: number
    adults: number
    children: number
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

interface GuestDetail {
    name: string
    age: string
    gender: string
}

export function CheckoutForm({
    room,
    checkIn,
    checkOut,
    nights,
    totalAmount,
    adults,
    children,
    user
}: CheckoutFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [processingPayment, setProcessingPayment] = useState(false)
    const [success, setSuccess] = useState(false)

    const totalGuests = adults + children

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: ""
    })

    // Initialize guest details array
    const [guestDetails, setGuestDetails] = useState<GuestDetail[]>(() => {
        return Array(totalGuests).fill({
            name: "",
            age: "",
            gender: ""
        })
    })

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleGuestChange = (index: number, field: keyof GuestDetail, value: string) => {
        const newDetails = [...guestDetails]
        newDetails[index] = { ...newDetails[index], [field]: value }
        setGuestDetails(newDetails)
    }

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill in all required primary contact fields")
            return
        }

        // Validate guest details
        for (let i = 0; i < guestDetails.length; i++) {
            const guest = guestDetails[i]
            if (!guest.name || !guest.age || !guest.gender) {
                toast.error(`Please fill all details for Guest ${i + 1}`)
                return
            }
        }

        setLoading(true)

        try {
            // 1. Load Script
            const res = await loadRazorpay()
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?")
                setLoading(false)
                return
            }

            // 2. Create Order on Server
            const orderData = await createOrder(room.id, checkIn, checkOut)

            if (orderData.error || !orderData.orderId) {
                throw new Error(orderData.error || "Failed to create order")
            }

            // 3. Open Razorpay Modal
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "O New Star Hotel",
                description: `Booking for ${room.room_name}`,
                image: "https://example.com/logo.png", // Replace with actual logo URL
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    setProcessingPayment(true)
                    // 4. Verify Payment on Server
                    const verifyRes = await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        roomId: room.id,
                        checkIn,
                        checkOut,
                        adults,
                        children,
                        guestName: formData.name,
                        guestEmail: formData.email,
                        guestPhone: formData.phone,
                        guestAddress: formData.address,
                        guestDetails: guestDetails,
                        totalAmount: totalAmount
                    })

                    if (verifyRes.success) {
                        setSuccess(true)
                        toast.success("Payment Successful! Booking Confirmed.")
                    } else {
                        toast.error(verifyRes.error || "Payment Verification Failed")
                    }
                    setProcessingPayment(false)
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    address: formData.address,
                },
                theme: {
                    color: "#2671D9",
                },
            }

            const paymentObject = new (window as any).Razorpay(options)
            paymentObject.open()

        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="w-full max-w-md mx-auto text-center shadow-2xl border-0 overflow-hidden relative">
                    {/* Decorative Top Banner */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

                    <CardContent className="pt-12 pb-8 px-6">
                        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Thank you for choosing O New Star Hotel. Your payment has been received.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100 shadow-sm relative">
                            {/* Visual Notch for "Ticket" look */}
                            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full border-r border-gray-100"></div>
                            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full border-l border-gray-100"></div>

                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold text-center">Receipt & Details</p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Accommodation</p>
                                    <p className="font-semibold text-gray-900">{room.room_name}</p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Check-in</p>
                                        <p className="font-medium text-sm">{new Date(checkIn).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Check-out</p>
                                        <p className="font-medium text-sm">{new Date(checkOut).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-gray-500">Primary Contact</p>
                                    <p className="font-medium text-sm">{formData.name}</p>
                                    <p className="text-xs text-gray-400">{formData.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => router.push("/")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 h-auto shadow-lg shadow-blue-200"
                            >
                                Go to Home
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/my-bookings")}
                                className="w-full"
                            >
                                View My Bookings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">

                {/* ID Proof Disclaimer */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-amber-900 text-sm">Important: ID Proof Required</h4>
                        <p className="text-amber-800 text-sm mt-1">
                            Please ensure all guests carry a valid Government-issued ID proof (Aadhar, License, Passport) during check-in.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Primary Contact Details</CardTitle>
                        <CardDescription>Booking updates will be sent here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Street address, City, State"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Guest Information</CardTitle>
                        <CardDescription>Please provide details for all {totalGuests} guests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {guestDetails.map((guest, index) => (
                            <div key={index} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Guest {index + 1}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Full Name</Label>
                                        <Input
                                            value={guest.name}
                                            onChange={(e) => handleGuestChange(index, "name", e.target.value)}
                                            placeholder="Name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Age</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={guest.age}
                                            onChange={(e) => handleGuestChange(index, "age", e.target.value)}
                                            placeholder="Age"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Gender</Label>
                                        <Select
                                            value={guest.gender}
                                            onValueChange={(value) => handleGuestChange(index, "gender", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {index < guestDetails.length - 1 && <Separator />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    form="checkout-form"
                    size="lg"
                    className="w-full bg-[#2671D9] hover:bg-[#1a5bb5]"
                    disabled={loading || processingPayment}
                >
                    {(loading || processingPayment) ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {processingPayment ? "Processing Payment..." : "Please Wait..."}
                        </>
                    ) : (
                        `Pay ₹${totalAmount.toLocaleString()}`
                    )}
                </Button>

                <div className="pt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Your data is secure and will only be used for this booking.</span>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
                <Card className="sticky top-8 bg-gray-50/50">
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-video relative rounded-md overflow-hidden bg-gray-200">
                            {room.image_url ? (
                                <Image src={room.image_url} alt={room.room_name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg">{room.room_name}</h3>
                            <p className="text-sm text-gray-500">Room {room.room_number}</p>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in</span>
                                <span className="font-medium">{new Date(checkIn).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-out</span>
                                <span className="font-medium">{new Date(checkOut).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guests</span>
                                <span className="font-medium">{adults} Guests, {children} Children</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">₹{Number(room.price_per_night).toLocaleString()} x {nights} nights</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Taxes & Fees</span>
                                <span>₹0</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Due</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-gray-100/50 py-3 rounded-b-lg">
                        <div className="flex items-center gap-2 text-xs text-gray-500 w-full justify-center">
                            <Lock className="h-3 w-3" />
                            Secure SSL Encryption
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
