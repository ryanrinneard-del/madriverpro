-- ============================================================================
--  2026-05-24  Coach Intakes — coach-only storage for the coach-plan-builder
--  ----------------------------------------------------------------------------
--  PROBLEM THIS FIXES
--
--  The Coach Intake panel in /adult/coach.html was originally storing its
--  4 fields (ecosystem, three-horizon goals, why, observation notes) inside
--  profiles.profile_json. That blob is readable by the player themselves via
--  the existing "profiles_self_select" RLS policy — so a tech-savvy player
--  could open browser DevTools and see Ryan's private intake notes about them
--  in the Supabase query response, even though nothing in the player-facing UI
--  displayed it. Confidential coach notes were leaking through the data layer.
--
--  THIS MIGRATION
--
--  1. Creates a SEPARATE coach_intakes table.
--  2. RLS denies all access by default; only the coach role can SELECT / INSERT
--     / UPDATE / DELETE. Players get nothing — not even an empty row, not even
--     a "row exists" signal.
--  3. Migrates any existing coach_intake data from profile_json into the new
--     table (so Reid's saved notes survive the move).
--  4. STRIPS coach_intake out of profile_json on every row — immediate damage
--     control so the data is no longer player-readable after this migration
--     runs.
--
--  AFTER RUNNING THIS, deploy the matching code change in /adult/coach.html
--  (commit on the same date) so the UI reads/writes from the new table.
-- ============================================================================

-- ---------- 1. Table ----------
create table if not exists public.coach_intakes (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  ecosystem         text,
  horizon_short     text,
  horizon_mid       text,
  horizon_long     text,
  why               text,
  observation_notes text,
  updated_at        timestamptz not null default now(),
  updated_by        uuid references auth.users(id)
);

create index if not exists coach_intakes_updated_at_idx
  on public.coach_intakes(updated_at desc);

-- ---------- 2. RLS — coach-only ----------
alter table public.coach_intakes enable row level security;

-- One policy covering all operations; using/with-check both gate on is_coach().
-- NO self-* policies for players. RLS default-denies, so absence of policy = no
-- access. This is the entire point — Reid cannot see this row even if he knows
-- the table exists.
drop policy if exists "coach_intakes_coach_all" on public.coach_intakes;
create policy "coach_intakes_coach_all" on public.coach_intakes
  for all
  using (is_coach(auth.uid()))
  with check (is_coach(auth.uid()));

-- ---------- 3. Migrate existing data from profile_json ----------
-- Any row that has profile_json.coach_intake gets its data copied into the
-- new table. on-conflict-update so re-running this migration is safe.
insert into public.coach_intakes (
  user_id,
  ecosystem,
  horizon_short,
  horizon_mid,
  horizon_long,
  why,
  observation_notes,
  updated_at
)
select
  id,
  nullif(profile_json->'coach_intake'->>'ecosystem',         ''),
  nullif(profile_json->'coach_intake'->>'horizon_short',     ''),
  nullif(profile_json->'coach_intake'->>'horizon_mid',       ''),
  nullif(profile_json->'coach_intake'->>'horizon_long',      ''),
  nullif(profile_json->'coach_intake'->>'why',               ''),
  nullif(profile_json->'coach_intake'->>'observation_notes', ''),
  coalesce(
    nullif(profile_json->'coach_intake'->>'updated_at', '')::timestamptz,
    now()
  )
from public.profiles
where profile_json ? 'coach_intake'
on conflict (user_id) do update set
  ecosystem         = excluded.ecosystem,
  horizon_short     = excluded.horizon_short,
  horizon_mid       = excluded.horizon_mid,
  horizon_long      = excluded.horizon_long,
  why               = excluded.why,
  observation_notes = excluded.observation_notes,
  updated_at        = excluded.updated_at;

-- ---------- 4. Damage control: strip coach_intake from profile_json ----------
-- After this update, the data only exists in coach_intakes (locked by RLS).
-- Players' Supabase queries will no longer return coach_intake in their
-- profile_json — they cannot see it via DevTools, even if they know to look.
update public.profiles
set profile_json = profile_json - 'coach_intake'
where profile_json ? 'coach_intake';

-- ---------- 5. Sanity check (informational, no-op if clean) ----------
-- Should return 0. If it returns >0, the strip step above didn't take —
-- investigate before deploying the code change.
do $$
declare
  remaining int;
begin
  select count(*) into remaining
  from public.profiles
  where profile_json ? 'coach_intake';
  raise notice 'Rows still containing coach_intake in profile_json: %', remaining;
end $$;
