-- =====================================================================
-- Migration — strokes_gained column on rounds (2026-05-01)
-- =====================================================================
-- Phase A of the "Scorecard as Savior" build. Adds a JSONB column to
-- store the four-category SG breakdown computed by api/compute-sg.js
-- after every round submission.
--
-- Shape stored:
--   {
--     "tier": "10-handicap",
--     "total": 4.2,
--     "categories": {
--       "ott":  { "value": -0.8, "components": { ... } },
--       "app":  { "value":  2.1, "components": { ... } },
--       "arg":  { "value": -0.4, "components": { ... } },
--       "putt": { "value":  3.3, "components": { ... } }
--     },
--     "top_leak": { "category": "arg", "label": "Around the Green", "deficit": 0.9, ... },
--     "prescription": { "id": "arg-easy-saves", "title": "...", "drill": "...", "goal": "..." },
--     "computed_at": "2026-05-01T12:34:56Z"
--   }
--
-- Idempotent — safe to re-run.

alter table rounds add column if not exists strokes_gained jsonb default '{}'::jsonb;

-- Index the SG total for quick "best/worst rounds" queries on the dashboard.
create index if not exists rounds_sg_total_idx
  on rounds ((strokes_gained->>'total'));
