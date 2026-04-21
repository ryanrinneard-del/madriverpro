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

  async create({ defaultPackage = null, note = '' } = {}) {
    await RRG._sbReady;
    const { data, error } = await RRG.sb.rpc('create_invite', {
      p_cohort: RRG.COHORT,
      p_default_package: defaultPackage,
      p_note: note || null,
      p_expires_at: null,
    });
    if (error) throw error;
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
    ? `<li class="nav-coach"><a href="coach.html" class="${active==='coach'?'active':''}">Coach View</a></li>` : '';

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
          <li><a href="scorecard.html" class="${active==='scorecard'?'active':''}">Mad River Scorecard</a></li>
          <li><a href="handicap.html"  class="${active==='handicap'?'active':''}">Handicap Index</a></li>
          <li><a href="lessons.html"   class="${active==='lessons'?'active':''}">My Lessons</a></li>
          <li><a href="tiger5.html"    class="${active==='tiger5'?'active':''}">5 Errors to Avoid</a></li>
          <li><a href="profile.html"   class="${active==='profile'?'active':''}">Profile</a></li>
        `)}

        ${group('Tools', 'tools', `
          <li><a href="bag.html"          class="${active==='bag'?'active':''}">My Bag</a></li>
          <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
          <li><a href="trackman.html"     class="${active==='trackman'?'active':''}">TrackMan Sessions</a></li>
          <li><a href="packages.html"     class="${active==='packages'?'active':''}">Packages</a></li>
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

        ${group('Books', 'books', `
          <li><a href="/improve/bookshelf.html"><strong>The Bookshelf</strong></a></li>
          <li class="nav-sublabel">Volume 01</li>
          <li><a href="/improve/book-8-step-swing.html">The 8-Step Swing &mdash; McLean</a></li>
          <li class="nav-sublabel">Volume 02 &middot; Primer</li>
          <li><a href="/improve/book-golfing-machine.html">The Golfing Machine &mdash; Kelley</a></li>
          <li class="nav-sublabel">Volume 03 &middot; Primer</li>
          <li><a href="/improve/book-stack-and-tilt.html">Stack &amp; Tilt &mdash; Plummer &amp; Bennett</a></li>
        `)}

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
