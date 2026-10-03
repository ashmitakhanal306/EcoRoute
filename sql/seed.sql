-- =============================================================
-- sql/seed.sql  —  CleanGreen · SIH 2026
-- Demo data for local testing and hackathon presentation.
-- Run AFTER schema.sql.
--
-- ⚠️  IMPORTANT: Run this in the Supabase SQL Editor (as postgres).
--     It inserts directly into auth.users — only works via the
--     SQL Editor or service-role key, NOT via the anon key.
--
-- DEMO CREDENTIALS  (all passwords: demo1234)
-- ┌──────────────────────────────┬──────────────────────────┬──────────┐
-- │ Role                         │ Email                    │ Password │
-- ├──────────────────────────────┼──────────────────────────┼──────────┤
-- │ admin                        │ admin@cleangreen.in      │ demo1234 │
-- │ driver                       │ driver@cleangreen.in     │ demo1234 │
-- │ citizen  (trust_score = 78)  │ citizen1@cleangreen.in   │ demo1234 │
-- │ citizen  (trust_score = 85)  │ citizen2@cleangreen.in   │ demo1234 │
-- │ citizen  (trust_score = 42)  │ citizen3@cleangreen.in   │ demo1234 │
-- └──────────────────────────────┴──────────────────────────┴──────────┘
-- =============================================================


-- ───────────────────────────────────────────────────────────────
-- 0.  CLEAN SLATE (idempotent — safe to re-run)
-- ───────────────────────────────────────────────────────────────
-- Delete in dependency order to respect foreign keys.

DELETE FROM public.report_verifications;
DELETE FROM public.truck_locations;
DELETE FROM public.reports;
DELETE FROM public.hotspots;
DELETE FROM public.profiles;

-- Remove any existing seed users from auth.users
DELETE FROM auth.users
WHERE email IN (
  'admin@cleangreen.in',
  'driver@cleangreen.in',
  'citizen1@cleangreen.in',
  'citizen2@cleangreen.in',
  'citizen3@cleangreen.in'
);


-- ───────────────────────────────────────────────────────────────
-- 1.  AUTH USERS
--     Inserting into auth.users triggers handle_new_user()
--     which auto-creates the corresponding profiles row.
--     We set role + full_name in raw_user_meta_data so the
--     trigger picks them up.
-- ───────────────────────────────────────────────────────────────

-- Stable UUIDs for cross-referencing in seed data
DO $$ BEGIN
  -- (just a comment block — UUIDs are defined inline below)
END $$;

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  is_super_admin
)
VALUES
  -- Admin: Raj Kumar
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'admin@cleangreen.in',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Raj Kumar","role":"admin"}'::jsonb,
    now(), now(), '', '', false
  ),
  -- Driver: Suresh Yadav
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'authenticated', 'authenticated',
    'driver@cleangreen.in',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Suresh Yadav","role":"driver"}'::jsonb,
    now(), now(), '', '', false
  ),
  -- Citizen 1: Priya Sharma (trust_score will be set to 78 below)
  (
    'cccccccc-0000-0000-0000-000000000003',
    'authenticated', 'authenticated',
    'citizen1@cleangreen.in',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Priya Sharma","role":"citizen"}'::jsonb,
    now(), now(), '', '', false
  ),
  -- Citizen 2: Arjun Singh (trust_score will be set to 85 — auto-verify reports)
  (
    'dddddddd-0000-0000-0000-000000000004',
    'authenticated', 'authenticated',
    'citizen2@cleangreen.in',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Arjun Singh","role":"citizen"}'::jsonb,
    now(), now(), '', '', false
  ),
  -- Citizen 3: Nisha Gupta (low trust_score = 42, needs community verification)
  (
    'eeeeeeee-0000-0000-0000-000000000005',
    'authenticated', 'authenticated',
    'citizen3@cleangreen.in',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nisha Gupta","role":"citizen"}'::jsonb,
    now(), now(), '', '', false
  );


-- ───────────────────────────────────────────────────────────────
-- 2.  ADJUST TRUST SCORES & ROLE OVERRIDES
--     The trigger already created profiles rows; we just patch
--     values that differ from defaults.
-- ───────────────────────────────────────────────────────────────

