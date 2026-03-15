-- Fix: Change service_role_insert_appointments from {public} to {service_role}
DROP POLICY IF EXISTS "service_role_insert_appointments" ON public.appointments;
CREATE POLICY "service_role_insert_appointments"
  ON public.appointments
  FOR INSERT
  TO service_role
  WITH CHECK (true);