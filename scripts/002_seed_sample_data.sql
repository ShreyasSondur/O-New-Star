-- Sample floors
INSERT INTO floors (name, floor_number) VALUES
  ('Ground Floor', 0),
  ('First Floor', 1),
  ('Second Floor', 2)
ON CONFLICT (floor_number) DO NOTHING;

-- Sample rooms
INSERT INTO rooms (floor_id, room_name, room_number, price_per_night, max_guests, is_active, has_wifi, has_tv, has_ac, has_bar) VALUES
  (1, 'Deluxe AC Room', '101', 2500.00, 2, true, true, true, true, false),
  (1, 'Standard Room', '102', 1500.00, 2, true, true, true, false, false),
  (2, 'Suite Room', '201', 4500.00, 4, true, true, true, true, true),
  (2, 'Family Room', '202', 3500.00, 4, true, true, true, true, false),
  (3, 'Executive Suite', '301', 6000.00, 2, true, true, true, true, true),
  (3, 'Presidential Suite', '302', 8500.00, 4, true, true, true, true, true)
ON CONFLICT (room_number) DO NOTHING;
