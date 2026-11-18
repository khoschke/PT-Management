-- A third lead source, `unverified`, so the portal can tell the workbook's
-- three lead types apart (Part 7 amendments, item 7; Karl, 17 Nov 2026):
--
--   form             Warm. Asked for PT themselves through /pt-session.
--   gymmaster_sweep  Sweep. Added by the PT Manager after a conversation, an
--                    email or a front of house heads-up. Not cold. The value
--                    keeps its old name so existing rows, the audit and the
--                    unmerged GymMaster branch (0007, `gymmaster_api`) line up.
--   unverified       New. A new member who hasn't asked about PT, handed over
--                    around day 10 to 17 after two of the three nurture
--                    emails. The only type the workbook calls cold.
--
-- Until now every hand-added lead was saved as gymmaster_sweep, so unverified
-- and sweep leads were mixed together and the allocation email called them all
-- cold. Existing rows are left as they are: nothing in the data says which
-- were which, so the PT Manager re-sorts them from the lead panel's new
-- "Lead type" control.
--
-- The goals check is rewritten to key off `form` rather than list every other
-- source. Only a form lead must state a goal. The old wording,
-- `lead_source = 'gymmaster_sweep' or ...`, would have rejected an unverified
-- lead with no goals (and a future gymmaster_api one).
--
-- `add value` is allowed inside a transaction on Postgres 12+, but the new
-- value can't be used until that transaction commits. Nothing below uses it.
--
-- Safe to re-run: the value is added "if not exists" and the constraint is
-- dropped "if exists" before it is recreated.

alter type lead_source add value if not exists 'unverified';

alter table leads drop constraint if exists goals_not_empty_for_form_leads;
alter table leads add constraint goals_not_empty_for_form_leads check (
  lead_source <> 'form' or array_length(goals, 1) is not null
);
