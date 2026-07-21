-- Free-text profile field for trainers, for specialties and notes that don't
-- fit the fixed goal-based specialty tags (e.g. boxing, rehab, pre/post-natal,
-- certifications, coaching style). The structured `specialties` array still
-- drives the allocation suggestions; this is human-readable reference detail.

alter table trainers add column if not exists bio text;
