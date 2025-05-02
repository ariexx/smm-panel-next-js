-- Update user triggers and functions for referral system

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INT;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric string
    code := substring(md5(random()::text), 1, 8);
    -- Check if the generated code already exists
    SELECT count(*) INTO exists_check FROM users WHERE referral_code = code;
    -- If it doesn't exist, exit the loop
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user function to process referrals
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referrer_uuid UUID;
  generated_code TEXT;
BEGIN
  -- Attempt to get referrer_id from metadata
  BEGIN
    referrer_uuid := (NEW.raw_user_meta_data->>'referrer_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    referrer_uuid := NULL;
  END;
  
  -- Generate a unique referral code
  generated_code := generate_referral_code();
  
  -- Insert new user with referral information
  INSERT INTO users (id, email, username, referred_by, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    referrer_uuid,
    generated_code
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle when a referred user completes a qualifying action
-- In this case, the qualifying action is placing their first order
CREATE OR REPLACE FUNCTION process_referral_qualification()
RETURNS TRIGGER AS $$
DECLARE
  user_order_count INT;
  referrer_id UUID;
BEGIN
  -- Check if this is the user's first order
  SELECT COUNT(*) INTO user_order_count 
  FROM orders 
  WHERE user_id = NEW.user_id AND id != NEW.id;
  
  -- If this is their first order and they were referred
  IF user_order_count = 0 THEN
    -- Get the referrer_id for this user
    SELECT referred_by INTO referrer_id 
    FROM users 
    WHERE id = NEW.user_id AND referred_by IS NOT NULL AND referred_action_completed = FALSE;
    
    -- If user was referred, update both users
    IF referrer_id IS NOT NULL THEN
      -- Mark the referred user as having completed the action
      UPDATE users
      SET referred_action_completed = TRUE
      WHERE id = NEW.user_id;
      
      -- Increment the referrer's qualifying_referrals_count
      UPDATE users
      SET qualifying_referrals_count = qualifying_referrals_count + 1
      WHERE id = referrer_id;
      
      -- Here you could add additional logic for rewards based on referral count
      -- For example, if the referrer now has 10 referrals, give them a bonus
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process referral qualification when an order is placed
CREATE TRIGGER process_referral_qualification_trigger
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION process_referral_qualification();