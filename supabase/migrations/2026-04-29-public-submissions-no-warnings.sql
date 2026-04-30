-- =====================================================================
-- Migration — public_submissions table (2026-04-29)
-- "No-warnings" variant — same outcome as the main migration, but no
-- DROP statements, so Supabase won't flag it as destructive.
-- =====================================================================
-- Run this in the Supabase SQL Editor for the production project.
-- This is a FIRST-TIME-ONLY migration (will error if re-run because
-- the policies already exist). For re-runnable version, use the main
-- 2026-04-29-public-submissions.sql file.

create table if not exists public_submissions (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  email              text not null,
  submission_data    jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists public_submissions_created_idx on public_submissions(created_at desc);
create index if not exists public_submissions_email_idx   on public_submissions(lower(email));

alter table public_submissions enable row level security;

create policy "public_submissions_coach_select" on public_submissions for select
  using (is_coach(auth.uid()));

create policy "public_submissions_coach_delete" on public_submissions for delete
  using (is_coach(auth.uid()));

-- =====================================================================
-- Seed Reid's already-submitted profile so he shows up TONIGHT.
-- BEFORE RUNNING: replace 'reid@placeholder.invalid' on the next line
-- with Reid's real email address from your inbox.
-- =====================================================================
insert into public_submissions (full_name, email, submission_data, created_at)
values (
  'Reid',
  'reid@placeholder.invalid',
  jsonb_build_object(
    'S1 Age',          '16',
    'S1 Years',        '7',
    'S1 Goals',        'Lower handicap to 5. Shoot even par for the first time. Lower my strokes around the green.',
    'S1 BestRound',    '72 at Mad River in August',
    'S1 Skill Level',  '—',
    'S2 Miss',         'Slice / fade right',
    'S2 Carry',        '250',
    'S2 Fir',          '50',
    'S2 LongConf',     '7',
    'S3 Yardages',     'Yes, dialed in',
    'S3 Gir',          '6/18',
    'S3 Conf 6-8',     '7',
    'S3 Conf 9-pw',    '7',
    'S4 Chip',         '8',
    'S4 Pitch',        '6',
    'S4 Bunker',       '5',
    'S4 Mistake',      'Poor distance control, Deceleration through impact',
    'S4 Goto',         '58 and PW',
    'S5 Short',        '8',
    'S5 Mid',          '7',
    'S5 Long',         '7',
    'S5 Struggle',     'Green reading',
    'S6 Risk',         'Always',
    'S6 PressureGood', 'My Tee Shot',
    'S6 PressureBad',  'Worrying about the unknown',
    'S6 Mistake',      'Mental (lack of commitment)',
    'S7 Strengths',    'Driving, course management & length',
    'S7 Weaknesses',   'Iron control, shots between 40 and 100 yards, mental toughness after bad shots',
    'S7 Success',      'Becoming a better golfer with a more consistent iron shot and lowering my handicap',
    'S7 Extra',        '—',
    'full_name',       'Reid'
  ),
  now() - interval '1 day'
);