UPDATE public.profiles SET trust_score = 50  WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'; -- admin
UPDATE public.profiles SET trust_score = 55  WHERE id = 'bbbbbbbb-0000-0000-0000-000000000002'; -- driver
UPDATE public.profiles SET trust_score = 78  WHERE id = 'cccccccc-0000-0000-0000-000000000003'; -- citizen1 — near threshold
UPDATE public.profiles SET trust_score = 85  WHERE id = 'dddddddd-0000-0000-0000-000000000004'; -- citizen2 — auto-verify
UPDATE public.profiles SET trust_score = 42  WHERE id = 'eeeeeeee-0000-0000-0000-000000000005'; -- citizen3 — low trust


-- ───────────────────────────────────────────────────────────────
-- 3.  HOTSPOTS  (15 dump sites around central Delhi)
--     All coordinates are real locations in Delhi NCR.
--     Approx centre: Connaught Place (28.6315° N, 77.2167° E)
-- ───────────────────────────────────────────────────────────────

INSERT INTO public.hotspots
  (id, name, lat, lng, report_count, is_chronic, status, last_cleaned_at)
VALUES
  -- ── Chronic / active sites ─────────────────────────────────

  ('h0000001-0000-0000-0000-000000000001',
   'Connaught Place Market — Bin Overflow',
   28.63150, 77.21670,
   8, true, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000002',
   'Paharganj Market Back Alley',
   28.64380, 77.21280,
   10, true, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000003',
   'Lajpat Nagar Main Market Rear',
   28.56810, 77.24340,
   7, true, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000004',
   'Malviya Nagar Veg Market Side',
   28.53800, 77.21200,
   6, true, 'reported', NULL),

  -- ── Active (reported, not yet chronic) ─────────────────────

  ('h0000001-0000-0000-0000-000000000005',
   'Rajiv Chowk Metro Exit B',
   28.63280, 77.21950,
   5, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000006',
   'Karol Bagh Sabzi Mandi',
   28.65080, 77.18920,
   4, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000007',
   'Janpath Road Footpath',
   28.62300, 77.21470,
   3, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000008',
   'Khan Market Parking Bins',
   28.60060, 77.22810,
   2, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000009',
   'Rohini Sector 3 Park Gate',
   28.73250, 77.10400,
   5, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000010',
   'Pitampura TV Tower Road',
   28.70210, 77.13030,
   3, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000011',
   'AIIMS Gate 1 Roadside',
   28.56690, 77.20930,
   4, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000012',
   'Tilak Nagar Station Exit',
   28.64090, 77.10250,
   4, false, 'reported', NULL),

  ('h0000001-0000-0000-0000-000000000013',
   'Saket Court Complex Corner',
   28.52440, 77.21270,
   2, false, 'reported', NULL),

  -- ── Cleaned sites ───────────────────────────────────────────

  ('h0000001-0000-0000-0000-000000000014',
   'INA Market Side Drain',
   28.57800, 77.20940,
   3, false, 'cleaned', now() - interval '2 days'),

  ('h0000001-0000-0000-0000-000000000015',
   'Lodhi Colony Park Gate',
   28.59130, 77.23030,
   2, false, 'cleaned', now() - interval '5 hours');


-- ───────────────────────────────────────────────────────────────
-- 4.  REPORTS  (~25 reports across the hotspots)
--     We INSERT directly (bypassing trigger) to avoid re-triggering
--     the hotspot lookup — hotspot_id is already set above.
--
--     For clean data we use ALTER TABLE … DISABLE TRIGGER, insert,
--     then re-enable.
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.reports DISABLE TRIGGER on_report_insert;

INSERT INTO public.reports
  (id, reporter_id, hotspot_id, lat, lng, description, status, verification_count,
   photo_url, created_at)
