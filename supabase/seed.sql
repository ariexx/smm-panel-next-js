-- Seed data for the SMM Panel

-- Insert categories
INSERT INTO categories (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Instagram'),
  ('22222222-2222-2222-2222-222222222222', 'TikTok'),
  ('33333333-3333-3333-3333-333333333333', 'YouTube'),
  ('44444444-4444-4444-4444-444444444444', 'Twitter'),
  ('55555555-5555-5555-5555-555555555555', 'Facebook');

-- Insert services
INSERT INTO services (id, name, description, category, price_per_1000, min_quantity, max_quantity, popularity) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Instagram Followers', 'High Quality Instagram followers, non-drop', '11111111-1111-1111-1111-111111111111', 12.00, 100, 10000, 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Instagram Likes', 'Real Instagram likes, instant delivery', '11111111-1111-1111-1111-111111111111', 8.00, 50, 5000, 8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TikTok Followers', 'High quality TikTok followers', '22222222-2222-2222-2222-222222222222', 15.00, 100, 20000, 9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'TikTok Likes', 'Real TikTok likes, non-drop', '22222222-2222-2222-2222-222222222222', 8.00, 50, 50000, 7),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'YouTube Views', 'High retention YouTube views', '33333333-3333-3333-3333-333333333333', 15.00, 1000, 100000, 6),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'YouTube Subscribers', 'Real YouTube subscribers', '33333333-3333-3333-3333-333333333333', 25.00, 100, 5000, 5),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Twitter Followers', 'High quality Twitter followers', '44444444-4444-4444-4444-444444444444', 20.00, 100, 10000, 4),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Twitter Likes', 'Real Twitter likes', '44444444-4444-4444-4444-444444444444', 10.00, 50, 5000, 3),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Facebook Page Likes', 'High quality Facebook page likes', '55555555-5555-5555-5555-555555555555', 18.00, 100, 10000, 2),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Facebook Post Likes', 'Real Facebook post likes', '55555555-5555-5555-5555-555555555555', 12.00, 50, 5000, 1);

-- Note: Users will be created through the registration process
-- Admin user can be created manually or through the registration process and then updated to have admin role
