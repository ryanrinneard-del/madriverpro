# Profile Review Pipeline — Build Report

**Do not deploy to production until this report has been reviewed.**

Everything below is the output of the 7-step build Ryan requested on 2026-04-14.

---

## Step 1 — Audit of the Know Your Game form (BEFORE this build)

**File:** `/coaching/know-your-game.html` (1,218 lines)
**Submission path (before):** The form's `submitForm()` JS handler POSTed the
collected fields as JSON to **`https://api.web3forms.com/submit`** using a
public access key (`e8454555-5132-4ce0-b73d-0102cc9f30eb`). Web3Forms then
forwarded the payload as an email to Ryan. No Next.js route, no internal API,
no database — just a third-party relay.

**This means:** today, nothing is captured server-side. The only historical
record of submissions is Ryan's inbox.

**As part of this build the handler has been rewritten** to POST the same
payload to `/api/process-profile` instead. The web3forms access key is no
longer referenced and can be revoked at will.

---

## Step 2 — Environment variable audit

The repo has **no `.env*` files** committed (all are gitignored). I cannot see
the Vercel dashboard from here, so I cannot confirm what's already set in
production — but the existing code gives strong signals:

| Variable | Evidence in repo | Likely present in Vercel? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Not referenced anywhere before this build | **Unknown — assume missing** |
| `RESEND_API_KEY` | Not referenced anywhere before this build | **Unknown — assume missing** |
| `MAILCHIMP_API_KEY` | Used in `api/subscribe.js` | **Almost certainly present** (subscribe flow works today) |
| `MAILCHIMP_LIST_ID` | Used in `api/subscribe.js` | **Almost certainly present** |
| `MAILCHIMP_SERVER` | Used in `api/subscribe.js` (defaults to `us17`) | Optional |
| `BLOB_READ_WRITE_TOKEN` | Not referenced before this build | **Missing — must be added** |
| `ADMIN_PASSWORD` | Not referenced before this build | **Missing — must be added** |

A complete list with descriptions lives in the new `.env.example` file.

---

## What was built

### Repo layout (new/changed)

```
my-golf-website/
├── admin/
│   └── profile-review.html               # NEW — password-gated dashboard
├── api/
│   ├── _lib/
│   │   ├── storage.js                    # NEW — Blob + auth helpers
│   │   └── systemPrompt.js               # NEW — Golfer Profile Interpreter prompt
│   ├── admin-auth.js                     # NEW — login/logout
│   ├── approve-profile.js                # NEW — Resend + mark approved
│   ├── generate-pdfs.py                  # NEW — Python PDF generator
│   ├── list-submissions.js               # NEW — admin API
│   ├── process-profile.js                # NEW — main intake endpoint
│   ├── requirements.txt                  # NEW — reportlab for Python runtime
│   └── subscribe.js                      # (unchanged)
├── coaching/
│   └── know-your-game.html               # CHANGED — form now POSTs to /api/process-profile
├── scripts/
│   └── pdf/
│       ├── arc_template.py               # NEW — copy of upload
│       ├── dossier_template.py           # NEW — copy of upload
│       └── session1_plan_template.py     # NEW — copy of upload
├── .env.example                          # NEW — all env vars documented
├── package.json                          # NEW — Node deps (Anthropic, Blob, Resend)
├── vercel.json                           # CHANGED — adds Python runtime + /admin headers
└── PROFILE_REVIEW_BUILD_REPORT.md        # THIS FILE
```

### End-to-end data flow