VALUES
  -- ── CP Market (h01) ─────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000003',     -- Priya
   'h0000001-0000-0000-0000-000000000001',
   28.63150, 77.21670,
   'Overflowing bins near Palika Bazaar entrance. Very bad smell.',
   'verified', 3,
   NULL, now() - interval '3 days'),

  ('r0000001-0000-0000-0000-000000000002',
   'dddddddd-0000-0000-0000-000000000004',     -- Arjun (high trust)
   'h0000001-0000-0000-0000-000000000001',
   28.63158, 77.21675,
   'Garbage spilling onto footpath blocking pedestrians.',
   'verified', 3,
   NULL, now() - interval '2 days'),

  ('r0000001-0000-0000-0000-000000000003',
   'eeeeeeee-0000-0000-0000-000000000005',     -- Nisha
   'h0000001-0000-0000-0000-000000000001',
   28.63145, 77.21660,
   'Plastic waste and food scraps dumped overnight.',
   'pending_verification', 1,
   NULL, now() - interval '6 hours'),

  -- ── Paharganj (h02) ─────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000004',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000002',
   28.64380, 77.21280,
   'Construction debris dumped in market alley.',
   'verified', 4,
   NULL, now() - interval '4 days'),

  ('r0000001-0000-0000-0000-000000000005',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000002',
   28.64385, 77.21288,
   'Old mattress and broken furniture dumped.',
   'verified', 3,
   NULL, now() - interval '3 days'),

  ('r0000001-0000-0000-0000-000000000006',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000002',
   28.64372, 77.21271,
   'Vegetable waste piling up, no bin nearby.',
   'pending_verification', 2,
   NULL, now() - interval '1 day'),

  -- ── Lajpat Nagar (h03) ──────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000007',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000003',
   28.56810, 77.24340,
   'Chronic dump behind cloth stalls. Residents complaining.',
   'verified', 5,
   NULL, now() - interval '6 days'),

  ('r0000001-0000-0000-0000-000000000008',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000003',
   28.56815, 77.24350,
   'Used packaging material and polythene bags.',
   'verified', 3,
   NULL, now() - interval '4 days'),

  ('r0000001-0000-0000-0000-000000000009',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000003',
   28.56808, 77.24335,
   'Dumped again after last cleanup — needs permanent solution.',
   'pending_verification', 1,
   NULL, now() - interval '12 hours'),

  -- ── Malviya Nagar (h04) ─────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000010',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000004',
   28.53800, 77.21200,
   'Butchers dumping waste near market drain.',
   'verified', 3,
   NULL, now() - interval '2 days'),

  ('r0000001-0000-0000-0000-000000000011',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000004',
   28.53808, 77.21209,
   'Mixed waste — need segregated bins here urgently.',
   'pending_verification', 0,
   NULL, now() - interval '3 hours'),

  -- ── Rajiv Chowk (h05) ───────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000012',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000005',
   28.63280, 77.21950,
   'Litter around metro gates — no bins visible.',
   'verified', 3,
   NULL, now() - interval '1 day'),

  -- ── Karol Bagh (h06) ────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000013',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000006',
   28.65080, 77.18920,
   'Vegetable market waste on the street every morning.',
   'verified', 4,
   NULL, now() - interval '5 days'),

  -- ── Janpath (h07) ───────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000014',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000007',
   28.62300, 77.21470,
   'Plastic bags and bottles on the heritage corridor footpath.',
   'pending_verification', 1,
   NULL, now() - interval '8 hours'),

  -- ── Khan Market (h08) ───────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000015',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000008',
   28.60060, 77.22810,
   'Overflowing parking-area bins on Friday evenings.',
   'verified', 3,
   NULL, now() - interval '2 days'),

  -- ── Rohini (h09) ────────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000016',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000009',
   28.73250, 77.10400,
   'Construction rubble dumped near park boundary wall.',
   'verified', 3,
   NULL, now() - interval '3 days'),

  ('r0000001-0000-0000-0000-000000000017',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000009',
   28.73258, 77.10410,
   'Illegal dumping continues even after signage.',
   'pending_verification', 2,
   NULL, now() - interval '10 hours'),

  -- ── Pitampura (h10) ─────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000018',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000010',
   28.70210, 77.13030,
   'Waste spilling onto cycle track from open garbage van.',
   'pending_verification', 1,
   NULL, now() - interval '4 hours'),

  -- ── AIIMS (h11) ─────────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000019',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000011',
   28.56690, 77.20930,
   'Medical waste improperly disposed near outer gate.',
   'verified', 3,
   NULL, now() - interval '1 day'),

  -- ── Tilak Nagar (h12) ───────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000020',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000012',
   28.64090, 77.10250,
   'Dump near station exit — hazardous for commuters.',
   'verified', 3,
   NULL, now() - interval '2 days'),

  -- ── Saket (h13) ─────────────────────────────────────────────
  ('r0000001-0000-0000-0000-000000000021',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000013',
   28.52440, 77.21270,
   'Old furniture and scrap dumped in corner lot.',
   'pending_verification', 0,
   NULL, now() - interval '2 hours'),

  -- ── INA Market (h14 — CLEANED) ──────────────────────────────
  ('r0000001-0000-0000-0000-000000000022',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000014',
   28.57800, 77.20940,
   'Large pile of market waste near drain.',
   'cleaned', 3,
   NULL, now() - interval '4 days'),

  ('r0000001-0000-0000-0000-000000000023',
   'dddddddd-0000-0000-0000-000000000004',
   'h0000001-0000-0000-0000-000000000014',
   28.57808, 77.20948,
   'Overflow from INA market stalls.',
   'cleaned', 3,
   NULL, now() - interval '4 days'),

  -- ── Lodhi Colony (h15 — CLEANED) ────────────────────────────
  ('r0000001-0000-0000-0000-000000000024',
   'eeeeeeee-0000-0000-0000-000000000005',
   'h0000001-0000-0000-0000-000000000015',
   28.59130, 77.23030,
   'Park gate has been a regular dumping spot for weeks.',
   'cleaned', 3,
   NULL, now() - interval '1 day'),

  ('r0000001-0000-0000-0000-000000000025',
   'cccccccc-0000-0000-0000-000000000003',
   'h0000001-0000-0000-0000-000000000015',
   28.59138, 77.23040,
   'Waste still present in the morning, needs daily sweep.',
   'cleaned', 3,
   NULL, now() - interval '1 day');

