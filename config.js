/**
 * config.js — Supabase project configuration
 * SIH 2026 · CleanGreen
 *
 * HOW TO USE:
 *   1. Go to https://app.supabase.com → your project → Settings → API
 *   2. Copy "Project URL" into SUPABASE_URL
 *   3. Copy "anon / public" key into SUPABASE_ANON_KEY
 *   4. Never commit real keys to public repos — add config.js to .gitignore
 *
 * SECURITY NOTE:
 *   The anon key is safe to expose in client JS because Supabase Row-Level
 *   Security (RLS) enforces all data access rules server-side.
 */

export const SUPABASE_URL     = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
