-- =============================================================
-- sql/schema.sql  —  CleanGreen · SIH 2026
-- Supabase (Postgres 15) — run in SQL Editor, top to bottom.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.
-- =============================================================


-- ───────────────────────────────────────────────────────────────
-- 0.  EXTENSIONS
-- ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_salt / crypt  (used in seed)


-- ───────────────────────────────────────────────────────────────
-- 1.  TABLES
-- ───────────────────────────────────────────────────────────────

-- 1a. profiles
--     Extends auth.users.  One row per registered user.
--     Created automatically by trigger handle_new_user (section 2a).
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text        NOT NULL DEFAULT 'New User',
  role          text        NOT NULL DEFAULT 'citizen'
                            CHECK (role IN ('citizen','driver','admin')),
  trust_score   integer     NOT NULL DEFAULT 50
                            CHECK (trust_score BETWEEN 0 AND 100),
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS
  'One profile per auth user. Role drives RBAC; trust_score gates report auto-verification.';


-- 1b. hotspots
--     A geographic dump site.  Aggregated from individual citizen reports.
CREATE TABLE IF NOT EXISTS public.hotspots (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text        NOT NULL,
  lat              float8      NOT NULL,
  lng              float8      NOT NULL,
  report_count     integer     NOT NULL DEFAULT 0,
  is_chronic       boolean     NOT NULL DEFAULT false,
  status           text        NOT NULL DEFAULT 'reported'
                               CHECK (status IN ('reported','cleaned')),
  last_cleaned_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.hotspots IS
  'Aggregated dump-site with GPS pin.  report_count drives is_chronic flag.';


-- 1c. reports
--     A single citizen photo-report of a dump site.
CREATE TABLE IF NOT EXISTS public.reports (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotspot_id           uuid        REFERENCES public.hotspots(id) ON DELETE SET NULL,
  photo_url            text,
  lat                  float8      NOT NULL,
  lng                  float8      NOT NULL,
  description          text,
  status               text        NOT NULL DEFAULT 'pending_verification'
                                   CHECK (status IN (
                                     'pending_verification','verified','cleaned'
                                   )),
  verification_count   integer     NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.reports IS
  'One citizen photo-report → linked to a hotspot (existing or newly created).';


-- 1d. report_verifications
--     Tracks which citizen up-voted / verified which report (one per pair).
CREATE TABLE IF NOT EXISTS public.report_verifications (
  report_id   uuid        NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (report_id, user_id)          -- implicit UNIQUE
);
COMMENT ON TABLE public.report_verifications IS
  'Upvote/verify log.  Composite PK prevents double-voting.';


-- 1e. truck_locations
--     One row per driver, upserted in real-time as the driver moves.
CREATE TABLE IF NOT EXISTS public.truck_locations (
  driver_id   uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  lat         float8      NOT NULL,
  lng         float8      NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.truck_locations IS
  'Real-time GPS position of each driver (single row per driver, upserted).';


-- ───────────────────────────────────────────────────────────────
-- 2.  HELPER FUNCTION  (avoids RLS recursion in policies)
-- ───────────────────────────────────────────────────────────────

-- get_my_role() runs as the function owner (SECURITY DEFINER),
-- so it bypasses RLS on profiles — safe, no recursion risk.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Haversine distance in metres — no PostGIS required.
CREATE OR REPLACE FUNCTION public.haversine_m(
  lat1 float8, lng1 float8,
  lat2 float8, lng2 float8
)
RETURNS float8
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
AS $$
  SELECT 6371000.0 * 2.0 * asin(
    sqrt(
      pow(sin(radians(lat2 - lat1) / 2.0), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) *
      pow(sin(radians(lng2 - lng1) / 2.0), 2)
    )
  );
$$;


-- ───────────────────────────────────────────────────────────────
-- 3.  TRIGGER: auto-create profile on signup  (section 2a spec)
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    -- pull full_name from sign-up metadata if provided
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(NEW.email, '@', 1)    -- fallback: use email prefix
    ),
    -- pull role from metadata; default 'citizen'
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      'citizen'
    )
  )
  ON CONFLICT (id) DO NOTHING;   -- idempotent
  RETURN NEW;
