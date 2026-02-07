-- Hardening: prevent bypass of rate limiting tables via broad service_role RLS policies

BEGIN;

-- 1) Remove overly broad service_role policies (these made direct table writes possible without constraints)
DROP POLICY IF EXISTS service_role_insert_tts_rate_limits ON public.tts_rate_limits;
DROP POLICY IF EXISTS service_role_update_tts_rate_limits ON public.tts_rate_limits;

DROP POLICY IF EXISTS service_role_insert_ebook_lead_rate_limits ON public.ebook_lead_rate_limits;
DROP POLICY IF EXISTS service_role_update_ebook_lead_rate_limits ON public.ebook_lead_rate_limits;

-- 2) Add trigger-based integrity enforcement so even privileged writes follow expected rate-limit semantics
CREATE OR REPLACE FUNCTION public.enforce_rate_limit_row_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ip_len int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Normalize + constrain values
    IF NEW.ip_address IS NULL OR btrim(NEW.ip_address) = '' THEN
      RAISE EXCEPTION 'ip_address is required';
    END IF;

    v_ip_len := length(NEW.ip_address);
    IF v_ip_len > 128 THEN
      RAISE EXCEPTION 'ip_address too long';
    END IF;

    -- Always start at 1 for a window
    NEW.request_count := 1;

    -- Force window to hour boundary (current implementation uses 60-minute windows)
    NEW.window_start := date_trunc('hour', COALESCE(NEW.window_start, now()));

    NEW.created_at := COALESCE(NEW.created_at, now());
    NEW.updated_at := now();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Prevent tampering with identity of the rate-limit bucket
    IF NEW.ip_address IS DISTINCT FROM OLD.ip_address THEN
      RAISE EXCEPTION 'ip_address cannot be changed';
    END IF;

    IF NEW.window_start IS DISTINCT FROM OLD.window_start THEN
      RAISE EXCEPTION 'window_start cannot be changed';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'created_at cannot be changed';
    END IF;

    -- Only allow +1 increments
    IF NEW.request_count IS DISTINCT FROM (OLD.request_count + 1) THEN
      RAISE EXCEPTION 'request_count must increment by 1';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.block_service_role_rate_limit_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Service role credential compromise is the primary risk in this finding.
  -- Prevent direct deletes executed as service_role (cleanup functions run as the function owner, not service_role).
  IF current_user = 'service_role' THEN
    RAISE EXCEPTION 'deletes are not permitted for service_role on rate limit tables';
  END IF;

  RETURN OLD;
END;
$$;

-- 3) Attach triggers to both rate limit tables
DROP TRIGGER IF EXISTS trg_enforce_tts_rate_limits_integrity ON public.tts_rate_limits;
CREATE TRIGGER trg_enforce_tts_rate_limits_integrity
BEFORE INSERT OR UPDATE ON public.tts_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.enforce_rate_limit_row_integrity();

DROP TRIGGER IF EXISTS trg_block_tts_rate_limits_delete ON public.tts_rate_limits;
CREATE TRIGGER trg_block_tts_rate_limits_delete
BEFORE DELETE ON public.tts_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.block_service_role_rate_limit_delete();

DROP TRIGGER IF EXISTS trg_enforce_ebook_lead_rate_limits_integrity ON public.ebook_lead_rate_limits;
CREATE TRIGGER trg_enforce_ebook_lead_rate_limits_integrity
BEFORE INSERT OR UPDATE ON public.ebook_lead_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.enforce_rate_limit_row_integrity();

DROP TRIGGER IF EXISTS trg_block_ebook_lead_rate_limits_delete ON public.ebook_lead_rate_limits;
CREATE TRIGGER trg_block_ebook_lead_rate_limits_delete
BEFORE DELETE ON public.ebook_lead_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.block_service_role_rate_limit_delete();

COMMIT;