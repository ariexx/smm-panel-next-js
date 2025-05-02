-- Sample data migration

-- Insert categories if they don't exist
INSERT INTO categories (id, name)
SELECT 
  uuid_generate_v4(), 'Instagram'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'Instagram'
);

INSERT INTO categories (id, name)
SELECT 
  uuid_generate_v4(), 'TikTok'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'TikTok'
);

INSERT INTO categories (id, name)
SELECT 
  uuid_generate_v4(), 'YouTube'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'YouTube'
);

INSERT INTO categories (id, name)
SELECT 
  uuid_generate_v4(), 'Twitter'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'Twitter'
);

INSERT INTO categories (id, name)
SELECT 
  uuid_generate_v4(), 'Facebook'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'Facebook'
);

-- Insert sample services
-- We'll use the category IDs we just created
DO $$
DECLARE
  instagram_id UUID;
  tiktok_id UUID;
  youtube_id UUID;
  twitter_id UUID;
  facebook_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO instagram_id FROM categories WHERE name = 'Instagram' LIMIT 1;
  SELECT id INTO tiktok_id FROM categories WHERE name = 'TikTok' LIMIT 1;
  SELECT id INTO youtube_id FROM categories WHERE name = 'YouTube' LIMIT 1;
  SELECT id INTO twitter_id FROM categories WHERE name = 'Twitter' LIMIT 1;
  SELECT id INTO facebook_id FROM categories WHERE name = 'Facebook' LIMIT 1;
  
  -- Insert services if they don't exist
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Instagram Followers') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Instagram Followers', 'High Quality Instagram followers, non-drop', instagram_id, 12.00, 100, 10000, 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Instagram Likes') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Instagram Likes', 'Real Instagram likes, instant delivery', instagram_id, 8.00, 50, 5000, 8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'TikTok Followers') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('TikTok Followers', 'High quality TikTok followers', tiktok_id, 15.00, 100, 20000, 9);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'TikTok Likes') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('TikTok Likes', 'Real TikTok likes, non-drop', tiktok_id, 8.00, 50, 50000, 7);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'YouTube Views') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('YouTube Views', 'High retention YouTube views', youtube_id, 15.00, 1000, 100000, 6);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'YouTube Subscribers') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('YouTube Subscribers', 'Real YouTube subscribers', youtube_id, 25.00, 100, 5000, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Twitter Followers') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Twitter Followers', 'High quality Twitter followers', twitter_id, 20.00, 100, 10000, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Twitter Likes') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Twitter Likes', 'Real Twitter likes', twitter_id, 10.00, 50, 5000, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Facebook Page Likes') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Facebook Page Likes', 'High quality Facebook page likes', facebook_id, 18.00, 100, 10000, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Facebook Post Likes') THEN
    INSERT INTO services (name, description, category, price_per_1000, min_quantity, max_quantity, popularity)
    VALUES ('Facebook Post Likes', 'Real Facebook post likes', facebook_id, 12.00, 50, 5000, 1);
  END IF;
END
$$;
