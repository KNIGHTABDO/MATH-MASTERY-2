-- Fix for the authentication and database issues
-- Run this in your Supabase SQL Editor

-- First, let's drop the problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a better function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use INSERT with ON CONFLICT to prevent errors
    INSERT INTO public.user_profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Could not create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the user_profiles table to allow empty names temporarily
ALTER TABLE user_profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN last_name DROP NOT NULL;

-- Add defaults for empty names
ALTER TABLE user_profiles ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE user_profiles ALTER COLUMN last_name SET DEFAULT '';

-- Update existing empty profiles
UPDATE user_profiles 
SET first_name = COALESCE(first_name, ''), 
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- Now make them NOT NULL again with defaults
ALTER TABLE user_profiles ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN last_name SET NOT NULL;

-- Add a role column to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'));
    END IF;
END $$;

-- Update the RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- Add policy for service role to manage profiles (for the trigger)
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;
CREATE POLICY "Service role can manage profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Ensure the anon role can create users
GRANT INSERT ON user_profiles TO anon;
GRANT SELECT ON user_profiles TO anon;
