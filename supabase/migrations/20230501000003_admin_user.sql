-- Create admin user migration

-- This migration creates an admin user if it doesn't exist
-- Note: In a production environment, you would want to set this up manually
-- or through a more secure process

DO $$
BEGIN
  -- Check if admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
  ) THEN
    -- Create admin user in auth.users if needed
    -- This is a placeholder - in a real app, you would create the admin through the auth API
    -- and then update their role to 'admin'
    
    -- For demonstration purposes, we'll just update the first user to be an admin if one exists
    UPDATE users
    SET role = 'admin'
    WHERE id = (SELECT id FROM users LIMIT 1);
    
    -- If no users exist, you would need to create one through the auth API first
  END IF;
END
$$;
