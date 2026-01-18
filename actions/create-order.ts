"use server"

import { auth } from "@/auth"
import { db } from "@/lib/prisma"
import { createRazorpayOrder, RazorpayOrderData } from "@/lib/razorpay"
import { calculateNights } from "@/lib/availability"

export async function createOrder(
    roomId: number,
    checkIn: string,
    checkOut: string
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return { error: "You must be logged in to book a room" }
        }

        // 1. Fetch Room Details Security Check (Server-side price calculation)
        const room = await db.room.findUnique({
            where: { id: roomId },
        })

        if (!room) {
            return { error: "Room not found" }
        }

        // 2. Calculate Amount
        const nights = calculateNights(checkIn, checkOut)

        if (nights < 1) {
            return { error: "Invalid dates selected" }
        }

        const totalAmount = Number(room.price_per_night) * nights

        // 3. Create Razorpay Order
        // We use a short receipt ID for tracking
        const receiptId = `rcpt_${Date.now()}_${roomId}`
        const order = await createRazorpayOrder(totalAmount, receiptId)

        return {
            success: true,
            orderId: order.id,
            amount: order.amount, // in paise
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID // Send key to client for initialization
        }

    } catch (error: any) {
        console.error("Create Order Error:", error)
        return { error: error.message || "Failed to create order" }
    }
}
