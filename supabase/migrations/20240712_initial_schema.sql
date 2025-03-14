
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('requester', 'driver', 'admin');

-- Create enum for driver status
CREATE TYPE public.driver_status AS ENUM ('available', 'busy', 'offline');

-- Create users table to store all user information
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'requester',
  phone TEXT,
  driver_id TEXT UNIQUE,
  ambulance_id TEXT,
  license_number TEXT,
  photo_url TEXT,
  status driver_status DEFAULT 'available',
  current_location TEXT,
  current_job TEXT,
  username TEXT UNIQUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  last_active BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
-- Allow users to see their own data
CREATE POLICY "Users can read their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow admins to see all users
CREATE POLICY "Admins can read all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update all users
CREATE POLICY "Admins can update all users" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow insertion during signup
CREATE POLICY "Users can insert during signup" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Function to handle user creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, username)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', new.email), 
    new.email, 
    coalesce(new.raw_user_meta_data->>'role', 'requester')::user_role,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a user record when a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Setup realtime for users table
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