END;
$$;

-- Fire after every new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ───────────────────────────────────────────────────────────────
-- 4.  TRIGGER: hotspot matching/creation on new report  (spec 2b + 2c)
-- ───────────────────────────────────────────────────────────────
--
--  Logic executed BEFORE the report is inserted:
--  a) Look for a hotspot within 30 m of the report coordinates.
--  b) Found  → increment its report_count, set status='reported',
--              write its id into NEW.hotspot_id.
--     Not found → create a new hotspot and write its id.
--  c) If the reporter's trust_score >= 80 → auto-set status='verified'.

CREATE OR REPLACE FUNCTION public.handle_new_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_hotspot_id  uuid;
  v_reporter_score       integer;
  v_new_count            integer;
BEGIN
  -- ── a) find closest hotspot within 30 metres ────────────────
  SELECT id
  INTO   v_existing_hotspot_id
  FROM   public.hotspots
  WHERE  public.haversine_m(lat, lng, NEW.lat, NEW.lng) < 30
  ORDER BY public.haversine_m(lat, lng, NEW.lat, NEW.lng)
  LIMIT 1;

  IF v_existing_hotspot_id IS NOT NULL THEN
    -- ── b-i) hotspot found → update it ─────────────────────────
    UPDATE public.hotspots
    SET
      report_count = report_count + 1,
      status       = 'reported'           -- re-open if it was cleaned
    WHERE id = v_existing_hotspot_id
    RETURNING report_count INTO v_new_count;

    -- Auto-flag as chronic when report_count hits 5
    IF v_new_count >= 5 THEN
      UPDATE public.hotspots
      SET is_chronic = true
      WHERE id = v_existing_hotspot_id;
    END IF;

    NEW.hotspot_id := v_existing_hotspot_id;

  ELSE
    -- ── b-ii) no nearby hotspot → create one ───────────────────
    INSERT INTO public.hotspots (name, lat, lng, report_count)
    VALUES (
      COALESCE(
        NULLIF(trim(NEW.description), ''),
        'Reported dump at (' ||
          round(NEW.lat::numeric, 5)::text || ', ' ||
          round(NEW.lng::numeric, 5)::text || ')'
      ),
      NEW.lat,
      NEW.lng,
      1
    )
    RETURNING id INTO v_existing_hotspot_id;

    NEW.hotspot_id := v_existing_hotspot_id;
  END IF;

  -- ── c) trust_score >= 80 → auto-verify ─────────────────────
  SELECT trust_score
  INTO   v_reporter_score
  FROM   public.profiles
  WHERE  id = NEW.reporter_id;

  IF v_reporter_score >= 80 THEN
    NEW.status             := 'verified';
    NEW.verification_count := 3;          -- treat as already verified
  END IF;

  RETURN NEW;   -- modified NEW is what actually gets inserted
END;
$$;

DROP TRIGGER IF EXISTS on_report_insert ON public.reports;
CREATE TRIGGER on_report_insert
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_report();


-- ───────────────────────────────────────────────────────────────
-- 5.  TRIGGER: verification count + trust_score  (spec 2d)
-- ───────────────────────────────────────────────────────────────
--
--  On INSERT into report_verifications:
--  a) Increment reports.verification_count.
--  b) When count reaches 3 → set report.status = 'verified'.
--  c) Give the original reporter +5 trust_score (cap 100).

CREATE OR REPLACE FUNCTION public.handle_new_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count   integer;
  v_reporter_id uuid;
