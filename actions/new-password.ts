"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/prisma"
import { getPasswordResetTokenByToken } from "@/lib/tokens"

export const newPassword = async (password: string, token: string | null) => {
    if (!token) return { error: "Missing token!" }
    if (!password) return { error: "Password is required!" }

    const existingToken = await getPasswordResetTokenByToken(token)

    if (!existingToken) {
        return { error: "Invalid token!" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
        return { error: "Token has expired!" }
    }

    const existingUser = await db.user.findUnique({
        where: { email: existingToken.email }
    })

    if (!existingUser) {
        return { error: "Email does not exist!" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
        where: { id: existingUser.id },
        data: {
            password: hashedPassword,
        }
    })

    await db.passwordResetToken.delete({
        where: { id: existingToken.id }
    })

    return { success: "Password updated!" }
}
