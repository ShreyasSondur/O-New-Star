"use server"

import { db } from "@/lib/prisma"
// import { getUserByEmail } from "@/data/user" // Assuming this exists or we use db directly
// import { getPendingUserByEmail } from "@/data/pending-user" // We'll just use db directly for implementation speed

export const verifyRegistration = async (email: string, code: string) => {
    if (!email || !code) {
        return { error: "Missing fields!" }
    }

    const pendingUser = await db.pendingUser.findUnique({
        where: { email }
    })

    if (!pendingUser) {
        return { error: "No pending registration found!" }
    }

    if (pendingUser.token !== code) {
        return { error: "Invalid OTP code!" }
    }

    const hasExpired = new Date(pendingUser.expires) < new Date()

    if (hasExpired) {
        return { error: "OTP has expired!" }
    }

    // Create the final user
    // Check if user exists just in case (race condition)
    const existingUser = await db.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        return { error: "Email already in use!" }
    }

    await db.user.create({
        data: {
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            emailVerified: new Date(),
        }
    })

    // Delete pending user
    await db.pendingUser.delete({
        where: { id: pendingUser.id }
    })

    return { success: "Account created successfully!" }
}
