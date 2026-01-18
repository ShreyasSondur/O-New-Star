"use server"

import * as z from "zod"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { db } from "@/lib/prisma"
import {
    generateVerificationToken,
    generateTwoFactorToken
} from "@/lib/tokens"
import { sendTwoFactorTokenEmail } from "@/lib/mail"
import bcrypt from "bcryptjs"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    code: z.optional(z.string()),
})

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password, code } = validatedFields.data

    const existingUser = await db.user.findUnique({
        where: { email }
    })

    // Filter out non-credential users (e.g. Google only) if needed, 
    // but existingUser.password check handles it.
    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exist!" }
    }

    // Verify password before sending 2FA to prevent enumeration or spam?
    // Ideally yes, but signIn handles it. We can do a manual check if 2FA is needed.
    const passwordMatch = await bcrypt.compare(password, existingUser.password)
    if (!passwordMatch) {
        return { error: "Invalid credentials!" }
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const twoFactorToken = await db.twoFactorToken.findFirst({
                where: {
                    email: existingUser.email,
                    token: code
                }
            })

            if (!twoFactorToken) {
                return { error: "Invalid code!" }
            }

            const hasExpired = new Date(twoFactorToken.expires) < new Date()

            if (hasExpired) {
                return { error: "Code expired!" }
            }

            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id }
            })

            const existingConfirmation = await db.twoFactorConfirmation.findUnique({
                where: { userId: existingUser.id }
            })

            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id }
                })
            }

            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id,
                }
            })
        } else {
            const twoFactorToken = await generateTwoFactorToken(existingUser.email)
            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token,
            )

            return { twoFactor: true }
        }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/", // Or DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" }
                default:
                    return { error: "Something went wrong!" }
            }
        }
        throw error
    }
}
