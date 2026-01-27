import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string
) => {
    await resend.emails.send({
        from: "Contact <contact@onewstar.in>",
        to: email,
        subject: "2FA Code",
        html: `<p>Your 2FA code: ${token}</p>`,
        text: `Your 2FA code: ${token}`
    })
}

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    try {
        const data = await resend.emails.send({
            from: "Contact <contact@onewstar.in>",
            to: email,
            subject: "Confirm your email address",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #333; text-align: center;">Confirm Your Email Address</h2>
                    <p style="color: #666; text-align: center;">Thank you for registering! Please use the following code to complete your verification:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2671D9; background: #e6f0ff; padding: 10px 20px; border-radius: 5px; border: 1px solid #b3d1ff;">
                            ${token}
                        </span>
                    </div>
                    <p style="color: #999; text-align: center; font-size: 12px;">If you did not request this, please ignore this email.</p>
            `
            ,
            text: `Confirm Your Email Address\n\nThank you for registering! Please use the following code to complete your verification:\n\n${token}\n\nIf you did not request this, please ignore this email.`
        })
        console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export const sendBookingConfirmationEmail = async (
    email: string,
    bookingDetails: {
        bookingId: string
        guestName: string
        roomName: string
        checkIn: string
        checkOut: string
        totalAmount: number
        adults: number
        children: number
    }
) => {
    try {
        const { bookingId, guestName, roomName, checkIn, checkOut, totalAmount, adults, children } = bookingDetails

        const data = await resend.emails.send({
            from: "Contact <contact@onewstar.in>",
            to: email,
            subject: `Booking Confirmed - #${bookingId} - O New Star Lodge`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
                    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
                    .content { padding: 40px; }
                    .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
                    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf2f7; }
                    .detail-row:last-child { border-bottom: none; }
                    .label { color: #64748b; font-size: 14px; }
                    .value { color: #1e293b; font-weight: 600; font-size: 14px; text-align: right; }
                    .footer { padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; background: #f1f5f9; border-top: 1px solid #e2e8f0; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Confirmed</h1>
                        <p>Your stay at O New Star Lodge is secured.</p>
                    </div>
                    <div class="content">
                        <p class="greeting">Hello ${guestName},</p>
                        <p style="color: #475569; line-height: 1.6;">
                            Great news! Your payment was successful and your booking has been confirmed. We are looking forward to hosting you.
                        </p>
                        
                        <div class="details-box">
                            <div class="detail-row">
                                <span class="label">Booking ID</span>
                                <span class="value">#${bookingId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Room</span>
                                <span class="value">${roomName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Check-in</span>
                                <span class="value">${checkIn}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Check-out</span>
                                <span class="value">${checkOut}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Guests</span>
                                <span class="value">${adults} Adults, ${children} Children</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Paid</span>
                                <span class="value" style="color: #10b981;">₹${totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style="text-align: center;">
                            <a href="${domain}/my-bookings" class="button">View My Booking</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} O New Star Lodge. All rights reserved.</p>
                        <p>Please carry a valid government ID for check-in.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            text: `Booking Confirmed - #${bookingId}\n\nHello ${guestName},\n\nGreat news! Your payment was successful and your booking has been confirmed.\n\nBooking ID: #${bookingId}\nRoom: ${roomName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${adults} Adults, ${children} Children\nTotal Paid: ₹${totalAmount.toLocaleString()}\n\nView details at ${domain}/my-bookings`
        })
        console.log("Confirmation Email sent:", data)
    } catch (error) {
        console.error("Error sending confirmation email:", error)
    }
}

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    await resend.emails.send({
        from: "Support <contact@onewstar.in>",
        to: email,
        subject: "Reset your password",
        html: `
        <div style="font-family: sans-serif; font-size: 16px; color: #333;">
            <p>Hello,</p>
            <p>Here is your code to reset your password:</p>
            <p style="font-size: 24px; font-weight: bold; color: #000; letter-spacing: 2px; margin: 16px 0;">
                ${token}
            </p>
            <p>This code expires in 1 hour.</p>
        </div>
        `,
        text: `Your password reset code is: ${token}`
    })
}

export const sendOwnerBookingNotification = async (
    bookingDetails: {
        bookingId: string
        guestName: string
        guestEmail: string
        guestPhone: string
        roomName: string
        checkIn: string
        checkOut: string
        totalAmount: number
        adults: number
        children: number
        numExtraBeds: number
    }
) => {
    try {
        const { bookingId, guestName, guestEmail, guestPhone, roomName, checkIn, checkOut, totalAmount, adults, children, numExtraBeds } = bookingDetails

        const ownerEmail = process.env.OWNER_EMAIL || "contact@onewstar.in"

        const data = await resend.emails.send({
            from: "Contact <contact@onewstar.in>",
            to: ownerEmail,
            subject: `New Booking Alert! - #${bookingId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
                    h2 { color: #111827; margin-bottom: 20px; }
                    .detail-row { border-bottom: 1px solid #f3f4f6; padding: 10px 0; display: flex; justify-content: space-between; }
                    .label { font-weight: bold; color: #4b5563; }
                    .value { color: #111827; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>New Booking Received! 🎉</h2>
                    <p>A new booking has been confirmed.</p>
                    
                    <div class="detail-row"><span class="label">Booking ID</span><span class="value">#${bookingId}</span></div>
                    <div class="detail-row"><span class="label">Guest Name</span><span class="value">${guestName}</span></div>
                    <div class="detail-row"><span class="label">Guest Phone</span><span class="value">${guestPhone}</span></div>
                    <div class="detail-row"><span class="label">Guest Email</span><span class="value">${guestEmail}</span></div>
                    <div class="detail-row"><span class="label">Room</span><span class="value">${roomName}</span></div>
                    <div class="detail-row"><span class="label">Check-In</span><span class="value">${checkIn}</span></div>
                    <div class="detail-row"><span class="label">Check-Out</span><span class="value">${checkOut}</span></div>
                    <div class="detail-row"><span class="label">Guests</span><span class="value">${adults} Adults, ${children} Children</span></div>
                     ${numExtraBeds > 0 ? `<div class="detail-row"><span class="label">Extra Beds</span><span class="value">${numExtraBeds}</span></div>` : ''}
                    <div class="detail-row"><span class="label">Total Amount</span><span class="value">₹${totalAmount.toLocaleString()}</span></div>

                    <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Please ensure the room is ready for arrival.</p>
                </div>
            </body>
            </html>
            `,
            text: `New Booking Received! 🎉\n\nBooking ID: #${bookingId}\nGuest: ${guestName} (${guestPhone}, ${guestEmail})\nRoom: ${roomName}\nDates: ${checkIn} - ${checkOut}\nAmount: ₹${totalAmount.toLocaleString()}\n\nPlease ensure the room is ready.`
        })
        console.log("Owner Notification Sent:", data)
    } catch (error) {
        console.error("Error sending owner notification:", error)
    }
}