BEGIN
  -- ── a) increment verification count ─────────────────────────
  UPDATE public.reports
  SET    verification_count = verification_count + 1
  WHERE  id = NEW.report_id
  RETURNING verification_count, reporter_id
  INTO   v_new_count, v_reporter_id;

  -- ── b) threshold reached → verify the report ─────────────────
  IF v_new_count >= 3 THEN
    UPDATE public.reports
    SET    status = 'verified'
    WHERE  id = NEW.report_id
      AND  status = 'pending_verification';   -- don't downgrade 'cleaned'

    -- ── c) reward the original reporter ──────────────────────────
    IF v_reporter_id IS NOT NULL THEN
      UPDATE public.profiles
      SET    trust_score = LEAST(100, trust_score + 5)
      WHERE  id = v_reporter_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_insert ON public.report_verifications;
CREATE TRIGGER on_verification_insert
  AFTER INSERT ON public.report_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_verification();


-- ───────────────────────────────────────────────────────────────
-- 6.  RPC: mark_hotspot_cleaned  (spec 2e)
-- ───────────────────────────────────────────────────────────────
--
--  Callable as: SELECT mark_hotspot_cleaned('<hotspot-uuid>');
--  • Validates caller is driver or admin.
--  • Marks hotspot cleaned.
--  • Marks all non-cleaned reports cleaned.
--  • Awards +10 trust_score to every unique reporter (cap 100).

CREATE OR REPLACE FUNCTION public.mark_hotspot_cleaned(p_hotspot_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role          text;
  v_reporter_ids  uuid[];
  v_updated_rpts  integer;
BEGIN
  -- ── permission check ─────────────────────────────────────────
  SELECT role INTO v_role
  FROM   public.profiles
  WHERE  id = auth.uid();

  IF v_role NOT IN ('driver', 'admin') THEN
    RAISE EXCEPTION 'permission_denied: only drivers and admins may mark hotspots cleaned'
      USING ERRCODE = '42501';
  END IF;

  -- ── collect unique reporters before updating status ───────────
  SELECT ARRAY_AGG(DISTINCT reporter_id)
  INTO   v_reporter_ids
  FROM   public.reports
  WHERE  hotspot_id = p_hotspot_id
    AND  status != 'cleaned';

  -- ── mark the reports cleaned ──────────────────────────────────
  UPDATE public.reports
  SET    status = 'cleaned'
  WHERE  hotspot_id = p_hotspot_id
    AND  status != 'cleaned';

  GET DIAGNOSTICS v_updated_rpts = ROW_COUNT;

  -- ── mark the hotspot cleaned ──────────────────────────────────
  UPDATE public.hotspots
  SET
    status          = 'cleaned',
    last_cleaned_at = now()
  WHERE id = p_hotspot_id;

  -- ── award +10 trust_score to each unique reporter ─────────────
  IF v_reporter_ids IS NOT NULL AND array_length(v_reporter_ids, 1) > 0 THEN
    UPDATE public.profiles
    SET    trust_score = LEAST(100, trust_score + 10)
    WHERE  id = ANY(v_reporter_ids);
  END IF;

  RETURN json_build_object(
    'success',          true,
    'hotspot_id',       p_hotspot_id,
    'reports_cleaned',  v_updated_rpts,
    'reporters_rewarded', COALESCE(array_length(v_reporter_ids, 1), 0)
  );
END;
$$;

-- Grant execute to authenticated users (permission checked inside fn)
GRANT EXECUTE ON FUNCTION public.mark_hotspot_cleaned(uuid) TO authenticated;


-- ───────────────────────────────────────────────────────────────
-- 7.  ROW-LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_locations       ENABLE ROW LEVEL SECURITY;

-- Drop old policies before recreating (idempotent re-runs)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename IN (
        'profiles','hotspots','reports',
        'report_verifications','truck_locations'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname, r.tablename
    );
  END LOOP;
END
$$;


-- ── 7a. profiles ──────────────────────────────────────────────

-- All logged-in users can read all profiles (needed for name display)
CREATE POLICY "profiles: authenticated read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update ONLY their own profile's non-sensitive fields
CREATE POLICY "profiles: owner update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins have full write access
CREATE POLICY "profiles: admin full access"
  ON public.profiles FOR ALL
  TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ── 7b. hotspots ──────────────────────────────────────────────

-- All logged-in users can read hotspots (for the map)
CREATE POLICY "hotspots: authenticated read all"
  ON public.hotspots FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can INSERT/UPDATE/DELETE hotspots directly
-- (Citizens create hotspots indirectly via the trigger — SECURITY DEFINER)
CREATE POLICY "hotspots: admin full access"
  ON public.hotspots FOR ALL
  TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ── 7c. reports ───────────────────────────────────────────────

-- All logged-in users can view all reports
CREATE POLICY "reports: authenticated read all"
  ON public.reports FOR SELECT
  TO authenticated
  USING (true);

-- Citizens and admins can insert reports
CREATE POLICY "reports: citizen or admin insert"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()                      -- must be their own report
    AND public.get_my_role() IN ('citizen','admin')
  );

