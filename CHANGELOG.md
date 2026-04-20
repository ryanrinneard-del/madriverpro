# RR Golf Performance — Build Log

A running record of what's in this codebase and where to find it.
Newest at the top.

---

## Architecture, in one screen

```
rrgolfperformance.com
│
├── /                    Public marketing site (index.html, /coaching/, etc.)
│
├── /adult/              Adult Coaching 2026 portal (auth-gated)
│   ├── dashboard.html   Today's Plan · Snapshot · Last Coach Input · Quick Log
│   ├── submit-round.html  Dead-simple round logging (Score required, rest optional)
│   ├── history.html     My Rounds — Supabase-backed
│   ├── tiger5.html      Live tracker + 6×4 print + 4-up letter print
│   ├── wedge-matrix.html  Matrix + wind calculator + tour-pro write-up
│   ├── bag.html         Map My Bag
│   ├── profile.html     Know Your Game profile
│   ├── lesson.html      Per-lesson detail (debrief + pre-work)
│   ├── packages.html    Adult-only packages landing (Series 5/10/20 + Single + Starter)
│   ├── how-to-use.html  10-section walkthrough of every feature
│   ├── coach.html       Coach command center (master codes, roster, log lesson, snapshot editor)
│   └── assets/
│       ├── app.js       RRG.auth, RRG.users, RRG.invites, RRG.lessons, RRG.subs, RRG.idb, etc.
│       ├── data.js      RRG.PACKAGES, RRG.ACUITY, RRG.WEDGE_CLUBS/SHOTS, RRG.TIGER5
│       ├── styles.css   Brand styles · nav drawer · lesson row grid
│       └── supabase-config.js
│
├── /portal/             Junior Elite 2026 portal (auth-gated, mirrors /adult/ structure)
│   └── (same files as /adult/ minus packages, with week.html for the 15-week curriculum)
│
├── /improve/            Game Improvement Library (auth-gated, shared by both cohorts)
│   ├── index.html       6 category cards
│   ├── beginner-golfer.html  6 articles — START HERE for newcomers
│   ├── long-game.html   6 articles — Ball Flight Laws, Slice, Higher, etc.
│   ├── short-game.html  5 articles — Putt/Chip/Pitch/10-footers/AimPoint
│   ├── mental-game.html 4 articles — Pre-shot, 3 boxes, etc.
│   ├── science.html     4 articles — Gear Effect, Wind, Kinematic Sequence, TPI
│   ├── practice.html    2 articles — Practice Like Rory + Speed Science
│   └── assets/          (smaller mirror of portal assets)
│
├── /supabase/
│   └── schema.sql       Full source-of-truth schema (profiles, invites, rounds, lessons,
│                        RPCs check_invite/claim_invite/create_invite, RLS policies,
│                        Phase 1 triggers for role-escalation block + lessons_used bump)
│
└── vercel.json          CSP, redirects (/portal /adult /improve all → trailing slash)
```

**Auth:** Supabase magic-link via `signInWithOtp`. Shared session across all cohorts.
**Storage:** Supabase tables for rounds, lessons, profiles, invites. localStorage as
warm cache for some tools (wedge matrix). Videos still local (cloud migration pending).
**Booking:** Acuity (madriverpro.as.me + the catalog). Portal links out; never duplicates
booking state.

---

## Phase log

### Phase 4 — Wedge Matrix sync + iOS responsive *(commit `c479763`)*
- Wedge matrix data migrated from localStorage to `profiles.profile_json.wedge_matrix`
- Edits debounce 800ms then flush; visibilitychange flushes pending writes
- Mobile: matrix-scroll wrapper + 640px-down media query for iPhone fit
- Fixed nonsensical "Read it this way" example

### Phase 3 — Dashboard redesign *(commit `385df05`)*
- Today's Plan card (top hero, 3 dynamic action items)
- Game Snapshot (3 metrics from `profile_json.snapshot`, coach-set)
- Last Coach Input (1-sentence pull from latest lesson's `coach_notes`)
- Coach view: Snapshot editor modal per player

### Phase 2 — Round logging dead simple *(commit `b6f946a`)*
- `RRG.subs` migrated to Supabase `rounds` table
- submit-round.html rebuilt: Score required, everything else optional + collapsible
- history.html: Supabase reads + prominent "+ Log a Round" button
- Dashboard Quick Log: Round / Tiger 5 / History

### Phase 1 — Trust fixes *(commits `98c92f3`, `a6a9911`)*
- Tiger 5 cohort label fixed
- Hamburger Player Portal nav fixed
- p10 "recommended" auto-select removed
- lesson-row mobile CSS (no more vertical text)
- packages.html landing built
- Schema: role-escalation block trigger + lessons_used auto-increment trigger
  *(SQL pending Ryan's paste in production — code already in /supabase/schema.sql)*

### Earlier
- Supabase auth migration (cross-device login)
- Master invite codes (RRA-ADULT-2026, RRG-JUNIOR-2026, reusable)
- Coach view rebuild (full Supabase)
- Game Improvement Library (21 → 27 → 33 articles)
- Wedge Matrix wind calculator + sub-30° launch write-up
- Beginner's Guide section (6 articles)
- How to Use This Portal (10 sections)
- Nav regroup (My Game / Tools / Learn subheadings)
- Tiger 5 4-per-sheet letter print

---

## Open follow-ups

1. **Phase 1 SQL** — Run the role-escalation + lessons_used triggers in production
   (already in `supabase/schema.sql`, just needs paste to Supabase dashboard).
2. **Snapshot UX polish** — inline-edit, better empty-state, save confirmation animation.
3. **Merge My Bag + Wedge Matrix** — Ryan flagged in handwritten notes; hold for design review.
4. **Import existing Know Your Game profiles** — handwritten note #1; upload/paste flow for
   coach to attach external profile data.
5. **Ladies Summer Series portal** — third cohort, $210/$495 packages already in Acuity.
6. **Google SEO + Ads** — meta tags, sitemap.xml updates, Google Business profile.
7. **Videos to cloud storage** — currently localStorage/IndexedDB only.
8. **True coach-private notes** — separate column with stricter RLS so client can't read.
9. **Audit log** — track coach actions for compliance.

---

## How to deploy

```
cd ~/my-golf-website
git push origin main
```

Vercel auto-builds within ~30-60 seconds. CSP allows Supabase + unpkg only.