```
[Student] --POST--> /api/process-profile
                      │
                      ├─ stores profiles/{id}/submission.json (Blob)
                      ├─ Anthropic claude-sonnet-4-20250514 → stores analysis.md
                      ├─ updates profiles/_index.json (status: pdf-pending)
                      └─ fire-and-forget POST to /api/generate-pdfs
                                          │
                                          ├─ runs scripts/pdf/session1_plan_template.py → Blob
                                          ├─ runs scripts/pdf/arc_template.py            → Blob
                                          ├─ runs scripts/pdf/dossier_template.py        → Blob
                                          └─ writes profiles/{id}/pdfs.json

[Ryan] --password--> /admin/profile-review
                      │
                      ├─ GET /api/list-submissions → list + asset URLs
                      ├─ previews analysis.md + 3 PDFs via Blob URLs
                      └─ POST /api/approve-profile { id }
                              │
                              ├─ Resend: email student (3 PDFs attached)
                              ├─ Resend: email ryan@rrgolfperformance.com (same 3 PDFs)
                              └─ updates status=approved in index
```

### Storage choice

All persisted artifacts (raw submission, AI analysis, PDFs, the index file)
live in **Vercel Blob**. I chose this because:

1. The problem statement says "save them to a secure temporary location." Blob
   is private by default in terms of path-guessability (random-suffixed URLs)
   and the pipeline only hands out Blob URLs to authenticated admin requests.
2. Vercel serverless functions have no persistent filesystem; `/tmp` evaporates
   between invocations, so it cannot hold PDFs between the "submit" event and
   Ryan hitting Approve minutes or days later.
3. Blob is the only Vercel-native option that works for both the Node API and
   the Python PDF generator (since I talk to it over its REST API from Python).

### Admin auth design

- POST `/api/admin-auth { password }` — constant-time compare against
  `ADMIN_PASSWORD`. Sets a **HttpOnly, Secure, SameSite=Strict** cookie named
  `rr_admin`, HMAC-signed with `ADMIN_SESSION_SECRET` (or `ADMIN_PASSWORD` as
  fallback). Expires in 8 hours.
- Per-IP login rate limit: 10 attempts per 10 minutes.
- `vercel.json` adds `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store`
  for the entire `/admin/*` path.
- Dashboard is one HTML file; login view and app view toggle client-side.
  Before showing the app it probes `/api/list-submissions` and falls back to
  the login screen on 401.

---

## Environment variables still needed in Vercel

Add these in **Vercel → Project Settings → Environment Variables**. Redeploy
after setting them.

| Variable | Required? | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Generate at https://console.anthropic.com/settings/keys |
| `RESEND_API_KEY` | **Yes** | Generate at https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Optional | Defaults to `Ryan Rinneard <ryan@rrgolfperformance.com>`. The domain **must** be a verified sender in Resend — this is the most common gotcha. |
| `ADMIN_PASSWORD` | **Yes** | This is the ONLY thing gating the dashboard — make it long. |
| `ADMIN_SESSION_SECRET` | Recommended | Any 32+ character random string. Falls back to `ADMIN_PASSWORD` if unset. |
| `INTERNAL_PIPELINE_TOKEN` | Recommended | Long random string. Shared between `/api/process-profile` and `/api/generate-pdfs` so nobody can hit the Python endpoint directly. |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | **Added automatically** when you attach a Blob store to the project (Storage → Create → Blob). |

### One-time Vercel setup

1. In the Vercel dashboard: **Storage → Create Database → Blob**, attach it to
   the `madriverpro` project. This sets `BLOB_READ_WRITE_TOKEN` for you.
2. Add the env vars above.
3. Add your sending domain to Resend and complete DNS (SPF + DKIM).
4. `npm install` locally (once), commit the lockfile, and push — Vercel will
   auto-detect both the Node deps from `package.json` and the Python deps
   from `api/requirements.txt`.

---

## Known gaps / things I couldn't complete from the repo alone

These are the honest "would not pass code review" items. Worth fixing before
going live.

### 1. ~~The three PDF templates are still hardcoded for "Sunny"~~ — RESOLVED

