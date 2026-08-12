-- Five placeholder trainers so the app can be clicked through immediately.
-- Replace with the real roster from the admin trainer roster screen.

insert into trainers (name, email, gender, specialties, available_am, available_pm, active) values
  ('Jordan Blake', 'jordan.blake@example.com', 'male', array['build_muscle', 'get_stronger', 'sport_event'], true, false, true),
  ('Casey Nguyen', 'casey.nguyen@example.com', 'female', array['lose_fat', 'general_fitness', 'consistent_routine'], false, true, true),
  ('Sam Whitfield', 'sam.whitfield@example.com', 'male', array['move_better', 'reduce_stress', 'general_fitness'], true, true, true),
  ('Priya Anand', 'priya.anand@example.com', 'female', array['build_muscle', 'get_stronger', 'consistent_routine'], true, true, true),
  ('Riley Cooper', 'riley.cooper@example.com', 'male', array['lose_fat', 'sport_event', 'move_better'], true, false, true);
