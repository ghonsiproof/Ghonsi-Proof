-- Ghonsi Proof Database Setup and Migrations
-- Run this script in your Supabase SQL Editor to set up wallet-email linking

-- 1. Add missing columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'solana',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing RLS policies if they exist (optional - comment out if you want to keep them)
DROP POLICY IF EXISTS "Allow anonymous wallet insert" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 4. Create RLS policies for wallet-based registration and auth

-- Policy: Allow anyone to insert a new user with wallet_address
CREATE POLICY "Allow anonymous wallet insert" ON public.users
  FOR INSERT
  WITH CHECK (wallet_address IS NOT NULL);

-- Policy: Allow users to read their own profile by ID (for email users) or by wallet (for wallet users)
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (
    -- Allow reading if user has Supabase auth session and it matches their ID
    auth.uid() = id
    -- OR allow reading by wallet address if wallet is connected
    OR wallet_address IS NOT NULL
  );

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR wallet_address IS NOT NULL)
  WITH CHECK (auth.uid() = id OR wallet_address IS NOT NULL);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR wallet_address IS NOT NULL);

-- 5. Create an index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);

-- 6. Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 7. Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_updated_at_column TO authenticated, anon;

-- 9. Verify table structure
-- Run this query to verify everything is set up correctly:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public';

-- NOTES:
-- - The users table now supports both email authentication and wallet authentication
-- - Email users can bind wallets to their account
-- - Wallet users can add emails to their account with OTP verification
-- - All changes to users are timestamped automatically via the updated_at trigger
-- - Indices on wallet_address and email ensure fast lookups for both auth methods
