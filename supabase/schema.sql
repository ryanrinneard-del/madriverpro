-- =====================================================================
-- RR Golf Performance — Supabase schema (Phase 1: auth, invites, profiles)
-- Run this once in the Supabase SQL Editor after creating the project.
-- =====================================================================

-- ---------- enums ----------
create type user_role    as enum ('player', 'coach');
create type cohort_type  as enum ('junior_elite_2026', 'adult_coaching_2026');
create type package_id   as enum ('single', 'p5', 'p10', 'p20');

-- ---------- profiles ----------
-- One row per auth user. Extends Supabase's auth.users table.
create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text not null,
  name               text,
  role               user_role not null default 'player',
  cohort             cohort_type,
  package_id         package_id,                 -- null = no package (e.g. junior, coach)
  package_lessons    int,                         -- from PACKAGES.lessons at signup
  lessons_used       int not null default 0,
  handicap           text,
  home_club          text,
  dob                date,
  invite_code        text,                        -- the code they used (audit trail)
  profile_json       jsonb default '{}'::jsonb,   -- Know Your Game + future fields
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index profiles_email_idx   on profiles(lower(email));
create index profiles_cohort_idx  on profiles(cohort);
create index profiles_role_idx    on profiles(role);

-- ---------- invites ----------
create table invites (
  code               text primary key,
  cohort             cohort_type not null,
  default_package    package_id,
  issued_by          uuid references profiles(id),
  used_by            uuid references profiles(id),
  is_master          boolean not null default false,  -- master codes can be reused by many clients
  note               text,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  used_at            timestamptz
);

create index invites_used_by_idx  on invites(used_by);

-- Seed the two master codes (idempotent; safe to re-run)
insert into invites (code, cohort, default_package, is_master, note)
values
  ('RRG-JUNIOR-2026', 'junior_elite_2026',    null, true, 'Master signup code — Junior Elite 2026'),
  ('RRA-ADULT-2026',  'adult_coaching_2026',  null, true, 'Master signup code — Adult Coaching 2026')
on conflict (code) do update set
  is_master = true,
  cohort    = excluded.cohort,
  note      = excluded.note;

-- ---------- rounds (scorecard submissions) ----------
create table rounds (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  week_n             int,
  round_date         date,
  course             text,
  tees               text,
  format             text,
  holes              int,
  score              int,
  fir                text,
  gir                text,
  putts              int,
  three_putts        int,
  up_down            text,
  penalties          int,
  lost_balls         int,
  tiger5             jsonb default '{}'::jsonb,
  tiger5_total       int default 0,
  reflection_good    text,
  reflection_bad     text,
  routine_score      int,
  one_thing          text,
  created_at         timestamptz not null default now()
);

create index rounds_user_created_idx on rounds(user_id, created_at desc);

