import { NextResponse } from "next/server";

const llms = `# www.onewstar.in llms.txt

- Refund Policy: https://www.onewstar.in/refund-policy
  Explain the non-refundable booking, cancellation, and refund policies of O New Star Hotel.

- Create Account: https://www.onewstar.in/auth/register
  Allow users to create a new account for accessing New Star Lodge services.

- Login to New Star Lodge: https://www.onewstar.in/auth/login
  Allow users to securely log in to their New Star Lodge accounts.

- O New Star Hotel: https://www.onewstar.in
  Promote O New Star Hotel's comfortable, affordable accommodation with details on bookings and guest services.

- Privacy Policy: https://www.onewstar.in/privacy-policy
  Explain how O New Star Hotel collects, uses, and protects personal information of guests and website users.

- O New Star Terms: https://www.onewstar.in/terms-conditions
  Outline the terms, conditions, and policies for booking and staying at O New Star Hotel.

- Room Booking: https://www.onewstar.in/rooms
  Allow users to search and book available hotel rooms by selecting dates and number of guests.
`;

export async function GET() {
  return new NextResponse(llms, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
