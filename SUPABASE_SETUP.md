# Supabase setup — RR Golf Performance portals

Follow these steps once. Takes about 10 minutes.

## 1. Create a Supabase project

1. Go to [**supabase.com**](https://supabase.com/) → **Start your project** → sign in with GitHub (same account you use for Vercel is fine).
2. Click **New project**.
   - **Name:** `rrgolf-portals`
   - **Database password:** click **Generate a password**, copy it somewhere safe (you won't need it day-to-day, but save it).
   - **Region:** Canada Central (`ca-central-1`) — closest to you and your clients.
   - **Pricing:** Free.
3. Wait ~2 minutes for the project to provision.

## 2. Get your API keys

From the project dashboard:

1. Left sidebar → **Project Settings** (gear icon) → **API**.
2. Copy these three values into a text file — you'll paste them into Vercel in a minute:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **Project API keys → anon/public** (a long `eyJ…` string)
   - **Project API keys → service_role** (another long `eyJ…` string — **keep this one secret**)

## 3. Run the database schema

1. Left sidebar → **SQL Editor** → **New query**.
2. Open the file **`supabase/schema.sql`** from this repo.
3. Copy the whole thing, paste into the SQL editor, click **Run**.
4. You should see `Success. No rows returned` at the bottom. Done.

This creates the `profiles`, `invites`, `rounds`, `lessons` tables and the Row Level Security policies so each client can only ever see their own data.

## 4. Configure magic-link email

1. Left sidebar → **Authentication** → **Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Scroll down to **Email Auth → Confirm email** → **toggle OFF**. We don't need email confirmation because the magic link already proves they own the email.
4. Left sidebar → **Authentication → URL Configuration**:
   - **Site URL:** `https://rrgolfperformance.com`
   - **Redirect URLs:** add both:
     - `https://rrgolfperformance.com/portal/auth-callback.html`
     - `https://rrgolfperformance.com/adult/auth-callback.html`
5. Save.

**Email template (optional, nice to have):**

Left sidebar → **Authentication → Email Templates → Magic Link**. Replace the default with:

```
<h2>Sign in to your RR Golf Performance portal</h2>
<p>Tap the link below to sign in. It expires in 60 minutes.</p>
<p><a href="{{ .ConfirmationURL }}">Sign me in →</a></p>
<p style="color:#888; font-size:12px;">If you didn't request this, ignore it.</p>
```

## 5. Plug the keys into Vercel

1. Go to [vercel.com](https://vercel.com) → your `my-golf-website` project → **Settings → Environment Variables**.
2. Add these three:

| Name | Value | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL from step 2 | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key from step 2 | All |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key from step 2 | All (**keep secret**) |

3. Click **Save** after each.
4. Trigger a redeploy: **Deployments** tab → most recent → **⋯ menu → Redeploy**.

## 6. Create your coach account

After the next push deploys:

1. Go to `https://rrgolfperformance.com/portal/`.
2. Click **Activate your portal**, use any placeholder invite code for now.
3. Enter **your own email** (`ryan@rrgolfperformance.com`) + your name.
4. You'll get a magic-link email → click it → you're signed in.
5. In the Supabase **SQL Editor**, run:
   ```sql
   update profiles set role = 'coach' where email = 'ryan@rrgolfperformance.com';
   ```
   This upgrades your account to coach role — you now see the coach view in the portal.
6. From the coach view, generate real invite codes for each client and text them the code + signup link.

## That's it

Every client signs up once with their code. From then on they just type their email on the login page and click the link. Works on any device, any browser.

---

## What's persisted in Supabase

- Auth users + sessions
- Profiles (role, cohort, package, Know Your Game answers)
- Invites (code, used_by, issued_by, expires_at)
- Rounds (scorecard submissions)
- Lessons (scheduled/completed, debriefs)

## What's still local (for now)

- Live Tiger 5 tally (stays on-device, which is fine — it's the round-in-progress)
- Wedge Matrix + Map My Bag (easy to sync to DB in a next pass if you want)
- Uploaded videos (still IndexedDB until we wire Vercel Blob)

## If anything goes sideways

Supabase logs are under **Logs → Auth Logs** and **Logs → Postgres Logs**. Most issues look like CSP errors in the browser console — we covered that in `vercel.json`.

Reach out with any step that doesn't match what you see on screen.
