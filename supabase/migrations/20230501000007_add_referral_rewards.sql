-- Add reward functions for referral milestones

-- Function to check and process referral rewards
CREATE OR REPLACE FUNCTION process_referral_rewards()
RETURNS TRIGGER AS $$
DECLARE
    referral_count INT;
    current_balance DECIMAL;
BEGIN
    -- Only execute if qualifying_referrals_count has changed
    IF OLD.qualifying_referrals_count = NEW.qualifying_referrals_count THEN
        RETURN NEW;
    END IF;
    
    -- Get current count of qualifying referrals
    referral_count := NEW.qualifying_referrals_count;
    current_balance := NEW.balance;
    
    -- Process rewards at different milestones
    -- These are example thresholds, customize as needed
    
    -- Reward at 5 referrals - Add $5 balance
    IF referral_count = 5 THEN
        -- Update the user's balance with a $5 bonus
        UPDATE users
        SET balance = balance + 5,
            -- You could also add a note about the bonus in another column if available
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- You might also want to record this in a transactions table
        INSERT INTO transactions (user_id, amount, type, status)
        VALUES (NEW.id, 5, 'referral_bonus', 'completed');
    END IF;
    
    -- Reward at 10 referrals - Add $10 balance
    IF referral_count = 10 THEN
        -- Update the user's balance with a $10 bonus
        UPDATE users
        SET balance = balance + 10,
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Record the transaction
        INSERT INTO transactions (user_id, amount, type, status)
        VALUES (NEW.id, 10, 'referral_bonus', 'completed');
    END IF;
    
    -- Reward at 15 referrals - Add $15 balance
    IF referral_count = 15 THEN
        -- Update the user's balance with a $15 bonus
        UPDATE users
        SET balance = balance + 15,
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Record the transaction
        INSERT INTO transactions (user_id, amount, type, status)
        VALUES (NEW.id, 15, 'referral_bonus', 'completed');
    END IF;
    
    -- You can add more reward tiers as needed
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically process rewards when qualifying_referrals_count changes
CREATE TRIGGER process_referral_rewards_trigger
AFTER UPDATE OF qualifying_referrals_count ON users
FOR EACH ROW
EXECUTE FUNCTION process_referral_rewards();