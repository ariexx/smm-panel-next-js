-- Create settings table migration

-- Create the settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'website_config', -- Use a fixed ID for the single settings row
  site_title TEXT,
  site_description TEXT,
  meta_tags TEXT, -- Stored as comma-separated string for now
  promotions JSONB DEFAULT '[]'::JSONB, -- Store promotions as a JSON array
  default_currency TEXT DEFAULT 'USD', -- Default currency
  currency_rates JSONB, -- Store exchange rates
  currency_rates_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on the settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read the settings (for frontend display)
-- You might want to restrict this if settings contain sensitive info,
-- but site title/description/meta tags are usually public.
-- We'll allow admins to read all settings too via their specific policy.
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- Policy to allow authenticated admins to update the settings
CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Optional: Policy to allow admins to insert the initial row if it doesn't exist
-- The upsert in the app handles creation, but this RLS is good practice.
CREATE POLICY "Admins can insert settings" ON settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- Add an updated_at trigger for the settings table
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); -- Assuming update_updated_at_column is defined in 20230501000002_functions_and_triggers.sql
