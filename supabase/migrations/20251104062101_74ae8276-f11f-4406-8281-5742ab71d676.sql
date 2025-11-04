-- Fix critical security issue: Respect public_mode for profile visibility
-- Drop the existing policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy that respects public_mode
-- Users can view profiles that are public OR their own profile
CREATE POLICY "Users can view public profiles or their own"
  ON public.profiles
  FOR SELECT
  USING (
    public_mode = true 
    OR auth.uid() = id
  );

-- Add index for better performance on public_mode queries
CREATE INDEX IF NOT EXISTS idx_profiles_public_mode ON public.profiles(public_mode) WHERE public_mode = true;