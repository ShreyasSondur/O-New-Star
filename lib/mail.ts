import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string
) => {
    await resend.emails.send({
        from: "onboarding@resend.dev", // Change to verified domain in production
        to: email,
        subject: "2FA Code",
        html: `<p>Your 2FA code: ${token}</p>`
    })
}

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    // In a real app with confirmed domain:
    // const confirmLink = `${domain}/auth/new-verification?token=${token}`
    // <a href="${confirmLink}">Click here to confirm email.</a>

    // For now we might not be using this if not strictly required
}
