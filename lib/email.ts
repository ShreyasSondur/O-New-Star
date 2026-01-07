
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY. Using mock email service.");
        console.log("---------------------------------------------------")
        console.log(`[MOCK EMAIL] To: ${to}`)
        console.log(`[SUBJECT] ${subject}`)
        console.log("---------------------------------------------------")
        return { success: true }
    }

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Allows sending to verified email only
            to: [to], // In trial mode, this must be YOUR email (the one you signed up with)
            subject: subject,
            html: html,
        });

        console.log("[Resend] Email sent successfully:", data);
        return { success: true, data };
    } catch (error) {
        console.error("[Resend] Failed to send email:", error);
        // Fallback to avoid crashing the app
        return { success: false, error };
    }
}

export function generateBookingEmailHtml(booking: any) {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Booking Confirmed! ✅</h1>
        <p>Dear ${booking.guestName},</p>
        <p>Thank you for choosing O New Star Hotel. Your booking has been confirmed.</p>
        
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> #${booking.id}</p>
          <p><strong>Room:</strong> ${booking.roomName} (${booking.roomNumber})</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${parseFloat(booking.totalAmount).toLocaleString()}</p>
        </div>
        
        <p>We look forward to hosting you!</p>
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">O New Star Hotel Team</p>
      </div>
    `
}
