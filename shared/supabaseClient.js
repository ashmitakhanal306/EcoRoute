/**
 * shared/supabaseClient.js
 *
 * Singleton Supabase client.  Every page imports from here so the
 * session/auth state is shared across all modules on the same page.
 *
 * Usage:
 *   import { supabase } from '../shared/supabaseClient.js';
 */

import { createClient }
  from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

// ── Guard against un-configured credentials ────────────────────
if (
  SUPABASE_URL.includes('YOUR_PROJECT_ID') ||
  SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY')
) {
  console.error(
    '[CleanGreen] ❌  Supabase credentials not set.\n' +
    '  Open config.js and replace the placeholder values with your\n' +
    '  Project URL and anon key from https://app.supabase.com → Settings → API'
  );
}

// ── Create and export the single client instance ───────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,   // stores session in localStorage
    autoRefreshToken:   true,   // silently refreshes JWT before expiry
    detectSessionInUrl: true,   // handles OAuth / magic-link callbacks
  },
  global: {
    headers: {
      'x-app-name': 'cleangreen-sih2026',  // shows up in Supabase logs
    },
  },
});
