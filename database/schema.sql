-- Drop existing tables and related objects
-- WARNING: This will delete all existing data!

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_soft_delete_garden_items ON gardens;

-- Drop functions
DROP FUNCTION IF EXISTS soft_delete_garden_items();

-- Drop policies
DROP POLICY IF EXISTS "Enable all access for items" ON items;
DROP POLICY IF EXISTS "Enable all access for trees" ON trees;
DROP POLICY IF EXISTS "Enable all access for gardens" ON gardens;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS trees CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;

-- ============================================
-- Create fresh tables
-- ============================================

-- Gardens table
CREATE TABLE gardens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  background_image TEXT,
  default_sort TEXT,
  default_year_planted INTEGER,
  default_owner TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - adjust based on your auth needs)
CREATE POLICY "Enable all access for gardens" ON gardens FOR ALL USING (true);

-- Trees table (for trees only)
CREATE TABLE trees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sort TEXT,
  year_planted INTEGER,
  owner TEXT,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable', 'Reserved')),
  x_percent DECIMAL(5,2) NOT NULL,
  y_percent DECIMAL(5,2) NOT NULL,
  custom_avatar TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - adjust based on your auth needs)
CREATE POLICY "Enable all access for trees" ON trees FOR ALL USING (true);

-- Items table (for buildings and other objects)
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  x_percent DECIMAL(5,2) NOT NULL,
  y_percent DECIMAL(5,2) NOT NULL,
  custom_avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - adjust based on your auth needs)
CREATE POLICY "Enable all access for items" ON items FOR ALL USING (true);

-- Function to soft delete trees and items when garden is soft deleted
CREATE OR REPLACE FUNCTION soft_delete_garden_items()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true THEN
    UPDATE trees SET is_active = false WHERE garden_id = NEW.id;
    UPDATE items SET is_active = false WHERE garden_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to soft delete trees and items when garden is soft deleted
CREATE TRIGGER trigger_soft_delete_garden_items
AFTER UPDATE ON gardens
FOR EACH ROW
EXECUTE FUNCTION soft_delete_garden_items();
