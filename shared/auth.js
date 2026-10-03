/**
 * shared/auth.js
 *
 * Authentication & RBAC helpers used by every page.
 *
 * Exported API:
 *   login(email, password)   → { profile } | throws Error
 *   logout()                 → void
 *   getCurrentProfile()      → profiles row (role, trust_score, …) | null
 *   requireRole(allowedRole) → profile (redirects if wrong/missing role)
 *   redirectByRole(role)     → void (navigates to the role's dashboard)
 */

import { supabase } from './supabaseClient.js';
import { goTo, url } from './paths.js';

/* ── Role → URL mapping ─────────────────────────────────────────
   Paths are relative to the app BASE computed at runtime by paths.js.
   This works on localhost, GitHub Pages subdirectories, and any host.
   ─────────────────────────────────────────────────────────────── */
const ROLE_PATHS = {
  citizen : 'citizen/',
  driver  : 'driver/',
  admin   : 'admin/',
};

const LOGIN_PATH = 'index.html';


/* ── Demo Account Mock Support (when Supabase credentials are placeholder) ── */
const DEMO_ACCOUNTS = {
  'citizen1@cleangreen.in': {
    id: 'cccccccc-0000-0000-0000-000000000003',
    full_name: 'Priya Sharma',
    role: 'citizen',
    trust_score: 78,
    created_at: new Date().toISOString()
  },
  'citizen2@cleangreen.in': {
    id: 'dddddddd-0000-0000-0000-000000000004',
    full_name: 'Arjun Singh',
    role: 'citizen',
    trust_score: 85,
    created_at: new Date().toISOString()
  },
  'citizen3@cleangreen.in': {
    id: 'eeeeeeee-0000-0000-0000-000000000005',
    full_name: 'Nisha Gupta',
    role: 'citizen',
    trust_score: 42,
    created_at: new Date().toISOString()
  },
  'citizen_trust50@cleangreen.in': {
    id: 'cccccccc-0000-0000-0000-000000000050',
    full_name: 'Citizen A (Trust 50)',
    role: 'citizen',
    trust_score: 50,
    created_at: new Date().toISOString()
  },
  'citizen_trust80@cleangreen.in': {
    id: 'cccccccc-0000-0000-0000-000000000080',
    full_name: 'Citizen High Trust (85)',
    role: 'citizen',
    trust_score: 85,
    created_at: new Date().toISOString()
  },
  'driver@cleangreen.in': {
    id: 'bbbbbbbb-0000-0000-0000-000000000002',
    full_name: 'Suresh Yadav',
    role: 'driver',
    trust_score: 100,
    created_at: new Date().toISOString()
  },
  'admin@cleangreen.in': {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    full_name: 'Raj Kumar',
    role: 'admin',
    trust_score: 100,
    created_at: new Date().toISOString()
  }
};

/* ────────────────────────────────────────────────────────────────
   login(email, password)
   Signs in via Supabase Auth, then immediately fetches the user's
   profiles row so the caller has the role available right away.

   Returns: { session, profile }
   Throws:  Error with a human-readable message on failure
   ──────────────────────────────────────────────────────────────── */
export async function login(email, password) {
  const normEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normEmail,
      password,
    });

    if (error) throw error;

    const profile = await getCurrentProfile();
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('Your account exists but has no profile.');
    }

    return { session: data.session, profile };
  } catch (err) {
    // If Supabase is unconfigured / network fails, check demo accounts
    if (DEMO_ACCOUNTS[normEmail] && password === 'demo1234') {
      const demoProfile = DEMO_ACCOUNTS[normEmail];
      const mockSession = {
        user: { id: demoProfile.id, email: normEmail },
        access_token: 'demo-token-' + Date.now()
      };
      localStorage.setItem('ecoroute_demo_session', JSON.stringify({ session: mockSession, profile: demoProfile }));
      return { session: mockSession, profile: demoProfile };
    }

    const msg = friendlyAuthError(err);
    throw new Error(msg);
  }
}


/* ────────────────────────────────────────────────────────────────
   logout()
   Signs out from Supabase (clears localStorage session) and
   redirects to the login page.
   ──────────────────────────────────────────────────────────────── */
export async function logout() {
  localStorage.removeItem('ecoroute_demo_session');
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }
  goTo(LOGIN_PATH);
}


