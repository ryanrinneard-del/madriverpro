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
RRG.COHORT = 'junior_elite_2026';

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

    /* ELITE / VIP PRE-FILL — if Ryan created this invite with a
       pending_profile payload (e.g. RRG-ELITE-2026 with
       junior_elite_accepted=true), merge it into the new player's
       profile_json so the Elite tier and any other pre-set fields
       take effect on first login.
       NOTE: junior_elite_accepted lives INSIDE profile_json — not as
       a top-level column on profiles. Don't try to write it as one. */
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
        const { data: updated, error: updErr } = await RRG.sb
          .from('profiles')
          .update({ profile_json: mergedJson })
          .eq('id', profile.id)
          .select()
          .maybeSingle();
        if (updErr) {
          console.warn('[invite] profile update failed', updErr);
        }
        if (updated) {
          RRG.auth._profileCache = updated;
          return updated;
        }
        profile.profile_json = mergedJson;
      }
    } catch (err) {
      console.warn('[invite] pending_profile merge failed', err);
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
   Mirrors the same RRG.approach utility in adult/assets/app.js so
   both portals share the same buckets, benchmarks, and rendering.
   ============================================================ */
RRG.approach = {
  BUCKETS: ['50-75','75-100','100-125','125-150','150-175','175-200','200-225','225+'],

  LABELS: {
    '50-75': '50–75y', '75-100': '75–100y', '100-125': '100–125y', '125-150': '125–150y',
    '150-175': '150–175y', '175-200': '175–200y', '200-225': '200–225y', '225+': '225+y',
  },

  // Approximate PGA Tour GIR% by approach distance bucket. Faded overlay.
  TOUR_GIR_PCT: {
    '50-75': 95, '75-100': 91, '100-125': 86, '125-150': 78,
    '150-175': 70, '175-200': 62, '200-225': 54, '225+': 45,
  },

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

  renderSpider(canvasEl, opts = {}) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded — spider chart skipped');
      return null;
    }
    const labels = this.BUCKETS.map(b => this.LABELS[b]);
    const datasets = [];

    if (opts.thisRoundAgg) {
      datasets.push({
        label: 'Your latest round',
        data: this.BUCKETS.map(b => opts.thisRoundAgg[b]?.pct ?? null),
        backgroundColor: 'rgba(201, 168, 76, 0.18)',
        borderColor:     'rgba(201, 168, 76, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(201, 168, 76, 1)',
        pointRadius: 4,
        spanGaps: false,
      });
    }
    if (opts.seasonAgg) {
      datasets.push({
        label: 'Your season average',
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
        label: 'Best players in the world',
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
   ROUNDS / LESSONS / VIDEOS — Phase 2 (still on localStorage/IDB)

   These continue to work on a single device for now. Auth is
   already cross-device, which was the critical fix. A follow-up
   commit moves these to Postgres tables (schema already in place).
   ============================================================ */
RRG.subs = {
  KEY: 'rrg_submissions_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  create(sub) {
    const entry = { id: 's_' + Date.now().toString(36), ...sub, createdAt: new Date().toISOString() };
    const list = this.all(); list.push(entry); this.save(list);
    return entry;
  },
  forUser(userId) {
    return this.all().filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  /* Called by portal/dashboard.html (week grid) and portal/week.html
     (submissions-this-week list). Was referenced but undefined before;
     this fixes the silent failure. */
  forUserWeek(userId, weekN) {
    return this.forUser(userId).filter(s => Number(s.week) === Number(weekN));
  },
};

RRG.lessons = {
  KEY: 'rrg_lessons_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  create(lesson) {
    const entry = { id: 'l_' + Date.now().toString(36), ...lesson, createdAt: new Date().toISOString() };
    const list = this.all(); list.push(entry); this.save(list);
    return entry;
  },
  update(id, patch) {
    const list = this.all();
    const i = list.findIndex(l => l.id === id);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    this.save(list);
    return list[i];
  },
  remove(id) { this.save(this.all().filter(l => l.id !== id)); },
  forUser(userId) {
    return this.all().filter(l => l.userId === userId)
      .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''));
  },
};

/* IndexedDB-backed video store — unchanged from the last revision. */
RRG.idb = {
  DB_NAME: 'rrg_video_store', STORE: 'videos', _dbPromise: null,
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
  KEY: 'rrg_videos_v1',
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
   ROUND SUMMARY — Good / Bad / Ugly post-submit panel.
   Categorizes the just-saved round into three buckets so the player
   gets instant feedback. Same logic powers the post-round modal on
   all four scorecards (adult + portal, home + away).
   ============================================================ */
RRG.renderRoundSummary = function(payload, mountEl, opts) {
  opts = opts || {};
  const historyUrl   = opts.historyUrl   || 'history.html';
  const dashboardUrl = opts.dashboardUrl || 'dashboard.html';

  const d = (payload && payload.derived) || {};
  const sg = payload && payload.strokes_gained;
  const score = payload && payload.score;
  const totalPar = (payload && payload.total_par) || ((d.par3_avg && d.par4_avg && d.par5_avg) ? null : null);

  const good = [], bad = [], ugly = [];

  // ----- score vs. par -----
  if (score != null && totalPar) {
    const overUnder = score - totalPar;
    const overUnderStr = overUnder === 0 ? 'E' : (overUnder > 0 ? `+${overUnder}` : `${overUnder}`);
    if (overUnder <= 0) good.push({ n: score, label: `Even or under par (${overUnderStr})`, sub: 'Mark this round.' });
    else if (overUnder <= 8) good.push({ n: score, label: `Score ${score} (${overUnderStr})`, sub: 'Solid round overall.' });
    else if (overUnder >= 18) ugly.push({ n: score, label: `Score ${score} (${overUnderStr})`, sub: 'A grind. Tomorrow is new.' });
    else bad.push({ n: score, label: `Score ${score} (${overUnderStr})`, sub: 'Room to tighten.' });
  } else if (score != null) {
    good.push({ n: score, label: `Total: ${score}`, sub: 'Round logged.' });
  }

  // ----- birdies / pars on hard holes -----
  if (d.birdies && d.birdies >= 1) {
    good.push({ n: d.birdies, label: `Birdie${d.birdies > 1 ? 's' : ''}`, sub: 'Always celebrate the birdie.' });
  }

  // ----- doubles+ -----
  if (d.doubles_plus === 0) {
    good.push({ n: 0, label: 'No doubles+', sub: 'Tiger 5 #2 in the green.' });
  } else if (d.doubles_plus >= 3) {
    ugly.push({ n: d.doubles_plus, label: `Double bogey or worse`, sub: 'These cost the round.' });
  } else if (d.doubles_plus >= 1) {
    bad.push({ n: d.doubles_plus, label: 'Double bogey or worse', sub: 'Limit these next time.' });
  }

  // ----- 3-putts -----
  if (d.three_putts === 0) {
    good.push({ n: 0, label: 'No 3-putts', sub: 'Putting held up.' });
  } else if (d.three_putts >= 3) {
    ugly.push({ n: d.three_putts, label: '3-putts', sub: 'Lag distance control needs work.' });
  } else if (d.three_putts >= 1) {
    bad.push({ n: d.three_putts, label: '3-putt' + (d.three_putts > 1 ? 's' : ''), sub: 'Tighten the lag putts.' });
  }

  // ----- fairways -----
  const fwPct = (typeof payload.fw_pct === 'number') ? payload.fw_pct : null;
  if (fwPct !== null) {
    if (fwPct >= 60) good.push({ n: `${fwPct}%`, label: 'Fairways hit', sub: 'In play off the tee.' });
    else if (fwPct < 30) ugly.push({ n: `${fwPct}%`, label: 'Fairways hit', sub: 'Driver was the leak today.' });
    else bad.push({ n: `${fwPct}%`, label: 'Fairways hit', sub: 'Costing yourself approach options.' });
  }

  // ----- GIR -----
  if (typeof payload.gir === 'number') {
    if (payload.gir >= 9) good.push({ n: payload.gir, label: 'Greens in regulation', sub: 'Approach work paid off.' });
    else if (payload.gir <= 2) ugly.push({ n: payload.gir, label: 'Greens in regulation', sub: 'Approaches missed all day.' });
  }

  // ----- penalty / OB tee shots -----
  const obCount = (d.tee_pattern && d.tee_pattern.X) || 0;
  if (obCount >= 3) ugly.push({ n: obCount, label: 'OB / penalty tee shots', sub: 'Disasters off the tee.' });
  else if (obCount >= 1) bad.push({ n: obCount, label: 'OB / penalty tee shot' + (obCount > 1 ? 's' : ''), sub: 'Cost you strokes you should have had.' });

  // ----- par-5 bogeys -----
  if (d.par5_bogeys >= 2) ugly.push({ n: d.par5_bogeys, label: 'Bogey-or-worse on par 5s', sub: 'Tiger 5 #1 — the scoring holes hurt.' });
  else if (d.par5_bogeys === 1) bad.push({ n: 1, label: 'Bogey on a par 5', sub: 'Par 5s are scoring chances.' });

  // ----- bogey with a scoring club (9-iron or less) -----
  if (d.scoring_club_bogeys >= 2) ugly.push({ n: d.scoring_club_bogeys, label: 'Bogey with 9ir or less in hand', sub: 'Tiger 5 #5 — the unforced errors.' });
  else if (d.scoring_club_bogeys === 1) bad.push({ n: 1, label: 'Bogey with 9ir or less in hand', sub: 'Strategic / mental, not a swing fault.' });

  // ----- easy saves blown -----
  if (d.easy_saves_blown >= 2) ugly.push({ n: d.easy_saves_blown, label: 'Blown easy saves', sub: 'Tiger 5 #3 — strokes given away around the green.' });
  else if (d.easy_saves_blown === 1) bad.push({ n: 1, label: 'Blown easy save', sub: 'Up-and-down was there.' });

  // ----- commitment % -----
  if (d.commitment_pct >= 80) good.push({ n: `${d.commitment_pct}%`, label: 'Fully committed shots', sub: 'Mental game stayed sharp.' });
  else if (d.commitment_pct < 50 && d.committed_n + d.weak_n >= 3) bad.push({ n: `${d.commitment_pct}%`, label: 'Fully committed shots', sub: 'Pre-shot routine slipping.' });

  // ----- SG top leak (always bring it forward) -----
  if (sg && sg.top_leak) {
    const leak = sg.top_leak;
    const def = (leak.deficit != null) ? `−${Number(leak.deficit).toFixed(1)} strokes` : '';
    ugly.push({ n: def || '!', label: `Biggest leak: ${leak.label || leak.category}`, sub: leak.summary || 'See your dashboard for the full breakdown + drill.' });
  }

  // ----- guarantee at least one Good item -----
  if (good.length === 0) {
    good.push({ n: '✓', label: 'Round logged', sub: 'Data captured. That\'s the foundation.' });
  }

  const renderItems = (items, emptyMsg) => {
    if (!items.length) return `<p class="rs-empty">${emptyMsg}</p>`;
    return '<ul class="rs-items">' + items.slice(0, 4).map(it => `
      <li><span class="rs-n">${it.n}</span><div><div class="rs-label">${it.label}</div><div class="rs-sub">${it.sub || ''}</div></div></li>
    `).join('') + '</ul>';
  };

  mountEl.innerHTML = `
    <div class="round-summary">
      <div class="rs-header">
        <div class="rs-kicker">Round complete</div>
        <h2>The Good, The Bad, The Ugly</h2>
        <p class="rs-subhead">Quick read on the round you just logged. Full numbers and trends live on your dashboard.</p>
      </div>
      <div class="rs-grid">
        <section class="rs-col rs-good">
          <h3>The Good</h3>
          ${renderItems(good, 'Nothing stood out as a clear win — log another round and we\'ll find one.')}
        </section>
        <section class="rs-col rs-bad">
          <h3>The Bad</h3>
          ${renderItems(bad, 'Nothing in the bad column — clean round.')}
        </section>
        <section class="rs-col rs-ugly">
          <h3>The Ugly</h3>
          ${renderItems(ugly, 'No disasters today. Nice.')}
        </section>
      </div>
      <div class="rs-where-note">
        <strong>Where to find this later:</strong> every round you log gets its own breakdown. Open <a href="${historyUrl}">My Rounds</a> and tap any round to pull this same Good / Bad / Ugly view back up. Your <a href="${dashboardUrl}">Dashboard</a> shows the running trends across all rounds.
      </div>
      <div class="rs-actions">
        <a href="${historyUrl}?new=1" class="btn btn-primary">View all my rounds &rarr;</a>
        <a href="${dashboardUrl}" class="btn">Go to dashboard</a>
      </div>
    </div>`;

  // Scroll the summary into view in case the page is long
  if (mountEl.scrollIntoView) mountEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ============================================================
   MILESTONES — progressive goals for Just Starting + Developing juniors.
   Same engine as the adult portal; ported over so each portal has its own
   copy (we load only one app.js at a time).

   Elite juniors (those Ryan has accepted via profile_json.junior_elite_accepted)
   see the full adult-grade Path-to-Goal widget instead of milestones.
   ============================================================ */
RRG.milestones = {
  all: [
    {
      id: 'first_9',
      title: 'Play your first 9-hole round',
      test(rounds) {
        const r = rounds.find(r => (r.holes === 9) || (r.score && r.score < 60));
        return { done: !!r, date: r?.round_date };
      },
    },
    {
      id: 'first_18',
      title: 'Play your first 18-hole round',
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
      description: 'Bogey golf is real',
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
      description: 'The biggest milestone in junior golf',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 100);
        return { done: !!r, date: r?.round_date, best };
      },
    },
    {
      id: 'break_90',
      title: 'Break 90',
      description: 'You\'re ready for Elite tier — ask Ryan',
      test(rounds) {
        const scores = rounds.map(r => +r.score).filter(n => !isNaN(n) && n > 0);
        const best = scores.length ? Math.min(...scores) : null;
        const r = rounds.find(r => r.score && r.score < 90);
        return { done: !!r, date: r?.round_date, best };
      },
    },
  ],

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

  fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
        .toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  },

  renderWidget({ user, rounds, variant = 'full' } = {}) {
    const res = RRG.milestones.evaluate(rounds || []);
    const completedCount = res.completed.length;
    const totalCount = RRG.milestones.all.length;
    const nextUp = res.upcoming.slice(0, variant === 'compact' ? 2 : 3);

    if (!rounds || rounds.length === 0) {
      return `
        <div class="ms-card">
          <div class="ms-kicker">Your Journey</div>
          <h3 class="ms-title">Ready for your first round?</h3>
          <p class="ms-sub">
            Once you've played &mdash; even just 9 holes &mdash; we'll track your progress
            through the milestones every golfer works toward. Score doesn't matter yet;
            just get out there and play.
          </p>
          <a href="log-simple.html" class="btn btn-primary">+ Log Your First Round</a>
        </div>`;
    }

    const recentDone = res.completed
      .filter(c => c.date)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 2);

    const doneHtml = recentDone.length ? recentDone.map(m => `
      <div class="ms-row ms-done">
        <div class="ms-icon">&check;</div>
        <div>
          <div class="ms-mt">${RRG.esc(m.title)}</div>
          <div class="ms-ms">${RRG.esc(RRG.milestones.fmtDate(m.date))}</div>
        </div>
      </div>`).join('') : '';

    const upHtml = nextUp.map(m => {
      let bestHint = '';
      if (m.best != null && m.id.startsWith('break_')) {
        bestHint = `<span class="ms-best">Best so far: <b>${m.best}</b></span>`;
      }
      return `
        <div class="ms-row ms-next">
          <div class="ms-icon ms-target">&cir;</div>
          <div>
            <div class="ms-mt">${RRG.esc(m.title)}</div>
            ${m.description ? `<div class="ms-ms">${RRG.esc(m.description)}</div>` : ''}
            ${bestHint}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="ms-card">
        <div class="ms-kicker">Your Journey &middot; ${completedCount} / ${totalCount} milestones</div>
        <h3 class="ms-title">Keep going. You're building something.</h3>
        <p class="ms-sub">Every round moves you forward. Here's what you've hit and what's next.</p>
        ${doneHtml ? `
          <div class="ms-section-label">Recently unlocked</div>
          <div class="ms-list">${doneHtml}</div>
        ` : ''}
        ${upHtml ? `
          <div class="ms-section-label">What's next</div>
          <div class="ms-list">${upHtml}</div>
        ` : '<p class="ms-sub" style="margin-top:10px;">You\'ve hit every milestone. Time to ask Ryan about Elite tier.</p>'}
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

  // Elite-tier check — pulls from the profile cache populated by
  // RRG.auth.completeSignupIfNeeded(). Coaches always see the Elite items.
  const profile = (RRG.auth && RRG.auth._profileCache) || null;
  const pj = (profile && profile.profile_json) || {};
  const tier = (pj.s1_skill_level || pj.skill_level || '').toLowerCase();
  const isElite = user.role === 'coach' ||
    ((tier === 'elite' || pj.junior_elite_accepted) &&
     tier !== 'just_starting' && tier !== 'developing');

  // Elite-only nav block — Away scorecard, TrackMan sessions, handicap index.
  // Hidden for non-Elite players. Mad River Scorecard is now a top-level
  // nav item (rendered separately below) so it gets one-tap access on every page.
  const eliteItems = isElite ? `
    <li class="nav-sublabel">Elite tier</li>
    <li><a href="scorecard-away.html" class="${active==='scorecard-away'?'active':''}">Away Scorecard</a></li>
    <li><a href="trackman.html"       class="${active==='trackman'?'active':''}">TrackMan Sessions</a></li>
    <li><a href="handicap.html"       class="${active==='handicap'?'active':''}">Handicap Index</a></li>
  ` : '';

  // Top-level Scorecard link — Elite-only. One-tap access from anywhere
  // in the portal, since logging a round is the highest-frequency player action.
  const scorecardTopLevel = isElite ? `
    <li class="nav-top-link">
      <a href="scorecard.html" class="${active==='scorecard-madriver'?'active':''}">Scorecard</a>
    </li>` : '';

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

        ${scorecardTopLevel}

        ${group('My Game', 'mygame', `
          <li><a href="dashboard.html"  class="${active==='dashboard'?'active':''}">Dashboard</a></li>
          <li><a href="log-simple.html" class="${active==='log-simple'?'active':''}">Log a Round &middot; Simple</a></li>
          <li><a href="history.html"    class="${active==='history'?'active':''}">My Rounds</a></li>
          <li><a href="tiger5.html"     class="${active==='tiger5'?'active':''}">5 Errors to Avoid</a></li>
          <li><a href="profile.html"    class="${active==='profile'?'active':''}">Profile</a></li>
          ${eliteItems}
        `)}

        ${group('Tools', 'tools', `
          <li><a href="bag.html"          class="${active==='bag'?'active':''}">My Bag</a></li>
          <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
          <li><a href="games.html"        class="${active==='games'?'active':''}"><strong>🎲 Games &amp; Drills</strong></a></li>
        `)}

        ${group('Learn', 'learn', `
          <li><a href="just-starting.html" class="${active==='just-starting'?'active':''}"><strong>Just Starting &mdash; Start Here</strong></a></li>
          <li><a href="/improve/basics.html">The Basics (plain English)</a></li>
          <li class="nav-sublabel">Deeper reference</li>
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
          <li class="nav-sublabel">Ryan's Framework</li>
          <li><a href="/improve/module-01-fundamentals.html">Module 01 &middot; Swing Fundamentals</a></li>
          <li><a href="/improve/module-02-practice-design.html">Module 02 &middot; Practice Design</a></li>
          <li><a href="/improve/module-03-short-game.html">Module 03 &middot; Short Game</a></li>
          <li class="nav-sublabel">Short Game skill pages</li>
          <li><a href="/improve/sg-putting.html">Putting</a></li>
          <li><a href="/improve/sg-chipping.html">Chipping</a></li>
          <li><a href="/improve/sg-pitching.html">Pitching</a></li>
          <li><a href="/improve/sg-bunker.html">Greenside Bunker</a></li>
          <li><a href="/improve/sg-lob.html">The Lob Shot</a></li>
          <li class="nav-sublabel">Primers on the books that shaped Ryan's teaching</li>
          <li><a href="/improve/book-8-step-swing.html">8-Position Map &middot; McLean</a></li>
          <li><a href="/improve/book-golfing-machine.html">Component Model &middot; Kelley</a></li>
          <li><a href="/improve/book-stack-and-tilt.html">Ball-First Swing &middot; P&amp;B</a></li>
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
      RR Golf Performance &nbsp;·&nbsp; Junior Elite Academy 2026 &nbsp;·&nbsp;
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
