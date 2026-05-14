CREATE TABLE IF NOT EXISTS wedding_guests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  guests_count TEXT DEFAULT '1',
  menu TEXT DEFAULT '',
  wishes TEXT DEFAULT '',
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);