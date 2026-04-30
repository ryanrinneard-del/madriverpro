/* ============================================================
   RR GOLF PERFORMANCE — Adult Coaching Portal
   app.js — Supabase-backed auth, data, UI helpers.

   Each page must load, in order:
     1. https://unpkg.com/@supabase/supabase-js@2  (Supabase CDN)
     2. assets/supabase-config.js                  (your keys)
     3. assets/data.js                             (curriculum)
     4. assets/app.js                              (this file)
   ============================================================ */

window.RRG = window.RRG || {};

/* ---------- Cohort this portal represents ---------- */
RRG.COHORT = 'adult_coaching_2026';

/* ---------- helpers ---------- */
RRG.$ = (sel, ctx = document) => ctx.querySelector(sel);
RRG.$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
RRG.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
RRG.qs = (k) => new URLSearchParams(location.search).get(k);

RRG.toast = (msg, ms = 2800) => {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
};

RRG.fmtDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' }); }
  catch { return iso; }
};

RRG.fmtBytes = (n) => {
  if (!n) return '—'; const u = ['B','KB','MB','GB']; let i = 0; n = +n;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(i === 0 ? 0 : 1) + ' ' + u[i];
};

/* ============================================================
   Supabase client (async init guard — every other method awaits it)
   ============================================================ */
RRG._sbReady = (async () => {
  if (!window.supabase) {
    console.error('Supabase JS not loaded. Check the CDN <script> tag.');
    return;
  }
  if (!window.SUPABASE_CONFIG || /REPLACE_ME/.test(window.SUPABASE_CONFIG.url || '')) {
    console.error('SUPABASE_CONFIG not set. Edit assets/supabase-config.js.');
    return;
  }
  RRG.sb = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
})();

/* ============================================================
   AUTH — email magic link
   ============================================================ */
RRG.auth = {
  _profileCache: null,

  async currentSession() {
    await RRG._sbReady;
    if (!RRG.sb) return null;
    const { data: { session } } = await RRG.sb.auth.getSession();
    return session || null;
  },

  async currentUser() {
    if (RRG.auth._profileCache) return RRG.auth._profileCache;
    const sess = await this.currentSession();
    if (!sess) return null;
    const { data, error } = await RRG.sb
      .from('profiles').select('*').eq('id', sess.user.id).maybeSingle();
    if (error) { console.warn('profile fetch', error); return null; }
    RRG.auth._profileCache = data || null;
    return RRG.auth._profileCache;
  },

  async isLoggedIn() { return !!(await this.currentSession()); },

  _callbackUrl() {
    // e.g. https://rrgolfperformance.com/adult/auth-callback.html
    const pathname = window.location.pathname.replace(/[^/]*$/, '') + 'auth-callback.html';
    return window.location.origin + pathname;
  },

  // Login (user already has an account): send a magic link only if the user exists.
  async sendLoginLink(email) {
    await RRG._sbReady;
    const { error } = await RRG.sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: this._callbackUrl(), shouldCreateUser: false }
    });
    if (error) throw error;
  },

  // Signup: validate the invite first, then send a magic link that creates the user.
  // The invite code + profile data are stashed in user_metadata so the callback
  // can call claim_invite() after the session is established — no matter which
  // device they click the link on.
  async signup({ email, name, inviteCode, packageId, handicap, homeClub }) {
    await RRG._sbReady;

    // 1. Pre-check the invite
    const { data: check, error: cErr } = await RRG.sb.rpc('check_invite', { p_code: inviteCode });
    if (cErr) throw cErr;
    if (!check || check.length === 0) {
      throw new Error('That invite code is not valid or has already been used.');
    }
    if (check[0].cohort !== RRG.COHORT) {
      throw new Error('That invite code is for a different program. Use the correct signup page.');
    }

    // 2. Send the magic link with pending signup data
    const { error: oErr } = await RRG.sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: this._callbackUrl(),
        shouldCreateUser: true,
        data: {
          pending_invite_code: inviteCode,
          pending_name: name,
          pending_handicap: handicap || '',
          pending_home_club: homeClub || '',
          pending_package_id: packageId || null,
          pending_cohort: RRG.COHORT,
        },
      },
    });
    if (oErr) throw oErr;
  },

  async logout() {
    await RRG._sbReady;
    RRG.auth._profileCache = null;
    if (RRG.sb) await RRG.sb.auth.signOut();
    location.href = 'index.html';
  },

  // Wait for auth to resolve, redirect to login if none.
  // Also routes the user to the correct portal for their cohort —
  // coaches can view either portal; players are locked to their own.
  async requireAuth() {
    const user = await this.currentUser();
    if (!user) { location.replace('index.html'); return null; }
    if (user.role !== 'coach' && user.cohort && user.cohort !== RRG.COHORT) {
      const target = user.cohort === 'junior_elite_2026' ? '/portal/'
                   : user.cohort === 'adult_coaching_2026' ? '/adult/'
                   : null;
      if (target && !location.pathname.startsWith(target)) {
        location.replace(target + 'dashboard.html');
        return null;
      }
    }
    return user;
  },

  // Called from auth-callback.html after the magic link completes.
  // If the user hasn't yet claimed their invite (first login), does it now.
  async completeSignupIfNeeded() {
    await RRG._sbReady;
    const { data: { user: authUser } } = await RRG.sb.auth.getUser();
    if (!authUser) return null;

    // Already has a profile? We're done.
    const { data: existing } = await RRG.sb
      .from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (existing) { RRG.auth._profileCache = existing; return existing; }

    // Otherwise consume the invite from user metadata.
    const meta = authUser.user_metadata || {};
    if (!meta.pending_invite_code) {
      // Logged in but no profile and no invite metadata — shouldn't happen for
      // real clients, but could happen for coach bootstrapping. Return null
      // so the caller can route to a setup page.
      return null;
    }
    const { data: profile, error } = await RRG.sb.rpc('claim_invite', {
      p_code: meta.pending_invite_code,
      p_name: meta.pending_name || authUser.email,
      p_handicap: meta.pending_handicap || null,
      p_home_club: meta.pending_home_club || null,
      p_package_id: meta.pending_package_id || null,
    });
    if (error) throw error;

    /* VIP pre-fill: if Ryan created this invite with a pending_profile
       payload (via "+ Create VIP Invite" on Coach View), merge it into the
       new player's profile_json. This is how wedge-matrix / skill tier /
       handicap / goals carry from pre-signup to their first login. */
    try {
      const { data: inviteRow } = await RRG.sb
        .from('invites')
        .select('pending_profile')
        .eq('code', meta.pending_invite_code)
        .maybeSingle();
      if (inviteRow && inviteRow.pending_profile && profile) {
        const mergedJson = {
          ...(profile.profile_json || {}),
          ...inviteRow.pending_profile,
        };
        console.log('[VIP] Merging pending_profile keys:', Object.keys(inviteRow.pending_profile));
        const { data: updated, error: updateErr } = await RRG.sb
          .from('profiles')
          .update({ profile_json: mergedJson })
          .eq('id', profile.id)
          .select()
          .maybeSingle();
        if (updateErr) {
          console.warn('[VIP] profile update error:', updateErr);
        }
        if (updated) {
          console.log('[VIP] pending_profile merge OK → profile_json keys:', Object.keys(updated.profile_json || {}));
          RRG.auth._profileCache = updated;
          return updated;
        }
        profile.profile_json = mergedJson;
      } else {
        console.log('[VIP] No pending_profile for code', meta.pending_invite_code, '(regular signup)');
      }
    } catch (err) {
      console.warn('[VIP] pending_profile merge failed', err);
    }

    RRG.auth._profileCache = profile;
    return profile;
  },
};

/* ============================================================
   USERS / PROFILES
   ============================================================ */
