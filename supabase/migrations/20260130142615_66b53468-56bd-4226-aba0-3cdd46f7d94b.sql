-- Drop conflicting policies
DROP POLICY IF EXISTS "Block anonymous role access" ON public.user_roles;
DROP POLICY IF EXISTS "Users can only view their own roles" ON public.user_roles;

-- Create a PERMISSIVE policy that allows authenticated users to see their own roles
CREATE POLICY "Authenticated users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Block anon users explicitly
CREATE POLICY "Block anon read"
ON public.user_roles
FOR SELECT
TO anon
USING (false);