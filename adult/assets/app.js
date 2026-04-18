/* ============================================================
   RR GOLF PERFORMANCE — Adult Coaching Portal
   app.js — auth, storage, navigation, UI helpers

   Storage keys are prefixed `rrgA_` to keep adult portal data
   isolated from the junior portal running at /portal/ on the
   same domain (they share localStorage).

   NOTE: Prototype uses localStorage for persistence. Swap the
   AUTH / USER STORE / SUBMISSIONS / VIDEOS / INVITES sections
   for real backend calls (Supabase + Vercel Blob for video)
   when the portal ships. See README.md.
   ============================================================ */

window.RRG = window.RRG || {};

/* ---------- helpers ---------- */
RRG.$ = (sel, ctx = document) => ctx.querySelector(sel);
RRG.$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
RRG.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

RRG.qs = (k) => new URLSearchParams(location.search).get(k);

RRG.toast = (msg, ms = 2800) => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
};

RRG.fmtDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return iso; }
};

RRG.fmtBytes = (n) => {
  if (!n) return '—';
  const u = ['B','KB','MB','GB'];
  let i = 0; n = +n;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(i === 0 ? 0 : 1) + ' ' + u[i];
};

/* ============================================================
   AUTH
   ============================================================ */
RRG.auth = {
  KEY: 'rrgA_session_v1',

  currentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.currentUser(); },

  async signup({ name, email, password, dob, handicap, homeClub, inviteCode, packageId }) {
    const invite = RRG.invites.find(inviteCode);
    if (!invite) throw new Error('That invite code is not valid.');
    if (invite.usedBy) throw new Error('That invite code has already been used.');
    if (invite.expiresAt && invite.expiresAt < new Date().toISOString()) {
      throw new Error('That invite code has expired.');
    }
    const users = RRG.users.all();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with that email already exists.');
    }
    const pkg = RRG.PACKAGES.find(p => p.id === packageId)
      || invite.defaultPackage
      || RRG.PACKAGES.find(p => p.id === 'p5');
    const user = {
      id: 'u_' + Date.now().toString(36),
      name, email,
      passwordHash: btoa(password + '|rrgA'),
      dob: dob || '',
      handicap: handicap || '',
      homeClub: homeClub || '',
      role: 'player',
      profile: null,
      package: pkg ? { id: pkg.id, name: pkg.name, lessons: pkg.lessons, startedAt: new Date().toISOString() } : null,
      lessonsUsed: 0,
      invitedBy: invite.issuedBy || 'coach',
      createdAt: new Date().toISOString(),
    };
    RRG.users.save([...users, user]);
    RRG.invites.markUsed(inviteCode, user.id);
    this._setSession(user);
    return user;
  },

  async login(email, password) {
    if (email === 'ryan@rrgolfperformance.com' && password === 'coach2026') {
      const coach = { id: 'coach_ryan', name: 'Ryan Rinneard', email, role: 'coach' };
      this._setSession(coach);
      return coach;
    }
    const user = RRG.users.all().find(
      u => u.email.toLowerCase() === email.toLowerCase()
        && u.passwordHash === btoa(password + '|rrgA')
    );
    if (!user) throw new Error('Email or password is incorrect.');
    this._setSession(user);
    return user;
  },

  logout() { localStorage.removeItem(this.KEY); location.href = 'index.html'; },

  _setSession(user) {
    const safe = { ...user }; delete safe.passwordHash;
    localStorage.setItem(this.KEY, JSON.stringify(safe));
  },

  requireAuth() {
    if (!this.isLoggedIn()) { location.replace('index.html'); return null; }
    return this.currentUser();
  },
};

/* ============================================================
   USER STORE
   ============================================================ */
RRG.users = {
  KEY: 'rrgA_users_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  update(userId, patch) {
    const list = this.all();
    const i = list.findIndex(u => u.id === userId);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    this.save(list);
    const current = RRG.auth.currentUser();
    if (current?.id === userId) RRG.auth._setSession(list[i]);
    return list[i];
  },
};

/* ============================================================
   INVITES
   ============================================================ */
