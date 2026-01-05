-- Create floors table
CREATE TABLE IF NOT EXISTS floors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  floor_number INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  price_per_night DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  
  -- Amenities as boolean flags
  has_wifi BOOLEAN DEFAULT false,
  has_tv BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  has_bar BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  
  -- Guest details
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  guest_address TEXT,
  
  -- Booking details
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_adults INTEGER NOT NULL,
  num_children INTEGER DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status: PENDING, CONFIRMED, CANCELLED
  status VARCHAR(50) DEFAULT 'PENDING',
  
  -- Admin booking flag
  is_admin_booking BOOLEAN DEFAULT false,
  blocks_availability BOOLEAN DEFAULT true,
  
  -- Payment details
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  
  -- Admin notes
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_dates table (for date locking)
-- This is the critical table that prevents double booking
CREATE TABLE IF NOT EXISTS booking_dates (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- This UNIQUE constraint is what prevents double booking
  -- Two bookings cannot have the same room on the same date
  UNIQUE(room_id, date)
);

-- Create admin_blocks table (for manual room blocking)
CREATE TABLE IF NOT EXISTS admin_blocks (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate blocks
  UNIQUE(room_id, blocked_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_booking_dates_room_date ON booking_dates(room_id, date);
CREATE INDEX IF NOT EXISTS idx_admin_blocks_room_date ON admin_blocks(room_id, blocked_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON floors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
