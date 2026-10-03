# SETUP.md — CleanGreen · SIH 2026
## How to deploy the database and storage

---

## Prerequisites

- A free [Supabase](https://supabase.com) account
- A new project created (any region; **Mumbai** recommended for India)
- Your project's **URL** and **anon key** (Settings → API)

---

## Step 1 — Fill in `config.js`

Open [`config.js`](./config.js) and replace the two placeholder values:

```js
export const SUPABASE_URL      = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

> **Never commit real keys to a public repository.**  
> Add `config.js` to `.gitignore` for safety.

---

## Step 2 — Run `schema.sql`

1. Go to your Supabase project dashboard.
2. Click **SQL Editor** in the left sidebar → **New Query**.
3. Paste the full contents of [`sql/schema.sql`](./sql/schema.sql).
4. Click **Run** (▶).

**What this creates:**

| Object | Description |
|--------|-------------|
| `profiles` table | One row per user; `role` + `trust_score` |
| `hotspots` table | Geographic dump sites aggregated from reports |
| `reports` table | Individual citizen photo-reports |
| `report_verifications` table | Upvote/verify log (one per user per report) |
| `truck_locations` table | Real-time GPS position of each driver |
| `get_my_role()` function | RLS helper — avoids policy recursion |
| `haversine_m()` function | Distance in metres between two lat/lng points |
| `handle_new_user` trigger | Auto-creates `profiles` row on every signup |
| `handle_new_report` trigger | Finds/creates hotspot on every new report |
| `handle_new_verification` trigger | Increments count, auto-verifies at ≥3, awards trust |
| `mark_hotspot_cleaned()` RPC | Driver/admin callable; awards reporters +10 trust |
| RLS policies | Per-role read/write rules on every table |
| Realtime publication | `hotspots`, `reports`, `truck_locations` go live |
| Indexes | Performance indexes on coords, status, foreign keys |

✅ You should see **"Success. No rows returned."** at the bottom of the SQL editor.

---

## Step 3 — Run `seed.sql`

> ⚠️ **Only after `schema.sql` succeeds.**  
> The seed inserts directly into `auth.users` — this works in the SQL editor  
> (postgres role) but not via the anon key.

1. Open a **new query** in the SQL Editor.
2. Paste [`sql/seed.sql`](./sql/seed.sql).
3. Click **Run**.

**Seeded data:**

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| admin   | admin@cleangreen.in      | `demo1234` |
| driver  | driver@cleangreen.in     | `demo1234` |
| citizen | citizen1@cleangreen.in   | `demo1234` |
| citizen | citizen2@cleangreen.in   | `demo1234` |
| citizen | citizen3@cleangreen.in   | `demo1234` |

- **15 hotspots** around central Delhi (Connaught Place + suburbs)
- **25 reports** distributed across all hotspots
- **10 verifications**
- **1 truck location** (driver en route, central Delhi)

At the end of the run you will see a table confirming row counts:

```
tbl                    | rows
-----------------------+------
profiles               |    5
hotspots               |    15
reports                |    25
report_verifications   |    10
truck_locations        |    1
```

---

## Step 4 — Create the Storage Bucket

Citizen reports upload photos to a Supabase Storage bucket named **`report-photos`**.

### Option A — Dashboard (recommended)
1. In your Supabase dashboard, click **Storage** → **New bucket**.
2. **Name:** `report-photos`
3. Check ✅ **Public bucket** (allows anyone to read photo URLs).
4. Click **Save**.

### Option B — SQL Editor

```sql
-- Creates a public bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;
```

Then add a storage policy so authenticated users can upload:

```sql
-- Allow authenticated users to upload to report-photos
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-photos');

-- Allow anyone to read photos (public bucket)
CREATE POLICY "Public read access for photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'report-photos');
```

---

## Step 5 — Enable Realtime (verify)

Supabase Realtime should be auto-enabled by `schema.sql`.  
To verify manually:

1. Dashboard → **Database** → **Replication**.
2. Under **Supabase Realtime**, confirm these tables are listed:
   - ✅ `hotspots`
   - ✅ `reports`
   - ✅ `truck_locations`

If any are missing, add them via the toggle or run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.hotspots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.truck_locations;
```

---

## Step 6 — Test Auth in Browser

Open [`index.html`](./index.html) directly from the filesystem  
(`file:///...`) **or** serve it locally:

```powershell
# From project root — Python (quick)
python -m http.server 5500

# Or Node (if installed)
npx serve .
```

Then visit `http://localhost:5500` and log in with any demo credential.

> **Note:** ES modules (`type="module"`) require a server — `file://` does  
> not work for cross-file imports. Use the local server above.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ERROR: relation "profiles" already exists` | Schema was already run — safe to ignore or `DROP TABLE … CASCADE` first |
| `ERROR: trigger "on_auth_user_created" already exists` | Schema re-run — `DROP TRIGGER … ON auth.users` first, then re-run |
| Seed fails with permission error on `auth.users` | Run in SQL Editor (not via anon key) |
| Photos 403 error | Check bucket is **public** and upload policy exists |
| Realtime not updating | Verify `supabase_realtime` publication includes the table |
| Login redirects to wrong dashboard | Check `raw_user_meta_data.role` in `auth.users` — trigger reads it |

---

## Quick Reference — Key Supabase JS calls

```js
// Auth login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Get current user's role (from profiles)
const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single();

// Subscribe to hotspot changes (Realtime)
supabase.channel('hotspots')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'hotspots' },
      payload => console.log(payload))
  .subscribe();

// Call RPC to mark cleaned
const { data } = await supabase.rpc('mark_hotspot_cleaned', { p_hotspot_id: id });

// Upload a report photo
const { data: upload } = await supabase.storage
  .from('report-photos')
  .upload(`${userId}/${Date.now()}.jpg`, file);
```

---

*Built for Smart India Hackathon 2026 · Clean & Green Technology*