All three templates (`session1_plan_template.py`, `arc_template.py`,
`dossier_template.py`) now accept a structured `data` dict and have no
hardcoded student content. The data contract is defined in
`api/_lib/schema.js` (`PDF_DATA_SCHEMA`) and enforced via Claude's tool use:
`/api/process-profile` binds the Anthropic call to a `write_coaching_roadmap`
tool whose `input_schema` is `PDF_DATA_SCHEMA`, forcing every response into
the same shape. The structured payload is persisted to
`profiles/{id}/analysis.json`, and `/api/generate-pdfs.py` now fetches that
JSON, passes it into each template's `build_pdf(output_path, data)`, and
uploads the rendered PDFs to Blob.

Each template signature is now `build_pdf(output_path, data=None)`. If `data`
is None the module falls back to `_sample_data.SAMPLE_DATA` so each template
can be run standalone for visual QA (`python3 session1_plan_template.py`,
etc.). A smoke test from the sandbox confirmed all three render cleanly with
the sample payload:

- `session1_plan.pdf` — 3 pages
- `arc.pdf` — 5 pages
- `dossier.pdf` — 8 pages (cover + 7 inner)

### 2. Repo is a static site on Vercel, not Next.js

The brief said "Next.js API route at `/api/process-profile`." The repo is
actually a static site with Vercel Node.js serverless functions under `/api/`
(see existing `api/subscribe.js`). I built `/api/process-profile.js` in that
same style — same URL shape, same deploy target, same behavior from the
client's perspective — so the functional outcome matches the brief. If you'd
rather migrate the site to Next.js properly, that's a separate (much bigger)
project.

### 3. I cannot verify env vars are set in Vercel

No `.env.local` on disk, no Vercel dashboard access from this session. The
code fails with a clear 500 + server log if a required var is missing, so
you'll see it on the first submission attempt if anything's wrong. Use
`vercel env ls` to inventory what's actually set.

### 4. Local testing not performed

I wrote the code but didn't run `vercel dev` / `npm install` / submit a test
profile. I'd suggest:

1. `npm install` in the repo root
2. `vercel env pull .env.local` (once you've set the vars in the dashboard)
3. `vercel dev`
4. Open `http://localhost:3000/coaching/know-your-game.html`, submit a test
   profile, then check `http://localhost:3000/admin/profile-review`.

### 5. PDF generator runs three templates serially in one 60s budget

Vercel's Python runtime has a 60-second default. Three ReportLab builds are
comfortably within that, but if the templates grow (images, more pages), we
may need to either extend `maxDuration` (Pro plan: up to 300s) or split each
template into its own function.

### 6. The CSP in `vercel.json` used to allow `https://api.web3forms.com`

Because the form no longer talks to web3forms, I removed that entry and
instead allow `https://*.public.blob.vercel-storage.com` so the admin page can
preview PDFs via their Blob URLs. If you need to roll back to the web3forms
flow temporarily, re-add `https://api.web3forms.com` to `connect-src` and
revert the change in `coaching/know-your-game.html`.

### 7. No "regenerate PDFs" button in the dashboard yet

If `/api/generate-pdfs` fails (e.g., a template throws), the index will show
the submission stuck at `pdf-pending`. There's no UI button to re-run it —
you'd need to POST to `/api/generate-pdfs` manually with the submission id.
Easy to add; let me know if you want it.

### 8. No student-facing "you'll hear back shortly" email

After a student submits, they see the in-page success screen but receive no
email confirmation. The original web3forms flow also didn't send one — happy
to add an immediate acknowledgement via Resend if you want.

---

## Pre-deploy checklist

- [ ] Attach Vercel Blob to the `madriverpro` project
- [ ] Set `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`,
      `ADMIN_SESSION_SECRET`, `INTERNAL_PIPELINE_TOKEN` in Vercel
- [ ] Verify sending domain in Resend (SPF + DKIM)
- [ ] `npm install` and commit `package-lock.json`
- [x] Parameterize the three PDF templates (done — see "Known gaps" #1)
- [ ] Test end-to-end on a preview deployment before promoting to production
- [ ] Revoke the old web3forms access key (`e8454555-5132-4ce0-b73d-0102cc9f30eb`)