RRG.users = {
  async all() {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('profiles')
      .select('*')
      .eq('cohort', RRG.COHORT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Coach-only: returns ALL profiles across all cohorts (adult + junior).
  // RLS already restricts non-coach callers to their own row.
  async allCohorts() {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async get(userId) {
    const { data, error } = await RRG.sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(userId, patch) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('profiles')
      .update(patch).eq('id', userId).select().maybeSingle();
    if (error) throw error;
    RRG.auth._profileCache = null; // force refresh on next currentUser()
    return data;
  },
};

/* ============================================================
   APPROACH ANALYSIS — "Where you're losing strokes by distance"
   Shared utility used by player dashboards + coach view + the
   coach-plan-builder skill dossier.

   Reads from rounds.approach_data which is a per-round per-bucket
   { attempts, gir } rollup populated at scorecard-submit time.
   ============================================================ */
RRG.approach = {
  BUCKETS: ['50-75','75-100','100-125','125-150','150-175','175-200','200-225','225+'],

  // Pretty labels for chart axes.
  LABELS: {
    '50-75': '50–75y', '75-100': '75–100y', '100-125': '100–125y', '125-150': '125–150y',
    '150-175': '150–175y', '175-200': '175–200y', '200-225': '200–225y', '225+': '225+y',
  },

  // Approximate PGA Tour GIR% by approach distance bucket. Used as the
  // faded "where the pros are" overlay on the spider chart. Sourced from
  // published SG-Approach distributions; numbers are rounded for legibility.
  TOUR_GIR_PCT: {
    '50-75': 95, '75-100': 91, '100-125': 86, '125-150': 78,
    '150-175': 70, '175-200': 62, '200-225': 54, '225+': 45,
  },

  // Aggregate approach_data across multiple rounds.
  // Input: array of round objects (each with .approach_data per the schema).
  // Output: { bucket: { attempts, gir, pct } } where pct is null if attempts==0.
  aggregate(rounds) {
    const out = {};
    this.BUCKETS.forEach(b => { out[b] = { attempts: 0, gir: 0, pct: null }; });
    (rounds || []).forEach(r => {
      const ad = r && r.approach_data;
      if (!ad) return;
      this.BUCKETS.forEach(b => {
        const e = ad[b];
        if (!e) return;
        out[b].attempts += (Number(e.attempts) || 0);
        out[b].gir      += (Number(e.gir)      || 0);
      });
    });
    this.BUCKETS.forEach(b => {
      out[b].pct = out[b].attempts > 0
        ? Math.round(100 * out[b].gir / out[b].attempts)
        : null;
    });
    return out;
  },

  // Identify the biggest leak — the bucket where the player is furthest
  // below the tour benchmark. Filters buckets with too few attempts to be
  // meaningful (default minAttempts=4).
  biggestLeak(agg, { minAttempts = 4 } = {}) {
    let worst = null;
    let worstDeficit = -Infinity;
    this.BUCKETS.forEach(b => {
      const a = agg[b];
      if (!a || a.attempts < minAttempts || a.pct == null) return;
      const tour = this.TOUR_GIR_PCT[b];
      const deficit = tour - a.pct;
      if (deficit > worstDeficit) {
        worstDeficit = deficit;
        worst = {
          bucket: b, label: this.LABELS[b],
          playerPct: a.pct, tourPct: tour,
          deficit, attempts: a.attempts,
        };
      }
    });
    return worst;
  },

  // Identify the strongest bucket — biggest positive delta vs tour.
  // Used to surface "where they're already gaining strokes."
  biggestStrength(agg, { minAttempts = 4 } = {}) {
    let best = null;
    let bestSurplus = -Infinity;
    this.BUCKETS.forEach(b => {
      const a = agg[b];
      if (!a || a.attempts < minAttempts || a.pct == null) return;
      const tour = this.TOUR_GIR_PCT[b];
      const surplus = a.pct - tour;
      if (surplus > bestSurplus) {
        bestSurplus = surplus;
        best = {
          bucket: b, label: this.LABELS[b],
          playerPct: a.pct, tourPct: tour,
          surplus, attempts: a.attempts,
        };
      }
    });
    return best;
  },

  // Render a radar (spider) chart into a <canvas> element.
  // Requires Chart.js v4 to be loaded on the page (CDN script).
  // options:
  //   thisRoundAgg   — per-bucket aggregate for the latest single round (gold solid)
  //   seasonAgg      — per-bucket aggregate across the whole season (navy dashed)
  //   showTour       — overlay the tour benchmark (default true, faded grey dotted)
  //   title          — optional chart title
  // Returns the Chart instance so the caller can destroy() it on re-render.
  renderSpider(canvasEl, opts = {}) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded — spider chart skipped');
      return null;
    }
    const labels = this.BUCKETS.map(b => this.LABELS[b]);
    const datasets = [];

    if (opts.thisRoundAgg) {
      datasets.push({
        label: 'This Round',
        data: this.BUCKETS.map(b => opts.thisRoundAgg[b]?.pct ?? null),
        backgroundColor: 'rgba(201, 168, 76, 0.18)',     // gold tint
        borderColor:     'rgba(201, 168, 76, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(201, 168, 76, 1)',
        pointRadius: 4,
        spanGaps: false,
      });
    }
    if (opts.seasonAgg) {
      datasets.push({
        label: 'Your Season Average',
        data: this.BUCKETS.map(b => opts.seasonAgg[b]?.pct ?? null),
        backgroundColor: 'rgba(13, 27, 42, 0.05)',
        borderColor:     'rgba(13, 27, 42, 0.55)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointBackgroundColor: 'rgba(13, 27, 42, 0.7)',
        pointRadius: 3,
        spanGaps: false,
      });
    }
    if (opts.showTour !== false) {
      datasets.push({
        label: 'PGA Tour Average',
        data: this.BUCKETS.map(b => this.TOUR_GIR_PCT[b]),
        backgroundColor: 'rgba(150, 150, 150, 0.04)',
        borderColor:     'rgba(150, 150, 150, 0.5)',
        borderWidth: 1,
        borderDash: [2, 4],
        pointBackgroundColor: 'rgba(150, 150, 150, 0.6)',
        pointRadius: 2,
        spanGaps: false,
      });
    }

    return new Chart(canvasEl, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { stepSize: 25, color: '#94a3b8', backdropColor: 'transparent' },
            grid:  { color: 'rgba(13,27,42,0.08)' },
            angleLines: { color: 'rgba(13,27,42,0.08)' },
            pointLabels: { color: '#0D1B2A', font: { size: 11, weight: '600' } },
          },
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw == null ? '—' : ctx.raw + '% GIR'}`,
            },
          },
          title: opts.title ? { display: true, text: opts.title, color: '#0D1B2A' } : { display: false },
        },
      },
    });
  },
};

/* ============================================================
   PUBLIC SUBMISSIONS — Know Your Game form fills that haven't
   yet been signed up via invite code. Coach-only (RLS).
   ============================================================ */
RRG.submissions = {
  async pending() {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('public_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async remove(id) {
    await RRG._sbReady;
    const { error } = await RRG.sb.from('public_submissions').delete().eq('id', id);
    if (error) throw error;
  },
};

/* ============================================================
   LESSON UPDATES — notes a coach writes after a lesson, stored
   inside profile_json.lesson_updates. Each update captures: date,
   the week the player was in, a root-cause tag, what was worked on,
   and the focus for this week. Shows on the player's My Plan as a
   banner. Coach can optionally trigger an AI regen of the remaining
   weeks based on the note (Phase 3).
   ============================================================ */
RRG.lessonUpdates = {
  _uid() {
    return 'lu_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  },

  async list(userId) {
    const prof = await RRG.users.get(userId);
    const arr = prof?.profile_json?.lesson_updates;
    return Array.isArray(arr) ? arr : [];
  },

  /* Returns the single most recent update within `withinDays` (default 14),
     or null if none. */
  async latest(userId, withinDays = 14) {
    const arr = await this.list(userId);
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const mostRecent = sorted[0];
    if (!withinDays) return mostRecent;
    const ms = withinDays * 24 * 60 * 60 * 1000;
    const d = new Date(mostRecent.date || mostRecent.created_at);
    if (isNaN(d.getTime())) return null;
    return (Date.now() - d.getTime() <= ms) ? mostRecent : null;
  },

  /* Append a lesson update to the player's profile_json.lesson_updates.
     Returns the full stored update (with id + created_at populated). */
  async add(userId, update) {
    const prof = await RRG.users.get(userId);
    const pj = prof?.profile_json || {};
    const arr = Array.isArray(pj.lesson_updates) ? [...pj.lesson_updates] : [];
    const stored = {
      id: this._uid(),
      date: update.date || new Date().toISOString().slice(0, 10),
      week_at_update: update.week_at_update || null,
      root_cause: update.root_cause || 'other',
      what_we_worked_on: (update.what_we_worked_on || '').trim(),
      focus_this_week: (update.focus_this_week || '').trim(),
      regenerated: !!update.regenerated,
      created_at: new Date().toISOString(),
      created_by: update.created_by || null,
    };
    arr.push(stored);
    const newPJ = { ...pj, lesson_updates: arr };
    await RRG.users.update(userId, { profile_json: newPJ });
    return stored;
  },

  /* Rewrite profile_json.game_plan.structured.sessions. Used by the inline
     week editor and the AI regen endpoint. */
  async savePlanSessions(userId, sessions) {
    const prof = await RRG.users.get(userId);
    const pj = prof?.profile_json || {};
    const plan = pj.game_plan || {};
    const structured = plan.structured || {};
    const newPJ = {
      ...pj,
      game_plan: {
        ...plan,
        structured: { ...structured, sessions },
        last_edited_at: new Date().toISOString(),
      },
    };
    await RRG.users.update(userId, { profile_json: newPJ });
    return newPJ.game_plan;
  },
};

/* Root-cause taxonomy used by the lesson-update form. Keep stable — the
   `key` values get stored in profile_json.lesson_updates.root_cause. */
RRG.ROOT_CAUSES = [
  { key: 'setup',       label: 'Setup',         hint: 'Grip, posture, alignment, ball position' },
  { key: 'movement',    label: 'Movement',      hint: 'Body mechanics, rotation, weight shift' },
  { key: 'sequencing',  label: 'Sequencing',    hint: 'Kinematic order / transition / timing' },
  { key: 'short_game',  label: 'Short Game',    hint: 'Chipping, pitching, bunker, low-point control' },
  { key: 'putting',     label: 'Putting',       hint: 'Stroke, green-reading, speed control' },
  { key: 'mental',      label: 'Mental',        hint: 'Routine, self-talk, pressure, decisions' },
  { key: 'strategy',    label: 'Strategy',      hint: 'Course management, DECADE, shot selection' },
  { key: 'equipment',   label: 'Equipment',     hint: 'Fitting, lofts, distance gaps' },
  { key: 'other',       label: 'Other',         hint: '' },
];

/* ============================================================
   INVITES
   ============================================================ */
RRG.invites = {
  async all() {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('invites')
      .select('*')
      .eq('cohort', RRG.COHORT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create({ defaultPackage = null, note = '', pendingProfile = null } = {}) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.rpc('create_invite', {
      p_cohort: RRG.COHORT,
      p_default_package: defaultPackage,
      p_note: note || null,
      p_expires_at: null,
    });
    if (error) throw error;
    /* VIP pre-fill: attach pending_profile to the freshly-created invite. The
       RPC doesn't accept this parameter yet; we do it as a follow-up update
       so the SQL function doesn't need to change. Merged into the player's
       profile_json the moment they redeem the code. */
    if (pendingProfile && data && data.code) {
      try {
        await RRG.sb.from('invites')
          .update({ pending_profile: pendingProfile })
          .eq('code', data.code);
      } catch (err) {
        console.warn('VIP invite pending_profile set failed', err);
      }
    }
    return data;
  },

  async revoke(code) {
    await RRG._sbReady;
    const { error } = await RRG.sb.from('invites').delete().eq('code', code);
    if (error) throw error;
  },
};

/* ============================================================
   ROUNDS / LESSONS / VIDEOS

   Rounds and Lessons are cloud-synced via Supabase tables — RLS
   gives every player read/write on their own rows, coaches read
   all. Bag and Wedge Matrix live on profiles.profile_json.{bag,
   wedge_matrix} with a localStorage warm cache.

   Videos remain on localStorage/IndexedDB but the upload UI is
   hidden on the player side until the blob pipeline is ready.
   ============================================================ */
/* Rounds — Supabase-backed. RLS: players manage their own rounds;
   coaches can read all. Schema columns are snake_case. */
RRG.subs = {
  async forUser(userId) {
    await RRG._sbReady;
    if (!RRG.sb) return [];
    const { data, error } = await RRG.sb.from('rounds')
      .select('*')
      .eq('user_id', userId)
      .order('round_date', { ascending: false, nullsFirst: false });
    if (error) { console.warn('rounds fetch', error); return []; }
    return data || [];
  },
  /* Coach-only. RLS on the rounds table restricts non-coaches to their own
     rows, so this returns [] for normal users. Used by /adult/coach.html
     for roster stats and the Latest Rounds feed. */
  async all() {
    await RRG._sbReady;
    if (!RRG.sb) return [];
    const { data, error } = await RRG.sb.from('rounds')
      .select('*')
      .order('round_date', { ascending: false, nullsFirst: false });
    if (error) { console.warn('rounds all fetch', error); return []; }
    return data || [];
  },
  async get(id) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('rounds').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(round) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('rounds').insert(round).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, patch) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('rounds').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    await RRG._sbReady;
    const { error } = await RRG.sb.from('rounds').delete().eq('id', id);
    if (error) throw error;
  },
};

/* Lessons — Supabase-backed. Source of truth for "Every Session, Logged".
   RLS: each player can read/write their own; coaches have full read/write access. */
RRG.lessons = {
  async forUser(userId) {
    await RRG._sbReady;
    if (!RRG.sb) return [];
    const { data, error } = await RRG.sb.from('lessons')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false, nullsFirst: false });
    if (error) { console.warn('lessons fetch', error); return []; }
    return data || [];
  },
  async upcoming(userId) {
    const all = await this.forUser(userId);
    return all.filter(l => !l.completed_at).reverse(); // earliest first
  },
  async past(userId) {
    const all = await this.forUser(userId);
    return all.filter(l => l.completed_at);
  },
  async get(id) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('lessons').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(lesson) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('lessons').insert(lesson).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, patch) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.from('lessons').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    await RRG._sbReady;
    const { error } = await RRG.sb.from('lessons').delete().eq('id', id);
    if (error) throw error;
  },
};

/* IndexedDB-backed video store — unchanged from the last revision. */
RRG.idb = {
  DB_NAME: 'rrgA_video_store', STORE: 'videos', _dbPromise: null,
  _open() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB not supported.')); return; }
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE)) db.createObjectStore(this.STORE);
      };
      req.onsuccess = () => resolve(req.result);
    });
    return this._dbPromise;
  },
  async putVideo(id, blob) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Storage quota exceeded.'));
    });
  },
  async getVideo(id) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const req = tx.objectStore(this.STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },
  async deleteVideo(id) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async blobUrlFor(id) {
    try { const b = await this.getVideo(id); return b ? URL.createObjectURL(b) : null; }
    catch { return null; }
  },
};

RRG.videos = {
  KEY: 'rrgA_videos_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  create(v) {
    const entry = { id: 'v_' + Date.now().toString(36), ...v, createdAt: new Date().toISOString() };
    const list = this.all(); list.push(entry); this.save(list);
    return entry;
  },
  update(id, patch) {
    const list = this.all();
    const i = list.findIndex(v => v.id === id);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    this.save(list);
    return list[i];
  },
  async remove(id) {
    this.save(this.all().filter(x => x.id !== id));
    try { await RRG.idb.deleteVideo(id); } catch {}
  },
  forUser(userId) {
    return this.all().filter(v => v.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

/* ============================================================
   PATH TO GOAL — gap analysis engine + widget renderer

   Consumes: player's rounds (from RRG.subs.forUser) + their current &
   goal handicap (from profile fields). Produces a color-coded widget
   that shows which stats are holding them back from their goal.

   Logic:
   1. Pull the last N rounds (default 5).
   2. Compute rolling averages for each stat (score, FW%, GIR%, putts,
      scrambling, sand save %, birdies, doubles+, penalties).
   3. Interpolate the benchmark for the player's GOAL handicap from the
      nearest two BENCHMARK_BRACKETS.
   4. Each stat gets a status: green (at/better than target), yellow
      (within 15% of target), or red (further off).
   5. Render as a sortable card on Dashboard / My Plan / History.
   ============================================================ */
RRG.path = {
  /* Parse a ratio string like "8 / 14" → { made: 8, attempted: 14 }.
     Accepts "8/14", "8 / 14", "8", null. Returns null if unparseable. */
  parseRatio(s) {
    if (s == null || s === '') return null;
    if (typeof s === 'number') return { made: s, attempted: null };
    const t = String(s).trim();
    const m = t.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (m) return { made: parseFloat(m[1]), attempted: parseFloat(m[2]) };
    const n = parseFloat(t);
    return isNaN(n) ? null : { made: n, attempted: null };
  },

  /* Linear interpolation between two benchmark brackets for any handicap.
     E.g. interpolate(17.3, 'gir_pct') returns the gir_pct benchmark
     proportionally between the 15 and 20 hcp values. */
  interpolate(hcp, metricKey) {
    const arr = RRG.BENCHMARKS[metricKey];
    const brackets = RRG.BENCHMARK_BRACKETS;
    if (!arr || !brackets) return null;
    const h = Math.max(0, Math.min(35, parseFloat(hcp) || 0));
    // Find the two nearest brackets in order (brackets are descending: 35,30,...,0)
    for (let i = 0; i < brackets.length - 1; i++) {
      const hi = brackets[i], lo = brackets[i + 1];
      if (h <= hi && h >= lo) {
        const t = (hi - h) / (hi - lo);            // 0 at high bracket, 1 at low
        return arr[i] + (arr[i + 1] - arr[i]) * t;
      }
    }
    return h > brackets[0] ? arr[0] : arr[arr.length - 1];
  },

  /* Look up the closest BRACKET_FOCUS entry for a handicap (rounds down to
     the nearest 5-stroke bracket). */
  bracketFor(hcp) {
    const h = parseFloat(hcp);
    if (isNaN(h)) return null;
    const brackets = [35, 30, 25, 20, 15, 10, 5, 0];
    for (const b of brackets) { if (h >= b) return b; }
    return 0;
  },

  /* Given a rounds array, compute the rolling average for the last `window`
     rounds for every stat in RRG.STATS. Missing fields skipped per round. */
  rollingStats(rounds, windowN = 5) {
    const recent = (rounds || [])
      .filter(r => r && r.score)
      .slice(0, windowN);
    if (!recent.length) return null;

    const agg = {};
    const init = () => ({ sum: 0, n: 0 });
    RRG.STATS.forEach(s => { agg[s.key] = init(); });

    for (const r of recent) {
      if (r.score != null)      { agg.avg_score.sum += r.score; agg.avg_score.n++; }

      const fir = RRG.path.parseRatio(r.fir);
      if (fir && fir.attempted) { agg.fairways_pct.sum += (fir.made / fir.attempted) * 100; agg.fairways_pct.n++; }

      const gir = RRG.path.parseRatio(r.gir);
      if (gir && gir.attempted) { agg.gir_pct.sum += (gir.made / gir.attempted) * 100; agg.gir_pct.n++; }

      if (r.putts != null)      { agg.putts_rd.sum += r.putts; agg.putts_rd.n++; }

      const ud = RRG.path.parseRatio(r.up_down);
      if (ud && ud.attempted)   { agg.scrambling.sum += (ud.made / ud.attempted) * 100; agg.scrambling.n++; }

      const ss = RRG.path.parseRatio(r.sand_saves);
      if (ss && ss.attempted)   { agg.sand_save.sum += (ss.made / ss.attempted) * 100; agg.sand_save.n++; }

      if (r.birdies != null)    { agg.birdies_rd.sum += r.birdies; agg.birdies_rd.n++; }
      if (r.doubles_plus != null){ agg.doubles_rd.sum += r.doubles_plus; agg.doubles_rd.n++; }
      if (r.penalties != null)  { agg.penalties_rd.sum += r.penalties; agg.penalties_rd.n++; }
      if (r.drive_dist != null) { agg.drive_dist.sum += r.drive_dist; agg.drive_dist.n++; }
    }

    const out = { _count: recent.length };
    Object.keys(agg).forEach(k => {
      out[k] = agg[k].n > 0 ? agg[k].sum / agg[k].n : null;
    });
    return out;
  },

  /* Compute the status color for one stat given actual value + target.
     Threshold: within 15% of target = yellow; better = green; worse = red. */
  statusFor(actual, target, higherBetter) {
    if (actual == null || target == null) return 'none';
    if (higherBetter) {
      if (actual >= target) return 'green';
      if (actual >= 0.85 * target) return 'yellow';
      return 'red';
    } else {
      if (actual <= target) return 'green';
      if (actual <= 1.15 * target) return 'yellow';
      return 'red';
    }
  },

  /* Return an array of {key, label, actual, target, status, gap} for every
     stat that has both an actual value and a benchmark. Sorted by priority
     (red first, then yellow, then green). */
  gapAnalysis(rolling, goalHcp) {
    if (!rolling) return [];
    const out = [];
    for (const s of RRG.STATS) {
      const actual = rolling[s.key];
      const target = RRG.path.interpolate(goalHcp, s.bench);
      const status = RRG.path.statusFor(actual, target, s.higherBetter);
      if (status === 'none') continue;
      // gap is the RELATIVE distance from target (positive means worse)
      const gap = s.higherBetter ? (target - actual) : (actual - target);
      out.push({ key: s.key, label: s.label, unit: s.unit, actual, target, status, gap, higherBetter: s.higherBetter });
    }
    const rank = { red: 0, yellow: 1, green: 2 };
    out.sort((a, b) => rank[a.status] - rank[b.status] || b.gap - a.gap);
    return out;
  },

  /* Format a stat value for display. Rounds to 1 decimal, tags unit. */
  fmt(v, unit) {
    if (v == null || isNaN(v)) return '—';
    const rounded = Math.round(v * 10) / 10;
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return str + (unit ? unit : '');
  },

  /* Render the full Path-to-Goal widget for a user.
     Expects: user (with .profile_json.handicap and .profile_json.goal_handicap),
     rounds (array). Returns HTML string. If no rounds or no handicap, shows
     an onboarding callout instead. */
  renderWidget({ user, rounds, variant = 'full' } = {}) {
    const pj = (user && user.profile_json) || {};
    // Read from both root fields (preferred) and the s1_ prefix used by the
    // Know Your Game form, so either path works without a migration.
    const rawCur  = pj.handicap != null && pj.handicap !== ''         ? pj.handicap
                  : pj.s1_handicap != null && pj.s1_handicap !== ''   ? pj.s1_handicap : null;
    const rawGoal = pj.goal_handicap != null && pj.goal_handicap !== ''            ? pj.goal_handicap
                  : pj.s1_goal_handicap != null && pj.s1_goal_handicap !== ''      ? pj.s1_goal_handicap : 0;
    const curHcp  = rawCur  != null ? parseFloat(rawCur)  : null;
    const goalHcp = rawGoal != null ? parseFloat(rawGoal) : 0;

    if (curHcp == null || isNaN(curHcp)) {
      return `
        <div class="path-card">
          <div class="path-kicker">Path to Your Goal</div>
          <h3 class="path-title">Set your handicap to unlock your path</h3>
          <p class="path-sub">Tell the portal what handicap you're currently playing to (and where you want to be) and we'll show you exactly which stats are holding you back.</p>
          <a class="btn btn-primary btn-sm" href="profile.html">Set your handicap &rarr;</a>
        </div>`;
    }

    const rolling = RRG.path.rollingStats(rounds);
    if (!rolling || rolling._count === 0) {
      return `
        <div class="path-card">
          <div class="path-kicker">Path to Your Goal</div>
          <h3 class="path-title">Log a round to unlock your path</h3>
          <p class="path-sub">Your gap-analysis card lights up after you log your first round. Fairways hit, greens, putts, up-and-downs — the more you log, the sharper the picture.</p>
          <a class="btn btn-primary btn-sm" href="submit-round.html">Log a round &rarr;</a>
        </div>`;
    }

    const gaps = RRG.path.gapAnalysis(rolling, goalHcp);
    const focus = RRG.BRACKET_FOCUS[RRG.path.bracketFor(curHcp)] || null;

    // For compact variant (dashboard teaser): show only reds + top yellow
    const showGaps = variant === 'compact'
      ? gaps.filter(g => g.status === 'red').concat(gaps.filter(g => g.status === 'yellow').slice(0, 1)).slice(0, 3)
      : gaps;

    const goalLabel = goalHcp === 0 ? 'Scratch' : (Number.isInteger(goalHcp) ? String(goalHcp) : goalHcp.toFixed(1));
    const curLabel  = Number.isInteger(curHcp) ? String(curHcp) : curHcp.toFixed(1);

    const rowsHtml = showGaps.map(g => {
      // Status icons — pure indicators, not buttons/chevrons.
      // Green = at/above goal. Yellow = close. Red = biggest gap.
      const icon = g.status === 'green' ? '✓'
                 : g.status === 'yellow' ? '~'
                 : '!';
      return `
        <div class="path-row path-${g.status}">
          <div class="path-metric">${RRG.esc(g.label)}</div>
          <div class="path-actual">${RRG.path.fmt(g.actual, g.unit)}</div>
          <div class="path-target"><span class="path-target-label">Goal</span> ${RRG.path.fmt(g.target, g.unit)}</div>
          <div class="path-pill path-pill-${g.status}" aria-label="${g.status === 'green' ? 'At or above goal' : g.status === 'yellow' ? 'Within 15% of goal' : 'Biggest gap'}">${icon}</div>
        </div>`;
    }).join('');

    // Hint the player at which stats they aren't logging yet. If any stat in
    // RRG.STATS has no rolling value, prompt them to fill more fields on the
    // round form so their gap analysis gets richer.
    const missingStats = RRG.STATS.filter(s => rolling[s.key] == null).map(s => s.label);
    const missingHint = missingStats.length ? `
      <div class="path-missing-hint">
        <b>Add more to your gap analysis.</b> Log these stats on your next round to light up
        the full picture: <em>${missingStats.map(s => RRG.esc(s)).join(' · ')}</em>.
        <a href="submit-round.html">Log a round with all stats &rarr;</a>
      </div>
    ` : '';

    const focusHtml = (variant === 'full' && focus) ? `
      <div class="path-focus">
        <div class="path-focus-label">Focus to get to ${focus.next == null ? 'stay there' : focus.next + ' handicap'}</div>
        <p class="path-focus-goal">${RRG.esc(focus.goal)}</p>
        <ul>${focus.bullets.map(b => `<li>${RRG.esc(b)}</li>`).join('')}</ul>
      </div>
    ` : '';

    const teaserHtml = variant === 'compact' ? `
      <div class="path-footer-link">
        <a href="my-plan.html">See the full gap analysis &rarr;</a>
      </div>
    ` : '';

    return `
      <div class="path-card">
        <div class="path-header">
          <div>
            <div class="path-kicker">Path to Your Goal</div>
            <h3 class="path-title">Current ${curLabel} &rarr; Goal ${goalLabel}</h3>
            <p class="path-sub">Based on your last ${rolling._count} round${rolling._count === 1 ? '' : 's'}. Green = you're there. Yellow = within 15%. Red = biggest gap.</p>
          </div>
        </div>
        <div class="path-rows">${rowsHtml || '<p class="path-sub">Log more stats per round to unlock the full gap analysis. Try entering fairways, greens, and up-and-downs on your next round.</p>'}</div>
        ${variant === 'full' ? missingHint : ''}
        ${focusHtml}
        ${teaserHtml}
      </div>`;
  },
};

/* ============================================================
   MILESTONES — progressive goals for beginners + developing players

   Replaces the Path-to-Goal widget for players in "just_starting" or
   "developing" skill tiers. Instead of showing red/yellow/red gaps vs.
   benchmark handicaps (which is demoralizing when you shoot 115),
   milestones celebrate what a newer player is actually working toward:
   breaking 120, making their first par, breaking 100.

   Each milestone has:
     - id                  unique key
     - title               short name
     - description         one-line detail
     - test(rounds)        returns { done: boolean, best: value, date: string }

   The widget shows: recent completions (celebrate), the next 2-3 targets
   (work toward), a best-so-far hint where applicable.
   ============================================================ */

RRG.milestones = {
  /* Full list in rough progression order. A player graduates to the Player
     tier after breaking 90 with some consistency — at which point the Path
     widget is more useful to them than milestones. */
  all: [
    {
      id: 'first_9',
      title: 'Complete your first 9-hole round',
      test(rounds) {
        const r = rounds.find(r => (r.holes === 9) || (r.score && r.score < 60));
        return { done: !!r, date: r?.round_date };
      },
    },
    {
      id: 'first_18',
      title: 'Complete your first 18-hole round',
      test(rounds) {
        const r = rounds.find(r => (r.holes === 18) || (r.score && r.score >= 60));
        return { done: !!r, date: r?.round_date };
      },
    },
    {
      id: 'break_130',
      title: 'Break 130',
      description: 'A full round under 130',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 130);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'break_120',
      title: 'Break 120',
      description: 'Consistency starts here',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 120);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'first_par_3',
      title: 'Make your first par on a par 3',
      test(rounds) {
        for (const r of rounds) {
          const rows = r.hole_detail?.rows;
          if (!rows) continue;
          const hit = rows.find(h => h.par === 3 && h.score === 3);
          if (hit) return { done: true, date: r.round_date };
        }
        return { done: false };
      },
    },
    {
      id: 'break_110',
      title: 'Break 110',
      description: 'Bogey golf gets real',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 110);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'first_par_4',
      title: 'Make your first par on a par 4',
      test(rounds) {
        for (const r of rounds) {
          const rows = r.hole_detail?.rows;
          if (!rows) continue;
          const hit = rows.find(h => h.par === 4 && h.score === 4);
          if (hit) return { done: true, date: r.round_date };
        }
        return { done: false };
      },
    },
    {
      id: 'first_birdie',
      title: 'Make your first birdie',
      description: 'One under par on any hole',
      test(rounds) {
        for (const r of rounds) {
          const rows = r.hole_detail?.rows;
          if (!rows) continue;
          const hit = rows.find(h => h.par && h.score && h.score < h.par);
          if (hit) return { done: true, date: r.round_date };
        }
        return { done: false };
      },
    },
    {
      id: 'break_100',
      title: 'Break 100',
      description: 'The biggest milestone in amateur golf',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 100);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'break_95',
      title: 'Break 95',
      description: 'Regular mid-90s rounds',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 95);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'break_90',
      title: 'Break 90',
      description: 'You\'re now a player — switch to Player tier',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 90);
        return { done: !!r, date: r?.round_date, best };
      },
    },
  ],

  /* Run every milestone test against the user's rounds. Returns
     { completed: [...], upcoming: [...], recentlyDone: latest done }. */
  evaluate(rounds) {
    const completed = [], upcoming = [];
    let recentlyDone = null;
    for (const m of RRG.milestones.all) {
      const res = m.test(rounds || []);
      const entry = { ...m, ...res };
      if (res.done) {
        completed.push(entry);
        if (!recentlyDone || (entry.date || '') > (recentlyDone.date || '')) {
          recentlyDone = entry;
        }
      } else {
        upcoming.push(entry);
      }
    }
    return { completed, upcoming, recentlyDone };
  },

  /* Format a milestone date (YYYY-MM-DD) for display. */
  fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
        .toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  },

  /* Render the milestones widget for a player. Replaces the Path widget
     for beginner/developing tiers. */
  renderWidget({ user, rounds, variant = 'full' } = {}) {
    const res = RRG.milestones.evaluate(rounds || []);
    const completedCount = res.completed.length;
    const totalCount = RRG.milestones.all.length;
    const nextUp = res.upcoming.slice(0, variant === 'compact' ? 2 : 3);

    // If they haven't logged anything yet, give a warm first-time framing.
    if (!rounds || rounds.length === 0) {
      return `
        <div class="path-card">
          <div class="path-kicker">Your Journey</div>
          <h3 class="path-title">Ready to log your first round?</h3>
          <p class="path-sub">
            Once you've played your first round &mdash; even just 9 holes &mdash; we'll
            track your progress through the milestones every golfer works toward. Don't
            worry about score; just get out there.
          </p>
          <a href="log-simple.html" class="btn btn-primary btn-sm">+ Log Your First Round</a>
        </div>`;
    }

    // Completed strip (most recent 2 if any)
    const recentDone = res.completed
      .filter(c => c.date)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 2);

    const doneHtml = recentDone.length ? recentDone.map(m => `
      <div class="ms-row ms-done">
        <div class="ms-icon">&check;</div>
        <div>
          <div class="ms-title">${RRG.esc(m.title)}</div>
          <div class="ms-sub">${RRG.esc(RRG.milestones.fmtDate(m.date))}</div>
        </div>
      </div>`).join('') : '';

    // Upcoming milestones — show "best so far" if a break-N milestone
    const upHtml = nextUp.map(m => {
      let bestHint = '';
      if (m.best != null && m.id.startsWith('break_')) {
        bestHint = `<span class="ms-best">Best so far: <b>${m.best}</b></span>`;
      }
      return `
        <div class="ms-row ms-next">
          <div class="ms-icon ms-target">&cir;</div>
          <div>
            <div class="ms-title">${RRG.esc(m.title)}</div>
            ${m.description ? `<div class="ms-sub">${RRG.esc(m.description)}</div>` : ''}
            ${bestHint}
          </div>
        </div>`;
    }).join('');

    const progress = `${completedCount} / ${totalCount}`;

    return `
      <div class="path-card">
        <div class="path-header">
          <div>
            <div class="path-kicker">Your Journey &middot; ${progress} milestones</div>
            <h3 class="path-title">Keep going. You're building something.</h3>
            <p class="path-sub">Every round moves you forward. Here's what you've hit and what's next.</p>
          </div>
        </div>
        ${doneHtml ? `
          <div class="ms-section-label">Recently unlocked</div>
          <div class="ms-list">${doneHtml}</div>
        ` : ''}
        ${upHtml ? `
          <div class="ms-section-label">What's next</div>
          <div class="ms-list">${upHtml}</div>
        ` : '<p class="path-sub" style="margin-top:10px;">You\'ve hit every milestone on this list. Time to graduate to Player tier and start tracking real stats — open your profile to switch.</p>'}
      </div>`;
  },
};

/* ============================================================
   TRACKMAN SESSIONS — stored in profile_json.trackman_sessions
   Each session: { id, date, tier, notes, clubs: [...], created_at }
   Each club entry: { club, clubhead_speed, ball_speed, smash,
                      launch_angle, spin, carry }

   Status logic for comparison vs. benchmark:
     'higher' direction (CHS, ball, smash, carry):
       actual >= benchmark          → green
       actual >= 0.90 × benchmark   → yellow
       else                         → red
     'range' direction (launch, spin):
       within ±15% of benchmark     → green
       within ±30% of benchmark     → yellow
       else                         → red (too high OR too low)
   ============================================================ */
RRG.trackman = {
  _uid() { return 'tm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); },

  /* Pull the saved sessions from a user's profile_json. */
  async list(userId) {
    const prof = await RRG.users.get(userId);
    const arr = prof?.profile_json?.trackman_sessions;
    return Array.isArray(arr) ? arr.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')) : [];
  },

  /* Append a new session. Returns the stored session. */
  async add(userId, session) {
    const prof = await RRG.users.get(userId);
    const pj = prof?.profile_json || {};
    const arr = Array.isArray(pj.trackman_sessions) ? [...pj.trackman_sessions] : [];
    const stored = {
      id: this._uid(),
      date: session.date || new Date().toISOString().slice(0, 10),
      tier: session.tier || 'pga',
      notes: (session.notes || '').trim(),
      clubs: Array.isArray(session.clubs) ? session.clubs : [],
      created_at: new Date().toISOString(),
    };
    arr.push(stored);
    await RRG.users.update(userId, { profile_json: { ...pj, trackman_sessions: arr } });
    return stored;
  },

  /* Remove a session by id. */
  async remove(userId, sessionId) {
    const prof = await RRG.users.get(userId);
    const pj = prof?.profile_json || {};
    const arr = (pj.trackman_sessions || []).filter(s => s.id !== sessionId);
    await RRG.users.update(userId, { profile_json: { ...pj, trackman_sessions: arr } });
  },

  /* Lookup benchmark for a (tier, club) combination. Returns null if missing. */
  benchmark(tier, clubKey) {
    const set = (RRG.TRACKMAN_BENCHMARKS || {})[tier];
    if (!set) return null;
    return set[clubKey] || null;
  },

  /* Compute status for one metric given actual vs. benchmark vs. direction. */
  metricStatus(actual, benchmark, direction) {
    if (actual == null || benchmark == null) return 'none';
    if (direction === 'higher') {
      if (actual >= benchmark)         return 'green';
      if (actual >= 0.90 * benchmark)  return 'yellow';
      return 'red';
    }
    if (direction === 'range') {
      const dev = Math.abs(actual - benchmark) / Math.max(Math.abs(benchmark), 0.001);
      if (dev <= 0.15) return 'green';
      if (dev <= 0.30) return 'yellow';
      return 'red';
    }
    return 'none';
  },

  /* Build a gap analysis for one club: [{ key, label, unit, actual, benchmark, status, direction }, ...] */
  clubGaps(clubEntry, tier) {
    const b = RRG.trackman.benchmark(tier, clubEntry.club);
    return RRG.TRACKMAN_METRICS.map(m => {
      const actual = clubEntry[m.key];
      const benchmark = b ? b[m.key] : null;
      const status = RRG.trackman.metricStatus(actual, benchmark, m.direction);
      return { ...m, actual, benchmark, status };
    });
  },

  /* Format a TrackMan metric for display. */
  fmt(v, metric) {
    if (v == null || isNaN(v)) return '—';
    const prec = metric && metric.precision != null ? metric.precision : (Math.abs(v) >= 100 ? 0 : 1);
    const rounded = Number(v).toFixed(prec);
    return rounded + ((metric && metric.unit) || '');
  },
};

/* ============================================================
   HANDICAP INDEX — portal-computed index tracker

   Implements the Golf Canada / World Handicap System calculation
   (simplified — no PCC or net double bogey adjustments). Players
   can track their own index from rounds logged in the portal;
   the value is labeled "Portal Index" so it's clearly not the
   official Golf Canada handicap (which requires posting through
   their system).

   Formula:  differential = (113 / slope) × (score - rating)

   Index = average of the N lowest differentials from the last 20
   rounds, with scaling for players with fewer than 20 posted rounds.

   Rounds need: score, course rating, slope, and a round_date.
   - Scorecard entries supply rating/slope via round.hole_detail
   - Totals-entry rounds require the player to enter rating/slope
     manually (optional fields in submit-round.html)
   ============================================================ */

/* Lookup table for how many low differentials get used and what
   adjustment to apply, based on rounds-posted count. From WHS. */
const WHS_TABLE = [
  // posted, use, adjustment
  [3,  1, -2.0],
  [4,  1, -1.0],
  [5,  1,  0],
  [6,  2, -1.0],
  [7,  2,  0],
  [8,  2,  0],
  [9,  3,  0],
  [10, 3,  0],
  [11, 3,  0],
  [12, 4,  0],
  [13, 4,  0],
  [14, 4,  0],
  [15, 5,  0],
  [16, 5,  0],
  [17, 6,  0],
  [18, 6,  0],
  [19, 7,  0],
  [20, 8,  0],
];

Object.assign(RRG.path, {
  /* Extract rating + slope from a round. Scorecard-entered rounds keep the
     values inside hole_detail; totals-entered rounds use explicit columns
     if the player filled them in. Returns null if either is missing. */
  ratingSlope(round) {
    if (!round) return null;
    const hd = round.hole_detail;
    const rating = round.course_rating != null ? parseFloat(round.course_rating)
                 : (hd && hd.rating != null)   ? parseFloat(hd.rating) : null;
    const slope  = round.course_slope != null  ? parseFloat(round.course_slope)
                 : (hd && hd.slope != null)    ? parseFloat(hd.slope) : null;
    if (rating == null || isNaN(rating) || slope == null || isNaN(slope)) return null;
    return { rating, slope };
  },

  /* Compute the score differential for a round per WHS. */
  calcDifferential(score, rating, slope) {
    if (!score || !rating || !slope) return null;
    return Math.round(((113 / slope) * (score - rating)) * 10) / 10;
  },

  /* Compute the portal handicap index for a player. Takes the rounds array
     (any order), filters to those with rating + slope, sorts by date,
     applies the WHS best-N rule.
     Returns:
       {
         index:        number | null,
         eligible:     total rounds with rating + slope,
         posted:       rounds used in the index calc (last 20, capped),
         used:         how many differentials were averaged,
         adjustment:   the WHS adjustment applied,
         differentials: [{ round_date, score, rating, slope, diff, used }]
       }
     Returns { index: null, ... } if fewer than 3 eligible rounds. */
  calcIndex(rounds) {
    const enriched = (rounds || [])
      .map(r => {
        const rs = RRG.path.ratingSlope(r);
        if (!rs || !r.score) return null;
        const diff = RRG.path.calcDifferential(r.score, rs.rating, rs.slope);
        if (diff == null) return null;
        return {
          id: r.id,
          round_date: r.round_date || r.created_at,
          score: r.score,
          course: r.course,
          rating: rs.rating,
          slope: rs.slope,
          diff,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b.round_date || '').localeCompare(a.round_date || ''));

    const eligible = enriched.length;
    if (eligible < 3) {
      return { index: null, eligible, posted: 0, used: 0, adjustment: 0, differentials: enriched };
    }

    const posted = enriched.slice(0, 20);
    const postedCount = posted.length;
    const rule = WHS_TABLE.find(r => r[0] === postedCount) || WHS_TABLE[WHS_TABLE.length - 1];
    const [, use, adjustment] = rule;

    const sortedByDiff = [...posted].sort((a, b) => a.diff - b.diff);
    const lowestUsed = sortedByDiff.slice(0, use);
    const lowestIds = new Set(lowestUsed.map(r => r.id));
    const avgDiff = lowestUsed.reduce((a, b) => a + b.diff, 0) / lowestUsed.length;
    const index = Math.round((avgDiff + adjustment) * 10) / 10;

    const differentials = posted.map(r => ({ ...r, used: lowestIds.has(r.id) }));

    return {
      index,
      eligible,
      posted: postedCount,
      used: use,
      adjustment,
      differentials,
    };
  },

  /* Returns an array of { round_date, index } points computed as if the
     player had been tracking their index round-by-round. For each round
     (chronological), we recompute calcIndex() on the rounds up to and
     including that one. Cost is O(N²) but N ≤ 20 so it's fine. */
  indexHistory(rounds) {
    const chron = (rounds || [])
      .filter(r => RRG.path.ratingSlope(r) && r.score)
      .sort((a, b) => (a.round_date || '').localeCompare(b.round_date || ''));
    const points = [];
    for (let i = 0; i < chron.length; i++) {
      const subset = chron.slice(0, i + 1);
      const res = RRG.path.calcIndex(subset);
      if (res.index != null) {
        points.push({ round_date: chron[i].round_date, index: res.index });
      }
    }
    return points;
  },

  /* Time-series of any stat, one point per round. Uses the same per-round
     extraction as rollingStats but without rolling — returns actual values. */
  statHistory(rounds, statKey) {
    const chron = (rounds || [])
      .filter(r => r.score)
      .sort((a, b) => (a.round_date || '').localeCompare(b.round_date || ''));
    const out = [];
    for (const r of chron) {
      let v = null;
      if (statKey === 'avg_score') v = r.score;
      else if (statKey === 'putts_rd' && r.putts != null) v = r.putts;
      else if (statKey === 'penalties_rd' && r.penalties != null) v = r.penalties;
      else if (statKey === 'birdies_rd' && r.birdies != null) v = r.birdies;
      else if (statKey === 'doubles_rd' && r.doubles_plus != null) v = r.doubles_plus;
      else if (statKey === 'fairways_pct') {
        const f = RRG.path.parseRatio(r.fir);
        if (f && f.attempted) v = (f.made / f.attempted) * 100;
      } else if (statKey === 'gir_pct') {
        const g = RRG.path.parseRatio(r.gir);
        if (g && g.attempted) v = (g.made / g.attempted) * 100;
      } else if (statKey === 'scrambling') {
        const u = RRG.path.parseRatio(r.up_down);
        if (u && u.attempted) v = (u.made / u.attempted) * 100;
      } else if (statKey === 'sand_save') {
        const s = RRG.path.parseRatio(r.sand_saves);
        if (s && s.attempted) v = (s.made / s.attempted) * 100;
      } else if (statKey === 'drive_dist' && r.drive_dist != null) v = r.drive_dist;
      if (v != null) out.push({ round_date: r.round_date, value: v });
    }
    return out;
  },
});

/* =============================================================
   PLAYS LIKE — Ponza-style distance adjustment math
   Turns a raw yards-to-target into the "plays like" number a golfer
   should actually club for. Adjusts for:
     - elevation delta (uphill plays longer, downhill plays shorter)
     - temperature (cool air = shorter ball flight)
     - wind (headwind penalty > tailwind bonus, crosswind ≈ 0 distance)
     - altitude above sea level (thinner air = longer carry)
   Returns a breakdown object so the UI can show WHY a shot is
   playing longer — teaching moment, not just a number.
   ============================================================= */
RRG.playsLike = {
  /* Compute the plays-like distance — METRIC inputs.
       input: {
         yards        : number,  // raw distance to target (yards — golf convention)
         elev_m       : number,  // green elevation MINUS tee elevation (m, + = uphill)
         temp_c       : number,  // ambient temperature in °C
         wind_kmh     : number,  // wind speed (km/h)
         wind_dir_deg : number,  // direction wind is BLOWING FROM (meteorological)
         shot_dir_deg : number,  // direction shot is heading TO (0=N, 90=E, …)
         altitude_m   : number,  // course altitude above sea level (m)
       }
     Any field may be null/undefined → that adjustment is skipped (zeroed).
     Returns:
       {
         actual, plays_like, adjustments: { elev, temp, wind, altitude },
         wind_component: { head_kmh, cross_kmh }
       }
     Distance values in YARDS. Constants below are converted from the original
     imperial coefficients (~0.75 yd/ft, 2 yd per 10°F, 1%/mph headwind, etc.). */
  compute({ yards, elev_m = 0, temp_c = 24, wind_kmh = 0, wind_dir_deg = 0,
            shot_dir_deg = 0, altitude_m = 0 } = {}) {
    const y = parseFloat(yards) || 0;
    if (y <= 0) {
      return { actual: 0, plays_like: 0,
               adjustments: { elev: 0, temp: 0, wind: 0, altitude: 0 },
               wind_component: { head_kmh: 0, cross_kmh: 0 } };
    }

    // Elevation: ~0.75 yd per 1 ft = ~2.46 yd per 1 m delta.
    const elev_adj = (parseFloat(elev_m) || 0) * 2.46;

    // Temperature: baseline 24°C (≈75°F). Every 5.6°C below → ~2 yd shorter,
    // i.e. ~0.36 yd per °C.
    const temp_adj = ((parseFloat(temp_c) || 24) - 24) * 0.36;

    // Altitude: every 305 m above sea level → ~1% longer carry.
    const alt_adj = y * ((parseFloat(altitude_m) || 0) / 305) * 0.01;

    // Wind decomposition (meteorological FROM-direction, shot TO-direction).
    let head_kmh = 0, cross_kmh = 0;
    if ((parseFloat(wind_kmh) || 0) > 0) {
      const rel = ((parseFloat(wind_dir_deg) || 0) - (parseFloat(shot_dir_deg) || 0)) * Math.PI / 180;
      head_kmh = (parseFloat(wind_kmh) || 0) * Math.cos(rel);
      cross_kmh = (parseFloat(wind_kmh) || 0) * Math.sin(rel);
    }
    // Original was 1%/mph head, 0.5%/mph tail. 1 mph = 1.609 km/h, so:
    // headwind ≈ 0.621% per km/h, tailwind ≈ 0.311% per km/h.
    const wind_pct = head_kmh > 0 ? -head_kmh * 0.00621 : -head_kmh * 0.00311;
    const wind_adj = y * wind_pct;

    const plays_like = Math.round(y + elev_adj + temp_adj + alt_adj + wind_adj);

    return {
      actual: y,
      plays_like,
      adjustments: {
        elev:     Math.round(elev_adj * 10) / 10,
        temp:     Math.round(temp_adj * 10) / 10,
        wind:     Math.round(wind_adj * 10) / 10,
        altitude: Math.round(alt_adj * 10) / 10,
      },
      wind_component: {
        head_kmh:  Math.round(head_kmh * 10) / 10,
        cross_kmh: Math.round(cross_kmh * 10) / 10,
      },
    };
  },

  /* Recommend a club from the player's personal bag distances.
     bag: { driver: 250, '3w': 230, hybrid: 205, '4i': 195, ..., 'LW': 60 }
         (full-carry yardages; keys match RRG.TRACKMAN_CLUBS.key casing)
     target: the plays-like yardage.
     Returns { primary, secondary, note } where primary is the closest club,
     secondary is the next option up or down, note explains the gap. */
  recommendClub(bag, target) {
    if (!bag || typeof bag !== 'object' || !target || target <= 0) return null;
    const entries = Object.entries(bag)
      .map(([k, v]) => ({ key: k, yards: parseFloat(v) }))
      .filter(e => !isNaN(e.yards) && e.yards > 0)
      .sort((a, b) => b.yards - a.yards);
    if (!entries.length) return null;

    // Closest club by absolute delta
    let primary = entries[0];
    let bestDelta = Math.abs(entries[0].yards - target);
    for (const e of entries) {
      const d = Math.abs(e.yards - target);
      if (d < bestDelta) { primary = e; bestDelta = d; }
    }
    const idx = entries.indexOf(primary);
    // Secondary = the "other side" — if target is LONGER than primary's
    // full-carry, offer the next-longer club; if SHORTER, next-shorter.
    const secondary = target > primary.yards
      ? (entries[idx - 1] || null)  // longer club
      : (entries[idx + 1] || null); // shorter club
    const delta = Math.round(target - primary.yards);
    let note;
    if (delta === 0) note = `${primary.key.toUpperCase()} stock — pure number.`;
    else if (delta > 0) note = `${primary.key.toUpperCase()} +${delta}y — firm it or step up to ${secondary ? secondary.key.toUpperCase() : 'longer club'}.`;
    else note = `${primary.key.toUpperCase()} ${delta}y — smooth it or step down to ${secondary ? secondary.key.toUpperCase() : 'shorter club'}.`;

    return { primary, secondary, delta, note };
  },
};

/* =============================================================
   WEATHER — minimal wrapper around Open-Meteo's free forecast API.
   No API key. No rate-limit concerns at our scale. Caches in
   sessionStorage for 10 minutes per coarse grid cell so a round
   doesn't hammer the endpoint hole-to-hole.
   ============================================================= */
RRG.weather = {
  CACHE_MS: 10 * 60 * 1000,

  /* Fetch current conditions at a lat/lng. Returns a promise resolving
     to { temp_c, wind_kmh, wind_dir_deg, elev_m_asl, cached, fetched_at }.
     On failure returns null — caller should fall back to manual entry.
     Metric units throughout (°C, km/h, m). */
  async fetchCurrent(lat, lng) {
    if (lat == null || lng == null) return null;
    // Cache key: round to ~1 km grid so nearby shots reuse the same fetch.
    const gridLat = Math.round(lat * 100) / 100;
    const gridLng = Math.round(lng * 100) / 100;
    const cacheKey = `rrg_wx_${gridLat}_${gridLng}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.fetched_at < this.CACHE_MS) {
          return { ...parsed, cached: true };
        }
      }
    } catch (e) { /* sessionStorage may be unavailable — ignore */ }

    try {
      // Open-Meteo metric defaults — °C, km/h, m. We just specify what we want.
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
                  `&current=temperature_2m,wind_speed_10m,wind_direction_10m` +
                  `&wind_speed_unit=kmh`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const j = await res.json();
      const c = j.current || {};
      const out = {
        temp_c:       Math.round(c.temperature_2m * 10) / 10,
        wind_kmh:     Math.round(c.wind_speed_10m),
        wind_dir_deg: Math.round(c.wind_direction_10m),
        elev_m_asl:   Math.round(j.elevation || 0),  // Open-Meteo returns m
        fetched_at:   Date.now(),
        cached:       false,
      };
      try { sessionStorage.setItem(cacheKey, JSON.stringify(out)); } catch (e) { /* ignore */ }
      return out;
    } catch (err) {
      console.warn('[weather] fetch failed', err);
      return null;
    }
  },

  /* Convert a wind-from-direction (0–360°, N=0) to a compass name. */
  compass(deg) {
    if (deg == null || isNaN(deg)) return '—';
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
  },
};

