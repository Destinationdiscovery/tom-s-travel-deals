
-- Add new enum values
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'deposit_due';
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'trip_start';
ALTER TYPE booking_event_type ADD VALUE IF NOT EXISTS 'trip_end';

-- Add booking_number column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_number text;

-- Add booked status to quote_status enum
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'booked';