RRG.invites = {
  KEY: 'rrgA_invites_v1',
  SEED_KEY: 'rrgA_invites_seeded_v1',
  all() { this._seedIfEmpty(); try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  find(code) {
    if (!code) return null;
    return this.all().find(i => i.code.toLowerCase() === String(code).trim().toLowerCase());
  },
  create({ issuedBy = 'coach', defaultPackage = null, note = '' } = {}) {
    const code = this._generateCode();
    const list = this.all();
    const invite = {
      code, issuedBy, defaultPackage, note,
      usedBy: null,
      createdAt: new Date().toISOString(),
      expiresAt: null,
    };
    list.push(invite);
    this.save(list);
    return invite;
  },
  markUsed(code, userId) {
    const list = this.all();
    const i = list.findIndex(inv => inv.code.toLowerCase() === code.toLowerCase());
    if (i === -1) return;
    list[i].usedBy = userId;
    list[i].usedAt = new Date().toISOString();
    this.save(list);
  },
  revoke(code) {
    const list = this.all().filter(i => i.code.toLowerCase() !== code.toLowerCase());
    this.save(list);
  },
  _generateCode() {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const g = () => Array.from({length:4}, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
    return `RRA-${g()}-${g()}`;
  },
  _seedIfEmpty() {
    if (localStorage.getItem(this.SEED_KEY)) return;
    const existing = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    if (existing.length === 0) {
      const demo = [
        { code: 'RRA-DEMO-2026', issuedBy: 'coach', defaultPackage: null, note: 'Demo invite', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
        { code: 'RRA-ADULT-01', issuedBy: 'coach', defaultPackage: null, note: 'Starter code 1', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
        { code: 'RRA-ADULT-02', issuedBy: 'coach', defaultPackage: null, note: 'Starter code 2', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
      ];
      localStorage.setItem(this.KEY, JSON.stringify(demo));
    }
    localStorage.setItem(this.SEED_KEY, '1');
  },
};

/* ============================================================
   LESSONS — scheduled 1-on-1 lessons (fully custom per player)
   Ryan creates/schedules lessons from the coach view. Each lesson
   has: date, focus, pre-work, and (after completion) a debrief.
   ============================================================ */
RRG.lessons = {
  KEY: 'rrgA_lessons_v1',
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
  remove(id) {
    const list = this.all().filter(l => l.id !== id);
    this.save(list);
  },
  forUser(userId) {
    return this.all().filter(l => l.userId === userId)
      .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''));
  },
};

/* ============================================================
   SUBMISSIONS — scorecards from on-course rounds
   ============================================================ */
RRG.subs = {
  KEY: 'rrgA_submissions_v1',
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
};

/* ============================================================
   IDB — IndexedDB store for video blobs (persistent across
   page navigations and reloads, unlike URL.createObjectURL).
   Metadata still lives in localStorage via RRG.videos.
   Production swap: Vercel Blob (see README).
   ============================================================ */
RRG.idb = {
  DB_NAME: 'rrgA_video_store',
  STORE: 'videos',
  _dbPromise: null,

  _open() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB not supported in this browser.')); return; }
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
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted — likely storage quota exceeded.'));
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

  // Returns a fresh blob URL for the given video ID (or null if not stored).
  // Caller should revoke the URL when done to avoid memory leaks.
  async blobUrlFor(id) {
    try {
      const blob = await this.getVideo(id);
      return blob ? URL.createObjectURL(blob) : null;
    } catch (e) {
      console.warn('[RRG.idb] blobUrlFor failed', id, e);
      return null;
    }
  },
};

/* ============================================================
   VIDEOS — swing video uploads (metadata only; file in IDB)

   PROTOTYPE: metadata in localStorage, actual video file in
   IndexedDB under the same id. Production swap-in uses Vercel
   Blob (already in Ryan's CSP allow-list):
     import { put } from '@vercel/blob';
     const { url } = await put(`videos/${userId}/${id}-${filename}`, file,
       { access: 'public' });
   Then save `url` on the record and remove the IDB step.
   ============================================================ */
RRG.videos = {
  KEY: 'rrgA_videos_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  create(video) {
    const entry = { id: 'v_' + Date.now().toString(36), ...video, createdAt: new Date().toISOString() };
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
    // Remove metadata AND the actual blob from IDB
    const list = this.all().filter(x => x.id !== id);
    this.save(list);
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
RRG.renderNav = function(active = '') {
  const user = RRG.auth.currentUser();
  if (!user) return '';
  const initials = (user.name || 'RR').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const coachLink = user.role === 'coach'
    ? `<li><a href="coach.html" class="${active==='coach'?'active':''}">Coach View</a></li>` : '';
  // Videos temporarily hidden from the main nav until the Vercel Blob upload
  // pipeline is wired. Pages are still accessible at /adult/videos.html and
  // /adult/upload-video.html for testing.
  return `
    <nav class="nav no-print">
      <div class="nav-brand">RR GOLF PERFORMANCE</div>
      <button class="nav-toggle" aria-label="Menu" onclick="RRG.toggleNav(this)">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="rrg-nav-drawer">
        <li><a href="dashboard.html" class="${active==='dashboard'?'active':''}">Dashboard</a></li>
        <li><a href="history.html" class="${active==='history'?'active':''}">My Rounds</a></li>
        <li><a href="profile.html" class="${active==='profile'?'active':''}">Profile</a></li>
        <li><a href="bag.html" class="${active==='bag'?'active':''}">My Bag</a></li>
        <li><a href="wedge-matrix.html" class="${active==='wedge'?'active':''}">Wedge Matrix</a></li>
        <li><a href="tiger5.html" class="${active==='tiger5'?'active':''}">Tiger 5</a></li>
        ${coachLink}
        <li class="nav-user-mobile">
          <div class="who">Signed in as <b>${RRG.esc(user.name)}</b></div>
          <button onclick="RRG.auth.logout()">Log out</button>
        </li>
      </ul>
      <div class="nav-scrim" id="rrg-nav-scrim" onclick="RRG.toggleNav()"></div>
      <div class="nav-user">
        <span>${RRG.esc(user.name)}</span>
        <span class="avatar">${RRG.esc(initials)}</span>
        <button onclick="RRG.auth.logout()">Log out</button>
      </div>
    </nav>
  `;
};

RRG.toggleNav = function(btn) {
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
    </footer>
  `;
};

RRG.mount = function(activeNav = '') {
  const user = RRG.auth.requireAuth();
  if (!user) return null;
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.outerHTML = RRG.renderNav(activeNav);
  const footMount = document.getElementById('footer-mount');
  if (footMount) footMount.outerHTML = RRG.renderFooter();
  return user;
};
