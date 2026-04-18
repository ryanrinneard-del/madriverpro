/* ============================================================
   RR GOLF PERFORMANCE — Junior Elite Academy Portal
   app.js — auth, storage, navigation, UI helpers

   NOTE: This prototype uses localStorage for persistence. Swap
   the three labelled sections (AUTH, USER STORE, SUBMISSIONS)
   for real backend calls (Supabase / Firebase / custom) when
   the portal is deployed. See README.md for a full production
   architecture.
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

/* ============================================================
   AUTH (replace with Supabase / Firebase for production)
   ============================================================ */
RRG.auth = {
  KEY: 'rrg_session_v1',

  currentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); }
    catch { return null; }
  },

  isLoggedIn() { return !!this.currentUser(); },

  async signup({ name, email, password, dob, handicap, homeClub, inviteCode }) {
    // Validate invite code — portal is invite-only
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
    // NOTE: Passwords should NEVER be stored plaintext in production.
    // This prototype stores a hashed-looking string for demo only.
    const user = {
      id: 'u_' + Date.now().toString(36),
      name, email,
      passwordHash: btoa(password + '|rrg'),   // prototype only
      dob: dob || '',
      handicap: handicap || '',
      homeClub: homeClub || '',
      role: 'player',
      profile: null,       // Know Your Game
      cohort: invite.cohort || 'junior-elite-2026',
      invitedBy: invite.issuedBy || 'coach',
      createdAt: new Date().toISOString(),
    };
    RRG.users.save([...users, user]);
    RRG.invites.markUsed(inviteCode, user.id);
    this._setSession(user);
    return user;
  },

  async login(email, password) {
    // Built-in coach credentials for demo
    if (email === 'ryan@rrgolfperformance.com' && password === 'coach2026') {
      const coach = {
        id: 'coach_ryan', name: 'Ryan Rinneard',
        email, role: 'coach',
      };
      this._setSession(coach);
      return coach;
    }
    const user = RRG.users.all().find(
      u => u.email.toLowerCase() === email.toLowerCase()
        && u.passwordHash === btoa(password + '|rrg')
    );
    if (!user) throw new Error('Email or password is incorrect.');
    this._setSession(user);
    return user;
  },

  logout() {
    localStorage.removeItem(this.KEY);
    location.href = 'index.html';
  },

  _setSession(user) {
    const safe = { ...user }; delete safe.passwordHash;
    localStorage.setItem(this.KEY, JSON.stringify(safe));
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      location.replace('index.html');
      return null;
    }
    return this.currentUser();
  },
};

/* ============================================================
   USER STORE (replace with Postgres table + row-level security)
   ============================================================ */
RRG.users = {
  KEY: 'rrg_users_v1',
  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  update(userId, patch) {
    const list = this.all();
    const i = list.findIndex(u => u.id === userId);
    if (i === -1) return;
    list[i] = { ...list[i], ...patch };
    this.save(list);
    // refresh session copy if the patched user is current
    const current = RRG.auth.currentUser();
    if (current?.id === userId) {
      RRG.auth._setSession(list[i]);
    }
    return list[i];
  },
};

/* ============================================================
   INVITES (replace with `invites` table + coach-gated API)
   Each code is single-use and optionally expires. In production
   Ryan generates codes from the coach view; each is emailed to
   the invited player with a signup link.
   ============================================================ */
