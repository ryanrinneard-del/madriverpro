# RR Golf Performance — Adult Coaching 2026&trade; Portal

The adult sibling to the Junior Elite portal. Same look, same tools, same brand —
different content model (lesson packages, not fixed weekly arc) plus a video upload
pipeline so Ryan can review swings between sessions.

Lives at **`rrgolfperformance.com/adult/`** after deploy.

---

## What's different from /portal/

| Area | Junior Elite `/portal/` | Adult Coaching `/adult/` |
| --- | --- | --- |
| Structure | 15-week curriculum arc | Lesson packages (Single / 5 / 10 / 20) |
| Schedule | Saturdays + Tue/Thu | Custom per player, scheduled by Ryan |
| Curriculum | Pre-planned week-by-week | Fully custom focus per lesson |
| Events | SCJGT tour pathway | None — no tour in the dashboard |
| Video | Not included | **Swing video uploads** with inline review + OnForm download |
| Debrief | Text-based reflection on round | Sliders + multi-choice chips per lesson |
| Invite codes | `RRG-XXXX-XXXX` | `RRA-XXXX-XXXX` (distinct namespace) |
| Storage keys | `rrg_*` in localStorage | `rrgA_*` in localStorage (isolated) |
| TM mark | RR Golf Performance | **Adult Coaching 2026**&trade; also marked |

---

## File tree

```
adult/
├── index.html          # Login
├── signup.html         # Invite-only signup with package selector
├── dashboard.html      # Lesson list + quick tools + package progress
├── lesson.html         # Single lesson detail + slider/chip debrief
├── upload-video.html   # Drop-zone upload + preview + club/angle metadata
├── videos.html         # My video list with inline player + download
├── submit-round.html   # Scorecard submission (shared pattern)
├── history.html        # My Rounds history
├── profile.html        # Know Your Game questionnaire
├── tiger5.html         # Live tally + printable card
├── wedge-matrix.html   # Fully customizable wedge matrix
├── bag.html            # Map My Bag
├── coach.html          # Ryan's view: video queue, roster, schedule lessons, invites
├── assets/
│   ├── styles.css      # Same brand system as /portal/
│   ├── data.js         # Packages, Codes, Tiger 5, Focus Areas (chips)
│   └── app.js          # Auth, lessons, videos, invites — all prefixed rrgA_
└── README.md           # This file
```

---

## Demo walk-through

1. Open `index.html` → click **Activate your portal**.
2. Use invite code `RRA-DEMO-2026`, pick a package (10-Lesson is pre-selected), create the account.
3. Fill out the Know Your Game profile (identical to junior, adult-appropriate).
4. Dashboard shows your package card (0 / 10 used), empty lesson list, four quick tools.
5. Click **Swing Video** → drop a .mp4 / .mov → preview plays → add club + angle + note → submit.
6. Go to **My Videos** — your upload appears with inline player + Download button.
7. Log out, log back in as coach: `ryan@rrgolfperformance.com` / `coach2026`.
8. Coach view: video queue shows your upload with **Download for OnForm** and **Add Feedback** buttons. Mark reviewed.
9. Schedule a lesson for the player from the roster (focus + date + pre-work).
10. Log back in as the player — lesson appears on the dashboard; click it, scroll to the debrief:
   three sliders (Overall feel, Confidence, Commitment) + two chip groups (What clicked / What needs work).

---

## Lesson-package model (data shape)

Each player has a `package` on their user record:

```js
user.package = {
  id: 'p10',
  name: '10-Lesson Package',
  lessons: 10,             // total in the package
  startedAt: '2026-04-17T...',
};
user.lessonsUsed = 0;      // increments when a lesson is marked complete
```

When a player finishes their package, the dashboard shows an **extend prompt**.
Production: extend via manual billing (club member account or Stripe invoice), then
bump `package.lessons` — the player's entire history (profile, rounds, videos) stays
in place because retention is indefinite.

---

## Video upload pipeline

### Prototype

Uploads never leave the browser. We hold the file in memory via `URL.createObjectURL`
so the preview works end-to-end and you can see the UX. Metadata (filename, size,
club, angle, note, lessonId) is stored in `localStorage` under `rrgA_videos_v1`.

### Production (Vercel Blob — already in your CSP allow-list)

