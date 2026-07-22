-- GymMaster integration, Phase 1 (the pull): add a distinct lead source for
-- members imported automatically from the GymMaster API, so the board can tell
-- auto-imported leads apart from ones a PT Manager typed in by hand
-- ('gymmaster_sweep').
--
-- This lives in its own migration because a newly added enum value cannot be
-- referenced in the same transaction that adds it. The column, constraint and
-- sync-log table that USE this value are in 0005, which runs afterwards.

alter type lead_source add value if not exists 'gymmaster_api';
