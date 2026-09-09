-- Adds "PT Contract" as a built-in compliance document type.
--
-- ---------------------------------------------------------------------------
-- Numbering: this file depends on 0006_trainer_documents.sql
-- ---------------------------------------------------------------------------
-- It inserts into `document_types`, which does not exist until 0006 has run.
-- Originally written as 0010. The trainer self-profile work landed 0010 to
-- 0014 on the default branch while this was in review, so it was renumbered
-- to 0015 on merge rather than colliding. 0007/0008 remain reserved by the
-- GymMaster pair on `claude/gymmaster-phase-1-pull-7yuxuy`, and 0005 is
-- permanently unused.
--
-- Already applied to the live project under its old number. Re-running is
-- harmless, see the note at the bottom.
--
-- Why this type exists
-- --------------------
-- The onboarding workbook tells a trainer, in Part 3 and again in Part 10,
-- that their signed agreement and their certification requirements live in
-- their PT contract, and both places now link to /admin/documents. Without a
-- type of its own, a signed agreement had to be filed under "Other" with a
-- free-text label, which meant it never grouped consistently in the
-- compliance view and every trainer could name it differently.
--
-- Choices worth stating
-- ---------------------
--   * expiry_rule 'none': a PT contract has a minimum term and a notice
--     period, but no expiry date to chase. 'required' would force a
--     meaningless date on upload; 'none' hides the field entirely.
--   * sort_order 5: the contract is the foundational document, so it leads
--     the list. Sorting it ahead of Qualification (10) avoids renumbering
--     the four existing types.
--   * is_custom false: this is a built-in type, not a manager-added one.
--
-- Safe to re-run: `key` is unique and the insert is a no-op if it is already
-- there.

insert into document_types (key, label, expiry_rule, sort_order, is_custom) values
  ('contract', 'PT Contract', 'none', 5, false)
on conflict (key) do nothing;
