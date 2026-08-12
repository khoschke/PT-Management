-- Trainer availability: AM and PM as independent options.
--
-- Replaces the single `availability` enum ('AM','PM','both') with two
-- independent booleans, so a trainer can be available AM, PM, or both by
-- selecting the slots that apply rather than picking a combined "both" value.
--
-- Backfill maps the old enum: 'both' -> both true; 'AM' -> am only; 'PM' -> pm only.

alter table trainers
  add column available_am boolean not null default true,
  add column available_pm boolean not null default true;

update trainers
  set available_am = (availability in ('AM', 'both')),
      available_pm = (availability in ('PM', 'both'));

alter table trainers drop column availability;

drop type trainer_availability;

comment on column trainers.available_am is 'Trainer takes morning (AM) sessions.';
comment on column trainers.available_pm is 'Trainer takes evening (PM) sessions.';
