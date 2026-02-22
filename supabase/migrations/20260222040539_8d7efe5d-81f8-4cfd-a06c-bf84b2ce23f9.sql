ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS room_type text;
ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS inclusions text[] DEFAULT '{}';
ALTER TABLE client_quotes ADD COLUMN IF NOT EXISTS valid_until date;