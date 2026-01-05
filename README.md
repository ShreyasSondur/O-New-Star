# Hotel Booking System

A production-ready hotel booking system built with Next.js 16, PostgreSQL, and Razorpay.

## Features

- **Zero Double Booking Guarantee**: Database-level unique constraints prevent conflicts
- **Real-time Availability**: Instant room availability checking
- **Secure Payment Gateway**: Razorpay integration with signature verification
- **Admin Panel**: Complete hotel management (floors, rooms, bookings, blocks)
- **Guest Booking**: Seamless booking flow with payment
- **Admin Blocks**: Manually block rooms for maintenance or offline use
- **Responsive Design**: Works perfectly on all devices

## Setup Instructions

### 1. Install Dependencies

The project uses the Next.js "Next.js" runtime, so dependencies are automatically inferred from imports. No manual npm install needed.

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database (Already provided)
DATABASE_URL="postgres://postgres.vltnjsshwcsaltkpjmve:JR0IRZr3bnvwgTbQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Razorpay (Add your keys)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"

# Optional: Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

Run the SQL scripts in order to set up your database:

1. **Initial Schema**: `/scripts/001_initial_schema.sql`
   - Creates all tables (floors, rooms, bookings, booking_dates, admin_blocks)
   - Sets up indexes and triggers
   - Implements unique constraint for double-booking prevention

2. **Sample Data** (Optional): `/scripts/002_seed_sample_data.sql`
   - Adds sample floors and rooms for testing
   - Can be skipped in production

### 4. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Add the keys to your `.env.local` file
4. For production, use live keys instead of test keys

### 5. Run the Application

```bash
npm run dev
```

Visit:
- Guest Booking: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`

## How It Works

### Booking Flow

1. **Guest searches** for rooms with dates and guest count
2. **System checks availability** in real-time from database
3. **Guest selects room** and enters details
4. **Booking created** with PENDING status (no dates locked yet)
5. **Payment initiated** via Razorpay
6. **Payment verified** on backend using signature
7. **Booking confirmed** in a transaction:
   - Dates are locked in `booking_dates` table
   - Unique constraint prevents double booking
   - Status changed to CONFIRMED
8. **Guest receives confirmation**

### Admin Features

- **Floors**: Organize rooms by floors
- **Rooms**: Add rooms with amenities, pricing, capacity
- **Blocks**: Block rooms for maintenance or offline bookings
- **Bookings**: View all bookings, create manual bookings, cancel bookings

### Security Features

- Backend validates all amounts (never trusts client)
- Razorpay signature verification prevents payment fraud
- Database transactions ensure atomic operations
- Unique constraints prevent double bookings
- SQL injection protection via parameterized queries

## Database Schema

### Key Tables

- `rooms`: Hotel rooms with amenities
- `bookings`: All bookings (guest and admin)
- `booking_dates`: Date locks (unique per room per date)
- `admin_blocks`: Admin-controlled date blocks
- `floors`: Room organization

### Double Booking Prevention

The `booking_dates` table has a unique constraint:
```sql
UNIQUE(room_id, date)
```

This guarantees that no two bookings can lock the same room on the same date. If two users try to book simultaneously, one will succeed and the other will fail with a clear error message.

## Production Deployment

1. Deploy to Vercel (recommended)
2. Add environment variables in Vercel dashboard
3. Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Use Razorpay live keys for production
5. Set up Razorpay webhooks (optional but recommended)

## Support

For issues or questions:
- Check the inline code comments
- Review the system specification in `/user_read_only_context/text_attachments/pasted-text-YkP4B.txt`
