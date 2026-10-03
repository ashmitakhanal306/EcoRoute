/**
 * shared/supabaseClient.js
 *
 * Singleton Supabase client — imported by every page so the
 * auth session is shared across all modules on the same page.
 *
 * Exports
 * ───────
 *   supabase       – the Supabase JS client instance
 *   isConfigured   – true when real credentials are present
 *   checkBackend() – resolves to { ok, error, code } after a quick DB ping
 */

import { createClient }
  from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

// ── Detect placeholder / unconfigured credentials ───────────────
const _placeholders = ['YOUR_PROJECT_ID', 'YOUR_ANON_KEY', 'your-project'];
export const isConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !_placeholders.some(p => SUPABASE_URL.includes(p) || SUPABASE_ANON_KEY.includes(p));

if (!isConfigured) {
  console.error(
    '[EcoRoute] Supabase credentials not set.\n' +
    '  Edit config.js -> replace SUPABASE_URL and SUPABASE_ANON_KEY\n' +
    '  with real values from https://app.supabase.com -> Settings -> API'
  );
}

// ── Create and export the singleton client ──────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { 'x-app-name': 'cleangreen-sih2026' },
  },
});

/**
 * checkBackend()
 * Quick health-check — pings the profiles table (limit 1).
 * Returns { ok: true } or { ok: false, error: string, code: string }.
 *
 * Codes: not_configured | schema_missing | auth_error |
 *        permission | paused | network | unknown
 */
export async function checkBackend() {
  if (!isConfigured) {
    return {
      ok: false,
      error: 'Supabase credentials are not configured.',
      code: 'not_configured'
    };
  }
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (!error) return { ok: true };

    const msg    = error.message ?? '';
    const status = String(error.status ?? error.code ?? '');

    if (status === '401' || msg.includes('apikey') || msg.includes('invalid API key'))
      return { ok: false, error: 'Invalid API key. Re-check the anon key in config.js.', code: 'auth_error' };

    if (msg.includes('relation') || msg.includes('does not exist'))
      return { ok: false, error: 'Database schema missing. Run sql/schema.sql in the Supabase SQL Editor.', code: 'schema_missing' };

    if (status === '403' || msg.includes('permission denied'))
      return { ok: false, error: 'Permission denied. Check Row-Level Security policies.', code: 'permission' };

    if (msg.includes('paused') || msg.includes('Project paused'))
      return { ok: false, error: 'Supabase project is paused. Restore it in the dashboard.', code: 'paused' };

    return { ok: false, error: msg || 'Unknown backend error.', code: 'unknown' };
  } catch (e) {
    return { ok: false, error: 'Network error. Check your internet connection.', code: 'network' };
  }
}