-- Citizens can update ONLY their own reports (e.g. description edit)
CREATE POLICY "reports: owner update own"
  ON public.reports FOR UPDATE
  TO authenticated
  USING  (reporter_id = auth.uid())
  WITH CHECK (reporter_id = auth.uid());

-- Admins have full access to reports
CREATE POLICY "reports: admin full access"
  ON public.reports FOR ALL
  TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ── 7d. report_verifications ──────────────────────────────────

-- All logged-in users can see all verifications (for count display)
CREATE POLICY "verifications: authenticated read all"
  ON public.report_verifications FOR SELECT
  TO authenticated
  USING (true);

-- Citizens can insert a verification for someone else's report.
-- (Cannot verify their own report — enforced here.)
CREATE POLICY "verifications: citizen insert others"
  ON public.report_verifications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()                  -- must log their own user_id
    AND public.get_my_role() = 'citizen'
    AND user_id != (                      -- cannot verify own report
      SELECT reporter_id FROM public.reports WHERE id = report_id
    )
  );

-- Admins can insert verifications (for testing / moderation)
CREATE POLICY "verifications: admin full access"
  ON public.report_verifications FOR ALL
  TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ── 7e. truck_locations ───────────────────────────────────────

-- All authenticated users can see truck locations (citizens see truck on map)
CREATE POLICY "truck_locations: authenticated read"
  ON public.truck_locations FOR SELECT
  TO authenticated
  USING (true);

-- Drivers can upsert ONLY their own row
CREATE POLICY "truck_locations: driver upsert own"
  ON public.truck_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid()
    AND public.get_my_role() = 'driver'
  );

CREATE POLICY "truck_locations: driver update own"
  ON public.truck_locations FOR UPDATE
  TO authenticated
  USING  (driver_id = auth.uid() AND public.get_my_role() = 'driver')
  WITH CHECK (driver_id = auth.uid());

-- Admins have full access to truck_locations
CREATE POLICY "truck_locations: admin full access"
  ON public.truck_locations FOR ALL
  TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ───────────────────────────────────────────────────────────────
-- 8.  REALTIME PUBLICATION
-- ───────────────────────────────────────────────────────────────
--  supabase_realtime is the default publication created by Supabase.
--  Adding tables here enables live subscriptions for the frontend.

ALTER PUBLICATION supabase_realtime ADD TABLE public.hotspots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.truck_locations;


-- ───────────────────────────────────────────────────────────────
-- 9.  INDEXES  (performance for map queries)
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hotspots_status
  ON public.hotspots (status);

CREATE INDEX IF NOT EXISTS idx_hotspots_coords
  ON public.hotspots (lat, lng);

CREATE INDEX IF NOT EXISTS idx_reports_hotspot_id
  ON public.reports (hotspot_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
  ON public.reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.reports (status);

CREATE INDEX IF NOT EXISTS idx_report_verifications_report_id
  ON public.report_verifications (report_id);


-- ───────────────────────────────────────────────────────────────
-- ✅  Schema complete.
--    Run sql/seed.sql next to populate demo data.
-- ───────────────────────────────────────────────────────────────
