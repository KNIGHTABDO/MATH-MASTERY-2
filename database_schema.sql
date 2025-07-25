-- Math Mastery Platform Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'bg-blue-500',
    icon TEXT NOT NULL DEFAULT 'Calculator',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_order ON exercises(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for chapters (readable by all authenticated users, writable by admins)
CREATE POLICY "Authenticated users can view chapters" ON chapters
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage chapters" ON chapters
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        )
    );

-- Create policies for lessons (readable by all authenticated users, writable by admins)
CREATE POLICY "Authenticated users can view lessons" ON lessons
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage lessons" ON lessons
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        )
    );

-- Create policies for exercises (readable by all authenticated users, writable by admins)
CREATE POLICY "Authenticated users can view exercises" ON exercises
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage exercises" ON exercises
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample chapters (only if they don't exist)
INSERT INTO chapters (title, description, color, icon, order_index) 
SELECT * FROM (VALUES
    ('Analyse Mathématique', 'Maîtrisez les concepts fondamentaux de l''analyse', 'bg-blue-500', 'Calculator', 0),
    ('Algèbre Avancée', 'Explorez les structures algébriques complexes', 'bg-emerald-500', 'Target', 1),
    ('Géométrie dans l''Espace', 'Visualisez et résolvez en trois dimensions', 'bg-purple-500', 'BookOpen', 2),
    ('Probabilités & Statistiques', 'Analysez l''incertain avec précision', 'bg-orange-500', 'BarChart3', 3)
) AS new_chapters(title, description, color, icon, order_index)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE chapters.title = new_chapters.title);

-- Create a function to handle new user registration
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a view to easily see all users and their roles (for admin management)
CREATE OR REPLACE VIEW user_management AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    (u.raw_user_meta_data->>'role') as role,
    (u.raw_user_meta_data->>'first_name') as first_name,
    (u.raw_user_meta_data->>'last_name') as last_name,
    p.first_name as profile_first_name,
    p.last_name as profile_last_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;