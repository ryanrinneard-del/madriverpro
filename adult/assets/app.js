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
   NAV / FOOTER
   ============================================================ */
RRG.renderNav = function(user, active = '') {
  if (!user) return '';
  const initials = (user.name || user.email || 'RR')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const coachLink = user.role === 'coach'
    ? `<li><a href="coach.html" class="${active==='coach'?'active':''}">Coach View</a></li>` : '';
  return `
    <nav class="nav no-print">
      <div class="nav-brand">RR GOLF PERFORMANCE</div>
      <button class="nav-toggle" aria-label="Menu" onclick="RRG.toggleNav(this)">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="rrg-nav-drawer">
        <li class="nav-group-label">MY GAME</li>
        <li><a href="dashboard.html" class="${active==='dashboard'?'active':''}">Dashboard</a></li>
        <li><a href="history.html"   class="${active==='history'?'active':''}">My Rounds</a></li>
        <li><a href="tiger5.html"    class="${active==='tiger5'?'active':''}">Tiger 5</a></li>
        <li><a href="profile.html"   class="${active==='profile'?'active':''}">Profile</a></li>

        <li class="nav-group-label">TOOLS</li>
        <li><a href="bag.html"       class="${active==='bag'?'active':''}">My Bag</a></li>
        <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
        <li><a href="packages.html"  class="${active==='packages'?'active':''}">Packages</a></li>

        <li class="nav-group-label">LEARN</li>
        <li><a href="/improve/" class="${active==='library'?'active':''}">Library</a></li>
        <li><a href="how-to-use.html" class="${active==='how-to-use'?'active':''}">How to use this portal</a></li>

        ${coachLink}
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