RRG.invites = {
  KEY: 'rrg_invites_v1',
  SEED_KEY: 'rrg_invites_seeded_v1',

  all() {
    this._seedIfEmpty();
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  find(code) {
    if (!code) return null;
    return this.all().find(i =>
      i.code.toLowerCase() === String(code).trim().toLowerCase());
  },
  create({ issuedBy = 'coach', cohort = 'junior-elite-2026', note = '' } = {}) {
    const code = this._generateCode();
    const list = this.all();
    const invite = {
      code, issuedBy, cohort, note,
      usedBy: null,
      createdAt: new Date().toISOString(),
      expiresAt: null,    // can be set in coach view later
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
    // Human-friendly 8-char code, ambiguous chars removed
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const g = () => Array.from({length:4}, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
    return `RRG-${g()}-${g()}`;
  },
  _seedIfEmpty() {
    // Drop a few starter demo codes so the prototype is usable
    if (localStorage.getItem(this.SEED_KEY)) return;
    const existing = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    if (existing.length === 0) {
      const demo = [
        { code: 'RRG-DEMO-2026', issuedBy: 'coach', cohort: 'junior-elite-2026', note: 'Demo invite', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
        { code: 'RRG-ELITE-01', issuedBy: 'coach', cohort: 'junior-elite-2026', note: 'Starter code 1', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
        { code: 'RRG-ELITE-02', issuedBy: 'coach', cohort: 'junior-elite-2026', note: 'Starter code 2', usedBy: null, createdAt: new Date().toISOString(), expiresAt: null },
      ];
      localStorage.setItem(this.KEY, JSON.stringify(demo));
    }
    localStorage.setItem(this.SEED_KEY, '1');
  },
};

/* ============================================================
   SUBMISSIONS (replace with scorecards table + API route)
   On submit, production will POST to /api/submit which:
     1. saves to DB
     2. emails ryan@rrgolfperformance.com with parsed round
     3. triggers a Performance Doc draft generation
   ============================================================ */
RRG.subs = {
  KEY: 'rrg_submissions_v1',
  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  create(sub) {
    const entry = { id: 's_' + Date.now().toString(36), ...sub, createdAt: new Date().toISOString() };
    const list = this.all();
    list.push(entry);
    this.save(list);
    return entry;
  },
  forUser(userId) {
    return this.all().filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  forUserWeek(userId, week) {
    return this.forUser(userId).filter(s => s.week === week);
  },
};

/* ============================================================
   WEEK STATUS HELPERS
   ============================================================ */
RRG.weekStatus = function(week, user) {
  const today = new Date().toISOString().slice(0, 10);
  const subs = RRG.subs.forUserWeek(user.id, week.n);
  if (subs.length > 0) return 'complete';
  if (week.open > today) return 'locked';
  return 'current';
};

/* ============================================================
   NAVIGATION BAR RENDER
   ============================================================ */
RRG.renderNav = function(active = '') {
  const user = RRG.auth.currentUser();
  if (!user) return '';
  const initials = (user.name || 'RR').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const coachLink = user.role === 'coach'
    ? `<li><a href="coach.html" class="${active==='coach'?'active':''}">Coach View</a></li>` : '';
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

// Debounced print. iOS Safari re-fires its "blocked from automatically
// printing" dialog if window.print() is called in quick succession; locking
// for 1.5s between fires stops the loop.
let _rrgPrintLock = false;
window.rrgPrint = function(btn) {
  if (_rrgPrintLock) return;
  _rrgPrintLock = true;
  if (btn) { btn.disabled = true; setTimeout(() => btn.disabled = false, 1500); }
  setTimeout(() => _rrgPrintLock = false, 1500);
  try { window.print(); } catch (e) { /* Safari may block; user can use Share \u2192 Print */ }
};

RRG.renderFooter = function() {
  return `
    <footer class="site-footer no-print">
      RR Golf Performance &nbsp;·&nbsp; Junior Elite Academy 2026 &nbsp;·&nbsp;
      <a href="mailto:ryan@rrgolfperformance.com">ryan@rrgolfperformance.com</a>
      &nbsp;·&nbsp; <a href="https://rrgolfperformance.com">rrgolfperformance.com</a>
    </footer>
  `;
};

/* ============================================================
   MOUNT — call on every logged-in page
   ============================================================ */
RRG.mount = function(activeNav = '') {
  const user = RRG.auth.requireAuth();
  if (!user) return null;
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.outerHTML = RRG.renderNav(activeNav);
  const footMount = document.getElementById('footer-mount');
  if (footMount) footMount.outerHTML = RRG.renderFooter();
  return user;
};

/* ============================================================
   EMAIL PREVIEW (shows what would send to coach on real deploy)
   ============================================================ */
RRG.previewEmail = function(subject, body) {
  const pre = document.createElement('pre');
  pre.style.cssText = 'white-space:pre-wrap;background:#F7F8FA;border:1px solid #DDE3EC;padding:14px;border-radius:6px;font-size:12px;max-width:640px;';
  pre.textContent = `To: ryan@rrgolfperformance.com\nFrom: portal@rrgolfperformance.com\nSubject: ${subject}\n\n${body}`;
  return pre;
};
