-- Fix: Convert user_roles SELECT policy to RESTRICTIVE for better security

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a restrictive SELECT policy that explicitly limits users to their own roles only
CREATE POLICY "Users can only view their own roles" 
ON public.user_roles 
AS RESTRICTIVE
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Also add a restrictive policy for anon to block all access
CREATE POLICY "Block anonymous role access"
ON public.user_roles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);