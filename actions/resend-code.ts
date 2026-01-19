"use server"

import { db } from "@/lib/prisma"
import { generateTwoFactorToken } from "@/lib/tokens"
import { sendTwoFactorTokenEmail } from "@/lib/mail"

export const resendCode = async (email: string) => {
    if (!email) return { error: "Email required!" }

    const existingUser = await db.user.findUnique({
        where: { email }
    })

    if (!existingUser || !existingUser.email) {
        return { error: "Email not found!" }
    }

    if (!existingUser.isTwoFactorEnabled) {
        return { error: "2FA not enabled!" }
    }

    const twoFactorToken = await generateTwoFactorToken(existingUser.email)
    await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
    )

    return { success: "Code resent!" }
}
