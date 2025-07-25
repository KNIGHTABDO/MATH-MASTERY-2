-- Math Mastery Platform - Complete Authentication Fix
-- Run this script in your Supabase SQL Editor to fix all auth issues

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add role column to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin'));
        RAISE NOTICE 'Added role column to user_profiles table';
    ELSE
        RAISE NOTICE 'Role column already exists in user_profiles table';
    END IF;
END $$;

-- 3. Update the user creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Prénom'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nom'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', user_profiles.first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', user_profiles.last_name),
        role = COALESCE(NEW.raw_user_meta_data->>'role', user_profiles.role),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create profiles for existing users who don't have them
INSERT INTO user_profiles (user_id, first_name, last_name, role)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'first_name', 'Prénom'),
    COALESCE(u.raw_user_meta_data->>'last_name', 'Nom'),
    COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    role = COALESCE(EXCLUDED.role, user_profiles.role),
    updated_at = NOW();

-- 6. Update existing profiles that don't have a role set
UPDATE user_profiles 
SET role = 'student', updated_at = NOW()
WHERE role IS NULL OR role = '';

-- 7. Update RLS policies to include the new role column
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
CREATE POLICY "Admins can manage chapters" ON chapters
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons" ON lessons
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;
CREATE POLICY "Admins can manage exercises" ON exercises
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- 8. Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    user_record auth.users%ROWTYPE;
BEGIN
    -- Find the user
    SELECT * INTO user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update user metadata
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE id = user_record.id;
    
    -- Update user profile
    UPDATE user_profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE user_id = user_record.id;
    
    RAISE NOTICE 'User % promoted to admin successfully', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permission on the promotion function
GRANT EXECUTE ON FUNCTION promote_user_to_admin TO authenticated;

-- 10. Create the user_management view if it doesn't exist
CREATE OR REPLACE VIEW user_management AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    COALESCE(p.role, u.raw_user_meta_data->>'role', 'student') as role,
    (u.raw_user_meta_data->>'first_name') as first_name,
    (u.raw_user_meta_data->>'last_name') as last_name,
    p.first_name as profile_first_name,
    p.last_name as profile_last_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- 11. Grant permissions on the view
GRANT SELECT ON user_management TO authenticated;

-- 12. Ensure proper RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- 14. Allow admins to update user profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- 15. Show current user count and profiles
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    admin_count INTEGER;
    missing_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE role = 'admin';
    SELECT COUNT(*) INTO missing_profiles FROM auth.users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE p.user_id IS NULL;
    
    RAISE NOTICE '=== DATABASE FIX COMPLETED ===';
    RAISE NOTICE 'Total users in auth.users: %', user_count;
    RAISE NOTICE 'Total profiles in user_profiles: %', profile_count;
    RAISE NOTICE 'Admin users: %', admin_count;
    RAISE NOTICE 'Student users: %', profile_count - admin_count;
    RAISE NOTICE 'Users missing profiles: %', missing_profiles;
    
    IF missing_profiles > 0 THEN
        RAISE NOTICE 'WARNING: Some users are missing profiles. This should be 0.';
    ELSE
        RAISE NOTICE 'SUCCESS: All users have profiles!';
    END IF;
END $$;