-- ---------- lessons (scheduled 1-on-1s, adult program) ----------
create table lessons (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  number             int,
  focus              text,
  pre_work           text,
  scheduled_at       timestamptz,
  completed_at       timestamptz,
  coach_notes        text,
  debrief            jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index lessons_user_scheduled_idx on lessons(user_id, scheduled_at);

-- ---------- public_submissions ----------
-- Public Know Your Game form fills that haven't yet claimed an invite code
-- (and therefore have no auth.users row / no profiles row).
-- Coach-only read / delete via RLS. INSERTs come from the server-side API
-- handler (api/process-profile.js) using the service-role key.
create table public_submissions (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  email              text not null,
  submission_data    jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index public_submissions_created_idx on public_submissions(created_at desc);
create index public_submissions_email_idx   on public_submissions(lower(email));

-- =====================================================================
-- TRIGGER: keep updated_at fresh on profiles
-- =====================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- =====================================================================
-- HELPER: is_coach(uid) — used inside RLS policies
-- =====================================================================
create or replace function is_coach(uid uuid) returns boolean as $$
  select exists (
    select 1 from profiles where id = uid and role = 'coach'
  );
$$ language sql stable security definer;

-- =====================================================================
-- RPC: check_invite(code) — called before signup to surface errors early
-- Returns 1 row if the code is claimable, 0 rows if not.
-- =====================================================================
create or replace function check_invite(p_code text)
  returns table(code text, cohort cohort_type, default_package package_id)
  language sql stable security definer
as $$
  select i.code, i.cohort, i.default_package
  from invites i
  where lower(i.code) = lower(p_code)
    and (i.is_master = true or i.used_by is null)
    and (i.expires_at is null or i.expires_at > now());
$$;

grant execute on function check_invite(text) to anon, authenticated;

-- =====================================================================
-- RPC: claim_invite — atomically mark invite used + upsert profile
-- Called immediately after magic-link auth completes for new users.
-- =====================================================================
create or replace function claim_invite(
  p_code         text,
  p_name         text,
  p_handicap     text default null,
  p_home_club    text default null,
  p_package_id   package_id default null
) returns profiles
language plpgsql security definer
as $$
declare
  v_invite invites%rowtype;
  v_user   uuid := auth.uid();
  v_email  text := (select email from auth.users where id = v_user);
  v_profile profiles%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Lock the invite row, validate
  select * into v_invite from invites
    where lower(code) = lower(p_code)
    for update;

  if not found then
    raise exception 'Invite code not found.';
  end if;
  -- Master codes are reusable; only single-use codes block on used_by
  if not v_invite.is_master and v_invite.used_by is not null then
    raise exception 'Invite code has already been used.';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'Invite code has expired.';
  end if;

  -- Upsert profile (user may already have a skeleton row from a prior attempt)
  insert into profiles (id, email, name, role, cohort, package_id, package_lessons,
                         handicap, home_club, invite_code)
    values (
      v_user, v_email, p_name, 'player', v_invite.cohort,
      coalesce(p_package_id, v_invite.default_package),
      case coalesce(p_package_id, v_invite.default_package)
        when 'single' then 1
        when 'p5'     then 5
        when 'p10'    then 10
        when 'p20'    then 20
        else null
      end,
      p_handicap, p_home_club, v_invite.code
    )
    on conflict (id) do update set
      name          = excluded.name,
      cohort        = excluded.cohort,
      package_id    = excluded.package_id,
      package_lessons = excluded.package_lessons,
      handicap      = excluded.handicap,
      home_club     = excluded.home_club,
      invite_code   = excluded.invite_code
    returning * into v_profile;

  -- Only mark single-use codes as consumed; master codes stay open
  if not v_invite.is_master then
    update invites
      set used_by = v_user, used_at = now()
      where code = v_invite.code;
  end if;

  return v_profile;
end;
$$;

grant execute on function claim_invite(text, text, text, text, package_id) to authenticated;

-- =====================================================================
-- RPC: create_invite — coach-only, generates a new invite code
-- =====================================================================
create or replace function create_invite(
  p_cohort          cohort_type,
  p_default_package package_id default null,
  p_note            text default null,
  p_expires_at      timestamptz default null
) returns invites
language plpgsql security definer
as $$
declare
  v_user uuid := auth.uid();
  v_code text;
  v_inv  invites%rowtype;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_prefix text;
begin
  if not is_coach(v_user) then
    raise exception 'coach only';
  end if;

  v_prefix := case p_cohort
    when 'junior_elite_2026' then 'RRG'
    when 'adult_coaching_2026' then 'RRA'
  end;

  -- Generate 8 chars in two groups of 4, e.g. RRG-7K3M-P9XN
  -- (retry on the vanishingly small chance of collision)
  loop
    v_code := v_prefix || '-' ||
      substr(translate(encode(gen_random_bytes(3), 'base64'), '+/=', 'XYZ'), 1, 4) || '-' ||
      substr(translate(encode(gen_random_bytes(3), 'base64'), '+/=', 'XYZ'), 1, 4);
    v_code := upper(regexp_replace(v_code, '[^A-Z0-9-]', '', 'g'));
    exit when not exists (select 1 from invites where code = v_code);
  end loop;

  insert into invites (code, cohort, default_package, issued_by, note, expires_at)
    values (v_code, p_cohort, p_default_package, v_user, p_note, p_expires_at)
    returning * into v_inv;

  return v_inv;
end;
$$;

grant execute on function create_invite(cohort_type, package_id, text, timestamptz) to authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table profiles            enable row level security;
alter table invites             enable row level security;
alter table rounds              enable row level security;
alter table lessons             enable row level security;
alter table public_submissions  enable row level security;

-- ---------- profiles ----------
-- Players: read + update their OWN profile
create policy "profiles_self_select" on profiles for select
  using (id = auth.uid());
create policy "profiles_self_update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Coach: can read all profiles
create policy "profiles_coach_select" on profiles for select
  using (is_coach(auth.uid()));
create policy "profiles_coach_update" on profiles for update
  using (is_coach(auth.uid())) with check (is_coach(auth.uid()));

-- No direct inserts from clients — profiles are created inside claim_invite().

-- ---------- invites ----------
-- Coach: full access (list, revoke) — creation uses the RPC
create policy "invites_coach_all" on invites for all
  using (is_coach(auth.uid()));
-- Players: no direct access (the RPC handles claim)

-- ---------- rounds ----------
create policy "rounds_self_all" on rounds for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "rounds_coach_select" on rounds for select
  using (is_coach(auth.uid()));

-- ---------- lessons ----------
create policy "lessons_self_select" on lessons for select
  using (user_id = auth.uid());
create policy "lessons_coach_all" on lessons for all
  using (is_coach(auth.uid()));
-- Players: read-only, debrief updates via a dedicated RPC (added in Phase 2).

-- ---------- public_submissions ----------
-- Coach-only: read + delete (clean up after invite is sent).
-- INSERTs happen from the server-side API handler with the service-role key,
-- which bypasses RLS — no public-anon insert policy is needed (and would be
-- a spam vector if added).
create policy "public_submissions_coach_select" on public_submissions for select
  using (is_coach(auth.uid()));
create policy "public_submissions_coach_delete" on public_submissions for delete
  using (is_coach(auth.uid()));

-- =====================================================================
-- PHASE 1 TRUST FIXES (run once against production)
-- =====================================================================

-- Block role / cohort self-escalation. Non-coach users cannot change their
-- own role or cohort via the profiles_self_update RLS path.
create or replace function block_profile_role_escalation() returns trigger
language plpgsql security definer
as $$
declare
  is_caller_coach boolean;
begin
  -- Coaches are exempt (they need to promote and re-assign others).
  select (role = 'coach') into is_caller_coach
    from profiles where id = auth.uid();
  if coalesce(is_caller_coach, false) then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Not authorized to change role';
  end if;
  if new.cohort is distinct from old.cohort then
    raise exception 'Not authorized to change cohort';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_block_escalation on profiles;
create trigger profiles_block_escalation
  before update on profiles
  for each row execute function block_profile_role_escalation();

-- Auto-maintain lessons_used when a lesson transitions in/out of "completed".
create or replace function bump_lessons_used() returns trigger
language plpgsql security definer
as $$
begin
  if tg_op = 'INSERT' then
    if new.completed_at is not null then
      update profiles set lessons_used = coalesce(lessons_used, 0) + 1
        where id = new.user_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if old.completed_at is null and new.completed_at is not null then
      update profiles set lessons_used = coalesce(lessons_used, 0) + 1
        where id = new.user_id;
    elsif old.completed_at is not null and new.completed_at is null then
      update profiles set lessons_used = greatest(coalesce(lessons_used, 0) - 1, 0)
        where id = new.user_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.completed_at is not null then
      update profiles set lessons_used = greatest(coalesce(lessons_used, 0) - 1, 0)
        where id = old.user_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists lessons_bump_usage on lessons;
create trigger lessons_bump_usage
  after insert or update of completed_at or delete on lessons
  for each row execute function bump_lessons_used();

-- =====================================================================
-- DONE.
-- =====================================================================
