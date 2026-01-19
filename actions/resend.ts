"use server"

import { db } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export const resendVerification = async (email: string) => {
    if (!email) return { error: "Email required!" }

    const existingUser = await db.user.findUnique({
        where: { email }
    })

    if (!existingUser) {
        return { error: "Email not found!" }
    }

    if (existingUser.emailVerified) {
        return { error: "Email already verified!" }
    }

    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
    )

    return { success: "Verification email sent!" }
}
