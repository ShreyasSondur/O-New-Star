"use server"

import { auth } from "@/auth"
import { db } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import { calculateNights } from "@/lib/availability"
import { formatDate } from "@/lib/utils"

interface VerifyPaymentParams {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    roomId: number
    checkIn: string
    checkOut: string
    adults: number
    children: number
    guestName: string
    guestEmail: string
    guestPhone: string
    guestAddress?: string
    guestDetails: any[] // Array of guest info
    totalAmount: number
}

export async function verifyPayment(params: VerifyPaymentParams) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { error: "Unauthorized" }
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            roomId,
            checkIn,
            checkOut,
            adults,
            children,
            guestName,
            guestEmail,
            guestPhone,
            guestAddress,
            guestDetails,
            totalAmount
        } = params

        // 1. Verify Signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )

        if (!isValid) {
            return { error: "Invalid payment signature" }
        }

        // 2. Create Booking in Database using a Transaction
        const booking = await db.booking.create({
            data: {
                room: {
                    connect: { id: roomId }
                },
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                guest_address: guestAddress,
                guest_details: guestDetails,
                check_in_date: new Date(checkIn),
                check_out_date: new Date(checkOut),
                num_adults: adults,
                num_children: children,
                total_amount: totalAmount,
                status: "CONFIRMED",
                payment_status: "PAID",
                razorpay_order_id,
                razorpay_payment_id,
                is_admin_booking: false,
            }
        })

        // 3. Block Dates (Create BookingDate entries)
        // We need to generate an array of dates between checkIn and checkOut
        const startDate = new Date(checkIn)
        const endDate = new Date(checkOut)
        const dateArray: Date[] = []

        let currentDate = new Date(startDate)
        while (currentDate < endDate) {
            dateArray.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Bulk create booking dates
        if (dateArray.length > 0) {
            await db.bookingDate.createMany({
                data: dateArray.map(date => ({
                    booking_id: booking.id,
                    room_id: roomId,
                    date: date
                }))
            })
        }

        // 4. Send Confirmation Email
        // Fetch room name for the email
        const fullBooking = await db.booking.findUnique({
            where: { id: booking.id },
            include: { room: true }
        })

        if (fullBooking?.room) {
            const { sendBookingConfirmationEmail } = await import("@/lib/mail")
            await sendBookingConfirmationEmail(
                guestEmail,
                {
                    bookingId: booking.id.toString(),
                    guestName: guestName,
                    roomName: fullBooking.room.room_name,
                    checkIn: formatDate(checkIn),
                    checkOut: formatDate(checkOut),
                    totalAmount: Number(totalAmount),
                    adults: adults,
                    children: children
                }
            )
        }

        return { success: true, bookingId: booking.id }

    } catch (error: any) {
        console.error("Verify Payment Error Details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        return { error: `Payment verification failed: ${error.message}` }
    }
}
