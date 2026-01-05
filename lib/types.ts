export interface Floor {
  id: number
  name: string
  floor_number: number
  created_at: Date
  updated_at: Date
}

export interface Room {
  id: number
  floor_id: number
  room_name: string
  room_number: string
  price_per_night: number
  max_guests: number
  is_active: boolean
  image_url?: string
  has_wifi: boolean
  has_tv: boolean
  has_ac: boolean
  has_bar: boolean
  created_at: Date
  updated_at: Date
}

export interface Booking {
  id: number
  room_id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_address?: string
  check_in_date: string
  check_out_date: string
  num_adults: number
  num_children: number
  total_amount: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
  is_admin_booking: boolean
  blocks_availability: boolean
  razorpay_order_id?: string
  razorpay_payment_id?: string
  payment_status: "PENDING" | "SUCCESS" | "FAILED"
  admin_notes?: string
  created_at: Date
  updated_at: Date
}

export interface BookingDate {
  id: number
  booking_id: number
  room_id: number
  date: string
  created_at: Date
}

export interface AdminBlock {
  id: number
  room_id: number
  blocked_date: string
  reason?: string
  created_at: Date
}

export interface AvailableRoom extends Room {
  floor_name?: string
  total_price?: number
}

export interface SearchParams {
  checkIn: string
  checkOut: string
  adults: number
  children?: number
}