-- Re-enable the trigger
ALTER TABLE public.reports ENABLE TRIGGER on_report_insert;


-- ───────────────────────────────────────────────────────────────
-- 5.  SAMPLE VERIFICATIONS  (to populate verification_count)
--     Inserted manually — trigger on report_verifications would
--     try to modify already-seeded counts, so we skip it here.
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.report_verifications DISABLE TRIGGER on_verification_insert;

INSERT INTO public.report_verifications (report_id, user_id) VALUES
  -- r01 verified by driver + admin
  ('r0000001-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002'),
  ('r0000001-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001'),
  ('r0000001-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000005'),
  -- r03 (pending) — 1 verification from citizen2
  ('r0000001-0000-0000-0000-000000000003','dddddddd-0000-0000-0000-000000000004'),
  -- r06 — 2 verifications
  ('r0000001-0000-0000-0000-000000000006','cccccccc-0000-0000-0000-000000000003'),
  ('r0000001-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000002'),
  -- r09 — 1 verification
  ('r0000001-0000-0000-0000-000000000009','cccccccc-0000-0000-0000-000000000003'),
  -- r14 — 1 verification
  ('r0000001-0000-0000-0000-000000000014','dddddddd-0000-0000-0000-000000000004'),
  -- r17 — 2 verifications
  ('r0000001-0000-0000-0000-000000000017','cccccccc-0000-0000-0000-000000000003'),
  ('r0000001-0000-0000-0000-000000000017','aaaaaaaa-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

ALTER TABLE public.report_verifications ENABLE TRIGGER on_verification_insert;


-- ───────────────────────────────────────────────────────────────
-- 6.  TRUCK LOCATION  (Suresh Yadav en route in central Delhi)
-- ───────────────────────────────────────────────────────────────

INSERT INTO public.truck_locations (driver_id, lat, lng, updated_at)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  28.63500, 77.22100,
  now()
)
ON CONFLICT (driver_id) DO UPDATE
  SET lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      updated_at = now();


-- ───────────────────────────────────────────────────────────────
-- 7.  QUICK SANITY CHECK  (optional — run after seeding)
-- ───────────────────────────────────────────────────────────────

SELECT
  'profiles'             AS tbl, COUNT(*) AS rows FROM public.profiles
UNION ALL SELECT
  'hotspots',                    COUNT(*) FROM public.hotspots
UNION ALL SELECT
  'reports',                     COUNT(*) FROM public.reports
UNION ALL SELECT
  'report_verifications',        COUNT(*) FROM public.report_verifications
UNION ALL SELECT
  'truck_locations',             COUNT(*) FROM public.truck_locations;

-- Expected output:
-- profiles             | 5
-- hotspots             | 15
-- reports              | 25
-- report_verifications | 10
-- truck_locations      | 1

-- ✅  Seed complete.