/* =============================================================
   CHARTS — minimal dependency-free SVG line / sparkline renderer.
   Used by the Handicap page + My Rounds trend cards. Inputs: an
   array of { date, value } points, plus options. Output: an SVG
   string that scales to the container. No D3, no Chart.js.
   ============================================================= */
RRG.charts = {
  /* Render a compact sparkline chart.
     points:   [{ round_date, value } OR { round_date, index }]
     opts:     { valueKey, height, lowerBetter, benchmark, unit, title } */
  sparkline(points, opts = {}) {
    const {
      valueKey = 'value',
      height = 80,
      lowerBetter = false,
      benchmark = null,
      unit = '',
      title = '',
    } = opts;

    if (!points || points.length < 2) {
      return `<div class="spark-empty">Not enough data to chart yet. Log more rounds.</div>`;
    }

    const W = 600; // internal viewBox width; scales via CSS
    const H = height;
    const padL = 6, padR = 6, padT = 10, padB = 16;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const values = points.map(p => p[valueKey]);
    let lo = Math.min(...values, benchmark != null ? benchmark : Infinity);
    let hi = Math.max(...values, benchmark != null ? benchmark : -Infinity);
    // Give a small margin so the line doesn't touch edges
    const span = Math.max(hi - lo, 1);
    lo -= span * 0.1; hi += span * 0.1;

    const x = i => padL + (i / (points.length - 1)) * plotW;
    const y = v => padT + (1 - (v - lo) / (hi - lo)) * plotH;

    // Line path
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p[valueKey]).toFixed(1)}`).join(' ');

    // Gradient fill area
    const areaPath = path + ` L ${x(points.length - 1).toFixed(1)} ${padT + plotH} L ${x(0).toFixed(1)} ${padT + plotH} Z`;

    // Benchmark line
    const benchLine = benchmark != null ? `
      <line x1="${padL}" x2="${W - padR}" y1="${y(benchmark).toFixed(1)}" y2="${y(benchmark).toFixed(1)}"
            stroke="#C9A84C" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="${W - padR - 2}" y="${(y(benchmark) - 3).toFixed(1)}" text-anchor="end" fill="#C9A84C" font-size="9" font-weight="600">
        GOAL ${Math.round(benchmark * 10) / 10}${unit}
      </text>
    ` : '';

    // Trend direction color: compare first and last, and improvement direction
    const first = values[0], last = values[values.length - 1];
    const improved = lowerBetter ? (last < first) : (last > first);
    const lineColor = improved ? '#6B8B4E' : (last === first ? '#C9A84C' : '#C76757');

    // Dots on first + last points
    const dots = [
      { i: 0, v: first, label: Math.round(first * 10) / 10 },
      { i: points.length - 1, v: last, label: Math.round(last * 10) / 10 },
    ].map(d => `
      <circle cx="${x(d.i).toFixed(1)}" cy="${y(d.v).toFixed(1)}" r="3.5" fill="${lineColor}" stroke="#fff" stroke-width="2"/>
    `).join('');

    const lastLabel = `
      <text x="${x(points.length - 1).toFixed(1)}" y="${(y(last) - 7).toFixed(1)}"
            text-anchor="end" fill="#0D1F3C" font-size="11" font-weight="700">
        ${Math.round(last * 10) / 10}${unit}
      </text>`;

    const titleEl = title ? `<div class="spark-title">${RRG.esc(title)}</div>` : '';

    return `
      ${titleEl}
      <svg class="spark-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${RRG.esc(title)}">
        <defs>
          <linearGradient id="gradFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stop-color="${lineColor}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#gradFill)"/>
        <path d="${path}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${benchLine}
        ${dots}
        ${lastLabel}
      </svg>`;
  },

  /* Trend card: sparkline + label + current value + delta vs. earliest. */
  trendCard(points, opts = {}) {
    const { title, unit = '', lowerBetter = false, benchmark = null, valueKey = 'value' } = opts;
    if (!points || points.length < 2) {
      return `
        <div class="trend-card trend-empty">
          <div class="trend-label">${RRG.esc(title)}</div>
          <div class="trend-subempty">Not enough data yet.</div>
        </div>`;
    }
    const values = points.map(p => p[valueKey]);
    const first = values[0], last = values[values.length - 1];
    const delta = last - first;
    const improved = lowerBetter ? (delta < 0) : (delta > 0);
    const deltaColor = Math.abs(delta) < 0.01 ? 'trend-flat' : (improved ? 'trend-up' : 'trend-down');
    const arrow = Math.abs(delta) < 0.01 ? '→' : (lowerBetter ? (delta < 0 ? '↓' : '↑') : (delta > 0 ? '↑' : '↓'));
    const deltaLabel = `${Math.abs(delta).toFixed(1)}${unit}`;
    return `
      <div class="trend-card">
        <div class="trend-head">
          <div class="trend-label">${RRG.esc(title)}</div>
          <div class="trend-delta ${deltaColor}">${arrow} ${deltaLabel}</div>
        </div>
        ${RRG.charts.sparkline(points, { valueKey, unit, lowerBetter, benchmark, height: 70, title: '' })}
      </div>`;
  },
};

/* ============================================================
   NAV / FOOTER
   ============================================================ */
RRG.renderNav = function(user, active = '') {
  if (!user) return '';
  const initials = (user.name || user.email || 'RR')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const coachItem = user.role === 'coach'
    ? `<li class="nav-coach"><a href="coach.html" class="${active==='coach'?'active':''}">Coach View</a></li>
       <li class="nav-coach"><a href="tour.html" class="${active==='tour'?'active':''}">Portal Tour</a></li>` : '';

  const group = (label, key, items) => `
    <li class="nav-group" data-group="${key}">
      <button class="nav-group-toggle" type="button"
              aria-expanded="false" aria-haspopup="true"
              onclick="RRG.toggleNavGroup(event, this)">
        <span>${label}</span><span class="caret" aria-hidden="true">&#9662;</span>
      </button>
      <ul class="nav-group-items">
        ${items}
      </ul>
    </li>`;

  return `
    <nav class="nav no-print">
      <div class="nav-brand">RR GOLF PERFORMANCE</div>
      <button class="nav-toggle" aria-label="Menu" onclick="RRG.toggleNav(this)">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="rrg-nav-drawer">

        ${group('My Game', 'mygame', `
          <li><a href="dashboard.html" class="${active==='dashboard'?'active':''}">Dashboard</a></li>
          <li><a href="my-plan.html"   class="${active==='plan'?'active':''}">My Plan</a></li>
          <li><a href="history.html"   class="${active==='history'?'active':''}">My Rounds</a></li>
          <li><a href="log-simple.html">Simple Log &middot; 30 seconds</a></li>
          <li><a href="scorecard.html" class="${active==='scorecard'?'active':''}">Mad River Scorecard</a></li>
          <li><a href="scorecard-away.html" class="${active==='scorecard-away'?'active':''}">Away Scorecard</a></li>
          <li><a href="scorecard-guide.html">How to Track Your Round</a></li>
          <li><a href="handicap.html"  class="${active==='handicap'?'active':''}">Handicap Index</a></li>
          <li><a href="lessons.html"   class="${active==='lessons'?'active':''}">My Lessons</a></li>
          <li><a href="tiger5.html"    class="${active==='tiger5'?'active':''}">5 Errors to Avoid</a></li>
          <li><a href="profile.html"   class="${active==='profile'?'active':''}">Profile</a></li>
        `)}

        ${group('Tools', 'tools', `
          <li><a href="bag.html"          class="${active==='bag'?'active':''}">My Bag</a></li>
          <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
          <li><a href="trackman.html"     class="${active==='trackman'?'active':''}">TrackMan Sessions</a></li>
        `)}

        ${group('Events', 'events', `
          <li><a href="events.html" class="${active==='events'?'active':''}"><strong>All Events &amp; Descriptions</strong></a></li>

          <li class="nav-sublabel">Friday Mornings</li>
          <li><a href="https://madriverpro.as.me/Ladies-Fridays" target="_blank" rel="noopener">Mad River Ladies Series</a></li>

          <li class="nav-sublabel">Thursday Evenings</li>
          <li><a href="https://madriverpro.as.me/ladiesnight" target="_blank" rel="noopener">Ladies Night Series</a></li>
          <li><a href="https://madriverpro.as.me/wineandwedges" target="_blank" rel="noopener">Wine &amp; Wedges</a></li>
          <li><a href="https://madriverpro.as.me/scotchandshortgame" target="_blank" rel="noopener">Scotch &amp; Short Game</a></li>
          <li><a href="https://madriverpro.as.me/5anddine" target="_blank" rel="noopener">9 &amp; Dine</a></li>
          <li><a href="https://madriverpro.as.me/steaknguinness" target="_blank" rel="noopener">Links Night &mdash; Steak &amp; Guinness</a></li>
          <li><a href="https://madriverpro.as.me/pilatesandperformance" target="_blank" rel="noopener">Pilates &amp; Performance</a></li>

          <li class="nav-sublabel">Summer Intensive</li>
          <li><a href="https://madriverpro.as.me/short-game-school" target="_blank" rel="noopener">Half Day Short Game School</a></li>

          <li class="nav-sublabel">Seasonal</li>
          <li><a href="/mothers-day.html">Mother's Day Special</a></li>
        `)}

        ${group('Learn', 'learn', `
          <li><a href="/improve/" class="${active==='library'?'active':''}">Library (all topics)</a></li>
          <li><a href="/improve/long-game.html">Long Game</a></li>
          <li><a href="/improve/short-game.html">Short Game</a></li>
          <li><a href="/improve/mental-game.html">Mental Game</a></li>
          <li><a href="/improve/course-strategy.html">Course Strategy (DECADE)</a></li>
          <li><a href="/improve/first-tee-ready.html">First-Tee Ready</a></li>
          <li><a href="how-to-use.html" class="${active==='how-to-use'?'active':''}">How to use this portal</a></li>
        `)}

        ${group('Library', 'library-books', `
          <li><a href="/improve/bookshelf.html"><strong>Teaching Library</strong></a></li>
          <li class="nav-sublabel">New to golf?</li>
          <li><a href="/improve/just-starting.html"><strong>Just Starting &middot; Start Here</strong></a></li>
          <li class="nav-sublabel">Ryan's Framework</li>
          <li><a href="/improve/module-01-fundamentals.html">Module 01 &middot; Fundamentals</a></li>
          <li><a href="/improve/module-02-practice-design.html">Module 02 &middot; Practice Design</a></li>
          <li><a href="/improve/module-03-short-game.html">Module 03 &middot; Short Game</a></li>
          <li class="nav-sublabel">Primers on the books that shaped it</li>
          <li><a href="/improve/book-8-step-swing.html">8-Position Swing Map &middot; McLean</a></li>
          <li><a href="/improve/book-golfing-machine.html">Component Model &middot; Kelley</a></li>
          <li><a href="/improve/book-stack-and-tilt.html">Ball-First Swing &middot; Plummer &amp; Bennett</a></li>
        `)}

        <li class="nav-book">
          <a href="packages.html"
             class="nav-book-cta ${active==='packages'?'active':''}"
             style="display:inline-block; background:#C9A84C; color:#0D1F3C; padding:8px 16px; border-radius:6px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; font-size:12.5px; text-decoration:none; border:2px solid #C9A84C; transition:all .15s ease;">
            Book a Lesson &rarr;
          </a>
        </li>

        ${coachItem}

        <li class="nav-user-mobile">
          <div class="who">Signed in as <b>${RRG.esc(user.name || user.email)}</b></div>
          <button onclick="RRG.auth.logout()">Log out</button>
        </li>
      </ul>
      <div class="nav-scrim" id="rrg-nav-scrim" onclick="RRG.toggleNav()"></div>
      <div class="nav-user">
        <span>${RRG.esc(user.name || user.email)}</span>
        <span class="avatar">${RRG.esc(initials)}</span>
        <button onclick="RRG.auth.logout()">Log out</button>
      </div>
    </nav>`;
};

/* Toggle one nav group dropdown, closing any others. */
RRG.toggleNavGroup = function(evt, btn) {
  if (evt) evt.stopPropagation();
  const group = btn.closest('.nav-group');
  if (!group) return;
  const willOpen = !group.classList.contains('open');
  document.querySelectorAll('.nav-group.open').forEach(g => {
    if (g !== group) {
      g.classList.remove('open');
      const t = g.querySelector('.nav-group-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  });
  group.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
};

/* Close any open nav dropdowns on outside click / Escape. */
document.addEventListener('click', (e) => {
  if (e.target.closest('.nav-group')) return;
  document.querySelectorAll('.nav-group.open').forEach(g => {
    g.classList.remove('open');
    const t = g.querySelector('.nav-group-toggle');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.nav-group.open').forEach(g => {
    g.classList.remove('open');
    const t = g.querySelector('.nav-group-toggle');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
});

RRG.toggleNav = function() {
  const drawer = document.getElementById('rrg-nav-drawer');
  const scrim  = document.getElementById('rrg-nav-scrim');
  const toggle = document.querySelector('.nav-toggle');
  if (!drawer) return;
  const willOpen = !drawer.classList.contains('open');
  drawer.classList.toggle('open', willOpen);
  if (scrim)  scrim.classList.toggle('open', willOpen);
  if (toggle) toggle.classList.toggle('open', willOpen);
  document.body.style.overflow = willOpen ? 'hidden' : '';
};

RRG.renderFooter = function() {
  return `
    <footer class="site-footer no-print">
      RR Golf Performance &nbsp;·&nbsp; Adult Coaching 2026&trade; &nbsp;·&nbsp;
      <a href="mailto:ryan@rrgolfperformance.com">ryan@rrgolfperformance.com</a>
      &nbsp;·&nbsp; <a href="https://rrgolfperformance.com">rrgolfperformance.com</a>
    </footer>`;
};

/* Mount is ASYNC. Every page wraps its boot code in an async IIFE that awaits it.
   Example:  (async () => { const user = await RRG.mount('dashboard'); if (!user) return; ... })(); */
RRG.mount = async function(activeNav = '') {
  const user = await RRG.auth.requireAuth();
  if (!user) return null;
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.outerHTML = RRG.renderNav(user, activeNav);
  const footMount = document.getElementById('footer-mount');
  if (footMount) footMount.outerHTML = RRG.renderFooter();
  return user;
};

/* Debounced print — iOS Safari re-fires its "blocked from automatically
   printing" dialog if window.print() is called in quick succession. */
let _rrgPrintLock = false;
window.rrgPrint = function(btn) {
  if (_rrgPrintLock) return;
  _rrgPrintLock = true;
  if (btn) { btn.disabled = true; setTimeout(() => btn.disabled = false, 1500); }
  setTimeout(() => _rrgPrintLock = false, 1500);
  try { window.print(); } catch (e) { /* Safari may block */ }
};
