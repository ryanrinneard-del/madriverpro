# RR Golf Performance — Junior Elite Academy Portal

A private, brand-matched web portal for the 15-week Junior Elite Academy. Each player
gets their own login, their own dashboard, their own submission history, and their own
Performance Docs. Ryan has a coach-side view of the whole cohort.

This folder is a **working prototype** — open `index.html` in any modern browser and it runs.
It uses `localStorage` for auth and data so you can see and feel the whole experience before
a single line of server code is written. When you're ready to productionize, the swap-in points
are clearly marked (see "Production plan" below).

---

## Demo walk-through (5 minutes)

1. Open `index.html` → you'll see the login screen.
2. Click **Apply to Junior Elite** → create a player account (any email/password ≥ 8 chars).
3. You'll land on **Know Your Game** — the confidential profile. Fill it out (honestly!) and save.
4. You'll land on the **Dashboard**. See all 15 weeks, your current week highlighted, the SCJGT schedule.
5. Click into any week → read the full week plan.
6. Click **Submit My Round** → log a round with FIR / GIR / putts / Tiger 5 tally / reflection.
7. View **My Rounds** (history.html) to see everything you've logged.
8. Print the **Tiger 5 scorecard** and the **Wedge Matrix** (they're print-optimized).
9. Log out, log back in as coach: `ryan@rrgolfperformance.com` / `coach2026` → see the **Coach View** with cohort stats and the submission stream.

---

## File tree

```
rrgolf-portal/
├── index.html            # Login
├── signup.html           # Apply / create account
├── dashboard.html        # Player home — 15-week grid, stats, SCJGT schedule
├── week.html             # Week detail (?n=1..15)
├── submit-round.html     # Scorecard submission form (?week=N optional)
├── history.html          # My Rounds — full submission history + detail view
├── profile.html          # Know Your Game confidential questionnaire
├── tiger5.html           # Live Tiger 5 tally + printable on-course card
├── wedge-matrix.html     # Editable, saveable, printable wedge yardage matrix
├── coach.html            # Coach view — roster, profiles, submission stream
├── assets/
│   ├── styles.css        # Full brand system (navy/gold, Helvetica, print styles)
│   ├── data.js           # Curriculum: 15 weeks, 12 Codes, Tiger 5, SCJGT 2026
│   └── app.js            # Auth, storage, nav, helpers
└── README.md             # This file
```

Everything is **vanilla HTML / CSS / JS**. No build step, no dependencies, no framework.
This keeps the prototype portable and makes it trivial to host on any static host
(Vercel, Netlify, Cloudflare Pages, GitHub Pages) in the short term.

---

## Brand system

Pulled directly from the RR Golf Performance PDF spec:

| Token | Hex | Use |
| --- | --- | --- |
| `--navy` | `#0A1628` | Primary background, nav bar, header accents |
| `--navy-mid` | `#1A2E4A` | Secondary navy for section blocks |
| `--gold` | `#C9A84C` | Accent: rules, labels, priority lines, primary CTA |
| `--cream` | `#FBF9F2` | Soft highlights, callouts |
| `--light-bg` | `#F7F8FA` | Card / cell backgrounds |
| `--mid-grey` | `#8A9BB0` | Meta text, footer text |
| `--dark-text` | `#1A1A2E` | Body copy |
| `--rule` | `#DDE3EC` | Light divider lines |

Type: Helvetica Neue → Helvetica → Arial (system stack, no web font required).

---

## Production plan (the real portal)

The three prototype layers in `assets/app.js` are clearly labeled `AUTH`, `USER STORE`,
`SUBMISSIONS`. They are the only code you need to swap to go from localStorage prototype
to real portal. Here is the recommended stack.

### 1. Host

**Recommendation: Vercel** (or Netlify) on the subdomain `portal.rrgolfperformance.com`.
- Connect to a private GitHub repo.
- Auto-deploy on push.
- Add custom domain, free SSL.
- Same static files — no rebuild needed at the HTML/CSS level.

### 2. Auth

**Recommendation: [Supabase Auth](https://supabase.com/docs/guides/auth)**. It gives you:
- Email + password, magic links, Google/Apple OAuth out of the box.
- Row-Level Security (RLS) so each player can only see their own rows.
- JavaScript SDK that drops into the existing code.

Swap the `RRG.auth` block in `app.js`:

```js
// prototype
async login(email, password) { /* localStorage */ }

// production
import { createClient } from '@supabase/supabase-js';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async login(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}
```

### 3. Database (Supabase Postgres)

Three tables, with RLS policies so players can only see their own rows:

```sql
-- users is managed by Supabase Auth; we add a profile row
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null,
  dob date,
  handicap text,
  home_club text,
  cohort text default 'junior-elite-2026',
  role text default 'player',           -- 'player' | 'coach'
  know_your_game jsonb,                 -- the full questionnaire
  wedge_matrix jsonb,                   -- saved wedge matrix
  created_at timestamptz default now()
);

-- Scorecards
create table rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  week int,
  round_date date,
  course text,
  tees text,
  format text,
  holes int,
  score int,
  fir text,
  gir text,
  putts int,
  three_putts int,
  up_down text,
  penalties int,
  lost_balls int,
  tiger5 jsonb,            -- {1:x, 2:x, 3:x, 4:x, 5:x}
  tiger5_total int,
  reflection_good text,
  reflection_bad text,
  routine_score int,
  one_thing text,
  created_at timestamptz default now()
);

-- Coach's Performance Docs back to players
create table performance_docs (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  doc jsonb,               -- structured content
  pdf_url text,            -- link to generated PDF
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- RLS policies (example)
alter table rounds enable row level security;
create policy "Players read own rounds" on rounds for select using (auth.uid() = user_id);
create policy "Coach reads all rounds" on rounds for select using (
  (select role from profiles where id = auth.uid()) = 'coach'
);
create policy "Players insert own rounds" on rounds for insert with check (auth.uid() = user_id);
```

### 4. Email on submit

**Recommendation: [Resend](https://resend.com)** — free tier, simple API, great deliverability.

Wire up a Supabase Edge Function triggered on `rounds` insert:

```ts
// supabase/functions/notify-round/index.ts
import { Resend } from 'npm:resend';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  const { record } = await req.json();
  const player = await getProfile(record.user_id);
  await resend.emails.send({
    from: 'portal@rrgolfperformance.com',
    to: 'ryan@rrgolfperformance.com',
    subject: `[Junior Elite · W${record.week}] ${player.name} submitted a round`,
    html: renderRoundEmail(player, record),
  });
});
```

The in-portal hook already calls `RRG.subs.create()`. Point that at `/api/rounds`
(or a Supabase insert) and the email fires automatically.

### 5. Performance Doc generation

The Performance Doc is a one-page PDF Ryan hands the player at their next session.
Two paths:

1. **Manual for v1.** Ryan reads the submission, fills a form in the coach view,
   clicks "Generate PDF." Use the existing `junior_elite_academy_2026.py` ReportLab
   pipeline as the starting template (same brand) — swap the content per player.
2. **AI-assisted for v2.** Feed the last 3 rounds + the player's profile to a
   Claude API call with a brand-constrained prompt; Ryan reviews and approves
   before send.

### 6. Analytics

Add [Plausible](https://plausible.io) or [Fathom](https://usefathom.com) for
privacy-friendly usage stats. No cookies, GDPR-safe, 2-line install.

### 7. Suggested rollout

| Phase | Scope | Time |
| --- | --- | --- |
| 1 | Static host at `portal.rrgolfperformance.com`, localStorage prototype live | 1 day |
| 2 | Supabase auth + profiles table, email + password login | 2–3 days |
| 3 | Rounds + performance_docs tables, submission pipeline, Resend integration | 2–3 days |
| 4 | Coach view wired to live data, Performance Doc generator (manual) | 2–3 days |
| 5 | Mobile PWA polish, push/email reminders for open weeks | 2 days |

Realistic total: **1.5 – 2 weeks of focused work** for a full production build.

---

## Things deliberately NOT in the prototype

- Real authentication (clearly swappable as described above).
- Server-side form validation (client-only for now).
- Email sending (UI mentions it; the email flow is ready to wire up).
- File uploads (video clips on submission) — easy addition via Supabase Storage.
- Push notifications (reminder when a week opens).
- Parent access / guardian accounts — worth discussing.

---

## Production decisions (confirmed with Ryan)

| Decision | Chosen |
| --- | --- |
| Host path | `portal.rrgolfperformance.com` subdomain (recommended) |
| Signup control | **Invite-only.** Coach generates single-use codes from the Coach view. Players need a valid code to register. Implemented in the prototype: see `RRG.invites` in `app.js`. Demo codes: `RRG-DEMO-2026`, `RRG-ELITE-01`, `RRG-ELITE-02`. |
| Parent access | **None.** Player-only portal. Parents see what the player chooses to share. Cleaner for competitive junior context. |
| Data retention | **Indefinite.** Returning players see their full multi-year history. Standard for a development program. |
| Payment | **Separate.** Most players are Mad River Golf Club members and are billed through the club. No Stripe integration in the portal. A simple "Tuition status: Paid / Owing / Waived" flag on the player record is enough. |

---

## Invite code flow (prototype)

The prototype mirrors the production flow exactly:

1. Ryan logs into the Coach view (`coach.html`) as `ryan@rrgolfperformance.com` / `coach2026`.
2. He clicks **+ Generate Code** on the Invites panel. A human-friendly code (e.g. `RRG-7K3M-P9XN`) appears.
3. Ryan copies the code and emails it to the invited player.
4. The player goes to `signup.html`, enters the code (first field), and creates their account. Signup fails gracefully if the code is unknown, already used, or revoked.
5. The invite is marked activated and linked to the player's record — so every account traces back to an invite.
6. Ryan can revoke any unused code from the Coach view.

For production, swap `RRG.invites` with an `invites` Postgres table and a coach-gated API route. The schema is in the SQL section above (add alongside `profiles`, `rounds`, `performance_docs`).

```sql
create table invites (
  code text primary key,
  issued_by uuid references profiles(id),
  cohort text default 'junior-elite-2026',
  note text,
  used_by uuid references profiles(id),
  created_at timestamptz default now(),
  used_at timestamptz,
  expires_at timestamptz
);

alter table invites enable row level security;
create policy "Coach manages invites" on invites for all using (
  (select role from profiles where id = auth.uid()) = 'coach'
);
```

---

*Built 2026. Design and code style aligned to the RR Golf Performance Junior Elite Academy 2026 program guide.*
