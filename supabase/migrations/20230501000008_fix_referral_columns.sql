-- Fix missing columns in users table for referral system

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check if qualifying_referrals_count column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'qualifying_referrals_count') THEN
        -- Add the missing column
        ALTER TABLE users ADD COLUMN qualifying_referrals_count INTEGER DEFAULT 0;
    END IF;

    -- Also ensure other referral columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'referred_action_completed') THEN
        ALTER TABLE users ADD COLUMN referred_action_completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_referral_code') THEN
        CREATE INDEX idx_users_referral_code ON users(referral_code);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_referred_by') THEN
        CREATE INDEX idx_users_referred_by ON users(referred_by);
    END IF;
END
$$;