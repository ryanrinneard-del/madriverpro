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
          <li><a href="dashboard.html"  class="${active==='dashboard'?'active':''}">Dashboard</a></li>
          <li><a href="log-simple.html" class="${active==='log-simple'?'active':''}">Log a Round &middot; Simple</a></li>
          <li><a href="history.html"    class="${active==='history'?'active':''}">My Rounds</a></li>
          <li><a href="tiger5.html"     class="${active==='tiger5'?'active':''}">5 Errors to Avoid</a></li>
          <li><a href="profile.html"    class="${active==='profile'?'active':''}">Profile</a></li>
        `)}

        ${group('Tools', 'tools', `
          <li><a href="bag.html"          class="${active==='bag'?'active':''}">My Bag</a></li>
          <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
        `)}

        ${group('Learn', 'learn', `
          <li><a href="just-starting.html" class="${active==='just-starting'?'active':''}"><strong>Just Starting &mdash; Start Here</strong></a></li>
          <li><a href="/improve/basics.html">The Basics (plain English)</a></li>
          <li class="nav-sublabel">Deeper reference</li>
          <li><a href="/improve/" class="${active==='library'?'active':''}">Library (all topics)</a></li>
          <li><a href="/improve/first-tee-ready.html">First-Tee Ready</a></li>
          <li><a href="how-to-use.html" class="${active==='how-to-use'?'active':''}">How to use this portal</a></li>
        `)}

        ${group('Library', 'library-books', `
          <li><a href="/improve/bookshelf.html"><strong>Teaching Library</strong></a></li>
          <li class="nav-sublabel">Primers on the books that shaped Ryan's teaching</li>
          <li><a href="/improve/module-01-fundamentals.html">Module 01 &middot; Swing Fundamentals</a></li>
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