1. Add a server route `api/upload-video.js`:

```js
import { put } from '@vercel/blob';

export default async function handler(req) {
  const { userId, filename, contentType } = req.query;
  const { url } = await put(
    `videos/${userId}/${Date.now()}-${filename}`,
    req.body,
    { access: 'public', contentType }
  );
  // save video record in DB with url
  // email ryan@rrgolfperformance.com with link
  return Response.json({ url });
}
```

2. Swap the single marked block in `upload-video.html` (look for
   `===== PRODUCTION SWAP POINT =====`) from `URL.createObjectURL` to a `fetch` POST.

3. Coach view's **Download for OnForm** button already just downloads via the URL —
   works identically whether it's a blob URL or a Vercel Blob URL.

That's it. One edit once you wire the route.

---

## Production decisions

Same posture as `/portal/`:

- Host: Vercel at `rrgolfperformance.com/adult/`
- Auth: Supabase (separate namespace from junior — or unify later)
- DB: Postgres via Supabase with Row-Level Security — add `videos`, `lessons`, `packages` tables
- Email: Resend edge function on lesson schedule, video upload, or scorecard submission
- Payment: Separate (club member account, direct, or eventual Stripe — portal doesn't process money)
- Data retention: Indefinite (multi-year history compounds)

---

## Trademark guidance (because you asked)

Short answer: **yes, you can and should protect the brand assets**. A few things worth
knowing before you file:

### What's protectable

| Asset | Protection | Notes |
| --- | --- | --- |
| **RR Golf Performance** (brand name) | Trademark | Core business identifier. Strong candidate. |
| **Junior Elite Academy**&trade; | Trademark | Program name + associated logos/styling. |
| **Adult Coaching 2026**&trade; | Trademark | Same — though generic-sounding program names are harder to register alone. Consider a more distinctive sub-brand (e.g., "Mad River Adult Elite"). |
| **The 12 Performance Codes**&trade; | Trademark | Your coaching framework name. Strong brand asset. |
| **Tiger 5** | Cannot register | Scott Fawcett / Tiger Woods adjacency. Safer to call your implementation something else if you want a registered mark. |
| **Know Your Game** | Trademark | If it's a named program / product offering on its own. |
| Website + app source code | Copyright | Automatic on creation. Add a `© 2026 Ryan Rinneard / RR Golf Performance` line to file headers and page footers. |
| Written curriculum (PDFs, README) | Copyright | Same — automatic; assert it in file headers. |

### Canadian vs US

- **Canada** — file through CIPO. About CAD $458 per class online, 18–24 months to registration. Covers Canada only.
- **USPTO** — USD $250+ per class, 12–18 months. Covers the US only.
- Most coaches in your position file Canada first (home market), then USPTO once the brand has traction.
- If you teach US clients or run camps across the border, file both.

### Use the &trade; symbol now

You can legally use &trade; next to any name you're asserting as a mark **before**
it's registered — it signals you're claiming rights. Once registered you switch to ®.
I've added `&trade;` to "Adult Coaching 2026" in this portal and left the junior name
as-is for you to decide. Audit the whole brand list first, then apply &trade; consistently
across the portal, the program PDF, and your website.

### What I'd do (not legal advice)

1. **Talk to a Canadian IP lawyer or use a flat-fee service** (Trademark Factory, Heer Law, Marque d'or). Expect CAD $1,500–3,000 per mark all-in for lawyer-assisted filing: search + class selection + filing + response to examiner reports.
2. **File the strongest, most distinctive marks first:** "RR Golf Performance", "The 12 Performance Codes", "Know Your Game".
3. **Skip generic program names:** "Adult Coaching 2026" alone isn't distinctive; pair with a unique sub-brand for a stronger mark.
4. **Add copyright notices** to every page + PDF + source file:
   `© 2026 Ryan Rinneard / RR Golf Performance. All rights reserved.`
5. **Keep a dated record** of when each name was first used publicly (website launch date, first player activated, first PDF delivered). That's your "first use in commerce" date — important for any filing.

Happy to draft copyright notices for the portal, the program PDF, and your main site pages whenever you're ready. Just say the word.

---

*RR Golf Performance &middot; Adult Coaching 2026&trade; &middot; April 2026*