/* ────────────────────────────────────────────────────────────────
   getCurrentProfile()
   Returns the profiles row for the currently signed-in user,
   including: id, full_name, role, trust_score, created_at.
   Returns null if there is no active session.
   ──────────────────────────────────────────────────────────────── */
export async function getCurrentProfile() {
  // Check demo session first (if local mock)
  try {
    const rawDemo = localStorage.getItem('ecoroute_demo_session');
    if (rawDemo) {
      const parsed = JSON.parse(rawDemo);
      if (parsed && parsed.profile) return parsed.profile;
    }
  } catch (e) {
    // ignore
  }

  // 1. Get the active session from Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // 2. Fetch the profiles row for this user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, trust_score, created_at')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.warn('[auth] getCurrentProfile error:', error.message);
      return null;
    }

    return profile;
  } catch (err) {
    return null;
  }
}


/* ────────────────────────────────────────────────────────────────
   requireRole(allowedRole)
   Call at the top of every dashboard page (inside <script type="module">).

   Behaviour:
   ┌──────────────────────────────────────────────────────────────┐
   │ No active session         → redirect to LOGIN_PAGE           │
   │ Session exists, wrong role→ redirect to user's own dashboard │
   │ Session + correct role    → return profile (page continues)  │
   └──────────────────────────────────────────────────────────────┘

   Usage:
     const profile = await requireRole('citizen');
     // if this line runs, the user IS a citizen
   ──────────────────────────────────────────────────────────────── */
export async function requireRole(allowedRole) {
  // If ?demo=... is in URL query parameters, auto-initialize demo session for that role
  try {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo');
    if (demoParam === '1' || demoParam === 'true' || demoParam === allowedRole) {
      const trustParam = params.get('trust');
      let demoProfile = null;
      if (allowedRole === 'citizen') {
        const trustVal = trustParam !== null ? parseInt(trustParam, 10) : 50;
        demoProfile = {
          id: trustVal >= 80 ? 'cccccccc-0000-0000-0000-000000000080' : 'cccccccc-0000-0000-0000-000000000050',
          full_name: trustVal >= 80 ? 'Citizen High Trust (85)' : 'Citizen A (Trust 50)',
          role: 'citizen',
          trust_score: trustVal,
          created_at: new Date().toISOString()
        };
      } else if (allowedRole === 'driver') {
        demoProfile = {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          full_name: 'Suresh Yadav',
          role: 'driver',
          trust_score: 100,
          created_at: new Date().toISOString()
        };
      } else if (allowedRole === 'admin') {
        demoProfile = {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          full_name: 'Raj Kumar',
          role: 'admin',
          trust_score: 100,
          created_at: new Date().toISOString()
        };
      }
      if (demoProfile) {
        localStorage.setItem('ecoroute_demo_session', JSON.stringify({
          session: { user: { id: demoProfile.id, email: `${allowedRole}@cleangreen.in` } },
          profile: demoProfile
        }));
        return demoProfile;
      }
    }
  } catch (e) {
    // ignore
  }

  // Retrieve profile (checks both demo sessions and Supabase Auth session)
  const profile = await getCurrentProfile();

  if (!profile) {
    // Not logged in at all → go to login
    goTo(LOGIN_PATH);
    return null;
  }

  if (profile.role !== allowedRole) {
    // Logged in as a different role → send them to their own dashboard
    console.info(
      `[auth] Role mismatch: expected "${allowedRole}", got "${profile.role}". Redirecting.`
    );
    redirectByRole(profile.role);
    return null;
  }

  // ✅ Correct role — return profile so the page can use it
  return profile;
}


/* ────────────────────────────────────────────────────────────────
   redirectByRole(role)
   Navigate to the correct dashboard for a given role.
   Uses location.replace so the login page is not in history.
   ──────────────────────────────────────────────────────────────── */
export function redirectByRole(role) {
  const path = ROLE_PATHS[role] ?? LOGIN_PATH;
  goTo(path);
}


/* ────────────────────────────────────────────────────────────────
   INTERNAL — friendlyAuthError(error)
   Maps Supabase GoTrue error codes/messages to UX-friendly strings.
   ──────────────────────────────────────────────────────────────── */
function friendlyAuthError(error) {
  const msg = (error.message ?? '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }
  if (msg.includes('too many requests') || error.status === 429) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Check your internet connection.';
  }
  // Fallback — show the raw message in development
  return error.message ?? 'An unexpected error occurred. Please try again.';
}
