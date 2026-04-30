-- =====================================================================
-- Migration — approach_data + hole_detail columns on rounds (2026-04-30)
-- =====================================================================
-- Phase 1 of the "Where you're losing strokes by distance" feature.
-- Idempotent — safe to re-run.
--
-- ADD COLUMN IF NOT EXISTS handles the defensive case where hole_detail
-- may have been added to production via the Supabase dashboard but never
-- migrated into schema.sql. Running this is a no-op if it already exists.

alter table rounds add column if not exists hole_detail   jsonb default '{}'::jsonb;
alter table rounds add column if not exists approach_data jsonb default '{}'::jsonb;

-- Note: the per-hole approach distance + result are stored INSIDE
-- hole_detail.rows[i] as new fields (approach_dist, approach_result).
-- The separate approach_data column is reserved for round-level rollups
-- (e.g., bucketed GIR% per distance) computed at save time.
